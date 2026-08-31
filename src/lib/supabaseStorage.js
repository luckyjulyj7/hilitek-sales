/**
 * Lớp lưu trữ Supabase — giai đoạn 2, hướng "1 blob JSON".
 *
 * Toàn bộ dữ liệu app nằm trong 1 bảng `app_state` (xem `supabase/schema.sql`):
 *     app_state ( key text primary key, value text, updated_at timestamptz )
 *
 * Backend này cài `window.storage` với ĐÚNG chữ ký bản gốc gọi, nên
 * `loadData()` / `saveData()` trong `SalesManager.jsx` không phải sửa:
 *     await window.storage.get(key, shared)   -> { value: "<chuỗi>" } | null
 *     await window.storage.set(key, value, shared)
 *
 * `value` luôn là chuỗi (JSON.stringify ở saveData, hoặc "1" ở marker) nên cột
 * `value` để kiểu text cho round-trip chính xác, không cần parse/stringify.
 * Tham số `shared` bị bỏ qua (mọi client đọc/ghi cùng 1 hàng).
 *
 * An toàn dữ liệu: nếu đã cấu hình Supabase mà kết nối/health-check hỏng,
 * `initStorage()` (trong storage.js) KHÔNG mount app — tránh trường hợp
 * loadData() nuốt lỗi, rơi về seedData() rồi auto-save đè mất dữ liệu cloud.
 */

import { createClient } from "@supabase/supabase-js";

const TABLE = "app_state";

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

let _client = null;
export function getClient() {
  if (!_client) {
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
  }
  return _client;
}

/**
 * Kiểm tra kết nối + bảng `app_state` tồn tại + đọc được.
 * Trả về { ok: true } hoặc { ok: false, message }.
 */
export async function healthCheck() {
  try {
    const { error } = await getClient()
      .from(TABLE)
      .select("key", { count: "exact", head: true });
    if (error) {
      return {
        ok: false,
        message:
          error.message +
          (/relation .* does not exist|schema cache/i.test(error.message || "")
            ? " — có vẻ bảng `app_state` chưa được tạo. Chạy supabase/schema.sql trong SQL Editor."
            : ""),
      };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e?.message || String(e) };
  }
}

// Đọc có retry cho lỗi mạng thoáng qua (không retry lỗi cấu hình/bảng).
async function selectValue(key, attempt = 0) {
  const { data, error } = await getClient()
    .from(TABLE)
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    const transient = /fetch|network|timeout|503|429|ECONN/i.test(error.message || "");
    if (transient && attempt < 4) {
      await new Promise((r) => setTimeout(r, 400 * 2 ** attempt));
      return selectValue(key, attempt + 1);
    }
    throw new Error(`Supabase get("${key}"): ${error.message}`);
  }
  return data ? data.value : null;
}

export function createSupabaseStorage() {
  return {
    async get(key /* , shared */) {
      const value = await selectValue(key);
      if (value == null) return null;
      return { value: typeof value === "string" ? value : JSON.stringify(value) };
    },

    async set(key, value /* , shared */) {
      const row = {
        key,
        value: typeof value === "string" ? value : JSON.stringify(value),
        updated_at: new Date().toISOString(),
      };
      const { error } = await getClient()
        .from(TABLE)
        .upsert(row, { onConflict: "key" });
      if (error) throw new Error(`Supabase set("${key}"): ${error.message}`);
      return { ok: true };
    },

    async delete(key /* , shared */) {
      const { error } = await getClient().from(TABLE).delete().eq("key", key);
      if (error) throw new Error(`Supabase delete("${key}"): ${error.message}`);
      return { ok: true };
    },
  };
}
