// "Việc hôm nay" ở đầu Tổng quan: mở máy là biết làm gì trước. Chỉ tính trên dữ liệu đã tải sẵn.
// calc = { orderCalc, orderDueInfo, poNetTotal, poDueInfo } truyền từ SalesManager.
import React from "react";
import { Truck, Wallet, PackageOpen, Landmark, ChevronRight } from "lucide-react";
import "./today.css";

/** Nút nhắn Zalo theo số điện thoại (mở zalo.me/<số> ở tab mới, app Zalo tự mở trên điện thoại). */
export function ZaloLink({ phone, label }) {
  const num = String(phone || "").replace(/\D/g, "").replace(/^84/, "0");
  if (num.length < 9) return null;
  return <a className="zalo" href={"https://zalo.me/" + num} target="_blank" rel="noopener" title={"Nhắn Zalo " + phone} aria-label={"Nhắn Zalo " + phone} onClick={(e) => e.stopPropagation()}>{label || "Zalo"}</a>;
}

const vnd = (n) => (Math.round(Number(n)) || 0).toLocaleString("vi-VN") + "đ";

function Card({ icon: Icon, tone, title, count, sub, onAll, children }) {
  return (
    <section className={"td-card t-" + tone}>
      <header>
        <span className="ic"><Icon size={18} /></span>
        <div><h3>{title}</h3><p>{sub}</p></div>
        <b className="ct">{count}</b>
      </header>
      <div className="td-list">{children}</div>
      {onAll && <button type="button" className="td-all" onClick={onAll}>Xem tất cả <ChevronRight size={15} /></button>}
    </section>
  );
}

export default function TodayPanel({ orders, customers, purchaseOrders, calc, onOpenOrder, onOpenPO, goOrders, goPurchase }) {
  const cust = (id) => (customers || []).find((c) => c.id === id);
  const live = orders.filter((o) => o.status !== "cancelled");
  const toShip = live.filter((o) => o.status === "pending" || o.status === "shipping").sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
  // Khách cần thu tiền: gộp theo khách, quá hạn lên trước rồi tới số tiền lớn.
  const debtMap = new Map();
  live.forEach((o) => {
    const rem = calc.orderCalc(o).remaining;
    if (rem <= 0) return;
    const d = calc.orderDueInfo(o);
    const k = o.customerId || "_le";
    const x = debtMap.get(k) || { id: o.customerId, amount: 0, orders: 0, overdue: 0, firstOrder: o };
    x.amount += rem; x.orders += 1;
    if (d && d.daysLeft < 0) x.overdue = Math.max(x.overdue, -d.daysLeft);
    debtMap.set(k, x);
  });
  const debts = [...debtMap.values()].sort((a, b) => b.overdue - a.overdue || b.amount - a.amount);
  const debtTotal = debts.reduce((n, x) => n + x.amount, 0);
  const incoming = (purchaseOrders || []).filter((p) => p.status === "pending").sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
  const supDue = (purchaseOrders || []).map((p) => ({ p, d: calc.poDueInfo(p) })).filter((x) => x.d && x.d.nearDue).sort((a, b) => a.d.daysLeft - b.d.daysLeft);
  const ago = (iso) => { const d = Math.floor((Date.now() - new Date(iso)) / 864e5); return d <= 0 ? "hôm nay" : `${d} ngày trước`; };

  return (
    <div className="td">
      <Card icon={Truck} tone="amber" title="Đơn cần giao" count={toShip.length} sub="Chờ xử lý và đang giao, cũ nhất trước" onAll={toShip.length > 5 ? goOrders : null}>
        {toShip.slice(0, 5).map((o) => (
          <button type="button" key={o.id} className="td-row" onClick={() => onOpenOrder(o.id)}>
            <span className="m"><b>{o.code}</b> {cust(o.customerId)?.name || "Khách lẻ"}<small>{o.status === "shipping" ? "Đang giao" : "Chờ xử lý"} · {ago(o.createdAt)}</small></span>
            <span className="v">{vnd(calc.orderCalc(o).payable)}</span>
          </button>
        ))}
        {!toShip.length && <p className="td-ok">Không còn đơn nào cần giao.</p>}
      </Card>
      <Card icon={Wallet} tone="red" title="Khách cần thu tiền" count={vnd(debtTotal)} sub={`${debts.length} khách, quá hạn lên trước`}>
        {debts.slice(0, 5).map((x) => { const c = cust(x.id); return (
          <div key={x.id || "_le"} className="td-row">
            <button type="button" className="m" onClick={() => onOpenOrder(x.firstOrder.id)}>{c?.name || "Khách lẻ"}<small>{x.orders} đơn{x.overdue ? <em> · quá hạn {x.overdue} ngày</em> : ""}</small></button>
            <span className="v due">{vnd(x.amount)}</span>
            {c?.phone && <ZaloLink phone={c.phone} />}
          </div>
        ); })}
        {!debts.length && <p className="td-ok">Không khách nào còn nợ.</p>}
      </Card>
      <Card icon={PackageOpen} tone="blue" title="Hàng chờ về" count={incoming.length} sub="Phiếu nhập chưa nhận hàng" onAll={incoming.length > 5 ? goPurchase : null}>
        {incoming.slice(0, 5).map((p) => (
          <button type="button" key={p.id} className="td-row" onClick={() => onOpenPO(p.id)}>
            <span className="m"><b>{p.code}</b> {(p.supplier || "").replace(/^\S+ - /, "")}<small>đặt {ago(p.createdAt)}</small></span>
            <span className="v">{vnd(calc.poNetTotal(p))}</span>
          </button>
        ))}
        {!incoming.length && <p className="td-ok">Không có hàng đang chờ về.</p>}
      </Card>
      <Card icon={Landmark} tone="ink" title="Trả nhà cung cấp" count={supDue.length} sub="Công nợ sắp và đã tới hạn">
        {supDue.slice(0, 5).map(({ p, d }) => (
          <button type="button" key={p.id} className="td-row" onClick={() => onOpenPO(p.id)}>
            <span className="m"><b>{p.code}</b> {(p.supplier || "").replace(/^\S+ - /, "")}<small className={d.overdue ? "due" : ""}>{d.overdue ? `quá hạn ${-d.daysLeft} ngày` : d.daysLeft === 0 ? "tới hạn hôm nay" : `còn ${d.daysLeft} ngày`}</small></span>
            <span className="v">{vnd(calc.poNetTotal(p))}</span>
          </button>
        ))}
        {!supDue.length && <p className="td-ok">Không có khoản nào tới hạn.</p>}
      </Card>
    </div>
  );
}
