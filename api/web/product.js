/**
 * GET /api/web/product?slug=<slug>  — chi tiết 1 sản phẩm đã đăng web.
 * File riêng (không đi qua catch-all [...path].js) cho chắc chắn về routing trên Vercel.
 * Sản phẩm thuộc nhóm nhiều phiên bản (màu sắc/kích cỡ...) được trả kèm `variants[]` (các phiên
 * bản khác cùng nhóm) để trang chi tiết hiện nút chọn option.
 */
import { handler, json, readState, publishedProducts, publicProduct, productSlug, slugify, webStockOf, baseVariantName } from "./_supa.js";

export default handler(async (req, res) => {
  if (req.method !== "GET") return json(res, 405, { error: "Chỉ hỗ trợ GET." });

  const slug = String((req.query && req.query.slug) || "").trim().toLowerCase();
  if (!slug) return json(res, 400, { error: "Thiếu slug." });

  const list = publishedProducts(await readState());
  const found = list.find((p) => {
    const s = p.web && p.web.slug ? slugify(p.web.slug) : productSlug(p);
    const sku = String(p.sku || "").toLowerCase();
    // Tương thích link cũ có gắn "-<sku>" ở đuôi: bỏ đuôi đó rồi so lại.
    const slugNoSku = sku && slug.endsWith("-" + sku) ? slug.slice(0, -(sku.length + 1)) : slug;
    return s === slug || s === slugNoSku || sku === slug || String(p.id || "").toLowerCase() === slug;
  });

  if (!found) return json(res, 404, { error: "Không tìm thấy sản phẩm." });
  const detail = publicProduct(found, { detail: true });

  if (found.variantGroupId) {
    const siblings = list.filter((p) => p.variantGroupId === found.variantGroupId);
    if (siblings.length > 1) {
      detail.name = baseVariantName(detail);
      detail.variants = siblings.map((p) => ({
        id: p.id,
        slug: p.web && p.web.slug ? slugify(p.web.slug) : productSlug(p),
        attrs: (p.variantAttrs && typeof p.variantAttrs === "object" ? p.variantAttrs : {}),
        price: Number(p.retailPrice) || 0,
        stock: webStockOf(p),
        image: (p.web && Array.isArray(p.web.images) && p.web.images.filter(Boolean)[0]) || p.image || "",
      }));
    }
  }

  // Cache ngắn ở Vercel Edge — xem sản phẩm/đổi phiên bản gọi API này liên tục, cache giúp các
  // lượt xem gần nhau (kể cả của người khác) trả về gần như tức thì thay vì đọc lại cả blob.
  json(res, 200, detail, "public, max-age=20, stale-while-revalidate=120");
});
