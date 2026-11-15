/**
 * Lớp lưu kho theo TỪNG DÒNG ở trình duyệt (xem src/lib/records.js, api/admin.js op=rget/rsince/rput).
 *
 *  - Mở trang: lấy bản trên máy (IndexedDB) rồi chỉ tải các dòng người khác đổi từ lần trước
 *    (op=rsince). Máy chưa có bản nào mới tải đủ 1 lần (op=rget, 500 dòng/lượt).
 *  - Lưu: so bản mới với bản đã đồng bộ, chỉ gửi dòng đổi (op=rput). Sửa 1 sản phẩm ~ vài KB.
 *    Kèm các dòng "danh mục web" đổi theo (mỗi sản phẩm đã đăng 1 dòng), máy chủ khỏi đọc cả kho.
 *  - Đồng bộ 20s: chỉ hỏi "có ai đổi gì không" (op=poll&rc=...); có thì tải đúng các dòng đó.
 * Máy chủ báo bảng chưa có (chưa chạy supabase/records.sql) -> mode "legacy": storage.js dùng cách cũ.
 */
import { splitState, assembleState, diffMaps, massDeleteProblem, keyOf, parseKey, canon, DOC } from "./records.js";
import { buildWebParts, webPartsToMap, SNAPSHOT_VERSION } from "./webCatalog.js";

const IDB_NAME = "hilitek-cache";
const IDB_STORE = "kv";
const IDB_REC = "rec";
const SECRET_FIELDS = ["passwordHash", "passwordSalt", "passwordAlgo", "passwordIter", "password", "_legacyPassword"];
const ACCOUNTS_KEY = keyOf(DOC, "accounts");

function idb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") return reject(new Error("no idb"));
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
export async function idbDo(mode, fn) {
  const db = await idb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, mode);
      const r = fn(tx.objectStore(IDB_STORE));
      tx.oncomplete = () => resolve(r && "result" in r ? r.result : undefined);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

/** So 2 mốc thời gian dạng chuỗi Postgres: theo mili-giây trước, bằng nhau thì so chuỗi (phần micro-giây). */
function tsGreater(a, b) {
  if (!b) return !!a;
  if (!a) return false;
  const ta = Date.parse(a), tb = Date.parse(b);
  if (ta !== tb) return ta > tb;
  return a > b;
}

function stripAccounts(s) {
  try {
    const arr = JSON.parse(s);
    if (!Array.isArray(arr)) return s;
    return canon(arr.map((a) => { const c = { ...a }; SECRET_FIELDS.forEach((k) => delete c[k]); return c; }));
  } catch { return null; }
}

export function createRecordStore(adminApi, nsKey) {
  const tab = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  let mode = null; // null | "records" | "legacy"
  let base = null; // Map<key, canon string> = bản máy chủ mà tab này biết
  let cursor = null; // mốc updated_at lớn nhất của dòng người khác đã tải
  let remoteChanged = false;
  let lastWeb = null; // Map<khoá, canon> các dòng danh mục web đã gửi; null = chưa biết -> gửi đủ 1 lần
  let persistTimer = null;

  function persistSoon() {
    clearTimeout(persistTimer);
    persistTimer = setTimeout(async () => {
      if (!base) return;
      const rows = [];
      for (const [k, s] of base) {
        if (k === ACCOUNTS_KEY) { const c = stripAccounts(s); if (c) rows.push([k, c]); }
        else rows.push([k, s]);
      }
      const web = lastWeb ? { v: SNAPSHOT_VERSION, rows: [...lastWeb] } : null;
      try { await idbDo("readwrite", (st) => st.put({ ns: nsKey, cursor, rows, web, at: Date.now() }, IDB_REC)); } catch { /* đầy/chặn: bỏ qua */ }
    }, 3000);
  }

  function applyRows(rows) {
    let maxT = null;
    for (const r of rows) {
      const k = keyOf(r.c, r.i);
      if (r.d || r.v == null) base.delete(k);
      else base.set(k, canon(r.v));
      if (tsGreater(r.t, maxT)) maxT = r.t;
    }
    if (tsGreater(maxT, cursor)) cursor = maxT;
  }

  async function fullLoad() {
    const map = new Map();
    let ac = null, ai = null, maxT = null;
    for (;;) {
      const r = await adminApi("rget", { query: ac != null ? { ac, ai } : {} });
      if (r.legacy) return false;
      for (const row of r.rows || []) {
        map.set(keyOf(row.c, row.i), canon(row.v));
        if (tsGreater(row.t, maxT)) maxT = row.t;
      }
      if (!r.more || !(r.rows || []).length) break;
      const last = r.rows[r.rows.length - 1];
      ac = last.c; ai = last.i;
    }
    base = map;
    cursor = maxT || new Date(0).toISOString();
    return true;
  }

  async function pullSince() {
    let after = null;
    for (;;) {
      const r = await adminApi("rsince", { query: after ? { since: cursor, tab, after } : { since: cursor, tab } });
      if (r.legacy) return false;
      const rows = r.rows || [];
      applyRows(rows);
      if (!r.more || !rows.length) break;
      after = rows[rows.length - 1].t;
    }
    return true;
  }

  const version = () => "r:" + cursor;

  return {
    tab,
    get mode() { return mode; },

    /** Tải kho (đủ hoặc phần đổi). Trả { value, updatedAt } hoặc null nếu máy chủ còn dùng cách cũ. */
    async load() {
      if (mode === "legacy") return null;
      if (!base) {
        try {
          const c = await idbDo("readonly", (st) => st.get(IDB_REC));
          // Bản quá 7 ngày thì bỏ (máy chủ dọn dấu xoá sau 30 ngày; bản cũ có thể còn dòng đã xoá).
          if (c && c.ns === nsKey && Array.isArray(c.rows) && c.cursor && Date.now() - (c.at || 0) < 7 * 86400000) {
            base = new Map(c.rows); cursor = c.cursor;
            if (c.web && c.web.v === SNAPSHOT_VERSION && Array.isArray(c.web.rows)) lastWeb = new Map(c.web.rows);
          }
        } catch { /* không có bản trên máy */ }
      }
      let ok;
      if (base && cursor) {
        try { ok = await pullSince(); } catch (e) {
          // Bản trên máy hỏng/lệch: tải đủ lại 1 lần.
          if (e && e.status && e.status < 500) { base = null; ok = await fullLoad(); } else throw e;
        }
      } else ok = await fullLoad();
      if (!ok) { mode = "legacy"; base = null; return null; }
      mode = "records";
      remoteChanged = false;
      persistSoon();
      return { value: JSON.stringify(assembleState(base)), updatedAt: version() };
    },

    /** Lưu: chỉ gửi dòng đổi. Trả { ok, updatedAt } hoặc null nếu chưa ở chế độ dòng. */
    async put(valueStr) {
      if (mode !== "records" || !base) return null;
      const obj = JSON.parse(valueStr);
      const restore = obj.__restore === true;
      delete obj.__restore;
      const { map, present } = splitState(obj);
      const changes = diffMaps(base, map, present);
      if (!restore) {
        const prob = massDeleteProblem(base, changes);
        if (prob) throw new Error(`Đã chặn lưu vì sẽ xoá hàng loạt (${prob}). Tải lại trang rồi kiểm tra.`);
      }
      // Danh mục web: so từng dòng với lần gửi trước; chưa biết lần trước thì gửi đủ + thay toàn bộ.
      let webMap = null, webChanges = [], webReplace = false;
      try {
        webMap = new Map([...webPartsToMap(buildWebParts(obj))].map(([k, v]) => [k, canon(v)]));
        if (!lastWeb) webReplace = true;
        for (const [k, v] of webMap) if (webReplace || lastWeb.get(k) !== v) { const [c, i] = parseKey(k); webChanges.push({ c, i, v }); }
        if (!webReplace) for (const k of lastWeb.keys()) if (!webMap.has(k)) { const [c, i] = parseKey(k); webChanges.push({ c, i, d: 1 }); }
      } catch { webMap = null; webChanges = []; /* dựng lỗi: máy chủ tự dựng khi cần */ }
      if (!changes.length && !webChanges.length) return { ok: true, updatedAt: version() };

      // Chia nhỏ để mỗi lần gửi < ~1,5 MB (chỉ xảy ra khi phục hồi dữ liệu / lần đầu chuẩn hoá).
      const chunks = [];
      let cur = [], size = 0;
      for (const ch of changes) {
        const n = (ch.v ? ch.v.length : 0) + ch.i.length + 40;
        if (cur.length && (size + n > 1500000 || cur.length >= 3000)) { chunks.push(cur); cur = []; size = 0; }
        cur.push(ch); size += n;
      }
      chunks.push(cur);
      for (let i = 0; i < chunks.length; i++) {
        const last = i === chunks.length - 1;
        const body = { tab, changes: chunks[i], restore };
        if (last && webChanges.length) { body.webChanges = webChanges; if (webReplace) body.webReplace = true; }
        await adminApi("rput", { method: "POST", body });
        for (const ch of chunks[i]) {
          const k = keyOf(ch.c, ch.i);
          if (ch.d) base.delete(k); else base.set(k, ch.v);
        }
      }
      if (webMap) lastWeb = webMap;
      persistSoon();
      return { ok: true, updatedAt: version() };
    },

    /** Tham số gửi kèm vòng poll 20s. */
    pollQuery() {
      return mode === "records" && cursor ? { rc: cursor, tab } : null;
    },
    onPoll(r) {
      if (r && typeof r.rchanged === "boolean") remoteChanged = r.rchanged;
    },
    /** Mốc phiên bản cho SalesManager: khác mốc đã đồng bộ -> nó gọi load() để tải phần đổi. */
    meta() {
      return { updatedAt: remoteChanged ? "r:changed:" + cursor : version() };
    },
    async clear() {
      base = null; cursor = null; lastWeb = null;
      try { await idbDo("readwrite", (st) => st.delete(IDB_REC)); } catch { /* bỏ qua */ }
    },
  };
}
