/**
 * GET /api/web/products — danh sách sản phẩm đã đăng web (đã lọc sạch giá vốn...).
 * Sản phẩm nhiều phiên bản (màu sắc/kích cỡ...) được GỘP lại thành 1 thẻ đại diện ở đây (danh
 * sách/lưới sản phẩm) — khách chỉ thấy chọn phiên bản khi vào trang chi tiết. Xem product.js.
 */
import { handler, json, readState, publishedProducts, publicProduct, baseVariantName } from "./_supa.js";

export default handler(async (req, res) => {
  if (req.method !== "GET") return json(res, 405, { error: "Chỉ hỗ trợ GET." });
  const state = await readState();
  const raw = publishedProducts(state);
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
    // Đại diện cả nhóm: ưu tiên phiên bản admin CHỌN TAY (isDefaultVariant, đặt ở trang sửa từng
    // phiên bản), không có thì mới tự động lấy phiên bản còn hàng (khách bấm vào thấy có thể mua ngay).
    const flagged = entries.find((e) => e.raw.web && e.raw.web.isDefaultVariant);
    const rep = (flagged && flagged.pub) || variants.find((v) => v.stock > 0) || variants[0];
    const prices = variants.map((v) => v.price);
    const minPrice = Math.min(...prices);
    const sameListPrice = variants.every((v) => v.listPrice === rep.listPrice);
    return {
      ...rep,
      name: baseVariantName(rep),
      price: minPrice,
      listPrice: sameListPrice ? rep.listPrice : 0, // giá gạch bỏ chỉ hiện khi mọi phiên bản đồng giá
      priceFrom: prices.some((v) => v !== minPrice),
      stock: variants.reduce((s, v) => s + v.stock, 0),
      variantCount: variants.length,
    };
  });

  const products = [...singles, ...merged];
  // Cache ngắn ở Vercel Edge — đọc lại toàn bộ blob Supabase mỗi lần là phần chậm nhất khi duyệt
  // web; 20s vẫn đủ nhanh cập nhật tồn kho/giá sau khi admin sửa, không đáng lo bị "cũ" lâu.
  json(res, 200, { products, count: products.length }, "public, max-age=20, stale-while-revalidate=120");
});
