/**
 * GET /api/web/product?slug=<slug>  — chi tiết 1 sản phẩm đã đăng web.
 * Sản phẩm thuộc nhóm nhiều phiên bản được trả kèm `variants[]` để trang chi tiết hiện nút chọn.
 * Đọc bản danh mục dựng sẵn (hàng `:web`, xem _catalog.js), KHÔNG đọc cả blob dữ liệu.
 */
import { handler, json, baseVariantName } from "./_supa.js";
import { readWebCached, findDetail } from "./_catalog.js";

export default handler(async (req, res) => {
  if (req.method !== "GET") return json(res, 405, { error: "Chỉ hỗ trợ GET." });

  const slug = String((req.query && req.query.slug) || "").trim().toLowerCase();
  if (!slug) return json(res, 400, { error: "Thiếu slug." });

  const { details } = await readWebCached();
  const found = findDetail(details, slug);
  if (!found) return json(res, 404, { error: "Không tìm thấy sản phẩm." }, "public, max-age=0, s-maxage=60");

  const detail = { ...found };
  if (found.variantGroupId) {
    const siblings = details.filter((p) => p.variantGroupId === found.variantGroupId);
    if (siblings.length > 1) {
      detail.name = baseVariantName(found);
      detail.variants = siblings.map((p) => ({
        id: p.id,
        slug: p.slug,
        attrs: p.variantAttrs || {},
        sku: p.sku,
        price: p.price,
        listPrice: p.listPrice,
        stock: p.stock,
        image: (p.images && p.images[0]) || "",
      }));
    }
  }

  json(res, 200, detail, "public, max-age=30, s-maxage=300, stale-while-revalidate=86400");
});
