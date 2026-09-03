import { handlerPOST, ghnFetch, send } from "./_ghn.js";

// Huỷ đơn GHN. body: { order_codes: ["<mã GHN>", ...] }
export default handlerPOST(async (req, res, body) => {
  const codes = Array.isArray(body.order_codes) ? body.order_codes : (body.order_code ? [body.order_code] : []);
  if (codes.length === 0) return send(res, 400, { error: "Thiếu order_codes." });
  const r = await ghnFetch("/shiip/public-api/v2/switch-status/cancel", { body: { order_codes: codes } });
  send(res, r.status, r.json);
});
