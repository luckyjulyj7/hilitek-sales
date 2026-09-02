import { handler, json, readState, publishedProducts, publicProduct } from "./_supa.js";

// GET /api/web/products — danh sách sản phẩm đã đăng web (đã lọc sạch giá vốn...).
export default handler(async (req, res) => {
  if (req.method !== "GET") return json(res, 405, { error: "Chỉ hỗ trợ GET." });
  const state = await readState();
  const products = publishedProducts(state).map((p) => publicProduct(p));
  json(res, 200, { products, count: products.length });
});
