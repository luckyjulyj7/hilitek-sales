/**
 * Hàm sản phẩm / danh mục web DÙNG CHUNG cho máy chủ (api/web/*) và trang quản lý (trình duyệt).
 * Chỉ trả field an toàn cho web: KHÔNG có giá vốn, giá sỉ, NCC, movements, series.
 * Trang quản lý tự dựng "bản danh mục web" (buildWebSnapshot) từ dữ liệu đang có rồi gửi kèm khi
 * lưu, nên máy chủ không phải đọc cả kho từ Supabase để làm mới web khách.
 */
import { autoComparePrice } from "./autoComparePrice.js";
import { baseVariantName } from "./variants.js";
import { keyOf } from "./records.js";

// Tăng số này khi đổi cách dựng (publicProduct, gộp phiên bản...) để bản cũ tự dựng lại sau deploy.
export const SNAPSHOT_VERSION = 1;

// Giống webTextToSpecs ở SalesManager.jsx: mỗi dòng "Nhãn | Giá trị"; dòng không có dấu gạch đứng
// nối vào giá trị dòng trên. Nhận cả ｜ │ ┃ ∣ ¦ ǀ và Tab.
function textToSpecs(text) {
  const rows = [];
  String(text || "").split("\n").forEach((line) => {
    const m = line.match(/[|｜│┃∣¦ǀ\t]/);
    if (m) rows.push([line.slice(0, m.index).trim(), line.slice(m.index + 1).replace(/\s*[|｜│┃∣¦ǀ	]\s*/g, " ").trim()]);
    else if (line.trim() && rows.length) rows[rows.length - 1][1] = (rows[rows.length - 1][1] + "\n" + line.trim()).replace(/^\n+/, "");
    else if (line.trim()) rows.push([line.trim(), ""]);
  });
  return rows;
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
  // Giá gạch bỏ: "Giá so sánh" chủ shop tự nhập; bỏ trống thì tự tính theo mức giá.
  const compareAt = Number(web.compareAtPrice) > 0 ? Number(web.compareAtPrice) : autoComparePrice(price, p.variantGroupId || p.id);
  const listPrice = Math.max(compareAt, price); // storefront tự bỏ qua khi listPrice <= price
  // Ưu tiên tách lại từ specsText (văn bản chủ shop gõ) — sản phẩm lưu trước khi app nhận các dấu
  // gạch đứng "lạ" (｜ │ ...) có mảng specs bị gộp sai thành 1 dòng; tách lại ở đây là sửa luôn.
  const specs = (typeof web.specsText === "string" && web.specsText.trim() ? textToSpecs(web.specsText) : Array.isArray(web.specs) ? web.specs : [])
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
    // Tên trên web (ngắn) nếu có, không thì tên vật tư; invoiceName giữ tên đầy đủ để tìm kiếm.
    name: (typeof web.name === "string" && web.name.trim()) || p.name || "",
    invoiceName: p.name || "",
    // Phiên bản (màu sắc/kích cỡ...) — sản phẩm tạo hàng loạt phiên bản ở admin dùng chung
    // variantGroupId, mỗi phiên bản có variantAttrs riêng (VD {"Màu sắc":"Đen"}). Web dùng để
    // gộp các phiên bản thành 1 sản phẩm có nút chọn option, thay vì hiện thành nhiều SP rời rạc.
    variantGroupId: p.variantGroupId || "",
    variantGroupName: p.variantGroupName || "",
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
    out.game = web.game && typeof web.game === "object" ? web.game : null; // nội dung trang bán máy game
  }
  return out;
}

export { baseVariantName };

/** Tìm sản phẩm đã đăng theo slug, SKU hoặc id; nhận cả link cũ có gắn "-<sku>" ở đuôi. */
export function findPublished(list, slug) {
  return list.find((p) => {
    const s = p.web && p.web.slug ? slugify(p.web.slug) : productSlug(p);
    const sku = String(p.sku || "").toLowerCase();
    const slugNoSku = sku && slug.endsWith("-" + sku) ? slug.slice(0, -(sku.length + 1)) : slug;
    return s === slug || s === slugNoSku || sku === slug || String(p.id || "").toLowerCase() === slug;
  });
}

/** Danh sách sản phẩm đã bật "Đăng web" (web.published). */
export function publishedProducts(state) {
  const list = Array.isArray(state.products) ? state.products : [];
  // Ưu tiên (web.priority) càng lớn càng lên đầu — dùng cho mặc định "Phổ biến" ở web khách (chưa
  // tự chọn sắp xếp/lọc theo giá...). Bằng nhau (đa số = 0) thì giữ nguyên thứ tự cũ (sort ổn định).
  return list
    .filter((p) => p && p.web && p.web.published)
    .sort((a, b) => (Number(b.web.priority) || 0) - (Number(a.web.priority) || 0));
}

// Trường chỉ có ở trang chi tiết (bỏ đi thì ra đúng bản rút gọn dùng cho danh sách).
const DETAIL_ONLY = ["description", "seoTitle", "seoDesc", "game"];
const toListItem = (d) => { const o = { ...d }; DETAIL_ONLY.forEach((k) => delete o[k]); delete o._g; return o; };

/**
 * Danh sách cho /api/web/products: gộp các phiên bản cùng nhóm thành 1 thẻ đại diện.
 * items: chi tiết sản phẩm (publicProduct detail) kèm `_g` = { d: chọn tay làm đại diện, c: có tự
 * nhập giá so sánh, id: id gốc } — đủ để gộp mà không cần dữ liệu sản phẩm gốc.
 */
function buildListFromDetails(items) {
  const groups = new Map();
  const singles = [];
  items.forEach((d) => {
    const pub = toListItem(d);
    if (!pub.variantGroupId) { singles.push(pub); return; }
    if (!groups.has(pub.variantGroupId)) groups.set(pub.variantGroupId, []);
    groups.get(pub.variantGroupId).push({ pub, g: d._g || {} });
  });
  const merged = [...groups.values()].map((entries) => {
    const variants = entries.map((e) => e.pub);
    if (variants.length === 1) return variants[0];
    // Đại diện cả nhóm: ưu tiên phiên bản admin CHỌN TAY (isDefaultVariant), không có thì lấy phiên bản còn hàng.
    const flagged = entries.find((e) => e.g.d);
    const rep = (flagged && flagged.pub) || variants.find((v) => v.stock > 0) || variants[0];
    const prices = variants.map((v) => v.price);
    const minPrice = Math.min(...prices);
    const sameListPrice = variants.every((v) => v.listPrice === rep.listPrice);
    return {
      ...rep,
      name: baseVariantName(rep),
      price: minPrice,
      listPrice: sameListPrice ? rep.listPrice : entries.some((e) => e.g.c) ? 0 : autoComparePrice(minPrice, entries[0].pub.variantGroupId || entries[0].g.id),
      priceFrom: prices.some((v) => v !== minPrice),
      stock: variants.reduce((s, v) => s + v.stock, 0),
      variantCount: variants.length,
      variantSkus: variants.map((v) => v.sku).filter(Boolean),
    };
  });
  return [...singles, ...merged];
}

/**
 * Bản danh mục web dạng TỪNG PHẦN (lưu mỗi sản phẩm 1 dòng, xem api/web/_catalog.js): sửa 1 sản
 * phẩm chỉ phải gửi đúng dòng của sản phẩm đó.
 *   details: [chi tiết + _g] theo thứ tự hiển thị · order: [id] · config · landings
 */
export function buildWebParts(state) {
  const raw = publishedProducts(state || {});
  const cfg = state && typeof state.webConfig === "object" && state.webConfig ? state.webConfig : {};
  const landings = Array.isArray(cfg.LANDINGS) ? cfg.LANDINGS.filter((l) => l && l.slug && l.published !== false) : [];
  const config = { ...cfg };
  if (Array.isArray(cfg.LANDINGS)) config.LANDINGS = landings.map(({ body, ...rest }) => rest);
  const details = raw.map((p) => ({
    ...publicProduct(p, { detail: true }),
    _g: { d: !!(p.web && p.web.isDefaultVariant), c: Number(p.web && p.web.compareAtPrice) > 0, id: p.id },
  }));
  return { v: SNAPSHOT_VERSION, details, order: details.map((d) => String(d.id)), config, landings };
}

/** Phần -> Map<khoá, giá trị>: khoá ("d", id sản phẩm) hoặc ("m", order|config|landings|v). */
export function webPartsToMap(parts) {
  const m = new Map();
  parts.details.forEach((d) => m.set(keyOf("d", String(d.id)), d));
  m.set(keyOf("m", "order"), parts.order);
  m.set(keyOf("m", "config"), parts.config);
  m.set(keyOf("m", "landings"), parts.landings);
  m.set(keyOf("m", "v"), parts.v);
  return m;
}

/** Ghép các phần thành bản danh mục mà API công khai dùng. */
export function snapshotFromParts(parts) {
  const byId = new Map(parts.details.map((d) => [String(d.id), d]));
  const ordered = [];
  const used = new Set();
  (parts.order || []).forEach((id) => { if (byId.has(id) && !used.has(id)) { ordered.push(byId.get(id)); used.add(id); } });
  for (const [id, d] of byId) if (!used.has(id)) ordered.push(d);
  return {
    v: parts.v,
    list: buildListFromDetails(ordered),
    details: ordered.map((d) => { const o = { ...d }; delete o._g; return o; }),
    config: parts.config || {},
    landings: Array.isArray(parts.landings) ? parts.landings : [],
  };
}

/** Dựng bản danh mục công khai từ kho đầy đủ. KHÔNG chứa giá vốn, NCC, movements, khách, đơn. */
export function buildWebSnapshot(state) {
  return { ...snapshotFromParts(buildWebParts(state)), builtAt: new Date().toISOString() };
}
