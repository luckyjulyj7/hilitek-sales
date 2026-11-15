/** GET /api/web/config — state.webConfig (chủ shop chỉnh từ app quản lý), đọc từ bản danh mục `:web`. */
import { handler, json } from "./_supa.js";
import { readWebCached } from "./_catalog.js";

const CACHE = "public, max-age=60, s-maxage=300, stale-while-revalidate=86400";

export default handler(async (req, res) => {
  if (req.method !== "GET") return json(res, 405, { error: "Chỉ hỗ trợ GET." });
  const { config, landings } = await readWebCached();

  // ?landing=<slug> — trả đủ nội dung 1 trang landing. Nội dung (body) có thể rất nặng, nên KHÔNG
  // kèm trong cấu hình chung: mọi lượt vào web đều tải cấu hình này.
  const slug = req.query && req.query.landing;
  if (slug) {
    const page = landings.find((l) => l.slug === slug);
    return page ? json(res, 200, page, CACHE) : json(res, 404, { error: "Không tìm thấy trang." });
  }
  json(res, 200, config, CACHE);
});
