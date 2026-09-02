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

const URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const TABLE = "app_state";
// Phải trùng STORAGE_KEY trong SalesManager.jsx.
const STORAGE_KEY = "solbh-data-v2";

let _client = null;
function client() {
  if (!URL || !KEY) {
    const e = new Error("Thiếu SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY trong Environment Variables của Vercel.");
    e.code = "NO_CONFIG";
    throw e;
  }
  if (!_client) _client = createClient(URL, KEY, { auth: { persistSession: false } });
  return _client;
}

export async function readState() {
  const { data, error } = await client().from(TABLE).select("value").eq("key", STORAGE_KEY).maybeSingle();
  if (error) throw new Error("Supabase đọc lỗi: " + error.message);
  if (!data || !data.value) return {};
  try { return JSON.parse(data.value); } catch { return {}; }
}

export async function writeState(state) {
  const { error } = await client()
    .from(TABLE)
    .upsert({ key: STORAGE_KEY, value: JSON.stringify(state), updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw new Error("Supabase ghi lỗi: " + error.message);
}

export function json(res, status, payload) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.status(status).json(payload);
}

/** Bọc handler: bắt lỗi chung, map NO_CONFIG → 503. */
export function handler(fn) {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (e) {
      json(res, e.code === "NO_CONFIG" ? 503 : 500, { error: String(e.message || e) });
    }
  };
}

/* ---------------- tiện ích sản phẩm ---------------- */

export function slugify(s) {
  return String(s || "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function productSlug(p) {
  const base = slugify(p.name);
  const tail = slugify(p.sku) || String(p.id || "").slice(0, 6);
  return tail ? `${base}-${tail}` : base || String(p.id || "");
}

/** Tồn kho hiện tại = tồn đầu + nhập − xuất (khớp productStats trong SalesManager). */
export function stockOf(p) {
  if (p.isService) return 999999;
  const moves = Array.isArray(p.movements) ? p.movements : [];
  const inQ = moves.filter((m) => m.type === "in").reduce((s, m) => s + (Number(m.qty) || 0), 0);
  const outQ = moves.filter((m) => m.type === "out").reduce((s, m) => s + (Number(m.qty) || 0), 0);
  return (Number(p.openingQty) || 0) + inQ - outQ;
}

/** Chỉ trả field an toàn cho web. KHÔNG có: giá vốn, giá sỉ, NCC, movements, series. */
export function publicProduct(p, { detail = false } = {}) {
  const web = p.web || {};
  // Giá bán web = giá bán lẻ ở "Sản phẩm & tồn kho" (đồng bộ 1 giá, không có ô "Giá web" riêng).
  const price = Number(p.retailPrice) || 0;
  // Giá gạch bỏ: "Giá so sánh" chủ shop tự nhập; bỏ trống = không hiện.
  const compareAt = Number(web.compareAtPrice) > 0 ? Number(web.compareAtPrice) : 0;
  const listPrice = Math.max(compareAt, price); // storefront tự bỏ qua khi listPrice <= price
  const specs = (Array.isArray(web.specs) ? web.specs : [])
    .map((r) => (Array.isArray(r) ? [String(r[0] || "").trim(), String(r[1] || "").trim()] : null))
    .filter((r) => r && (r[0] || r[1]));
  const desc = typeof web.description === "string" ? web.description : "";

  // Danh mục web: ưu tiên web.categories (chủ shop tự gán), không có thì dùng "Nhóm hàng".
  const webCats = Array.isArray(web.categories) && web.categories.length
    ? web.categories.filter((x) => typeof x === "string" && x.trim())
    : (p.category ? [p.category] : []);

  const out = {
    id: p.id,
    sku: p.sku || "",
    slug: web.slug ? slugify(web.slug) : productSlug(p),
    name: p.name || "",
    brand: p.brand || "",
    category: webCats[0] || p.category || "",
    categories: webCats,
    group: "", // storefront tự map category → nhóm qua CATEGORY_TO_GROUP
    price,
    listPrice,
    warrantyMonths: Number(p.warrantyMonths) || 0,
    weight: Number(p.weight) || 0,
    stock: Math.max(0, stockOf(p)),
    hasSerial: !!p.hasSeries,
    shortDesc: (desc.split(/\n{2,}/)[0] || "").slice(0, 180),
    specChips: specs.slice(0, 4).map(([k, v]) => v || k).filter(Boolean),
    specs, // cần cho bộ lọc "thông số" ở trang danh mục (nhẹ — vài cặp nhãn|giá trị)
    images: [p.image, ...(Array.isArray(p.images) ? p.images : [])].filter(Boolean),
  };
  if (detail) {
    out.description = desc;
  }
  return out;
}

/** Danh sách sản phẩm đã bật "Đăng web" (web.published). */
export function publishedProducts(state) {
  const list = Array.isArray(state.products) ? state.products : [];
  return list.filter((p) => p && p.web && p.web.published);
}
