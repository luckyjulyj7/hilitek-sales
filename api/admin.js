/**
 * API của trang quản lý (/quanlybanhang) — MỌI lần đọc/ghi dữ liệu đều đi qua đây, trình duyệt
 * không còn chạm thẳng vào Supabase. Gộp chung 1 function vì gói Vercel Hobby giới hạn số function.
 *
 *   POST ?op=login   { username, password }  -> { userId }   (cấp cookie phiên)
 *   POST ?op=logout
 *   GET  ?op=me                              -> { userId }
 *   POST ?op=verify  { password }            -> { ok }       (xác nhận lại mật khẩu của chính mình)
 *   GET  ?op=poll                            -> { updatedAt, kicks }  (đồng bộ 20s/lần, rất nhẹ)
 *   GET  ?op=get&k=main|locks|kicks|marker   -> { value, updatedAt }
 *        &since=<updatedAt>                 -> { notModified: true, updatedAt } nếu dữ liệu chưa đổi
 *   GET  ?op=meta&k=...                      -> { updatedAt }
 *   POST ?op=set     { k, value }            -> { updatedAt }
 *   POST ?op=cas     { k, value, expected }  -> { updatedAt } | { conflict: true }
 *   POST ?op=del     { k }
 *   POST ?op=upload  { ext }                 -> { path, token }  (link tải ảnh lên dùng 1 lần)
 *   GET  ?op=fetch-image&url=...  ·  GET|POST ?op=media-cleanup
 *
 * Mọi POST phải kèm header "x-hili: 1" (trang khác không tự gửi được header này -> chống CSRF).
 */
import { client, json, handler } from "./web/_supa.js";
import {
  CLIENT_KEYS, MAIN_KEY, KICK_KEY,
  readRow, readJsonRow, writeRow, loadAuth, splitSecrets, stripAccounts, verifyHash, verifyProof, passwordParams,
  startSession, endSession, requireSession, kickedAfter,
  checkLock, recordFail, clearFails, upgradeIfLegacy,
} from "./web/_auth.js";
import zlib from "node:zlib";
import fetchImage from "./web/_fetchImage.js";
import { writeWebSnapshot, applyWebChanges } from "./web/_catalog.js";
import { recordsStatus, migrateFromBlob, pageRows, rowsSince, changedSince, upsertRows, latestUpdate } from "./web/_records.js";
import { RECORD_COLLS, DOC, ORDER } from "../src/lib/records.js";
import mediaCleanup from "./web/_mediaCleanup.js";
import crypto from "node:crypto";
import { rawDb } from "../worker/supa-d1.js";
import { vnDay } from "../worker/track.js";

const TABLE = "app_state";
const BUCKET = "product-media";

// Trình duyệt nén gzip thân request khi lưu (header "x-hili-gzip: 1", kiểu application/octet-stream)
// — blob ~4 MB sát giới hạn 4,5 MB/request của Vercel, nén còn ~1/3. Đọc 1 lần rồi nhớ lại.
async function readBody(req) {
  if (req._hiliBody) return req._hiliBody;
  let b = req.body;
  if (req.headers["x-hili-gzip"] === "1") {
    let buf = Buffer.isBuffer(b) ? b : null;
    if (!buf) {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      buf = Buffer.concat(chunks);
    }
    try { b = zlib.gunzipSync(buf).toString("utf8"); } catch { b = "{}"; }
  }
  let out = {};
  if (b && typeof b === "object" && !Buffer.isBuffer(b)) out = b;
  else { try { out = JSON.parse(Buffer.isBuffer(b) ? b.toString("utf8") : b || "{}"); } catch { out = {}; } }
  req._hiliBody = out;
  return out;
}
function body(req) { return req._hiliBody || {}; }
function keyOf(k) {
  return Object.prototype.hasOwnProperty.call(CLIENT_KEYS, k) ? CLIENT_KEYS[k] : null;
}
function bad(res, msg, status = 400) {
  json(res, status, { error: msg });
}

// Phiên hợp lệ + chưa bị chủ "đá" ra. checkAuth=true: kiểm thêm tài khoản còn tồn tại & đang mở.
async function session(req, res, { checkAuth = false } = {}) {
  const s = requireSession(req, res);
  if (!s) return null;
  const kicks = await readJsonRow(KICK_KEY, {});
  let dead = kickedAfter(kicks, s);
  let auth = null;
  if (!dead && checkAuth) {
    auth = await loadAuth();
    const e = auth.accounts[s.u];
    dead = !e || !e.active;
  }
  if (dead) {
    endSession(req, res);
    json(res, 401, { error: "Phiên đăng nhập không còn hiệu lực.", auth: false });
    return null;
  }
  return { s, kicks, auth };
}

// Gửi danh sách dòng mà không parse lại giá trị (chuỗi JSON lấy thẳng từ D1) — đỡ CPU trên Worker.
function sendRows(res, rows, more, withDel) {
  const parts = rows.map((r) => {
    const del = withDel && r.deleted;
    const v = del ? "null" : r.value_raw != null ? r.value_raw : JSON.stringify(r.value === undefined ? null : r.value);
    return '{"c":' + JSON.stringify(r.coll) + ',"i":' + JSON.stringify(r.id) + ',"v":' + v + (withDel ? ',"d":' + (del ? 1 : 0) : "") + ',"t":' + JSON.stringify(r.updated_at) + "}";
  });
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.status(200).send('{"rows":[' + parts.join(",") + '],"more":' + (more ? "true" : "false") + "}");
}

const mediaSig = (path) => crypto.createHmac("sha256", process.env.ADMIN_SESSION_SECRET || "").update("media:" + path).digest("base64url");

const ops = {
  // POST { username } -> { algo, salt, iter }: thông số để trình duyệt tự băm mật khẩu (xem _auth.js verifyProof).
  async pwsalt(req, res) {
    const auth = await loadAuth();
    json(res, 200, passwordParams(auth, body(req).username));
  },

  async login(req, res) {
    const { username, password, proof } = body(req);
    const name = String(username || "").trim().toLowerCase();
    if (!name || (!password && !proof)) return bad(res, "Nhập tên đăng nhập và mật khẩu.");
    const lockedMin = await checkLock(name);
    if (lockedMin) return bad(res, `Sai mật khẩu quá nhiều lần. Thử lại sau ${lockedMin} phút.`, 429);
    const auth = await loadAuth();
    const id = Object.keys(auth.accounts).find((k) => auth.accounts[k].username === name);
    const entry = id && auth.accounts[id];
    if (!entry || !entry.active) return bad(res, "Tài khoản không tồn tại hoặc đã bị khoá.", 401);
    if (!(proof ? verifyProof(entry, proof) : verifyHash(entry, password))) {
      const r = await recordFail(name);
      return bad(res, r.locked ? `Sai mật khẩu 5 lần. Tạm khoá đăng nhập ${r.locked} phút.` : `Sai mật khẩu (còn ${r.left} lần thử).`, 401);
    }
    await clearFails(name);
    if (auth.migratedAt && password) await upgradeIfLegacy(auth, id, password);
    startSession(req, res, id, entry.role);
    json(res, 200, { userId: id });
  },

  async logout(req, res) {
    endSession(req, res);
    json(res, 200, { ok: true });
  },

  async me(req, res) {
    const ss = await session(req, res);
    if (ss) json(res, 200, { userId: ss.s.u });
  },

  async verify(req, res) {
    const ss = await session(req, res, { checkAuth: true });
    if (!ss) return;
    const { password, proof } = body(req);
    const key = "verify:" + ss.s.u;
    const lockedMin = await checkLock(key);
    if (lockedMin) return json(res, 200, { ok: false, locked: lockedMin });
    const entry = ss.auth.accounts[ss.s.u];
    if (!(proof ? verifyProof(entry, proof) : verifyHash(entry, String(password || "")))) {
      const r = await recordFail(key);
      return json(res, 200, { ok: false, ...r });
    }
    await clearFails(key);
    json(res, 200, { ok: true });
  },

  async poll(req, res) {
    const ss = await session(req, res);
    if (!ss) return;
    // Kho theo dòng: ?rc=<mốc đã tải>&tab=<mã tab> -> chỉ báo có/không có dòng người khác vừa đổi.
    const rc = String(req.query.rc || "");
    if (rc) {
      const changed = await changedSince(rc, String(req.query.tab || ""));
      return json(res, 200, { rchanged: changed, kicks: ss.kicks });
    }
    const { data, error } = await client().from(TABLE).select("updated_at").eq("key", MAIN_KEY).maybeSingle();
    if (error) throw new Error("Supabase đọc lỗi: " + error.message);
    json(res, 200, { updatedAt: data ? data.updated_at : null, kicks: ss.kicks });
  },

  /* ---- Kho theo TỪNG DÒNG (xem src/lib/records.js) ---- */
  // GET ?op=rget[&ac=<coll>&ai=<id>] -> { rows:[{c,i,v,t}], more } (500 dòng/trang). Bảng chưa có -> { legacy: true }.
  async rget(req, res) {
    if (!(await session(req, res, { checkAuth: true }))) return;
    let st = await recordsStatus();
    if (st === "missing") return json(res, 200, { legacy: true });
    if (st === "empty") { await migrateFromBlob(); st = "ready"; }
    const ac = req.query.ac, ai = req.query.ai;
    const rows = await pageRows({ afterColl: ac != null ? String(ac) : null, afterId: ai != null ? String(ai) : null, limit: 500, raw: true });
    sendRows(res, rows, rows.length === 500, false);
  },

  // GET ?op=rsince&since=<mốc>&tab=<mã tab>[&after=<mốc trang trước>] -> dòng người khác vừa đổi.
  async rsince(req, res) {
    if (!(await session(req, res, { checkAuth: true }))) return;
    if ((await recordsStatus()) !== "ready") return json(res, 200, { legacy: true });
    const since = String(req.query.since || "");
    if (!since || isNaN(Date.parse(since))) return bad(res, "Thiếu mốc thời gian.");
    const after = req.query.after ? String(req.query.after) : null;
    const rows = await rowsSince(since, String(req.query.tab || ""), { after, raw: true });
    sendRows(res, rows, rows.length === 500, true);
  },

  // POST ?op=rput { tab, changes:[{c,i,v}|{c,i,d:1}], restore?, webChanges?, webReplace? } — chỉ ghi các dòng đổi.
  async rput(req, res) {
    const ss = await session(req, res, { checkAuth: true });
    if (!ss) return;
    if ((await recordsStatus()) !== "ready") return bad(res, "Kho theo dòng chưa sẵn sàng, tải lại trang.", 409);
    const b = body(req);
    const changes = Array.isArray(b.changes) ? b.changes : [];
    if (changes.length > 5000) return bad(res, "Quá nhiều thay đổi trong 1 lần gửi.");
    const isAdmin = ss.auth.accounts[ss.s.u]?.role === "admin";
    const restore = b.restore === true && isAdmin;
    const okName = (x) => typeof x === "string" && x.length > 0 && x.length <= 200;
    const rows = [];
    const delCount = {};
    for (const ch of changes) {
      if (!ch || !okName(ch.c) || !okName(ch.i)) return bad(res, "Dòng dữ liệu không hợp lệ.");
      if (!(RECORD_COLLS.includes(ch.c) || ch.c === DOC || ch.c === ORDER || /^[A-Za-z]\w{0,40}$/.test(ch.c))) return bad(res, "Danh sách không hợp lệ: " + ch.c);
      if (ch.d) {
        if (ch.c === DOC || ch.c === ORDER) return bad(res, "Không được xoá mục này.");
        rows.push({ coll: ch.c, id: ch.i, deleted: true });
        delCount[ch.c] = (delCount[ch.c] || 0) + 1;
        continue;
      }
      if (typeof ch.v !== "string") return bad(res, "Thiếu dữ liệu dòng.");
      let value;
      // Postgres jsonb không nhận ký tự \u0000 -> bỏ đi.
      try { value = JSON.parse(ch.v.replace(/\\u0000/g, "")); } catch { return bad(res, "Dữ liệu dòng hỏng."); }
      if (ch.c === DOC && ch.i === "accounts") {
        // Mật khẩu: tách mã băm sang hàng riêng, chặn dữ liệu mẫu/mất tài khoản (giống lưu cả khối).
        try {
          const split = await splitSecrets(JSON.stringify({ accounts: value, __restore: restore }), ss.auth, { allowRestore: isAdmin });
          value = split.state.accounts;
        } catch (e) {
          return bad(res, e.message, e.status || 400);
        }
      }
      rows.push({ coll: ch.c, id: ch.i, value });
    }
    // Chặn lỡ xoá hàng loạt (VD trang tải lỗi rồi lưu dữ liệu trống): >20 dòng và >30% danh sách.
    if (!restore) {
      for (const c of Object.keys(delCount)) {
        if (c === "activityLog" || c === "notifications" || delCount[c] <= 20) continue;
        const { count, error } = await client().from("app_records").select("id", { count: "exact", head: true })
          .eq("ns", MAIN_KEY).eq("coll", c).eq("deleted", false);
        if (error) throw new Error("Supabase đọc lỗi: " + error.message);
        if (delCount[c] > (count || 0) * 0.3) return bad(res, `Đã chặn: lần lưu này xoá ${delCount[c]}/${count} dòng của ${c}. Tải lại trang rồi thử lại.`, 409);
      }
    }
    if (rows.length) await upsertRows(rows, String(b.tab || "").slice(0, 60));
    // Các dòng danh mục web đổi theo (trang quản lý tự dựng) — web khách đọc các dòng này.
    if (Array.isArray(b.webChanges) && b.webChanges.length) await applyWebChanges(b.webChanges.slice(0, 5000), { replace: b.webReplace === true });
    json(res, 200, { ok: true, n: rows.length });
  },

  async get(req, res) {
    const key = keyOf(req.query.k);
    if (!key) return bad(res, "Khoá dữ liệu không hợp lệ.");
    if (key === MAIN_KEY && (await recordsStatus()) === "ready") return bad(res, LEGACY_MSG, 409);
    const ss = await session(req, res, { checkAuth: key === MAIN_KEY });
    if (!ss) return;
    // ?since=<updatedAt bản trình duyệt đang giữ>: chưa đổi thì chỉ trả mốc (vài byte thay vì ~1,6 MB).
    const since = String(req.query.since || "");
    if (since) {
      const { data, error } = await client().from(TABLE).select("updated_at").eq("key", key).maybeSingle();
      if (error) throw new Error("Supabase đọc lỗi: " + error.message);
      // So đúng chuỗi (cùng định dạng PostgREST, đủ micro-giây); khác định dạng thì tải đủ cho chắc.
      if (data && data.updated_at === since) return json(res, 200, { notModified: true, updatedAt: data.updated_at });
    }
    const row = await readRow(key);
    if (!row || row.value == null) return json(res, 200, { value: null });
    let value = row.value;
    if (key === MAIN_KEY) {
      try { value = JSON.stringify(stripAccounts(JSON.parse(value))); } catch { /* giữ nguyên */ }
    }
    json(res, 200, { value, updatedAt: row.updated_at });
  },

  async meta(req, res) {
    const key = keyOf(req.query.k);
    if (!key) return bad(res, "Khoá dữ liệu không hợp lệ.");
    if (!(await session(req, res))) return;
    const { data, error } = await client().from(TABLE).select("updated_at").eq("key", key).maybeSingle();
    if (error) throw new Error("Supabase đọc lỗi: " + error.message);
    let updatedAt = data ? data.updated_at : null;
    // Kho theo dòng: lưu sản phẩm không đổi hàng app_state chính -> lấy mốc dòng mới nhất (công cụ chờ lưu).
    if (key === MAIN_KEY) { const r = await latestUpdate(); if (r && (!updatedAt || r > updatedAt)) updatedAt = r; }
    json(res, 200, { updatedAt });
  },

  async set(req, res) { return write(req, res, false); },
  async cas(req, res) { return write(req, res, true); },

  async del(req, res) {
    const key = keyOf(body(req).k);
    if (!key || key === MAIN_KEY) return bad(res, "Không được xoá khoá này.");
    if (!(await session(req, res))) return;
    const { error } = await client().from(TABLE).delete().eq("key", key);
    if (error) throw new Error("Supabase xoá lỗi: " + error.message);
    json(res, 200, { ok: true });
  },

  async upload(req, res) {
    if (!(await session(req, res))) return;
    const ext = String(body(req).ext || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "jpg";
    const path = `desc/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const { data, error } = await client().storage.from(BUCKET).createSignedUploadUrl(path);
    if (error) throw new Error("Không tạo được link tải ảnh: " + error.message);
    // put: kho ảnh không cho trình duyệt ghi thẳng (Cloudflare R2) -> gửi file qua op=put-media.
    json(res, 200, { path: data.path || path, token: data.token, ...(data.put ? { put: true, sig: mediaSig(data.path || path) } : {}) });
  },

  // POST ?op=put-media&path=desc/...&sig=... (thân = file ảnh/âm thanh) — chỉ path do op=upload vừa cấp.
  async "put-media"(req, res) {
    if (!(await session(req, res))) return;
    const path = String(req.query.path || "");
    if (!/^desc\/[A-Za-z0-9-]+\.[a-z0-9]{1,5}$/.test(path)) return bad(res, "Đường dẫn không hợp lệ.");
    const want = mediaSig(path), got = String(req.query.sig || "");
    if (want.length !== got.length || !crypto.timingSafeEqual(Buffer.from(want), Buffer.from(got))) return bad(res, "Mã tải lên không hợp lệ.", 403);
    const buf = Buffer.isBuffer(req.body) ? req.body : null;
    if (!buf || !buf.length) return bad(res, "Thiếu file.");
    if (buf.length > 10 * 1024 * 1024) return bad(res, "File lớn hơn 10MB.", 413);
    const ct = String(req.headers["content-type"] || "application/octet-stream").split(";")[0];
    if (!/^(image|audio)\//.test(ct)) return bad(res, "Chỉ nhận ảnh hoặc âm thanh.", 415);
    const { error } = await client().storage.from(BUCKET).upload(path, buf, { contentType: ct, upsert: false, cacheControl: "31536000" });
    if (error) throw new Error("Lưu file lỗi: " + error.message);
    json(res, 200, { path, url: "/media/" + path });
  },


  // GET ?op=stats -> số liệu lượt truy cập web khách (đã cộng dồn theo ngày, xem worker/track.js). Chỉ quản trị viên.
  // Đọc ~vài trăm dòng nhỏ trong 1 lần D1.batch; không đụng kho dữ liệu chính.
  async stats(req, res) {
    const ss = await session(req, res, { checkAuth: true });
    if (!ss) return;
    if (ss.auth.accounts[ss.s.u]?.role !== "admin") return bad(res, "Chỉ quản trị viên xem được thống kê.", 403);
    const db = rawDb();
    const today = vnDay();
    const from = vnDay(Date.now() - 29 * 86400000);
    let out;
    try {
      out = await db.batch([
        db.prepare("select day,views,visits,mobile,clicks from stats_day where day>=? order by day").bind(from),
        db.prepare("select path,kind,max(title) title,sum(views) v from stats_page where day>=? group by path order by v desc limit 300").bind(from),
        db.prepare("select src,sum(n) n from stats_ref where day>=? group by src order by n desc limit 30").bind(from),
        db.prepare("select h,sum(n) n from stats_hour where day>=? group by h").bind(from),
        db.prepare("select path,sum(n) n from stats_land where day>=? group by path order by n desc limit 12").bind(from),
        db.prepare("select ev,path,sum(n) n from stats_event where day>=? group by ev,path order by n desc limit 600").bind(from),
        db.prepare("select q,sum(n) n,sum(zero) zero from stats_search where day>=? group by q order by n desc limit 60").bind(from),
      ]);
    } catch (e) {
      if (/no such table/i.test(String(e && e.message))) return json(res, 200, { missing: true, today });
      throw e;
    }
    const [days, pages, refs, hours, land, events, search] = out.map((r) => r.results);
    json(res, 200, { today, from, days, pages, refs, hours, land, events, search });
  },

  async "fetch-image"(req, res) {
    if (!(await session(req, res))) return;
    return fetchImage(req, res);
  },

  async "media-cleanup"(req, res) {
    if (!(await session(req, res))) return;
    return mediaCleanup(req, res);
  },
};

// Đã chuyển sang kho theo dòng: khối cũ chỉ còn là bản dự phòng, tab chạy code cũ không được đọc/ghi.
const LEGACY_MSG = "Trang quản lý đã có bản mới. Tải lại trang (F5) để tiếp tục.";

async function write(req, res, conditional) {
  const b = body(req);
  const key = keyOf(b.k);
  if (!key) return bad(res, "Khoá dữ liệu không hợp lệ.");
  if (key === MAIN_KEY && (await recordsStatus()) === "ready") return bad(res, LEGACY_MSG, 409);
  if (typeof b.value !== "string") return bad(res, "Thiếu dữ liệu.");
  const ss = await session(req, res, { checkAuth: key === MAIN_KEY });
  if (!ss) return;
  let value = b.value;
  let mainState = null;
  if (key === MAIN_KEY) {
    try {
      const split = await splitSecrets(value, ss.auth, { allowRestore: ss.auth.accounts[ss.s.u]?.role === "admin" });
      value = split.value;
      mainState = split.state;
    } catch (e) {
      return bad(res, e.message, e.status || 400);
    }
  }
  if (conditional) {
    if (!b.expected) return bad(res, "Thiếu phiên bản dữ liệu.");
    const { data, error } = await client().from(TABLE).update({ value })
      .eq("key", key).eq("updated_at", b.expected).select("updated_at");
    if (error) throw new Error("Supabase ghi lỗi: " + error.message);
    if (!data || !data.length) return json(res, 200, { conflict: true });
    if (mainState) await writeWebSnapshot(mainState); // web khách đọc bản này, không đọc cả blob
    return json(res, 200, { updatedAt: data[0].updated_at });
  }
  const updatedAt = await writeRow(key, value);
  if (mainState) await writeWebSnapshot(mainState);
  json(res, 200, { updatedAt });
}

const POST_OPS = new Set(["pwsalt", "login", "logout", "verify", "set", "cas", "del", "upload", "rput", "put-media"]);

export default handler(async (req, res) => {
  const op = String((req.query && req.query.op) || "");
  const fn = Object.prototype.hasOwnProperty.call(ops, op) ? ops[op] : null;
  if (!fn) return bad(res, "Thao tác không hợp lệ.", 404);
  if (POST_OPS.has(op) && req.method !== "POST") return bad(res, "Chỉ hỗ trợ POST.", 405);
  if (req.method === "POST" && req.headers["x-hili"] !== "1") return bad(res, "Thiếu header bảo vệ.", 403);
  if (req.method === "POST" && op !== "put-media") await readBody(req);
  return fn(req, res);
});
