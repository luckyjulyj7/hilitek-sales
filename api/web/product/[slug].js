import { handler, json, readState, publishedProducts, publicProduct, productSlug, slugify } from "../_supa.js";

// GET /api/web/product/:slug — chi tiết 1 sản phẩm đã đăng web.
export default handler(async (req, res) => {
  if (req.method !== "GET") return json(res, 405, { error: "Chỉ hỗ trợ GET." });
  const slug = String(req.query.slug || "").toLowerCase();
  if (!slug) return json(res, 400, { error: "Thiếu slug." });

  const state = await readState();
  const list = publishedProducts(state);
  const found = list.find((p) => {
    const s = p.web && p.web.slug ? slugify(p.web.slug) : productSlug(p);
    return s === slug || p.sku === slug || p.id === slug;
  });

  if (!found) return json(res, 404, { error: "Không tìm thấy sản phẩm." });
  json(res, 200, publicProduct(found, { detail: true }));
});
