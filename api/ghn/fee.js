import { handlerPOST, ghnFetch, send } from "./_ghn.js";

// Tính phí ship. body chuyển thẳng cho GHN, các trường thường dùng:
//   service_type_id (2 = hàng nhẹ), from_district_id, to_district_id, to_ward_code,
//   weight (gram), length, width, height (cm), insurance_value, cod_value, items[]
// from_district_id: nếu body không có, dùng GHN_FROM_DISTRICT_ID (env) làm mặc định.
export default handlerPOST(async (req, res, body) => {
  const payload = { ...body };
  if (payload.from_district_id == null && process.env.GHN_FROM_DISTRICT_ID) {
    payload.from_district_id = Number(process.env.GHN_FROM_DISTRICT_ID);
  }
  const r = await ghnFetch("/shiip/public-api/v2/shipping-order/fee", { body: payload });
  send(res, r.status, r.json);
});
