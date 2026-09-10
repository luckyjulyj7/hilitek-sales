/**
 * GET /api/web/order-lookup?code=<mã đơn>&phone=<sđt đặt hàng>
 * Trả tình trạng đơn + tình trạng vận chuyển (đồng bộ với mục "Vận chuyển" của app quản lý).
 * Xác thực bằng số điện thoại người nhận để không lộ đơn cho người lạ.
 */
import { handler, json, readState } from "./_supa.js";

const ORDER_STATUS = {
  pending: "Chờ xử lý", shipping: "Đang giao", delivered: "Đã giao",
  done: "Hoàn thành", cancelled: "Đã huỷ",
};
const SHIP_STATUS = {
  packing: "Chờ đóng gói", picked: "Chờ lấy hàng", shipping: "Đang giao",
  delivered: "Đã giao", failed: "Giao thất bại", returned: "Hoàn hàng",
};
const tail = (s) => String(s || "").replace(/\D/g, "").slice(-9);

export default handler(async (req, res) => {
  if (req.method !== "GET") return json(res, 405, { error: "Chỉ hỗ trợ GET." });

  const code = String((req.query && req.query.code) || "").trim().toUpperCase();
  const phone = tail((req.query && req.query.phone) || "");
  if (!code || phone.length < 8)
    return json(res, 400, { error: "Nhập mã đơn hàng và số điện thoại đặt hàng." });

  const state = await readState();
  const orders = Array.isArray(state.orders) ? state.orders : [];
  const order = orders.find((o) => o && String(o.code || "").trim().toUpperCase() === code);

  const okPhone =
    order &&
    (tail(order.shippingAddress && order.shippingAddress.recipientPhone) === phone ||
      String(order.notes || "").replace(/\D/g, "").includes(phone));
  if (!order || !okPhone)
    return json(res, 404, { error: "Không tìm thấy đơn khớp mã và số điện thoại. Vui lòng kiểm tra lại." });

  const tickets = (Array.isArray(state.shippingTickets) ? state.shippingTickets : [])
    .filter((t) => t && (t.orderCode === order.code || (order.id && t.orderId === order.id)))
    .sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || "")));
  const t = tickets[tickets.length - 1] || null;

  const itemCount = (Array.isArray(order.items) ? order.items : [])
    .reduce((s, it) => s + (Number(it.qty) || 0), 0);

  json(res, 200, {
    code: order.code,
    placedAt: order.createdAt || order.date || "",
    orderStatus: ORDER_STATUS[order.status] || "Đang xử lý",
    orderStatusId: order.status || "pending",
    itemCount,
    recipient: (order.shippingAddress && order.shippingAddress.recipientName) || "",
    address: [
      order.shippingAddress && order.shippingAddress.addressDetail,
      order.shippingAddress && order.shippingAddress.ward,
      order.shippingAddress && order.shippingAddress.province,
    ].filter(Boolean).join(", "),
    shipping: t
      ? {
          carrier: t.carrier || "",
          trackingCode: t.trackingCode || "",
          status: SHIP_STATUS[t.status] || "Đang xử lý",
          statusId: t.status || "packing",
          packDate: t.packDate || "",
          pickupDate: t.pickupDate || "",
          deliveredDate: t.deliveredDate || "",
          cod: Number(t.codAmount) || 0,
        }
      : null,
  });
});
