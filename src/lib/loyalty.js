/**
 * Điểm tích luỹ khách hàng — tính SỐNG từ lịch sử đơn hàng (không lưu số điểm tĩnh) để không
 * bao giờ bị lệch khi đơn đổi trạng thái/huỷ/trả hàng, cộng thêm 1 sổ điều chỉnh tay riêng
 * (tặng thêm/trừ bớt) cho các trường hợp đặc biệt. Dùng CHUNG cho app quản lý (SalesManager.jsx)
 * và API web (api/web/points.js) nên phải là module thuần JS, không phụ thuộc React/DOM.
 *
 * Định danh khách hàng bằng SỐ ĐIỆN THOẠI (không phải customerId) — vì đơn đặt trên web hiện
 * KHÔNG gắn với hồ sơ khách hàng trong CRM (customerId luôn rỗng), chỉ đơn tại quầy mới có.
 * SĐT là điểm chung duy nhất giữa 2 kênh.
 */

export const DEFAULT_LOYALTY = { enabled: false, rateVnd: 10000, minOrderValue: 0 };

export function normalizePhone(s) {
  return String(s || "").replace(/\D/g, "").replace(/^84/, "0");
}

// Doanh số tính điểm của 1 đơn: giá trị hàng SAU chiết khấu + đổi/trả hàng, KHÔNG gồm phí ship
// (công thức khớp với orderCalc() trong SalesManager.jsx, trừ phần phí ship). Chỉ đơn "Hoàn thành"
// (status "done") mới tính — đơn đang xử lý/đã huỷ chưa tích điểm.
export function orderPointsBase(order) {
  if (!order || order.status !== "done") return 0;
  const items = Array.isArray(order.items) ? order.items : [];
  const subtotal = items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);
  const discAmt = order.discountType === "percent" ? (subtotal * (Number(order.orderDiscount) || 0)) / 100 : (Number(order.orderDiscount) || 0);
  const returns = Array.isArray(order.returns) ? order.returns : [];
  const lineSum = (arr) => (Array.isArray(arr) ? arr : []).reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);
  const returnedValue = returns.reduce((s, r) => s + lineSum(r.returnedItems), 0);
  const exchangeValue = returns.reduce((s, r) => s + lineSum(r.exchangeItems), 0);
  return Math.max(0, subtotal - discAmt - returnedValue + exchangeValue);
}

export function orderPoints(order, config) {
  const cfg = { ...DEFAULT_LOYALTY, ...config };
  if (!cfg.enabled || !cfg.rateVnd) return 0;
  const base = orderPointsBase(order);
  if (base < (Number(cfg.minOrderValue) || 0)) return 0;
  return Math.floor(base / Number(cfg.rateVnd));
}

// SĐT "chủ" của 1 đơn: web (khách lẻ, chưa gắn CRM) lấy từ shippingAddress; đơn tại quầy lấy
// từ hồ sơ khách hàng (customerId) trong CRM.
export function orderPhone(order, customers) {
  const direct = order.shippingAddress && order.shippingAddress.recipientPhone;
  if (direct) return normalizePhone(direct);
  const cust = (Array.isArray(customers) ? customers : []).find((c) => c.id === order.customerId);
  return normalizePhone(cust && cust.phone);
}

/** Tổng điểm hiện có của 1 SĐT: điểm tự tính từ đơn hàng + điểm điều chỉnh tay (có thể âm/dương). */
export function pointsForPhone(phone, state, config) {
  const target = normalizePhone(phone);
  if (!target) return { points: 0, fromOrders: 0, fromAdjustments: 0, orderCount: 0 };

  const orders = Array.isArray(state.orders) ? state.orders : [];
  const customers = Array.isArray(state.customers) ? state.customers : [];
  const adjustments = Array.isArray(state.pointAdjustments) ? state.pointAdjustments : [];

  let fromOrders = 0, orderCount = 0;
  orders.forEach((o) => {
    if (orderPhone(o, customers) !== target) return;
    const pts = orderPoints(o, config);
    if (pts > 0) { fromOrders += pts; orderCount++; }
  });
  const fromAdjustments = adjustments
    .filter((a) => normalizePhone(a.phone) === target)
    .reduce((s, a) => s + (Number(a.amount) || 0), 0);

  return { points: fromOrders + fromAdjustments, fromOrders, fromAdjustments, orderCount };
}
