/** GET /api/web/config — state.webConfig (chủ shop chỉnh từ app quản lý). */
import { handler, json, readState } from "./_supa.js";

export default handler(async (req, res) => {
  if (req.method !== "GET") return json(res, 405, { error: "Chỉ hỗ trợ GET." });
  const state = await readState();
  json(res, 200, state && typeof state.webConfig === "object" && state.webConfig ? state.webConfig : {});
});
