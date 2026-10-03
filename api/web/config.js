/** GET /api/web/config — state.webConfig (chủ shop chỉnh từ app quản lý). */
import { handler, json, readStateCached } from "./_supa.js";

const CACHE = "public, max-age=60, stale-while-revalidate=300";

export default handler(async (req, res) => {
  if (req.method !== "GET") return json(res, 405, { error: "Chỉ hỗ trợ GET." });
  const state = await readStateCached();
  const cfg = state && typeof state.webConfig === "object" && state.webConfig ? state.webConfig : {};
  const landings = Array.isArray(cfg.LANDINGS) ? cfg.LANDINGS.filter((l) => l && l.slug && l.published !== false) : [];

  // ?landing=<slug> — trả đủ nội dung 1 trang landing. Nội dung (body) có thể rất nặng (ảnh nhúng
  // base64 vài MB), nên KHÔNG kèm trong cấu hình chung: mọi lượt vào web đều tải cấu hình này.
  const slug = req.query && req.query.landing;
  if (slug) {
    const page = landings.find((l) => l.slug === slug);
    return page ? json(res, 200, page, CACHE) : json(res, 404, { error: "Không tìm thấy trang." });
  }

  const out = { ...cfg };
  if (Array.isArray(cfg.LANDINGS)) out.LANDINGS = landings.map(({ body, ...rest }) => rest);
  json(res, 200, out, CACHE);
});
