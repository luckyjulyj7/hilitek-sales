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
 */

import {
  isSupabaseConfigured,
  createSupabaseStorage,
  healthCheck,
} from "./supabaseStorage.js";

const PREFIX = "hilitek:";
const mem = new Map(); // dự phòng khi localStorage bị chặn

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
    window.storage = localStorageShim;
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
  window.storage = createSupabaseStorage();
  return { backend: "supabase" };
}

/** Giữ lại cho tương thích: cài nhanh localStorage shim, không health-check. */
export function installStorageShim() {
  if (typeof window !== "undefined" && !window.storage) {
    window.storage = localStorageShim;
  }
}
