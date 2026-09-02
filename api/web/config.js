import { handler, json, readState } from "./_supa.js";

/**
 * GET /api/web/config — thông tin hiển thị trên web mà chủ shop chỉnh được từ
 * app quản lý (liên hệ, hotline, banner, flash sale, ...).
 *
 * Lưu trong blob dưới key con `webConfig` (một object). Chưa có -> trả {} và web
 * dùng giá trị mặc định trong src/storefront/config.js.
 *
 * GHI: sẽ do app quản lý (SalesManager) ghi vào `state.webConfig` rồi saveData().
 */
export default handler(async (req, res) => {
  if (req.method !== "GET") return json(res, 405, { error: "Chỉ hỗ trợ GET." });
  const state = await readState();
  const cfg = state && typeof state.webConfig === "object" && state.webConfig ? state.webConfig : {};
  json(res, 200, cfg);
});
