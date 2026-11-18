/**
 * Helper cho các Serverless Function của website bán hàng (thư mục api/web/).
 *
 * Vì sao cần: web khách chạy ở trình duyệt — KHÔNG được nhúng khoá Supabase
 * (blob dữ liệu chứa giá vốn, khách hàng, mã băm mật khẩu...). Các function này
 * chạy phía server Vercel, đọc khoá từ Environment Variables, lọc sạch dữ liệu
 * rồi mới trả cho web.
 *
 * Environment Variables (Vercel → Project Settings → Environment Variables):
 *   SUPABASE_URL                (hoặc dùng lại VITE_SUPABASE_URL đã có)
 *   SUPABASE_SERVICE_ROLE_KEY   (khuyên dùng — Supabase → Settings → API → service_role)
 *                               nếu chưa đặt sẽ tạm dùng VITE_SUPABASE_ANON_KEY.
 */

import { createClient } from "@supabase/supabase-js";
// Hàm sản phẩm/danh mục web dùng chung với trình duyệt (trang quản lý tự dựng bản danh mục web).
export { slugify, productSlug, stockOf, webStockOf, publicProduct, baseVariantName, findPublished, publishedProducts } from "../../src/lib/webCatalog.js";

// Đọc lúc gọi (không đọc lúc nạp file): trên Cloudflare Worker biến môi trường chỉ có khi đang chạy lượt.
const envUrl = () => process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const envKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const TABLE = "app_state";
// Phải trùng STORAGE_KEY trong SalesManager.jsx. HILI_STORAGE_KEY chỉ dùng khi thử ở máy (như _auth.js).
export const STORAGE_KEY = process.env.HILI_STORAGE_KEY || "solbh-data-v2";

let _client = null;
export function client() {
  const URL = envUrl(), KEY = envKey();
  if (!URL || !KEY) {
    const e = new Error("Thiếu SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY trong Environment Variables của Vercel.");
    e.code = "NO_CONFIG";
    throw e;
  }
  if (!_client) _client = createClient(URL, KEY, { auth: { persistSession: false } });
  return _client;
}

export async function readState() {
  const { data, error } = await client().from(TABLE).select("value, updated_at").eq("key", STORAGE_KEY).maybeSingle();
  if (error) throw new Error("Supabase đọc lỗi: " + error.message);
  if (!data || !data.value) return {};
  try {
    const state = JSON.parse(data.value);
    Object.defineProperty(state, "__version", { value: data.updated_at, enumerable: false });
    return state;
  } catch { return {}; }
}

// Bản đọc có nhớ tạm (20s) trong bộ nhớ của function đang chạy — CHỈ dùng cho API công khai chỉ-đọc
// (products/product/config). Mỗi lần đọc thật là tải + parse cả blob (vài MB) từ Supabase, mất 1-3s;
// khách bấm hết sản phẩm này sang sản phẩm khác (mỗi sản phẩm 1 URL riêng nên không trúng cache
// Edge) sẽ dùng chung bản đã đọc thay vì mỗi lần đọc lại. KHÔNG dùng cho API ghi (orders...) —
// ghi dựa trên dữ liệu cũ sẽ làm mất thay đổi. Nơi gọi KHÔNG được sửa object trả về.
let _stateCache = { at: 0, state: null, pending: null };
const STATE_CACHE_MS = 120000; // 2 phút: gói Supabase Free giới hạn egress, mỗi lần đọc là ~1,2MB
export async function readStateCached() {
  if (_stateCache.state && Date.now() - _stateCache.at < STATE_CACHE_MS) return _stateCache.state;
  if (_stateCache.pending) return _stateCache.pending;
  const pending = readState()
    .then((state) => { _stateCache = { at: Date.now(), state, pending: null }; return state; })
    .catch((e) => {
      _stateCache.pending = null;
      if (_stateCache.state) return _stateCache.state; // lỗi mạng thoáng qua — dùng tạm bản cũ
      throw e;
    });
  _stateCache.pending = pending;
  return pending;
}

/** Bản nhớ tạm đã đọc cách đây bao lâu (ms); chưa có thì Infinity. */
export function stateCacheAge() {
  return _stateCache.state ? Date.now() - _stateCache.at : Infinity;
}
/** Đọc lại bản mới nhất và cập nhật bản nhớ tạm (dùng khi bản nhớ tạm có thể đã cũ). */
export async function readStateFresh() {
  const state = await readState();
  _stateCache = { at: Date.now(), state, pending: null };
  return state;
}

// Ghi có điều kiện: chỉ ghi nếu blob chưa đổi kể từ lúc readState() — nếu đã đổi thì ném CONFLICT để
// handler() chạy lại từ đầu trên dữ liệu mới, không xoá mất thao tác nhân viên vừa lưu.
export async function writeState(state) {
  const value = JSON.stringify(state);
  if (state.__version) {
    const { data, error } = await client().from(TABLE).update({ value })
      .eq("key", STORAGE_KEY).eq("updated_at", state.__version).select("updated_at");
    if (error) throw new Error("Supabase ghi lỗi: " + error.message);
    if (!data || data.length === 0) { const e = new Error("Dữ liệu vừa thay đổi, vui lòng thử lại."); e.code = "CONFLICT"; throw e; }
    return;
  }
  const { error } = await client()
    .from(TABLE)
    .upsert({ key: STORAGE_KEY, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw new Error("Supabase ghi lỗi: " + error.message);
}

/* ---------------- Sao lưu tự động (bảng app_state_backups) ---------------- */


const BACKUP_TABLE = "app_state_backups";

/** Chụp 1 bản blob hiện tại vào bảng backup. Cần SUPABASE_SERVICE_ROLE_KEY (bảng khoá anon). */
export async function snapshotBackup(reason = "cron") {
  const { data, error: readErr } = await client()
    .from(TABLE).select("value").eq("key", STORAGE_KEY).maybeSingle();
  if (readErr) throw new Error("Đọc blob lỗi: " + readErr.message);
  let value = (data && data.value) || "{}";
  // Kèm hàng mật khẩu (<key>:auth — chỉ máy chủ đọc được) vào bản sao lưu, dưới trường "__auth",
  // để khôi phục được cả đăng nhập nếu hàng đó hỏng/mất.
  const { data: authRow } = await client().from(TABLE).select("value").eq("key", STORAGE_KEY + ":auth").maybeSingle();
  if (authRow && authRow.value) {
    try { const st = JSON.parse(value); st.__auth = JSON.parse(authRow.value); value = JSON.stringify(st); } catch { /* giữ bản không kèm */ }
  }
  const { error } = await client()
    .from(BACKUP_TABLE)
    .insert({ reason: String(reason).slice(0, 40), bytes: value.length, value });
  if (error) throw new Error("Ghi backup lỗi: " + error.message + " (đã tạo bảng app_state_backups và đặt SUPABASE_SERVICE_ROLE_KEY chưa?)");
  return { bytes: value.length };
}

/** Giữ lại `keep` bản mới nhất, xoá phần cũ hơn. */
export async function pruneBackups(keep = 60) {
  const { data, error } = await client()
    .from(BACKUP_TABLE).select("taken_at").order("taken_at", { ascending: false }).limit(keep + 200);
  if (error || !Array.isArray(data) || data.length <= keep) return { pruned: 0 };
  const cutoff = data[keep].taken_at;
  const { error: delErr, count } = await client()
    .from(BACKUP_TABLE).delete({ count: "exact" }).lt("taken_at", cutoff);
  if (delErr) return { pruned: 0, warn: delErr.message };
  return { pruned: count || 0 };
}

// cacheControl: mặc định "no-store" (dữ liệu riêng tư/ghi — orders, ai-product-info...). Các API
// đọc công khai (products/product/config) truyền 1 chuỗi Cache-Control ngắn để Vercel Edge trả
// thẳng bản đã cache cho các lượt xem gần nhau (VD xem sản phẩm, đổi phiên bản) thay vì phải đọc
// + parse lại toàn bộ blob Supabase mỗi lần — đây là phần chậm nhất khi duyệt web.
export function json(res, status, payload, cacheControl) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", cacheControl || "no-store");
  res.status(status).json(payload);
}

/** Bọc handler: bắt lỗi chung, map NO_CONFIG → 503. */
export function handler(fn) {
  return async (req, res) => {
    for (let attempt = 0; ; attempt++) {
      try {
        await fn(req, res);
        return;
      } catch (e) {
        if (e.code === "CONFLICT" && attempt < 5) {
          await new Promise((r) => setTimeout(r, 150 + Math.random() * 350));
          continue;
        }
        json(res, e.code === "NO_CONFIG" ? 503 : 500, { error: String(e.message || e) });
        return;
      }
    }
  };
}


function nextCustomerCode(customers) {
  let max = 0;
  customers.forEach((c) => { const m = /^KH(\d+)$/.exec(c.code || ""); if (m) max = Math.max(max, parseInt(m[1], 10)); });
  return "KH" + String(max + 1).padStart(3, "0");
}

/**
 * Tìm/tạo khách hàng theo SĐT (chuẩn hoá chỉ giữ số) — dùng khi khách đặt hàng hoặc đăng ký nhận
 * ưu đãi trên web, để họ TỰ hiện trong danh sách "Khách hàng" ở app quản lý (trước đây đơn/đăng ký
 * từ web không gắn customerId nên khách web không hiện trong danh sách này).
 * Mutate `state.customers` (thêm mới nếu SĐT chưa từng có, không đụng khách đã tồn tại). Trả về customerId,
 * hoặc "" nếu SĐT rỗng.
 */
export function upsertWebCustomer(state, { name, phone, email, note, province, ward, addressDetail } = {}) {
  const cleanPhone = String(phone || "").replace(/\D/g, "");
  if (!cleanPhone) return "";
  state.customers = Array.isArray(state.customers) ? state.customers : [];
  const existing = state.customers.find((c) => String(c.phone || "").replace(/\D/g, "") === cleanPhone);
  if (existing) return existing.id;
  const id = "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  state.customers.push({
    id, code: nextCustomerCode(state.customers), name: (name || "").trim() || "Khách website", phone: cleanPhone,
    contactPerson: "", email: (email || "").trim(), taxCode: "", province: province || "", ward: ward || "", addressDetail: addressDetail || "",
    group: "retail", representativeName: "", representativeTitle: "", assignedTo: "",
    note: note || "", addresses: [], createdAt: new Date().toISOString(),
  });
  return id;
}
