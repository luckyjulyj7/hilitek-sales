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
  readRow, readJsonRow, writeRow, loadAuth, splitSecrets, stripAccounts, verifyHash,
  startSession, endSession, requireSession, kickedAfter,
  checkLock, recordFail, clearFails, upgradeIfLegacy,
} from "./web/_auth.js";
import fetchImage from "./web/_fetchImage.js";
import mediaCleanup from "./web/_mediaCleanup.js";

const TABLE = "app_state";
const BUCKET = "product-media";

function body(req) {
  const b = req.body;
  if (b && typeof b === "object") return b;
  try { return JSON.parse(b || "{}"); } catch { return {}; }
}
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

const ops = {
  async login(req, res) {
    const { username, password } = body(req);
    const name = String(username || "").trim().toLowerCase();
    if (!name || !password) return bad(res, "Nhập tên đăng nhập và mật khẩu.");
    const lockedMin = await checkLock(name);
    if (lockedMin) return bad(res, `Sai mật khẩu quá nhiều lần. Thử lại sau ${lockedMin} phút.`, 429);
    const auth = await loadAuth();
    const id = Object.keys(auth.accounts).find((k) => auth.accounts[k].username === name);
    const entry = id && auth.accounts[id];
    if (!entry || !entry.active) return bad(res, "Tài khoản không tồn tại hoặc đã bị khoá.", 401);
    if (!verifyHash(entry, password)) {
      const r = await recordFail(name);
      return bad(res, r.locked ? `Sai mật khẩu 5 lần. Tạm khoá đăng nhập ${r.locked} phút.` : `Sai mật khẩu (còn ${r.left} lần thử).`, 401);
    }
    await clearFails(name);
    if (auth.migratedAt) await upgradeIfLegacy(auth, id, password);
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
    const { password } = body(req);
    const key = "verify:" + ss.s.u;
    const lockedMin = await checkLock(key);
    if (lockedMin) return json(res, 200, { ok: false, locked: lockedMin });
    if (!verifyHash(ss.auth.accounts[ss.s.u], String(password || ""))) {
      const r = await recordFail(key);
      return json(res, 200, { ok: false, ...r });
    }
    await clearFails(key);
    json(res, 200, { ok: true });
  },

  async poll(req, res) {
    const ss = await session(req, res);
    if (!ss) return;
    const { data, error } = await client().from(TABLE).select("updated_at").eq("key", MAIN_KEY).maybeSingle();
    if (error) throw new Error("Supabase đọc lỗi: " + error.message);
    json(res, 200, { updatedAt: data ? data.updated_at : null, kicks: ss.kicks });
  },

  async get(req, res) {
    const key = keyOf(req.query.k);
    if (!key) return bad(res, "Khoá dữ liệu không hợp lệ.");
    const ss = await session(req, res, { checkAuth: key === MAIN_KEY });
    if (!ss) return;
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
    json(res, 200, { updatedAt: data ? data.updated_at : null });
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
    json(res, 200, { path: data.path || path, token: data.token });
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

async function write(req, res, conditional) {
  const b = body(req);
  const key = keyOf(b.k);
  if (!key) return bad(res, "Khoá dữ liệu không hợp lệ.");
  if (typeof b.value !== "string") return bad(res, "Thiếu dữ liệu.");
  const ss = await session(req, res, { checkAuth: key === MAIN_KEY });
  if (!ss) return;
  let value = b.value;
  if (key === MAIN_KEY) {
    try {
      value = (await splitSecrets(value, ss.auth)).value;
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
    return json(res, 200, { updatedAt: data[0].updated_at });
  }
  const updatedAt = await writeRow(key, value);
  json(res, 200, { updatedAt });
}

const POST_OPS = new Set(["login", "logout", "verify", "set", "cas", "del", "upload"]);

export default handler(async (req, res) => {
  const op = String((req.query && req.query.op) || "");
  const fn = Object.prototype.hasOwnProperty.call(ops, op) ? ops[op] : null;
  if (!fn) return bad(res, "Thao tác không hợp lệ.", 404);
  if (POST_OPS.has(op) && req.method !== "POST") return bad(res, "Chỉ hỗ trợ POST.", 405);
  if (req.method === "POST" && req.headers["x-hili"] !== "1") return bad(res, "Thiếu header bảo vệ.", 403);
  return fn(req, res);
});
