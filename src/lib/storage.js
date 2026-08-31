/**
 * Chọn lớp lưu trữ cho `window.storage` — API key/value riêng của Claude Artifact
 * mà `SalesManager.jsx` gọi qua `loadData()` / `saveData()`:
 *
 *     await window.storage.get(key, shared)   -> { value: "<chuỗi>" } | null
 *     await window.storage.set(key, value, shared)
 *
 * Có 2 backend:
 *   - localStorage (mặc định, giai đoạn 1) — 1 trình duyệt, không đồng bộ.
 *   - Supabase (khi có VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY) — 1 blob JSON
 *     trong bảng `app_state`, đồng bộ đa thiết bị / nhiều người.
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

import {
  isSupabaseConfigured,
  createSupabaseStorage,
  healthCheck,
} from "./supabaseStorage.js";

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
  return {
    async get(key, shared) {
      const res = await backend.get(key, shared);
      if (key !== STORAGE_KEY || !res || !res.value) return res;
      try {
        const obj = JSON.parse(res.value);
        obj.session = { userId: readDeviceSession() };
        return { value: JSON.stringify(obj) };
      } catch {
        return res;
      }
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
    async delete(key, shared) {
      if (key === STORAGE_KEY) writeDeviceSession(null);
      return backend.delete ? backend.delete(key, shared) : { ok: true };
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
};

/**
 * Cài `window.storage` và xác nhận nó dùng được.
 * @returns {Promise<{ backend: "local" | "supabase", error?: string }>}
 */
export async function initStorage() {
  if (typeof window === "undefined") return { backend: "local" };

  if (!isSupabaseConfigured()) {
    window.storage = withDeviceSession(localStorageShim);
    return { backend: "local" };
  }

  const health = await healthCheck();
  if (!health.ok) {
    return {
      backend: "supabase",
      error:
        "Không kết nối được Supabase (đã cấu hình VITE_SUPABASE_URL). " +
        "Chưa mount app để tránh ghi đè dữ liệu.\n\nChi tiết: " +
        health.message,
    };
  }
  window.storage = withDeviceSession(createSupabaseStorage());
  return { backend: "supabase" };
}

/** Giữ lại cho tương thích: cài nhanh localStorage shim, không health-check. */
export function installStorageShim() {
  if (typeof window !== "undefined" && !window.storage) {
    window.storage = withDeviceSession(localStorageShim);
  }
}
