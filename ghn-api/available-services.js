import { handlerPOST, ghnFetch, send } from "./_ghn.js";

// Lấy các gói dịch vụ khả dụng cho 1 tuyến (cần service_type_id khi tính phí / tạo đơn).
// body: { from_district: <int>, to_district: <int> }   (shop_id lấy từ GHN_SHOP_ID)
export default handlerPOST(async (req, res, body) => {
  const shopId = Number(process.env.GHN_SHOP_ID || 0);
  const r = await ghnFetch("/shiip/public-api/v2/shipping-order/available-services", {
    body: {
      shop_id: shopId,
      from_district: Number(body.from_district),
      to_district: Number(body.to_district),
    },
  });
  send(res, r.status, r.json);
});
