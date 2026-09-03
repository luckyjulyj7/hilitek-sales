import { handlerPOST, ghnFetch, send } from "./_ghn.js";

// Địa chỉ theo hệ thống GHN (GHN dùng ID riêng, KHÔNG trùng danh sách 34 tỉnh mới của app).
// body: { type: "province" }                       -> danh sách tỉnh/thành GHN
//       { type: "district", province_id: <int> }   -> danh sách quận/huyện
//       { type: "ward", district_id: <int> }       -> danh sách phường/xã (ward_code là string)
export default handlerPOST(async (req, res, body) => {
  const type = body && body.type;
  if (type === "province") {
    const r = await ghnFetch("/shiip/public-api/master-data/province", { method: "GET" });
    return send(res, r.status, r.json);
  }
  if (type === "district") {
    if (!body.province_id) return send(res, 400, { error: "Thiếu province_id." });
    const r = await ghnFetch("/shiip/public-api/master-data/district", { body: { province_id: Number(body.province_id) } });
    return send(res, r.status, r.json);
  }
  if (type === "ward") {
    if (!body.district_id) return send(res, 400, { error: "Thiếu district_id." });
    const r = await ghnFetch("/shiip/public-api/master-data/ward", { body: { district_id: Number(body.district_id) } });
    return send(res, r.status, r.json);
  }
  send(res, 400, { error: "type phải là province | district | ward." });
});
