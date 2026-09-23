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

/* ---------------- Sao lưu tự động (bảng app_state_backups) ---------------- */

const BACKUP_TABLE = "app_state_backups";

/** Chụp 1 bản blob hiện tại vào bảng backup. Cần SUPABASE_SERVICE_ROLE_KEY (bảng khoá anon). */
export async function snapshotBackup(reason = "cron") {
  const { data, error: readErr } = await client()
    .from(TABLE).select("value").eq("key", STORAGE_KEY).maybeSingle();
  if (readErr) throw new Error("Đọc blob lỗi: " + readErr.message);
  const value = (data && data.value) || "{}";
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
  // Đường dẫn sản phẩm = slug từ tên, KHÔNG gắn mã/SKU ở đuôi.
  return slugify(p.name) || slugify(p.sku) || String(p.id || "");
}

/** Tồn kho hiện tại = tồn đầu + nhập − xuất (khớp productStats trong SalesManager). */
export function stockOf(p) {
  if (p.isService) return 999999;
  const moves = Array.isArray(p.movements) ? p.movements : [];
  const inQ = moves.filter((m) => m.type === "in").reduce((s, m) => s + (Number(m.qty) || 0), 0);
  const outQ = moves.filter((m) => m.type === "out").reduce((s, m) => s + (Number(m.qty) || 0), 0);
  return (Number(p.openingQty) || 0) + inQ - outQ;
}

/**
 * Tồn KHO HIỂN THỊ TRÊN WEB.
 * - Nếu chủ shop bật "Tồn kho ảo bán online" (web.virtualStock): dùng số ảo (không lộ tồn thật,
 *   web luôn có vẻ còn hàng — dùng cho hàng dropship / nhập nhanh từ NPP).
 * - Ngược lại: dùng tồn thật.
 */
export function webStockOf(p) {
  const web = p && p.web ? p.web : {};
  if (web.virtualStock) {
    const q = Math.floor(Number(web.virtualStockQty) || 0);
    return q > 0 ? q : 8; // dự phòng nếu chưa đặt số
  }
  return Math.max(0, stockOf(p));
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
  // "Flash Sale" là danh mục đặc biệt (chỉ để lọc khối Flash Sale) — giữ trong mảng nhưng
  // KHÔNG để nó làm danh mục chính (tránh hiện "Flash Sale" ở breadcrumb sản phẩm).
  const FLASH_CAT = "Flash Sale";
  const rawCats = Array.isArray(web.categories) && web.categories.length
    ? web.categories.filter((x) => typeof x === "string" && x.trim())
    : (p.category ? [p.category] : []);
  const realCats = rawCats.filter((c) => c !== FLASH_CAT);
  const webCats = realCats.length ? [...realCats, ...rawCats.filter((c) => c === FLASH_CAT)] : rawCats;

  // Ảnh: ưu tiên ảnh chất lượng cao chủ shop thêm riêng cho web (web.images), không có thì lấy ảnh sản phẩm.
  const webImgs = (Array.isArray(web.images) ? web.images : []).filter((s) => typeof s === "string" && s.trim());
  const images = webImgs.length
    ? webImgs.slice(0, 10)
    : [p.image, ...(Array.isArray(p.images) ? p.images : [])].filter(Boolean);

  // Mô tả lưu dạng HTML (soạn thảo Quill) — bỏ thẻ HTML để lấy đoạn preview thuần chữ khi chủ shop
  // chưa tự nhập "Mô tả ngắn". Dữ liệu cũ (trước khi đổi sang Quill) là văn bản Markdown — bỏ thẻ
  // không ảnh hưởng gì (không có thẻ để bỏ), vẫn ra kết quả hợp lý.
  const shortDesc = (typeof web.shortDesc === "string" && web.shortDesc.trim())
    ? web.shortDesc.trim().slice(0, 300)
    : desc.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/https?:\/\/\S+/g, "").replace(/\s+/g, " ").trim().slice(0, 180);

  const out = {
    id: p.id,
    sku: p.sku || "",
    slug: web.slug ? slugify(web.slug) : productSlug(p),
    name: p.name || "",
    // Phiên bản (màu sắc/kích cỡ...) — sản phẩm tạo hàng loạt phiên bản ở admin dùng chung
    // variantGroupId, mỗi phiên bản có variantAttrs riêng (VD {"Màu sắc":"Đen"}). Web dùng để
    // gộp các phiên bản thành 1 sản phẩm có nút chọn option, thay vì hiện thành nhiều SP rời rạc.
    variantGroupId: p.variantGroupId || "",
    variantAttrs: p.variantAttrs && typeof p.variantAttrs === "object" ? p.variantAttrs : null,
    brand: p.brand || "",
    category: webCats[0] || p.category || "",
    categories: webCats,
    group: "", // storefront tự map category → nhóm qua CATEGORY_TO_GROUP
    price,
    listPrice,
    warrantyMonths: Number(p.warrantyMonths) || 0,
    weight: Number(p.weight) || 0,
    stock: webStockOf(p),
    hasSerial: !!p.hasSeries,
    shortDesc,
    promo: typeof web.promo === "string" ? web.promo.trim().slice(0, 600) : "", // khuyến mãi / quà tặng ngắn (mỗi dòng 1 ý)
    // Chip thông số nổi bật — ưu tiên thông số DỄ HIỂU với khách (VD "Compact 65%", "Màn hình 2.3
    // inch"), bỏ qua dòng kiểu "SKU/Mã sản phẩm/Model" hay giá trị trông như mã nội bộ (VD
    // "VSKY-NIMBUS-65-A-DK-TE") — khách không cần thấy mã kỹ thuật ở ngay dưới tên sản phẩm. Nếu
    // sau khi lọc không còn đủ 4 dòng thì mới lấy tạm cả các dòng bị lọc, cho có nội dung hiển thị.
    specChips: (() => {
      const looksLikeCode = ([k, v]) =>
        /sku|mã sản phẩm|mã hàng|mã vt|model|part\s*number/i.test(k) ||
        /^[A-Z0-9]+(-[A-Z0-9]+){2,}$/.test(v);
      const good = specs.filter((r) => !looksLikeCode(r));
      const source = (good.length ? good : specs).slice(0, 4);
      // Giới hạn độ dài mỗi "chip" — dòng thông số đầu tiên đôi khi bị dán nguyên khối dài (VD liệt kê
      // hết các mã phiên bản trên 1 dòng, không xuống dòng) khiến khối chip vỡ bố cục trên web khách.
      return source.map(([k, v]) => {
        const val = String(v || k).split("\n")[0].trim();
        return val.length > 60 ? val.slice(0, 60).trim() + "…" : val;
      }).filter(Boolean);
    })(),
    specs, // cần cho bộ lọc "thông số" ở trang danh mục (nhẹ — vài cặp nhãn|giá trị)
    images,
  };
  if (detail) {
    out.description = desc;
    out.seoTitle = typeof web.seoTitle === "string" ? web.seoTitle.trim() : "";
    out.seoDesc = typeof web.seoDesc === "string" ? web.seoDesc.trim() : "";
  }
  return out;
}

export { baseVariantName } from "../../src/lib/variants.js";

/** Danh sách sản phẩm đã bật "Đăng web" (web.published). */
export function publishedProducts(state) {
  const list = Array.isArray(state.products) ? state.products : [];
  // Ưu tiên (web.priority) càng lớn càng lên đầu — dùng cho mặc định "Phổ biến" ở web khách (chưa
  // tự chọn sắp xếp/lọc theo giá...). Bằng nhau (đa số = 0) thì giữ nguyên thứ tự cũ (sort ổn định).
  return list
    .filter((p) => p && p.web && p.web.published)
    .sort((a, b) => (Number(b.web.priority) || 0) - (Number(a.web.priority) || 0));
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
    note: note || "", addresses: [],
  });
  return id;
}
