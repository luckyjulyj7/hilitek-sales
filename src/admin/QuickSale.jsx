// Màn "Bán nhanh" tại quầy: gõ tên/mã hoặc quét mã vạch là thêm vào giỏ, chọn khách (mặc định khách lẻ),
// nhập tiền khách đưa, bấm Thanh toán (F9) là tạo đơn + in hoá đơn. Không gọi máy chủ: đơn tạo qua onCreate
// (cùng cách tính tồn kho, giá sàn, duyệt như form tạo đơn trong SalesManager).
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, Printer, Search, Trash2, X, UserRound } from "lucide-react";
import "./quickSale.css";

const vnd = (n) => (Math.round(Number(n)) || 0).toLocaleString("vi-VN") + "đ";
const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

export default function QuickSale({ products, customers, stockOf, onCreate, onClose }) {
  const [q, setQ] = useState("");
  const [hi, setHi] = useState(0);
  const [cart, setCart] = useState([]); // [{ productId, qty, price }]
  const [custQ, setCustQ] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [disc, setDisc] = useState(0);
  const [given, setGiven] = useState("");
  const [msg, setMsg] = useState("");
  const searchRef = useRef(null);
  useEffect(() => { searchRef.current && searchRef.current.focus(); }, []);

  const sellable = useMemo(() => (products || []).filter((p) => !p.hidden), [products]);
  const results = useMemo(() => {
    const s = norm(q.trim());
    if (!s) return [];
    const words = s.split(/\s+/);
    return sellable.filter((p) => { const t = norm([p.name, p.code, p.sku, p.barcode].join(" ")); return words.every((w) => t.includes(w)); }).slice(0, 8);
  }, [q, sellable]);
  const custResults = useMemo(() => {
    const s = norm(custQ.trim());
    if (!s) return [];
    return (customers || []).filter((c) => norm([c.name, c.phone, c.code].join(" ")).includes(s)).slice(0, 6);
  }, [custQ, customers]);
  const cust = (customers || []).find((c) => c.id === customerId);

  const add = (p) => {
    if (!p) return;
    setCart((c) => c.some((x) => x.productId === p.id) ? c.map((x) => (x.productId === p.id ? { ...x, qty: x.qty + 1 } : x)) : [...c, { productId: p.id, qty: 1, price: p.retailPrice || 0 }]);
    setQ(""); setHi(0); setMsg("");
    searchRef.current && searchRef.current.focus();
  };
  const onSearchKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      const s = q.trim();
      const exact = sellable.find((p) => [p.barcode, p.sku, p.code].some((v) => v && String(v).toLowerCase() === s.toLowerCase()));
      add(exact || results[hi]);
    }
  };
  const setLine = (id, patch) => setCart((c) => c.map((x) => (x.productId === id ? { ...x, ...patch } : x)));
  const sub = cart.reduce((n, x) => n + x.qty * x.price, 0);
  const total = Math.max(0, sub - (Number(disc) || 0));
  const givenN = given === "" ? total : Number(given) || 0;
  const change = givenN - total;

  const pay = (print) => {
    if (!cart.length) { setMsg("Chưa có sản phẩm nào."); return; }
    const res = onCreate({ customerId, items: cart.map((x) => ({ ...x, series: [] })), orderDiscount: Number(disc) || 0, paidAmount: Math.min(givenN, total) }, { print });
    if (res && res.error) { setMsg(res.error); return; }
    setCart([]); setDisc(0); setGiven(""); setCustomerId(""); setCustQ("");
    setMsg(res && res.code ? `Đã tạo đơn ${res.code}${res.status === "done" ? ", hoàn thành" : ", chờ xử lý"}.` : "Đã tạo đơn.");
    searchRef.current && searchRef.current.focus();
  };
  useEffect(() => {
    const k = (e) => {
      if (e.key === "F9") { e.preventDefault(); pay(true); }
      else if (e.key === "Escape") { e.preventDefault(); onClose(); }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });

  return (
    <div className="qs" role="dialog" aria-label="Bán nhanh">
      <header className="qs-top">
        <b>Bán nhanh</b><span>Gõ tên, mã hoặc quét mã vạch · Enter thêm · F9 thanh toán và in · Esc đóng</span>
        <button type="button" onClick={onClose} aria-label="Đóng"><X size={20} /></button>
      </header>
      <div className="qs-body">
        <section className="qs-left">
          <div className="qs-search">
            <Search size={18} />
            <input ref={searchRef} value={q} onChange={(e) => { setQ(e.target.value); setHi(0); }} onKeyDown={onSearchKey} placeholder="Tìm sản phẩm hoặc quét mã…" aria-label="Tìm sản phẩm" />
            {results.length > 0 && (
              <ul className="qs-res" role="listbox">
                {results.map((p, i) => (
                  <li key={p.id} role="option" aria-selected={i === hi}>
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => add(p)} className={i === hi ? "on" : ""}>
                      <span className="n">{p.name}<small>{p.code}{p.sku ? ` · ${p.sku}` : ""} · Tồn {stockOf(p)}</small></span>
                      <b>{vnd(p.retailPrice)}</b>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="qs-cart">
            {cart.length === 0 && <p className="qs-empty">Giỏ trống. Gõ tên sản phẩm hoặc quét mã để bắt đầu.</p>}
            {cart.map((x, i) => {
              const p = sellable.find((y) => y.id === x.productId);
              const st = p ? stockOf(p) : 0;
              return (
                <div key={x.productId} className="qs-line">
                  <span className="i">{i + 1}</span>
                  <span className="n">{p?.name}<small>{p?.code}{x.qty > st && !p?.isService ? <em> · Tồn chỉ còn {st}</em> : ""}</small></span>
                  <span className="q">
                    <button type="button" onClick={() => setLine(x.productId, { qty: Math.max(1, x.qty - 1) })} aria-label="Bớt"><Minus size={14} /></button>
                    <input value={x.qty} inputMode="numeric" onChange={(e) => setLine(x.productId, { qty: Math.max(1, Number(e.target.value.replace(/\D/g, "")) || 1) })} aria-label="Số lượng" />
                    <button type="button" onClick={() => setLine(x.productId, { qty: x.qty + 1 })} aria-label="Thêm"><Plus size={14} /></button>
                  </span>
                  <input className="p" value={x.price.toLocaleString("vi-VN")} inputMode="numeric" onChange={(e) => setLine(x.productId, { price: Number(e.target.value.replace(/\D/g, "")) || 0 })} aria-label="Đơn giá" />
                  <b className="t">{vnd(x.qty * x.price)}</b>
                  <button type="button" className="x" onClick={() => setCart((c) => c.filter((y) => y.productId !== x.productId))} aria-label="Bỏ khỏi giỏ"><Trash2 size={15} /></button>
                </div>
              );
            })}
          </div>
        </section>
        <aside className="qs-right">
          <div className="qs-cust">
            <label>Khách hàng</label>
            {cust ? (
              <div className="qs-picked"><UserRound size={16} /><span>{cust.name}<small>{cust.phone}</small></span><button type="button" onClick={() => setCustomerId("")}>Đổi</button></div>
            ) : (
              <div className="qs-cs">
                <input value={custQ} onChange={(e) => setCustQ(e.target.value)} placeholder="Khách lẻ (gõ tên hoặc SĐT để chọn)" />
                {custResults.length > 0 && <ul>{custResults.map((c) => <li key={c.id}><button type="button" onClick={() => { setCustomerId(c.id); setCustQ(""); }}>{c.name}<small>{c.phone}</small></button></li>)}</ul>}
              </div>
            )}
          </div>
          <dl className="qs-sum">
            <div><dt>Tạm tính ({cart.reduce((n, x) => n + x.qty, 0)} sp)</dt><dd>{vnd(sub)}</dd></div>
            <div><dt>Giảm giá</dt><dd><input value={disc ? Number(disc).toLocaleString("vi-VN") : ""} inputMode="numeric" placeholder="0" onChange={(e) => setDisc(Number(e.target.value.replace(/\D/g, "")) || 0)} /></dd></div>
            <div className="tot"><dt>Khách phải trả</dt><dd>{vnd(total)}</dd></div>
            <div><dt>Khách đưa</dt><dd><input value={given === "" ? "" : Number(given).toLocaleString("vi-VN")} inputMode="numeric" placeholder={total.toLocaleString("vi-VN")} onChange={(e) => setGiven(e.target.value.replace(/\D/g, ""))} /></dd></div>
            <div className={change < 0 ? "due" : "ok"}><dt>{change < 0 ? "Còn nợ" : "Tiền thối"}</dt><dd>{vnd(Math.abs(change))}</dd></div>
          </dl>
          {msg && <p className="qs-msg" role="status">{msg}</p>}
          <button type="button" className="qs-pay" onClick={() => pay(true)} disabled={!cart.length}><Printer size={18} /> Thanh toán và in <kbd>F9</kbd></button>
          <button type="button" className="qs-pay2" onClick={() => pay(false)} disabled={!cart.length}>Thanh toán, không in</button>
        </aside>
      </div>
    </div>
  );
}
