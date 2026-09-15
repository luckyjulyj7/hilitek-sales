/**
 * GET /api/web/points?phone=<số điện thoại>
 * Tra cứu điểm tích luỹ công khai theo SĐT — chỉ trả tổng điểm hiện có + số đơn đã tích điểm.
 * KHÔNG trả chi tiết từng đơn hàng, tên/địa chỉ khách, hay bất kỳ dữ liệu nội bộ nào khác.
 */
import { handler, json, readState } from "./_supa.js";
import { pointsForPhone, normalizePhone, DEFAULT_LOYALTY } from "../../src/lib/loyalty.js";

export default handler(async (req, res) => {
  if (req.method !== "GET") return json(res, 405, { error: "Chỉ hỗ trợ GET." });

  const phone = normalizePhone((req.query && req.query.phone) || "");
  if (!/^0\d{8,10}$/.test(phone)) return json(res, 400, { error: "Nhập số điện thoại hợp lệ." });

  const state = await readState();
  const config = (state.webConfig && state.webConfig.LOYALTY) || DEFAULT_LOYALTY;
  if (!config.enabled) return json(res, 200, { enabled: false, points: 0 });

  const { points, orderCount } = pointsForPhone(phone, state, config);
  json(res, 200, { enabled: true, points, orderCount, rateVnd: Number(config.rateVnd) || 0 });
});
