// Phiếu gửi chành xe cho khách tỉnh: thông tin chành / nhà xe đi kèm phiếu gửi hàng (nhãn dán thùng),
// và mẫu in "Phiếu gửi hàng qua chành xe" (A5 dọc, 2 liên: shop giữ, giao nhà xe) có chỗ ký nhận.
// Chỉ dùng dữ liệu đã có trên máy, không gọi máy chủ.
import React from "react";

const LINE = "#E5E7EB";
const TEXT = "#111827";
const MUTE = "#6B7280";
const inputCls = "w-full border rounded-md py-2 px-3 text-sm bg-white";
const vnd = (n) => (Math.round(Number(n)) || 0).toLocaleString("vi-VN") + "đ";
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/** Các trường chành xe thêm vào phiếu gửi hàng (giữ dữ liệu cũ không có các trường này). */
export function normalizeChanh(p) {
  return {
    chanhName: p.chanhName || "",
    chanhPhone: p.chanhPhone || "",
    chanhAddress: p.chanhAddress || "",
    plate: p.plate || "",
    sendDate: p.sendDate || "",
    orderCode: p.orderCode || "",
    goods: p.goods || "",
    boxes: Math.max(1, Number(p.boxes) || 1),
    freight: Number(p.freight) || 0,
    freightPayer: p.freightPayer === "sender" ? "sender" : "receiver",
    cod: Number(p.cod) || 0,
  };
}
export const hasChanh = (p) => !!(p.chanhName || p.chanhPhone || p.chanhAddress || p.plate);

function L({ label, hint, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium mb-1" style={{ color: TEXT, opacity: 0.7 }}>{label}</span>
      {children}
      {hint && <span className="block text-xs mt-1" style={{ color: MUTE }}>{hint}</span>}
    </label>
  );
}

/** Khối nhập thông tin chành trong form phiếu gửi hàng. chanhs: các chành đã dùng để gợi ý điền nhanh. */
export function ChanhFields({ form, set, orders, customers, chanhs }) {
  const pickChanh = (name) => {
    const c = chanhs.find((x) => x.chanhName === name);
    if (c) { set("chanhPhone", form.chanhPhone || c.chanhPhone); set("chanhAddress", form.chanhAddress || c.chanhAddress); }
  };
  const pickOrder = (code) => {
    set("orderCode", code);
    const o = (orders || []).find((x) => x.code === code.trim().toUpperCase());
    if (o && o.__remaining > 0 && !form.cod) set("cod", o.__remaining);
  };
  return (
    <div className="p-4 rounded-md mb-4" style={{ background: "#fff", border: `1px solid ${LINE}` }}>
      <p className="text-sm font-medium mb-1" style={{ color: TEXT }}>Gửi qua chành xe (khách tỉnh)</p>
      <p className="text-xs mb-3" style={{ color: MUTE }}>Bỏ trống nếu không gửi chành. Có thông tin chành thì nhãn in thêm dòng chành, và in được phiếu giao cho nhà xe.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <L label="Tên chành / nhà xe">
          <input list="chanhNames" className={inputCls} style={{ borderColor: LINE }} value={form.chanhName} onChange={(e) => { set("chanhName", e.target.value); pickChanh(e.target.value); }} placeholder="VD: Chành Hải Đăng" />
          <datalist id="chanhNames">{chanhs.map((c) => <option key={c.chanhName} value={c.chanhName} />)}</datalist>
        </L>
        <L label="SĐT chành"><input className={inputCls} style={{ borderColor: LINE }} value={form.chanhPhone} onChange={(e) => set("chanhPhone", e.target.value)} inputMode="tel" /></L>
        <div className="sm:col-span-2"><L label="Địa chỉ chành (nơi mang hàng tới gửi)"><input className={inputCls} style={{ borderColor: LINE }} value={form.chanhAddress} onChange={(e) => set("chanhAddress", e.target.value)} placeholder="VD: 123 Lê Hồng Phong, Q.5" /></L></div>
        <L label="Biển số xe (nếu có)"><input className={inputCls} style={{ borderColor: LINE }} value={form.plate} onChange={(e) => set("plate", e.target.value)} placeholder="51B-123.45" /></L>
        <L label="Ngày gửi"><input type="date" className={inputCls} style={{ borderColor: LINE }} value={form.sendDate} onChange={(e) => set("sendDate", e.target.value)} /></L>
        <L label="Đơn hàng" hint="Gõ mã đơn để tự điền số tiền thu hộ còn nợ">
          <input list="chanhOrders" className={inputCls} style={{ borderColor: LINE }} value={form.orderCode} onChange={(e) => pickOrder(e.target.value)} placeholder="DH033" />
          <datalist id="chanhOrders">{(orders || []).slice(0, 60).map((o) => <option key={o.id} value={o.code}>{(customers || []).find((c) => c.id === o.customerId)?.name || ""}</option>)}</datalist>
        </L>
        <L label="Số kiện"><input type="number" min={1} className={inputCls} style={{ borderColor: LINE }} value={form.boxes} onChange={(e) => set("boxes", Math.max(1, Number(e.target.value) || 1))} /></L>
        <div className="sm:col-span-2"><L label="Nội dung hàng"><input className={inputCls} style={{ borderColor: LINE }} value={form.goods} onChange={(e) => set("goods", e.target.value)} placeholder="VD: 2 thùng màn hình 27 inch, 1 thùng phụ kiện" /></L></div>
        <L label="Cước chành">
          <input type="number" min={0} step={1000} className={inputCls} style={{ borderColor: LINE }} value={form.freight || ""} onChange={(e) => set("freight", Number(e.target.value) || 0)} placeholder="0" />
        </L>
        <L label="Ai trả cước">
          <select className={inputCls} style={{ borderColor: LINE }} value={form.freightPayer} onChange={(e) => set("freightPayer", e.target.value)}>
            <option value="receiver">Người nhận trả</option>
            <option value="sender">Shop trả</option>
          </select>
        </L>
        <L label="Thu hộ (COD)" hint="Số tiền chành thu của khách khi giao, 0 = không thu">
          <input type="number" min={0} step={1000} className={inputCls} style={{ borderColor: LINE }} value={form.cod || ""} onChange={(e) => set("cod", Number(e.target.value) || 0)} placeholder="0" />
        </L>
      </div>
    </div>
  );
}

/** Dòng tóm tắt chành trong danh sách phiếu gửi. */
export function ChanhLine({ p }) {
  if (!hasChanh(p)) return null;
  return (
    <p className="text-xs mt-1" style={{ color: TEXT }}>
      <b>Chành:</b> {[p.chanhName, p.chanhPhone].filter(Boolean).join(" · ")}{p.sendDate ? ` · gửi ${new Date(p.sendDate).toLocaleDateString("vi-VN")}` : ""}
      {p.cod > 0 ? <> · <b style={{ color: "#C62828" }}>Thu hộ {vnd(p.cod)}</b></> : ""}
    </p>
  );
}

/** Dòng chành in thêm trên nhãn dán thùng (HTML). */
export function chanhLabelRows(p, e) {
  if (!hasChanh(p)) return "";
  const pay = p.freightPayer === "sender" ? "Shop trả cước" : "Người nhận trả cước";
  return `<tr><td class="k">Chành:</td><td class="v b">${e([p.chanhName, p.chanhPhone].filter(Boolean).join(" - "))}</td></tr>
    <tr><td class="k">Cước:</td><td class="v b">${e(pay)}${p.cod > 0 ? ` · THU HỘ ${e(vnd(p.cod))}` : ""}</td></tr>`;
}

/** Phiếu gửi hàng qua chành xe: A5 dọc, 2 liên (shop giữ / giao nhà xe). */
export function buildChanhSlipHTML(p, company) {
  const e = esc;
  const day = p.sendDate ? new Date(p.sendDate) : new Date();
  const d = `Ngày ${day.getDate()} tháng ${day.getMonth() + 1} năm ${day.getFullYear()}`;
  const pay = p.freightPayer === "sender" ? "Shop trả" : "Người nhận trả";
  const row = (k, v, b) => `<tr><th>${k}</th><td${b ? ' class="b"' : ""}>${v || "&nbsp;"}</td></tr>`;
  const one = (copy) => `
  <section class="pg">
    <div class="top"><div><b>${e(company.name)}</b><br>${e(company.address)}<br>ĐT: ${e(company.phone)}</div><div class="copy">${copy}</div></div>
    <h1>PHIẾU GỬI HÀNG QUA CHÀNH XE</h1>
    <p class="sub">Mã phiếu: <b>${e(p.code || "")}</b>${p.orderCode ? ` · Đơn hàng: <b>${e(p.orderCode)}</b>` : ""} · ${d}</p>
    <h2>Chành / nhà xe</h2>
    <table>${row("Tên chành", e(p.chanhName), 1)}${row("Số điện thoại", e(p.chanhPhone), 1)}${row("Địa chỉ", e(p.chanhAddress))}${p.plate ? row("Biển số xe", e(p.plate)) : ""}</table>
    <h2>Người nhận</h2>
    <table>${row("Tên", e(p.company || p.recipientName), 1)}${p.company && p.recipientName ? row("Người nhận", e(p.recipientName)) : ""}${row("Số điện thoại", e(p.recipientPhone), 1)}${row("Địa chỉ", e(p.recipientAddress))}</table>
    <h2>Hàng gửi</h2>
    <table>${row("Nội dung", e(p.goods))}${row("Số kiện", e(p.boxes), 1)}${row("Cước chành", (p.freight ? e(vnd(p.freight)) + " · " : "") + e(pay), 1)}${row("Thu hộ (COD)", p.cod > 0 ? `<b class="cod">${e(vnd(p.cod))}</b>` : "Không thu")}</table>
    ${p.note ? `<p class="note">${e(p.note)}</p>` : ""}
    <div class="sign"><div><b>Bên gửi</b><i>(ký, ghi rõ họ tên)</i></div><div><b>Chành / nhà xe</b><i>(ký nhận đủ ${e(p.boxes)} kiện)</i></div></div>
  </section>`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${e(p.code || "Phieu gui chanh")}</title><style>
    @page { size: A5 portrait; margin: 9mm; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #000; font-size: 12.5px; }
    .pg { page-break-after: always; }
    .pg:last-child { page-break-after: auto; }
    .top { display: flex; justify-content: space-between; gap: 10px; font-size: 11px; line-height: 1.4; }
    .copy { border: 1px solid #000; padding: 3px 8px; height: fit-content; white-space: nowrap; font-weight: bold; }
    h1 { margin: 10px 0 2px; text-align: center; font-size: 17px; letter-spacing: .3px; }
    .sub { margin: 0 0 8px; text-align: center; font-size: 11.5px; }
    h2 { margin: 9px 0 3px; font-size: 12.5px; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #000; padding: 5px 7px; text-align: left; vertical-align: top; }
    th { width: 31%; font-weight: normal; background: #f2f2f2; }
    td.b { font-weight: bold; }
    .cod { font-size: 15px; }
    .note { margin: 8px 0 0; text-align: center; font-weight: bold; }
    .sign { display: grid; grid-template-columns: 1fr 1fr; margin-top: 14px; text-align: center; min-height: 80px; }
    .sign i { display: block; font-size: 10.5px; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style></head><body>${one("Liên 1: Shop giữ")}${one("Liên 2: Giao nhà xe")}</body></html>`;
}
