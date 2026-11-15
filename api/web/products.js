/**
 * GET /api/web/products — danh sách sản phẩm đã đăng web (đã lọc sạch giá vốn...).
 * Sản phẩm nhiều phiên bản được GỘP thành 1 thẻ đại diện (xem buildList trong _catalog.js).
 * Đọc bản danh mục dựng sẵn (hàng `:web`), KHÔNG đọc cả blob dữ liệu — tiết kiệm egress Supabase.
 */
import { handler, json } from "./_supa.js";
import { readWebCached } from "./_catalog.js";

export default handler(async (req, res) => {
  if (req.method !== "GET") return json(res, 405, { error: "Chỉ hỗ trợ GET." });
  const { list } = await readWebCached();
  json(res, 200, { products: list, count: list.length }, "public, max-age=30, s-maxage=300, stale-while-revalidate=86400");
});
