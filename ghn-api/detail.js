import { handlerPOST, ghnFetch, send } from "./_ghn.js";

// Tra cứu chi tiết + trạng thái 1 vận đơn. body: { order_code: "<mã GHN>" }
// Trả về status (ready_to_pick, picking, delivering, delivered, cancel, return...), log[], leadtime.
export default handlerPOST(async (req, res, body) => {
  if (!body.order_code) return send(res, 400, { error: "Thiếu order_code." });
  const r = await ghnFetch("/shiip/public-api/v2/shipping-order/detail", {
    body: { order_code: String(body.order_code) },
  });
  send(res, r.status, r.json);
});
