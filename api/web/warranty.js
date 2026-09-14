/**
 * GET /api/web/warranty?serial=<số serial>
 * Tra cứu bảo hành công khai theo serial — chỉ trả thông tin AN TOÀN cho khách xem
 * (tên sản phẩm, ngày bán, hạn bảo hành, còn/hết hạn). KHÔNG trả tên/SĐT khách hàng,
 * mã đơn, giá vốn... (giống nguyên tắc publicProduct() trong _supa.js).
 *
 * Cách xác định 1 serial:
 *  1. Serial GỐC (bán lần đầu) — tìm trong orders[].items[].series, ngày bán = order.createdAt.
 *  2. Serial ĐỔI TRẢ BẢO HÀNH (nằm trong exchangeSeries của 1 phiếu bảo hành đã hoàn tất,
 *     "Đã trả khách") — lần ngược về serial gốc trong items[] của phiếu đó, dùng ngày bán +
 *     thời hạn bảo hành của sản phẩm GỐC (chính sách: đổi máy KHÔNG reset lại hạn bảo hành,
 *     chỉ tiếp tục phần hạn còn lại từ ngày mua ban đầu).
 * Giới hạn đã biết: nếu 1 phiếu bảo hành gộp nhiều sản phẩm khác nhau trong items[], chỉ dò
 * theo items[0] (khớp với cách "Đổi sản phẩm" hiện chỉ cho chọn 1 sản phẩm thay thế/phiếu).
 */
import { handler, json, readState } from "./_supa.js";

const norm = (s) => String(s || "").trim().toLowerCase();

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

  let currentSerial = norm(serial);
  let displayProductName = "";
  const seenTickets = new Set();
  for (let hop = 0; hop < 5; hop++) {
    const ticket = tickets.find(
      (t) =>
        t.status === "completed" &&
        t.resolutionType === "exchange" &&
        !seenTickets.has(t.id) &&
        (t.exchangeSeries || []).some((s) => norm(s) === currentSerial)
    );
    if (!ticket) break;
    seenTickets.add(ticket.id);
    if (!displayProductName) displayProductName = ticket.exchangeProductName || "";
    const rootItem = (ticket.items || [])[0];
    const rootSerial = rootItem && rootItem.series && rootItem.series[0];
    if (!rootSerial) break;
    currentSerial = norm(rootSerial);
  }

  for (const o of orders) {
    for (const it of o.items || []) {
      if ((it.series || []).some((s) => norm(s) === currentSerial)) {
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

export default handler(async (req, res) => {
  if (req.method !== "GET") return json(res, 405, { error: "Chỉ hỗ trợ GET." });

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
});
