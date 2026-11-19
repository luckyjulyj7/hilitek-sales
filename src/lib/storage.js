/**
 * Chọn lớp lưu trữ cho `window.storage` — API key/value riêng của Claude Artifact
 * mà `SalesManager.jsx` gọi qua `loadData()` / `saveData()`:
 *
 *     await window.storage.get(key, shared)   -> { value: "<chuỗi>" } | null
 *     await window.storage.set(key, value, shared)
 *
 * Có 2 backend:
 *   - localStorage (mặc định, giai đoạn 1) — 1 trình duyệt, không đồng bộ.
 *   - Máy chủ /api/admin (khi có VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY) — 1 blob JSON
 *     trong bảng `app_state` trên Supabase, nhưng chỉ máy chủ đọc/ghi (sau khi đăng nhập).
 *
 * Dùng `initStorage()` ở main.jsx: nó cài backend và (với Supabase) chạy health-check
 * TRƯỚC khi mount app, để lỗi kết nối không khiến app rơi về seedData rồi đè dữ liệu.
 *
 * QUAN TRỌNG — tách phiên đăng nhập theo thiết bị (withDeviceSession):
 *   Bản gốc lưu `session.userId` (ai đang đăng nhập) CHUNG trong blob dữ liệu.
 *   Với Supabase, blob là 1 hàng dùng chung => ai mở link cũng nhận luôn phiên
 *   của người đăng nhập gần nhất (vào thẳng, không cần mật khẩu).
 *   Wrapper này chặn điều đó: khi ghi, rút `session` ra localStorage của MÁY hiện
 *   tại rồi mới ghi phần còn lại lên backend (blob luôn session=null); khi đọc,
 *   ghép `session` từ localStorage máy này vào. `SalesManager.jsx` không phải sửa.
 */

import { isServerMode } from "./supabaseStorage.js";
import { adminApi } from "./adminApi.js";
import { createRecordStore } from "./recordStore.js";

const PREFIX = "hilitek:";
const mem = new Map(); // dự phòng khi localStorage bị chặn

// Phải khớp STORAGE_KEY trong SalesManager.jsx (`const STORAGE_KEY = "solbh-data-v2"`).
const STORAGE_KEY = "solbh-data-v2";
const SESSION_LS_KEY = PREFIX + "session-userId"; // phiên đăng nhập, riêng từng máy

function readRaw(key) {
  try {
    return localStorage.getItem(PREFIX + key);
  } catch {
    return mem.has(key) ? mem.get(key) : null;
  }
}
function writeRaw(key, value) {
  try {
    localStorage.setItem(PREFIX + key, value);
  } catch {
    mem.set(key, value);
  }
}

function readDeviceSession() {
  try {
    return localStorage.getItem(SESSION_LS_KEY) || null;
  } catch {
    return mem.get(SESSION_LS_KEY) || null;
  }
}
function writeDeviceSession(userId) {
  try {
    if (userId) localStorage.setItem(SESSION_LS_KEY, userId);
    else localStorage.removeItem(SESSION_LS_KEY);
  } catch {
    if (userId) mem.set(SESSION_LS_KEY, userId);
    else mem.delete(SESSION_LS_KEY);
  }
}

/**
 * Bọc 1 backend để `session.userId` không bao giờ đi vào blob dùng chung —
 * nó nằm ở localStorage của riêng máy đang mở app.
 */
function withDeviceSession(backend) {
  const wrapped = {
    async get(key, shared) {
      const res = await backend.get(key, shared);
      if (key !== STORAGE_KEY || !res || !res.value) return res;
      try {
        const obj = JSON.parse(res.value);
        obj.session = { userId: readDeviceSession() };
        return { value: JSON.stringify(obj), updatedAt: res.updatedAt };
      } catch {
        return res;
      }
    },
    async getMeta(key, shared) {
      return backend.getMeta ? backend.getMeta(key, shared) : { updatedAt: null };
    },
    async set(key, value, shared) {
      if (key !== STORAGE_KEY) return backend.set(key, value, shared);
      try {
        const obj = JSON.parse(value);
        writeDeviceSession(obj && obj.session ? obj.session.userId : null);
        if (obj && obj.session) obj.session = { userId: null };
        return backend.set(key, JSON.stringify(obj), shared);
      } catch {
        return backend.set(key, value, shared);
      }
    },
    async casSet(key, value, expectedUpdatedAt) {
      const obj = JSON.parse(value);
      writeDeviceSession(obj && obj.session ? obj.session.userId : null);
      if (obj && obj.session) obj.session = { userId: null };
      return backend.casSet(key, JSON.stringify(obj), expectedUpdatedAt);
    },
    async delete(key, shared) {
      if (key === STORAGE_KEY) writeDeviceSession(null);
      return backend.delete ? backend.delete(key, shared) : { ok: true };
    },
  };
  if (!backend.casSet) delete wrapped.casSet; // localStorage: 1 trình duyệt, không cần
  return wrapped;
}

/**
 * Backend qua máy chủ (/api/admin) — trình duyệt KHÔNG chạm thẳng Supabase. Khoá trong app được
 * đổi sang tên logic (main/locks/kicks/marker); máy chủ chỉ cho đọc/ghi đúng các hàng đó.
 * get(kicks) đi chung 1 request "poll" với mốc updated_at, getMeta(main) ngay sau đó dùng lại kết
 * quả (vòng đồng bộ 20s chỉ tốn 1 lượt gọi function thay vì 2).
 */
// Báo kết quả op=poll cho các phần khác của trang (VD chat nội bộ: poll kèm id tin mới nhất), không tốn thêm lượt gọi.
function emitPoll(r) {
  try { window.dispatchEvent(new CustomEvent("hili-poll", { detail: r })); } catch { /* bỏ qua */ }
}
const LOGICAL = {
  [STORAGE_KEY]: "main",
  [STORAGE_KEY + ":edit-locks"]: "locks",
  [STORAGE_KEY + ":kicked-accounts"]: "kicks",
  [STORAGE_KEY + ":shared-migrated"]: "marker",
};
function logical(key) {
  const k = LOGICAL[key];
  if (!k) throw new Error(`Khoá dữ liệu không được hỗ trợ: ${key}`);
  return k;
}
/*
 * Bản sao dữ liệu chính trên máy (IndexedDB), để MỞ LẠI / TẢI LẠI trang không phải kéo cả bộ dữ liệu
 * (~1,6 MB egress Supabase mỗi lần). Khi mở trang: gửi kèm mốc updatedAt của bản trên máy, máy chủ
 * chỉ so mốc (vài byte) — chưa ai lưu gì thì dùng luôn bản trên máy. Sau mỗi lần lưu thành công, bản
 * trên máy được thay bằng đúng bản vừa lưu + mốc máy chủ trả về. Đăng xuất thì xoá bản này.
 * Không lưu mật khẩu/mã băm (xoá các trường bí mật của tài khoản trước khi ghi).
 */
const IDB_NAME = "hilitek-cache";
const IDB_STORE = "kv";
const IDB_MAIN = "main";
const SECRET_FIELDS = ["passwordHash", "passwordSalt", "passwordAlgo", "passwordIter", "password", "_legacyPassword"];
function idb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") return reject(new Error("no idb"));
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idbDo(mode, fn) {
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
async function cacheRead() {
  try {
    const v = await idbDo("readonly", (st) => st.get(IDB_MAIN));
    return v && typeof v.value === "string" && v.updatedAt ? v : null;
  } catch { return null; }
}
async function cacheWrite(value, updatedAt) {
  try { await idbDo("readwrite", (st) => st.put({ value, updatedAt, at: Date.now() }, IDB_MAIN)); } catch { /* hết chỗ / chặn: bỏ qua */ }
}
let _rec = null; // kho theo dòng của trang đang mở
export async function clearMainCache() {
  try { await idbDo("readwrite", (st) => st.delete(IDB_MAIN)); } catch { /* bỏ qua */ }
  if (_rec) await _rec.clear();
}
function stripSecrets(value) {
  try {
    const st = JSON.parse(value);
    if (st && Array.isArray(st.accounts)) st.accounts = st.accounts.map((a) => { const c = { ...a }; SECRET_FIELDS.forEach((k) => delete c[k]); return c; });
    return JSON.stringify(st);
  } catch { return null; }
}
// Lưu liên tục (tự lưu 400ms) -> chỉ ghi bản trên máy cho lần lưu MỚI NHẤT, lúc trình duyệt rảnh.
let _pendingCache = null;
function cacheAfterSave(value, updatedAt) {
  const first = !_pendingCache;
  _pendingCache = { value, updatedAt };
  if (!first) return;
  setTimeout(async () => {
    const job = _pendingCache;
    _pendingCache = null;
    const clean = stripSecrets(job.value);
    if (clean) await cacheWrite(clean, job.updatedAt);
    else await clearMainCache();
  }, 1500);
}

export function createApiStorage() {
  let lastPoll = null; // { at, updatedAt }
  // Kho theo TỪNG DÒNG (src/lib/recordStore.js). Máy chủ chưa có bảng app_records -> rec.mode
  // "legacy" và mọi thứ dưới đây chạy như cũ (cả khối + bản trên máy).
  const rec = createRecordStore(adminApi, STORAGE_KEY);
  _rec = rec;
  return {
    api: true,
    async get(key /* , shared */) {
      const k = logical(key);
      if (k === "kicks") {
        const r = await adminApi("poll", { query: rec.pollQuery() || {} });
        lastPoll = { at: Date.now(), updatedAt: r.updatedAt };
        rec.onPoll(r);
        emitPoll(r);
        return { value: JSON.stringify(r.kicks || {}) };
      }
      if (k === "main") {
        const got = await rec.load();
        if (got) return got;
        const cached = await cacheRead();
        const r = await adminApi("get", { query: cached ? { k, since: cached.updatedAt } : { k } });
        if (r.notModified && cached) return { value: cached.value, updatedAt: cached.updatedAt };
        if (r.value == null) return null;
        cacheWrite(r.value, r.updatedAt || null);
        return { value: r.value, updatedAt: r.updatedAt || null };
      }
      const r = await adminApi("get", { query: { k } });
      if (r.value == null) return null;
      return { value: r.value, updatedAt: r.updatedAt || null };
    },
    async getMeta(key /* , shared */) {
      const k = logical(key);
      if (k === "main" && rec.mode === "records") {
        if (!(lastPoll && Date.now() - lastPoll.at < 5000)) { const r = await adminApi("poll", { query: rec.pollQuery() || {} }); rec.onPoll(r); emitPoll(r); }
        lastPoll = null;
        return rec.meta();
      }
      if (k === "main" && lastPoll && Date.now() - lastPoll.at < 5000) {
        const p = lastPoll;
        lastPoll = null;
        return { updatedAt: p.updatedAt };
      }
      const r = await adminApi("meta", { query: { k } });
      return { updatedAt: r.updatedAt || null };
    },
    async set(key, value /* , shared */) {
      const k = logical(key);
      const v = typeof value === "string" ? value : JSON.stringify(value);
      if (k === "main" && rec.mode === "records") return rec.put(v);
      if (k === "main") await clearMainCache(); // đang ghi: bản trên máy không còn chắc đúng
      const r = await adminApi("set", { method: "POST", body: { k, value: v } });
      if (k === "main" && r.updatedAt) cacheAfterSave(v, r.updatedAt);
      return { ok: true, updatedAt: r.updatedAt || null };
    },
    async casSet(key, value, expectedUpdatedAt) {
      const k = logical(key);
      // Kho theo dòng: mỗi dòng ghi đè riêng, không còn xung đột cả khối -> không cần so phiên bản.
      if (k === "main" && rec.mode === "records") return rec.put(value);
      const r = await adminApi("cas", { method: "POST", body: { k, value, expected: expectedUpdatedAt } });
      if (r.conflict) return { conflict: true };
      if (k === "main" && r.updatedAt) cacheAfterSave(value, r.updatedAt);
      return { ok: true, updatedAt: r.updatedAt };
    },
    async delete(key /* , shared */) {
      if (key === STORAGE_KEY) return { ok: true }; // không bao giờ xoá blob chính từ trình duyệt
      await adminApi("del", { method: "POST", body: { k: logical(key) } });
      return { ok: true };
    },
  };
}

export const localStorageShim = {
  async get(key /* , shared */) {
    const raw = readRaw(key);
    if (raw == null) return null;
    return { value: raw };
  },
  async set(key, value /* , shared */) {
    writeRaw(key, typeof value === "string" ? value : JSON.stringify(value));
    return { ok: true };
  },
  async delete(key /* , shared */) {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {
      mem.delete(key);
    }
    return { ok: true };
  },
  // 1 trình duyệt, không có rủi ro nhiều người ghi đè nhau — không cần kiểm tra.
  async getMeta(/* key, shared */) {
    return { updatedAt: null };
  },
};

/**
 * Cài `window.storage` và xác nhận nó dùng được.
 * Chế độ máy chủ: hỏi /api/admin?op=me — chưa đăng nhập thì trả needLogin (main.jsx hiện màn đăng nhập).
 * @returns {Promise<{ backend: "local" | "api", needLogin?: boolean, error?: string }>}
 */
export async function initStorage() {
  if (typeof window === "undefined") return { backend: "local" };

  if (!isServerMode()) {
    window.storage = withDeviceSession(localStorageShim);
    return { backend: "local" };
  }

  window.storage = withDeviceSession(createApiStorage());
  window.storage.api = true;
  try {
    const me = await adminApi("me");
    // Máy chủ là nguồn sự thật về ai đang đăng nhập trên máy này.
    writeDeviceSession(me.userId);
    return { backend: "api" };
  } catch (e) {
    if (e.status === 401) {
      writeDeviceSession(null);
      return { backend: "api", needLogin: true };
    }
    return {
      backend: "api",
      error:
        "Không kết nối được máy chủ dữ liệu. Chưa mở app để tránh ghi đè dữ liệu.\n\nChi tiết: " +
        (e.message || e),
    };
  }
}

/** Giữ lại cho tương thích: cài nhanh localStorage shim, không health-check. */
export function installStorageShim() {
  if (typeof window !== "undefined" && !window.storage) {
    window.storage = withDeviceSession(localStorageShim);
  }
}
