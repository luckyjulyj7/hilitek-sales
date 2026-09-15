/**
 * GET /api/web/lookup?type=order|warranty|points&...
 * Gộp 3 API tra cứu công khai (đơn hàng, bảo hành, điểm tích luỹ) vào 1 file để tiết kiệm
 * số lượng serverless function (giới hạn 12 function trên gói Vercel Free). Mỗi loại giữ
 * NGUYÊN logic + tham số + dữ liệu trả về như khi còn là API riêng — chỉ gộp chỗ triển khai.
 *
 *   type=order    &code=<mã đơn>&phone=<sđt đặt hàng>       — trạng thái đơn + vận chuyển
 *   type=warranty &serial=<số serial>                        — hạn bảo hành theo serial
 *   type=points   &phone=<số điện thoại>                     — điểm tích luỹ theo SĐT
 */
import { handler, json, readState } from "./_supa.js";
import { pointsForPhone, normalizePhone, DEFAULT_LOYALTY } from "../../src/lib/loyalty.js";

/* ---------------- type=order ---------------- */
const ORDER_STATUS = {
  pending: "Chờ xử lý", shipping: "Đang giao", delivered: "Đã giao",
  done: "Hoàn thành", cancelled: "Đã huỷ",
};
const SHIP_STATUS = {
  packing: "Chờ đóng gói", picked: "Chờ lấy hàng", shipping: "Đang giao",
  delivered: "Đã giao", failed: "Giao thất bại", returned: "Hoàn hàng",
};
const tail = (s) => String(s || "").replace(/\D/g, "").slice(-9);

async function lookupOrder(req, res) {
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
}

/* ---------------- type=warranty ---------------- */
const normLower = (s) => String(s || "").trim().toLowerCase();

function addMonthsISO(dateStr, months) {
  const d = new Date(`${dateStr}T00:00:00`);
  if (isNaN(d)) return "";
  d.setMonth(d.getMonth() + Number(months || 0));
  return d.toISOString().slice(0, 10);
}
function formatVN(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return d && m && y ? `${d}/${m}/${y}` : dateStr;
}

/** Lần theo chuỗi đổi trả (nếu có) để tìm serial GỐC + đơn hàng gốc + sản phẩm. */
function resolveOriginalSale(serial, state) {
  const orders = Array.isArray(state.orders) ? state.orders : [];
  const tickets = Array.isArray(state.warrantyTickets) ? state.warrantyTickets : [];
  const products = Array.isArray(state.products) ? state.products : [];

  let currentSerial = normLower(serial);
  let displayProductName = "";
  const seenTickets = new Set();
  for (let hop = 0; hop < 5; hop++) {
    const ticket = tickets.find(
      (t) =>
        t.status === "completed" &&
        t.resolutionType === "exchange" &&
        !seenTickets.has(t.id) &&
        (t.exchangeSeries || []).some((s) => normLower(s) === currentSerial)
    );
    if (!ticket) break;
    seenTickets.add(ticket.id);
    if (!displayProductName) displayProductName = ticket.exchangeProductName || "";
    const rootItem = (ticket.items || [])[0];
    const rootSerial = rootItem && rootItem.series && rootItem.series[0];
    if (!rootSerial) break;
    currentSerial = normLower(rootSerial);
  }

  for (const o of orders) {
    for (const it of o.items || []) {
      if ((it.series || []).some((s) => normLower(s) === currentSerial)) {
        const product = products.find((p) => p.id === it.productId);
        if (!product) continue;
        return {
          soldDate: String(o.createdAt || "").slice(0, 10),
          product,
          displayProductName: displayProductName || product.name,
        };
      }
    }
  }
  return null;
}

async function lookupWarranty(req, res) {
  const serial = String((req.query && req.query.serial) || "").trim();
  if (!serial) return json(res, 400, { error: "Nhập số serial cần tra cứu." });

  const state = await readState();
  const info = resolveOriginalSale(serial, state);
  if (!info) {
    return json(res, 200, {
      found: false,
      message: "Không tìm thấy serial này trong hệ thống. Vui lòng kiểm tra lại hoặc gọi hotline để được hỗ trợ.",
    });
  }

  const warrantyMonths = Number(info.product.warrantyMonths) || 0;
  const untilDate = warrantyMonths > 0 ? addMonthsISO(info.soldDate, warrantyMonths) : "";
  const active = warrantyMonths > 0 && untilDate >= new Date().toISOString().slice(0, 10);

  json(res, 200, {
    found: true,
    productName: info.displayProductName,
    serial,
    soldDate: formatVN(info.soldDate),
    warrantyUntil: warrantyMonths > 0 ? formatVN(untilDate) : "Sản phẩm không áp dụng bảo hành",
    active,
  });
}

/* ---------------- type=points ---------------- */
async function lookupPoints(req, res) {
  const phone = normalizePhone((req.query && req.query.phone) || "");
  if (!/^0\d{8,10}$/.test(phone)) return json(res, 400, { error: "Nhập số điện thoại hợp lệ." });

  const state = await readState();
  const config = (state.webConfig && state.webConfig.LOYALTY) || DEFAULT_LOYALTY;
  if (!config.enabled) return json(res, 200, { enabled: false, points: 0 });

  const { points, orderCount } = pointsForPhone(phone, state, config);
  json(res, 200, { enabled: true, points, orderCount, rateVnd: Number(config.rateVnd) || 0 });
}

/* ---------------- dispatch ---------------- */
export default handler(async (req, res) => {
  if (req.method !== "GET") return json(res, 405, { error: "Chỉ hỗ trợ GET." });
  const type = (req.query && req.query.type) || "";
  if (type === "order") return lookupOrder(req, res);
  if (type === "warranty") return lookupWarranty(req, res);
  if (type === "points") return lookupPoints(req, res);
  return json(res, 400, { error: "Thiếu hoặc sai tham số type (order/warranty/points)." });
});
