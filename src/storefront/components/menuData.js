// Số liệu cho menu danh mục (máy tính + điện thoại): đếm sản phẩm, ảnh đại diện, giá thấp nhất,
// thương hiệu, sản phẩm nổi bật. Tính từ danh sách sản phẩm đã tải sẵn (không gọi máy chủ).
import { productInGroup, productInCategory, brandsInGroup } from "../config.js";

export const imgOf = (p) => {
  const i = p?.images?.[0];
  return (i && (i.src || i)) || "";
};

const inStock = (p) => Number(p.stock) > 0;
const off = (p) => (p.listPrice > p.price && p.price > 0 ? Math.round((1 - p.price / p.listPrice) * 100) : 0);

// Ưu tiên hàng còn, có ảnh, giảm giá nhiều -> làm ảnh đại diện / sản phẩm nổi bật.
function rank(list) {
  return [...list].sort((a, b) => (inStock(b) - inStock(a)) || (!!imgOf(b) - !!imgOf(a)) || (off(b) - off(a)));
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
  const subStat = (node) => {
    const own = list.filter((p) => productInCategory(p, node.name));
    const top = rank(own)[0];
    return { count: own.length, image: top ? imgOf(top) : "" };
  };
  const subs = (group.subs || []).map((s) => ({ node: s, ...subStat(s) }));
  const featured = rank(list.filter((p) => inStock(p) && imgOf(p))).slice(0, 2);
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
