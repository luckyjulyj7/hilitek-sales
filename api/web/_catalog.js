/**
 * "Bản danh mục web" (snapshot) — hàng riêng `<STORAGE_KEY>:web` trong bảng app_state.
 *
 * Vì sao có file này (15/11/2026, Supabase Free bị chặn vì egress 125%): trước đây mọi API công
 * khai (products/product/config/page/sitemap) đọc CẢ blob "main" (~3,9 MB: đơn hàng, khách hàng,
 * nhật ký, tồn kho...) chỉ để lấy vài chục sản phẩm đã đăng web. Mỗi lần Vercel bật 1 instance mới
 * hoặc ai đó gọi kèm cache-buster (&x=...) là ~1,6 MB egress Supabase.
 *
 * Giờ: mỗi lần trang quản lý LƯU (api/admin.js) hoặc web nhận đơn (orders.js), máy chủ dựng sẵn bản
 * danh mục công khai (chỉ sản phẩm đã đăng, đã lọc giá vốn/NCC) và ghi vào hàng `:web`. API công
 * khai chỉ đọc hàng nhỏ này. Thiếu hàng hoặc khác phiên bản code -> tự dựng lại từ blob 1 lần.
 */
import { client, readState, publishedProducts, publicProduct, baseVariantName, STORAGE_KEY } from "./_supa.js";
import { autoComparePrice } from "../../src/lib/autoComparePrice.js";

const TABLE = "app_state";
export const WEB_KEY = STORAGE_KEY + ":web";
// Tăng số này khi đổi cách dựng (publicProduct, gộp phiên bản...) để bản cũ tự dựng lại sau deploy.
const SNAPSHOT_VERSION = 1;

/** Danh sách cho /api/web/products: gộp các phiên bản cùng nhóm thành 1 thẻ đại diện. */
function buildList(raw) {
  const mapped = raw.map((p) => publicProduct(p));
  const groups = new Map(); // variantGroupId -> [{ pub, raw }...]
  const singles = [];
  mapped.forEach((p, i) => {
    if (!p.variantGroupId) { singles.push(p); return; }
    if (!groups.has(p.variantGroupId)) groups.set(p.variantGroupId, []);
    groups.get(p.variantGroupId).push({ pub: p, raw: raw[i] });
  });
  const merged = [...groups.values()].map((entries) => {
    const variants = entries.map((e) => e.pub);
    if (variants.length === 1) return variants[0];
    // Đại diện cả nhóm: ưu tiên phiên bản admin CHỌN TAY (isDefaultVariant), không có thì lấy phiên bản còn hàng.
    const flagged = entries.find((e) => e.raw.web && e.raw.web.isDefaultVariant);
    const rep = (flagged && flagged.pub) || variants.find((v) => v.stock > 0) || variants[0];
    const prices = variants.map((v) => v.price);
    const minPrice = Math.min(...prices);
    const sameListPrice = variants.every((v) => v.listPrice === rep.listPrice);
    return {
      ...rep,
      name: baseVariantName(rep),
      price: minPrice,
      listPrice: sameListPrice ? rep.listPrice : entries.some((e) => Number(e.raw.web?.compareAtPrice) > 0) ? 0 : autoComparePrice(minPrice, entries[0].raw.variantGroupId || entries[0].raw.id),
      priceFrom: prices.some((v) => v !== minPrice),
      stock: variants.reduce((s, v) => s + v.stock, 0),
      variantCount: variants.length,
      variantSkus: variants.map((v) => v.sku).filter(Boolean),
    };
  });
  return [...singles, ...merged];
}

/** Dựng bản danh mục công khai từ blob đầy đủ. KHÔNG chứa giá vốn, NCC, movements, khách, đơn. */
export function buildWebSnapshot(state) {
  const raw = publishedProducts(state || {});
  const cfg = state && typeof state.webConfig === "object" && state.webConfig ? state.webConfig : {};
  const landings = Array.isArray(cfg.LANDINGS) ? cfg.LANDINGS.filter((l) => l && l.slug && l.published !== false) : [];
  const config = { ...cfg };
  if (Array.isArray(cfg.LANDINGS)) config.LANDINGS = landings.map(({ body, ...rest }) => rest);
  return {
    v: SNAPSHOT_VERSION,
    builtAt: new Date().toISOString(),
    list: buildList(raw),
    // Giữ đúng thứ tự publishedProducts (ưu tiên) — findDetail lấy kết quả khớp đầu tiên như trước.
    details: raw.map((p) => publicProduct(p, { detail: true })),
    config,
    landings,
  };
}

// Ghi nhớ bản đã ghi gần nhất trong instance này: lưu liên tục (tự lưu 400ms) mà danh mục web không
// đổi (VD chỉ sửa đơn hàng) thì khỏi ghi lại.
let _lastWritten = "";
/** Ghi bản danh mục; lỗi chỉ ghi log, KHÔNG làm hỏng thao tác lưu chính. */
export async function writeWebSnapshot(state) {
  try {
    const snap = buildWebSnapshot(state);
    const { builtAt, ...rest } = snap;
    const sig = JSON.stringify(rest);
    if (sig === _lastWritten) return;
    const { error } = await client().from(TABLE)
      .upsert({ key: WEB_KEY, value: JSON.stringify(snap), updated_at: builtAt }, { onConflict: "key" });
    if (error) throw new Error(error.message);
    _lastWritten = sig;
    _cache = { at: Date.now(), snap, pending: null };
  } catch (e) {
    console.error("[web-snapshot] ghi lỗi:", e && e.message);
  }
}

async function loadSnapshot() {
  const { data, error } = await client().from(TABLE).select("value").eq("key", WEB_KEY).maybeSingle();
  if (error) throw new Error("Supabase đọc lỗi: " + error.message);
  if (data && data.value) {
    try {
      const snap = JSON.parse(data.value);
      if (snap && snap.v === SNAPSHOT_VERSION && Array.isArray(snap.details)) return snap;
    } catch { /* hỏng -> dựng lại */ }
  }
  // Chưa có (lần đầu sau deploy) hoặc khác phiên bản code: dựng từ blob đầy đủ 1 lần rồi ghi lại.
  const state = await readState();
  await writeWebSnapshot(state);
  return buildWebSnapshot(state);
}

// Nhớ tạm trong instance: hàng nhỏ nên 2 phút là đủ nhẹ; CDN Vercel còn cache thêm (s-maxage).
let _cache = { at: 0, snap: null, pending: null };
const CACHE_MS = 120000;
/** Đọc bản danh mục (có nhớ tạm). Nơi gọi KHÔNG được sửa object trả về. */
export async function readWebCached() {
  if (_cache.snap && Date.now() - _cache.at < CACHE_MS) return _cache.snap;
  if (_cache.pending) return _cache.pending;
  const pending = loadSnapshot()
    .then((snap) => { _cache = { at: Date.now(), snap, pending: null }; return snap; })
    .catch((e) => {
      _cache.pending = null;
      if (_cache.snap) return _cache.snap; // lỗi thoáng qua — dùng tạm bản cũ
      throw e;
    });
  _cache.pending = pending;
  return pending;
}

/** Tìm chi tiết theo slug / SKU / id; nhận cả link cũ có gắn "-<sku>" ở đuôi (như findPublished). */
export function findDetail(details, slug) {
  return details.find((d) => {
    const sku = String(d.sku || "").toLowerCase();
    const slugNoSku = sku && slug.endsWith("-" + sku) ? slug.slice(0, -(sku.length + 1)) : slug;
    return d.slug === slug || d.slug === slugNoSku || sku === slug || String(d.id || "").toLowerCase() === slug;
  });
}
