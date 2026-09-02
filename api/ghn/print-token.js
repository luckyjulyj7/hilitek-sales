import { handlerPOST, ghnFetch, send } from "./_ghn.js";

// Lấy token để in vận đơn. body: { order_codes: ["<mã GHN>", ...] }
// Trả về { token }. Sau đó mở: <GHN_BASE>/a5/public-api/printA5?token=<token>
//   (đổi printA5 -> print80x80 hoặc printA5 tuỳ khổ giấy).
export default handlerPOST(async (req, res, body) => {
  const codes = Array.isArray(body.order_codes) ? body.order_codes : (body.order_code ? [body.order_code] : []);
  if (codes.length === 0) return send(res, 400, { error: "Thiếu order_codes." });
  const r = await ghnFetch("/shiip/public-api/v2/a5/gen-token", { body: { order_codes: codes } });
  const base = process.env.GHN_BASE_URL || "https://online-gateway.ghn.vn";
  const token = r.json && r.json.data && r.json.data.token;
  send(res, r.status, {
    ...r.json,
    printUrls: token
      ? {
          A5: `${base}/a5/public-api/printA5?token=${token}`,
          "80x80": `${base}/a5/public-api/print80x80?token=${token}`,
          "52x70": `${base}/a5/public-api/print52x70?token=${token}`,
        }
      : null,
  });
});
