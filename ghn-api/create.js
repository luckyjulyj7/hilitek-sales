import { handlerPOST, ghnFetch, send } from "./_ghn.js";

// Tạo đơn GHN. body chuyển thẳng cho GHN. Các trường bắt buộc thường gặp:
//   to_name, to_phone, to_address, to_ward_code, to_district_id,
//   weight, length, width, height, service_type_id,
//   payment_type_id (1 = shop trả, 2 = người nhận trả), required_note
//   ("CHOTHUHANG" | "CHOXEMHANGKHONGTHU" | "KHONGCHOXEMHANG"),
//   cod_amount, items: [{ name, quantity, weight }]
// Nếu không truyền from_* thì GHN dùng địa chỉ lấy hàng mặc định của shop.
export default handlerPOST(async (req, res, body) => {
  const r = await ghnFetch("/shiip/public-api/v2/shipping-order/create", { body });
  send(res, r.status, r.json);
});
