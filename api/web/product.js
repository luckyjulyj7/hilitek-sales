/**
 * GET /api/web/product?slug=<slug>  — chi tiết 1 sản phẩm đã đăng web.
 * File riêng (không đi qua catch-all [...path].js) cho chắc chắn về routing trên Vercel.
 */
import { handler, json, readState, publishedProducts, publicProduct, productSlug, slugify } from "./_supa.js";

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
  json(res, 200, publicProduct(found, { detail: true }));
});
