// Số liệu cho menu danh mục (máy tính + điện thoại): đếm sản phẩm, ảnh đại diện, giá thấp nhất,
// thương hiệu, sản phẩm nổi bật. Tính từ danh sách sản phẩm đã tải sẵn (không gọi máy chủ).
import { productInGroup, productInCategory, brandsInGroup } from "../config.js";

export const imgOf = (p) => {
  const i = p?.images?.[0];
  return (i && (i.src || i)) || "";
};

const inStock = (p) => Number(p.stock) > 0;
const off = (p) => (p.listPrice > p.price && p.price > 0 ? Math.round((1 - p.price / p.listPrice) * 100) : 0);

// Ảnh đại diện danh mục: hàng còn, có ảnh, giá cao nhất (thường là mẫu chủ lực, đẹp nhất),
// không lấy theo % giảm giá (dễ ra mẫu rẻ nhất).
function rank(list) {
  return [...list].sort((a, b) => (inStock(b) - inStock(a)) || (!!imgOf(b) - !!imgOf(a)) || ((b.price || 0) - (a.price || 0)));
}
// "Nổi bật": hàng còn, có ảnh, tiết kiệm được nhiều TIỀN nhất (không phải nhiều % nhất), khác thương hiệu nhau.
function pickFeatured(list, n = 2) {
  const save = (p) => (p.listPrice > p.price ? p.listPrice - p.price : 0);
  const sorted = [...list].sort((a, b) => (save(b) - save(a)) || ((b.price || 0) - (a.price || 0)));
  const out = [], brands = new Set();
  for (const p of sorted) { if (out.length >= n) break; if (p.brand && brands.has(p.brand)) continue; out.push(p); if (p.brand) brands.add(p.brand); }
  for (const p of sorted) { if (out.length >= n) break; if (!out.includes(p)) out.push(p); }
  return out;
}

const cache = new WeakMap();

/** Số liệu của 1 nhóm menu. Lưu tạm theo danh sách sản phẩm để rê chuột qua lại không tính lại. */
export function groupStats(products, group) {
  if (!products || !group) return null;
  let byGroup = cache.get(products);
  if (!byGroup) { byGroup = new Map(); cache.set(products, byGroup); }
  if (byGroup.has(group.group)) return byGroup.get(group.group);

  const list = products.filter((p) => productInGroup(p, group.group) || productInCategory(p, group.group));
  const prices = list.map((p) => p.price).filter((x) => x > 0);
  // Mỗi danh mục con một ảnh, cố tránh trùng thương hiệu với thẻ bên cạnh cho đỡ đơn điệu.
  const usedBrands = new Set();
  const subStat = (node) => {
    const own = rank(list.filter((p) => productInCategory(p, node.name)));
    const top = own.find((p) => imgOf(p) && !usedBrands.has(p.brand)) || own.find((p) => imgOf(p));
    if (top?.brand) usedBrands.add(top.brand);
    return { count: own.length, image: top ? imgOf(top) : "" };
  };
  const subs = (group.subs || []).map((s) => ({ node: s, ...subStat(s) }));
  const featured = pickFeatured(list.filter((p) => inStock(p) && imgOf(p)));
  const res = {
    count: list.length,
    minPrice: prices.length ? Math.min(...prices) : 0,
    subs,
    brands: brandsInGroup(list, null).slice(0, 14),
    featured,
    sample: rank(list).slice(0, 8),
    off,
  };
  byGroup.set(group.group, res);
  return res;
}
