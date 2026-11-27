// Mẫu in phiếu nhập hàng và bảng đối chiếu công nợ nhà cung cấp (A4 dọc). Chỉ dựng HTML, không gọi máy chủ.
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const num = (n) => (Math.round(Number(n)) || 0).toLocaleString("vi-VN");
const dt = (iso) => { const d = new Date(iso); return isNaN(d) ? "" : d.toLocaleDateString("vi-VN"); };

const CSS = `
  @page { size: A4; margin: 12mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Times New Roman', Times, serif; color: #111; font-size: 13px; }
  .co { line-height: 1.55; border-bottom: 2px solid #111; padding-bottom: 8px; margin-bottom: 12px; }
  h1 { text-align: center; font-size: 21px; letter-spacing: .5px; margin: 6px 0 4px; }
  .sub { text-align: center; margin: 0 0 12px; }
  .info div { margin-bottom: 5px; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0; }
  th, td { border: 1px solid #111; padding: 6px 8px; }
  th { font-size: 12px; background: #f2f2f2; }
  td.c { text-align: center; } td.r { text-align: right; }
  tr.b td { font-weight: bold; }
  .sn { font-size: 11.5px; color: #333; }
  .sign { display: flex; justify-content: space-between; text-align: center; margin-top: 22px; }
  .sign div { width: 32%; } .sign i { display: block; font-size: 11px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`;

const head = (title) => `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${CSS}</style></head><body>`;
const companyBlock = (c) => `<div class="co"><b>${esc(c.name)}</b><br>Địa chỉ: ${esc(c.address)}<br>MST: ${esc(c.taxCode)} · ĐT: ${esc(c.phone)}</div>`;

/** Phiếu nhập kho. vatLabel(id) → "VAT 10%"… */
export function buildPOHTML(po, products, company, supplier, vatLabel) {
  const d = new Date(po.createdAt);
  const rows = po.items.map((it, i) => {
    const p = products.find((x) => x.id === it.productId);
    return `<tr><td class="c">${i + 1}</td><td>${esc(p?.name || "?")}${it.series?.length ? `<div class="sn">Series: ${esc(it.series.join(", "))}</div>` : ""}</td><td class="c">${esc(p?.unit || "")}</td><td class="c">${it.qty}</td><td class="r">${num(it.price)}</td><td class="c">${esc(vatLabel(it.vat))}</td><td class="r">${num(it.qty * it.price)}</td></tr>`;
  }).join("");
  const total = po.items.reduce((n, it) => n + it.qty * it.price, 0);
  const returned = (po.returns || []).reduce((n, r) => n + r.items.reduce((m, it) => m + it.qty * it.price, 0), 0);
  return head(po.code) + `${companyBlock(company)}
    <h1>PHIẾU NHẬP KHO</h1>
    <p class="sub">Ngày ${d.getDate()} tháng ${d.getMonth() + 1} năm ${d.getFullYear()} · <b>Số: ${esc(po.code)}</b></p>
    <div class="info">
      <div><b>Nhà cung cấp:</b> ${esc(supplier?.name || String(po.supplier || "").replace(/^\S+ - /, ""))}</div>
      ${supplier?.taxCode ? `<div><b>Mã số thuế:</b> ${esc(supplier.taxCode)}</div>` : ""}
      ${supplier?.address ? `<div><b>Địa chỉ:</b> ${esc(supplier.address)}</div>` : ""}
      <div><b>Số hoá đơn NCC:</b> ${esc(po.invoiceNo || "—")} · <b>Nhập tại:</b> ${esc(po.branch || "")} · <b>Thanh toán:</b> ${po.paid ? "Đã thanh toán" : po.creditDays ? `Công nợ ${po.creditDays} ngày` : "Chưa thanh toán"}</div>
    </div>
    <table><thead><tr><th>STT</th><th>Tên hàng</th><th>ĐVT</th><th>SL</th><th>Đơn giá</th><th>VAT</th><th>Thành tiền</th></tr></thead>
      <tbody>${rows}
        <tr class="b"><td colspan="6" class="r">Tổng cộng:</td><td class="r">${num(total)}</td></tr>
        ${returned > 0 ? `<tr><td colspan="6" class="r">Đã trả lại NCC:</td><td class="r">-${num(returned)}</td></tr><tr class="b"><td colspan="6" class="r">Giá trị còn lại:</td><td class="r">${num(total - returned)}</td></tr>` : ""}
      </tbody></table>
    ${po.notes ? `<p><b>Ghi chú:</b> ${esc(po.notes)}</p>` : ""}
    <div class="sign"><div><b>Người lập phiếu</b><i>(Ký, họ tên)</i><br><br><br>${esc(po.createdBy || "")}</div><div><b>Người giao hàng</b><i>(Ký, họ tên)</i></div><div><b>Thủ kho</b><i>(Ký, họ tên)</i></div></div>
  </body></html>`;
}

/** Bảng đối chiếu công nợ nhà cung cấp: các phiếu nhập chưa thanh toán. */
export function buildSupplierDebtHTML(supplier, pos, company, poNetTotal, poDueInfo) {
  const now = new Date();
  const unpaid = pos.filter((p) => !p.paid && poNetTotal(p) > 0).sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
  const total = unpaid.reduce((n, p) => n + poNetTotal(p), 0);
  const rows = unpaid.map((p, i) => {
    const d = poDueInfo(p);
    return `<tr><td class="c">${i + 1}</td><td>${esc(p.code)}</td><td class="c">${dt(p.createdAt)}</td><td>${esc(p.invoiceNo || "")}</td><td class="c">${d ? dt(d.dueDate) : ""}</td><td class="c">${d ? (d.overdue ? `Quá hạn ${-d.daysLeft} ngày` : `Còn ${d.daysLeft} ngày`) : ""}</td><td class="r">${num(poNetTotal(p))}</td></tr>`;
  }).join("");
  return head("Cong no " + supplier.name) + `${companyBlock(company)}
    <h1>BẢNG ĐỐI CHIẾU CÔNG NỢ</h1>
    <p class="sub">Tính đến ngày ${now.getDate()} tháng ${now.getMonth() + 1} năm ${now.getFullYear()}</p>
    <div class="info">
      <div><b>Nhà cung cấp:</b> ${esc(supplier.name)} (${esc(supplier.code)})</div>
      ${supplier.taxCode ? `<div><b>Mã số thuế:</b> ${esc(supplier.taxCode)}</div>` : ""}
      ${supplier.address ? `<div><b>Địa chỉ:</b> ${esc(supplier.address)}</div>` : ""}
      <div><b>Điều khoản:</b> ${supplier.paymentTerm === "cash" ? "Tiền mặt" : `Công nợ ${supplier.creditDays} ngày`}</div>
    </div>
    <table><thead><tr><th>STT</th><th>Phiếu nhập</th><th>Ngày nhập</th><th>Số HĐ</th><th>Hạn trả</th><th>Tình trạng</th><th>Còn nợ</th></tr></thead>
      <tbody>${rows || `<tr><td colspan="7" class="c">Không còn khoản nợ nào.</td></tr>`}
        <tr class="b"><td colspan="6" class="r">Tổng còn nợ:</td><td class="r">${num(total)}</td></tr>
      </tbody></table>
    <div class="sign"><div><b>Bên mua</b><i>(Ký, họ tên)</i></div><div></div><div><b>Nhà cung cấp xác nhận</b><i>(Ký, họ tên)</i></div></div>
  </body></html>`;
}
