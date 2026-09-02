import { handler, json, readState, writeState, stockOf } from "./_supa.js";

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

// POST /api/web/orders — nhận đơn từ website, ghi vào blob để hiện trong app quản lý.
// body: { source, code?, customer:{name,phone,email}, shipping:{province,ward,address,fullAddress,note},
//         payment:'cod'|'bank', items:[{productId|sku, qty, price, name?}], subtotal? }
export default handler(async (req, res) => {
  if (req.method !== "POST") return json(res, 405, { error: "Chỉ hỗ trợ POST." });

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const cust = body.customer || {};
  const sh = body.shipping || {};
  const phone = String(cust.phone || "").replace(/\s/g, "");

  const rawItems = Array.isArray(body.items) ? body.items : [];
  const items = rawItems.filter((it) => it && (it.productId || it.sku) && Number(it.qty) > 0);
  if (!items.length) return json(res, 400, { error: "Đơn hàng không có sản phẩm hợp lệ." });
  if (!cust.name || !/^0\d{8,10}$/.test(phone)) return json(res, 400, { error: "Thiếu họ tên hoặc số điện thoại hợp lệ." });

  const state = await readState();
  state.orders = Array.isArray(state.orders) ? state.orders : [];
  const products = Array.isArray(state.products) ? state.products : [];

  const preorderNames = [];
  const mapped = items.map((it) => {
    const p = products.find((x) => x.id === it.productId || x.sku === it.productId || x.sku === it.sku);
    const qty = Math.max(1, Math.floor(Number(it.qty) || 1));
    // Đặt trước = web báo preorder, HOẶC tồn kho thực tế không đủ.
    const avail = p ? stockOf(p) : 0;
    const isPre = !!it.preorder || (p && !p.isService && avail < qty);
    if (isPre) preorderNames.push((p ? p.name : it.name || it.sku) + (avail > 0 ? ` (còn ${avail}/${qty})` : ""));
    return {
      productId: p ? p.id : it.productId || it.sku,
      qty,
      price: Number(it.price) || (p ? Number(p.retailPrice) || 0 : 0),
      series: [],
      fulfilled: false,
      preorder: !!isPre,
    };
  });
  const hasPreorder = preorderNames.length > 0;

  const source = body.source || "Đặt hàng website";
  const code = body.code || "WEB" + Date.now().toString(36).toUpperCase().slice(-8);
  const now = new Date().toISOString();

  const order = {
    id: uid(),
    code,
    createdAt: now,
    date: now.slice(0, 10),
    channel: "online",
    status: "pending",
    approvalStatus: "pending", // cần nhân viên xác nhận
    createdByRole: "web",
    customerId: "",
    branch: "",
    seller: "",
    tags: hasPreorder ? [source, "Đặt trước"] : [source],
    notes: [
      "🌐 " + source,
      hasPreorder ? "⚠ ĐƠN ĐẶT TRƯỚC (chưa đủ tồn): " + preorderNames.join("; ") : "",
      `Khách: ${cust.name} · ${phone}` + (cust.email ? ` · ${cust.email}` : ""),
      sh.fullAddress ? `Giao tới: ${sh.fullAddress}` : "",
      sh.note ? `Ghi chú KH: ${sh.note}` : "",
      `Thanh toán: ${body.payment === "bank" ? "Chuyển khoản trước" : "COD (thu khi giao)"}`,
    ].filter(Boolean).join("\n"),
    shippingAddress: {
      recipientName: cust.name || "",
      recipientPhone: phone,
      province: sh.province || "",
      ward: sh.ward || "",
      addressDetail: sh.address || sh.fullAddress || "",
    },
    items: mapped,
    vat: "VAT10",
    orderDiscount: 0,
    discountType: "amount",
    shippingFee: 0,
    paidAmount: 0,
    payments: [],
    invoiceStatus: "pending",
    invoiceNo: "",
    returns: [],
  };

  state.orders.unshift(order);
  await writeState(state);

  json(res, 200, { ok: true, code });
});
