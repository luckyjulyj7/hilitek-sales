/** GET /api/web/config — state.webConfig (chủ shop chỉnh từ app quản lý). */
import { handler, json, readState } from "./_supa.js";

export default handler(async (req, res) => {
  if (req.method !== "GET") return json(res, 405, { error: "Chỉ hỗ trợ GET." });
  const state = await readState();
  // Cache ở Vercel Edge — cấu hình web hiếm khi đổi, không cần đọc lại Supabase mỗi lượt khách vào.
  json(res, 200, state && typeof state.webConfig === "object" && state.webConfig ? state.webConfig : {}, "public, max-age=60, stale-while-revalidate=300");
});
