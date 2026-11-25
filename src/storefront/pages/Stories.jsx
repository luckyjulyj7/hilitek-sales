import React, { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Gift, MessageCircle, Search } from "lucide-react";
import { NEWS_KINDS, NEWS_PATH, SITE, newsItems } from "../config.js";
import { formatVND } from "../lib/format.js";
import { useLx, zaloHref } from "./lxParts.jsx";
import "./stories.css";

/** Mỗi loại bài một kiểu trang riêng. Dữ liệu: data/stories.js. Giá luôn lấy từ danh mục đang bán. */
export default function Stories({ meta, story, products, navigate }) {
  useLx(`${meta.title} | ${SITE.name}`);
  const go = (to) => (e) => { e.preventDefault(); navigate(to.replace(/^\//, "")); };
  const find = (s) => (products || []).find((p) => p.slug === s) || (products || []).find((p) => p.slug.startsWith(s));
  const C = { news: News, steps: Steps, gifts: Gifts, build: Build, decide: Decide, panels: Panels }[story.kind];
  return <div className={"st st-" + story.kind}><C meta={meta} S={story} go={go} find={find} /></div>;
}
const Back = ({ go, children }) => <a className="st-back" href={NEWS_PATH} onClick={go(NEWS_PATH)}><ArrowLeft size={17} /> {children || "Tin tức"}</a>;
const Zalo = ({ children, className = "" }) => <a className={"st-btn " + className} href={zaloHref()} target="_blank" rel="noreferrer"><MessageCircle size={18} /> {children}</a>;
const dmy = (d) => (d ? d.split("-").reverse().join("/") : "");

/* ========== TIN TỨC: ảnh tràn trang, cột chữ hẹp, đổi màu máy ========== */
function News({ meta, S, go, find }) {
  const [c, setC] = useState(0);
  const p = find(S.slug);
  const more = newsItems().filter((x) => x.kind && x.to !== `/trang/${meta.slug}` && String(x.to).startsWith("/trang/")).slice(0, 4);
  return (
    <>
      <header className="nw-hero"><img src={S.hero} alt={meta.title} /><div className="w">
        <Back go={go} /><p className="k">{S.kicker}{meta.date ? `, ${dmy(meta.date)}` : ""}</p><h1>{meta.title}</h1>
      </div></header>
      <div className="w nw-top"><p className="lead">{S.lead}</p><dl>{S.facts.map(([a, b]) => <div key={b}><dt>{a}</dt><dd>{b}</dd></div>)}</dl></div>
      <div className="w nw-parts">{S.parts.map((x) => <section key={x.t}><div><h2>{x.t}</h2><p>{x.d}</p></div><img src={x.img} alt={x.t} loading="lazy" /></section>)}</div>
      <section className="nw-col"><div className="w"><h2>Chọn màu</h2><div className="sw" role="group" aria-label="Chọn màu máy">{S.colors.map(([n, , bg], i) => <button key={n} type="button" aria-pressed={i === c} onClick={() => setC(i)}><i style={{ background: bg }} />{n}</button>)}</div></div>
        <div className="pics">{S.colors.map(([n, src], i) => <img key={n} src={src} alt={i === c ? meta.title + ", màu " + n : ""} className={i === c ? "on" : ""} loading="lazy" />)}</div></section>
      <div className="w nw-buy"><p>{S.think}</p>{p && <a className="st-btn r" href={`/san-pham/${p.slug}`} onClick={go(`/san-pham/${p.slug}`)}>Xem máy, từ {formatVND(p.price)} <ArrowRight size={18} /></a>}</div>
      <section className="w nw-more"><h2>Tin khác</h2>{more.map((x) => <a key={x.to} href={x.to} onClick={go(x.to)}><img src={x.image} alt="" loading="lazy" /><span><small>{NEWS_KINDS[x.kind]}</small><b>{x.title}</b></span></a>)}</section>
    </>
  );
}

/* ========== HƯỚNG DẪN: nền vàng, số bước khổng lồ, hình mô phỏng ========== */
function Steps({ meta, go }) {
  const open = go("/bao-hanh");
  return (
    <>
      <header className="w sp-hero"><Back go={go} /><h1>{meta.title}</h1><p>Không cần giữ hoá đơn giấy. Chỉ cần số serial.</p><a className="st-btn d" href="/bao-hanh" onClick={open}><Search size={18} /> Tra bảo hành ngay</a></header>
      <ol className="w sp-list">
        <li><b className="n">1</b><div><h2>Tìm tem serial</h2><p>Xem mặt dưới, mặt sau sản phẩm, trên hộp hoặc phiếu bảo hành.</p></div>
          <svg viewBox="0 0 420 260" aria-hidden="true"><rect x="60" y="40" width="300" height="180" rx="34" fill="#0B1230" /><rect x="120" y="92" width="180" height="84" rx="10" fill="#fff" />{[...Array(26)].map((_, i) => <rect key={i} x={136 + i * 5.8} y="108" width={i % 3 ? 2 : 4} height="30" fill="#0B1230" />)}<text x="210" y="162" textAnchor="middle" fontSize="16" fontWeight="700" fill="#0B1230">HLT-2405-000123</text><circle cx="90" cy="70" r="9" fill="#3B4460" /><circle cx="330" cy="70" r="9" fill="#3B4460" /><circle cx="90" cy="190" r="9" fill="#3B4460" /><circle cx="330" cy="190" r="9" fill="#3B4460" /><rect x="110" y="82" width="200" height="104" rx="16" fill="none" stroke="#E0483B" strokeWidth="5" strokeDasharray="12 9" /></svg></li>
        <li><b className="n">2</b><div><h2>Nhập số serial</h2><p>Mở trang Tra cứu bảo hành, gõ đúng số trên tem. Ví dụ HLT-2405-000123.</p></div>
          <div className="mock"><span className="bar">hilipc.vn/bao-hanh</span><label>Số serial<em>HLT-2405-000123<i /></em></label><u>Tra cứu</u></div></li>
        <li><b className="n">3</b><div><h2>Xem hạn bảo hành</h2><p>Trang hiện tên sản phẩm, ngày mua và hạn bảo hành.</p></div>
          <div className="mock"><span className="bar">Kết quả mẫu</span><p className="ok"><Check size={22} /> Còn bảo hành</p><dl><dt>Sản phẩm</dt><dd>Tên sản phẩm bạn mua</dd><dt>Ngày mua</dt><dd>ngày / tháng / năm</dd><dt>Hạn bảo hành</dt><dd>ngày / tháng / năm</dd></dl></div></li>
      </ol>
      <section className="w sp-help"><div><h2>Mất tem serial?</h2><p>Nhắn Zalo kèm số điện thoại đã mua, nhân viên tra giúp.</p><Zalo className="d">Nhắn Zalo</Zalo></div><div><h2>Cần bảo hành?</h2><p>Mang tới cửa hàng ở Phú Thọ, TP.HCM hoặc nhắn Zalo để được hướng dẫn gửi. Hili hỗ trợ gửi bảo hành hãng.</p><a className="st-btn d" href="/lien-he" onClick={go("/lien-he")}>Xem địa chỉ <ArrowRight size={18} /></a></div></section>
    </>
  );
}

/* ========== GỢI Ý QUÀ: nền đỏ lễ hội, kéo ngân sách ========== */
function Gifts({ meta, S, go, find }) {
  const [b, setB] = useState(1200000);
  const L = S.items.map((x) => ({ ...x, p: find(x.slug)?.price || 0, to: `/san-pham/${x.slug}` })).sort((a, c) => a.p - c.p);
  const n = L.filter((x) => x.p && x.p <= b).length;
  const by = (id) => L.find((x) => x.id === id);
  return (
    <>
      <header className="gf-hero"><div className="w"><Back go={go} /><h1>{meta.title}</h1><p>Thứ họ dùng mỗi ngày là món quà đáng nhớ.</p></div><div className="snow" aria-hidden="true">{[...Array(22)].map((_, i) => <i key={i} style={{ left: `${(i * 47) % 100}%`, animationDelay: `${-(i * 1.7) % 12}s`, "--z": 4 + (i % 4) * 2 + "px" }} />)}</div></header>
      <section className="w gf-pick"><label htmlFor="gf-b">Bạn định chi bao nhiêu? <b>{formatVND(b)}</b></label><div className="rg"><input id="gf-b" type="range" min="500000" max="2000000" step="50000" value={b} onChange={(e) => setB(+e.target.value)} /></div><p aria-live="polite">{n ? `${n} món vừa ngân sách` : "Chưa có món nào vừa, thử tăng thêm một chút"}</p>
        <div className="gf-grid">{L.map((x) => <a key={x.id} href={x.to} onClick={go(x.to)} className={x.p && x.p <= b ? "" : "off"}><span className="im"><img src={x.img} alt={x.n} loading="lazy" /></span><b>{x.n}</b><small>{x.d}</small><strong>{x.p ? formatVND(x.p) : ""}</strong></a>)}</div></section>
      <section className="gf-combo"><div className="w"><h2>Hai bộ quà dưới 2 triệu</h2><div className="g">{S.combos.map(([t, ids]) => { const xs = ids.map(by); const sum = xs.reduce((a, x) => a + x.p, 0); return <article key={t}><Gift size={30} /><h3>{t}</h3><div className="pair">{xs.map((x, i) => <React.Fragment key={x.id}>{i > 0 && <em>+</em>}<a href={x.to} onClick={go(x.to)}><img src={x.img} alt={x.n} loading="lazy" /><span>{x.n}</span></a></React.Fragment>)}</div>{xs.every((x) => x.p) && <strong>{formatVND(sum)}</strong>}</article>; })}</div></div></section>
      <section className="w gf-end"><h2>Người nhận không cần giữ hoá đơn giấy</h2><p>Hàng chính hãng, bảo hành theo số serial. Cần gói quà hoặc giao trong TP.HCM, nhắn Hili.</p><Zalo className="r">Nhắn Zalo</Zalo></section>
    </>
  );
}

/* ========== CỘT MÀU: mỗi ý một cột cao, ít chữ ========== */
function Panels({ meta, S, go }) {
  return (
    <>
      <header className="w pn-hero"><Back go={go} /><h1>{meta.title}</h1></header>
      <div className={"pn n" + S.items.length}>{S.items.map((x) => <section key={x.t} className={x.ph ? "ph" : ""} style={{ background: x.bg }}><img src={x.img} alt={x.t} /><div><h2>{x.t}</h2><p>{x.d}</p></div></section>)}</div>
      <div className="w pn-end"><p>Chưa chắc kiểu nào hợp? Nói game bạn hay chơi.</p><span><a className="st-btn d" href={S.cta[0]} onClick={go(S.cta[0])}>{S.cta[1]} <ArrowRight size={18} /></a><Zalo className="y">Nhắn Zalo</Zalo></span></div>
    </>
  );
}

/* ========== DỰNG MÁY: bản vẽ kỹ thuật + phiếu cộng tiền ========== */
function Build({ meta, S, go, find }) {
  const L = S.parts.map((x) => { const p = find(x.find); return { ...x, p: p?.price || 0, slug: p?.slug }; });
  const [on, setOn] = useState(0);
  const sum = L.reduce((a, x) => a + x.p, 0), left = S.budget - sum, full = L.every((x) => x.p);
  return (
    <>
      <header className="w bd-hero"><Back go={go} /><h1>{meta.title}</h1><p>Phần nền chọn loại bền để dùng lâu. CPU, RAM và card chọn theo giá từng ngày.</p></header>
      <div className="w bd-main">
        <section className="bd-draw"><div className="view"><img key={on} src={L[on].img} alt={L[on].n} /><span>{L[on].k}</span></div>
          <ul>{L.map((x, i) => <li key={x.k}><button type="button" aria-pressed={i === on} onClick={() => setOn(i)}><img src={x.img} alt="" loading="lazy" /><span><small>{x.k}</small><b>{x.n}</b><i>{x.d}</i></span></button></li>)}</ul></section>
        <aside className="bd-bill"><h2>Phiếu cấu hình</h2>
          {L.map((x) => <a key={x.k} className="ln" href={x.slug ? `/san-pham/${x.slug}` : "#"} onClick={x.slug ? go(`/san-pham/${x.slug}`) : (e) => e.preventDefault()}><span>{x.k}</span><b>{x.p ? formatVND(x.p) : "Hỏi giá"}</b></a>)}
          <div className="ln t"><span>Phần nền</span><b>{full ? formatVND(sum) : ""}</b></div>
          {full && <><div className="pb"><i style={{ width: `${Math.min(100, sum / S.budget * 100)}%` }} /></div><p>Còn <b>{formatVND(left)}</b> trong 15 triệu cho CPU, RAM và card.</p></>}
          {S.daily.map(([k, n]) => <div key={k} className="ln d"><span>{k}: {n}</span><b>Báo theo ngày</b></div>)}
          <Zalo className="y">Hỏi giá hôm nay</Zalo><a className="alt" href={meta.cta.to} onClick={go(meta.cta.to)}>Tự chọn linh kiện trên web</a></aside>
      </div>
      <section className="w bd-day">{S.daily.map(([k, n, d]) => <div key={k}><small>{k}</small><h2>{n}</h2><p>{d}</p></div>)}</section>
      <section className="w bd-tip"><h2>Ba điều nên nhớ</h2><ol>{S.tips.map((t) => <li key={t}>{t}</li>)}</ol><p>Tham khảo tháng 11/2026: bộ máy i5-12400F, 16GB, RTX 3050 ở các cửa hàng lớn bán trọn khoảng 16 đến 18,6 triệu. Giá RAM và card đổi theo tuần.</p></section>
    </>
  );
}

/* ========== GIẢI THÍCH: trả lời vài câu ra kết quả ========== */
const LIC = { OEM: ["Gắn với máy cài đầu tiên", "Không", "Không"], FQC: ["OEM đóng hộp, cho máy lắp ráp", "Không", "Có"], Retail: ["Gỡ máy cũ, cài sang máy mới", "Có", "Có"], ESD: ["Nhận khoá qua email", "Tuỳ bản", "Không"] };
function Decide({ meta, S, go, find }) {
  const [a, setA] = useState([]);
  const p = find(S.slug);
  const Q = [["Bạn có hay thay máy không?", ["Dùng cố định", "Hay thay máy"]], ["Cần nhận nhanh qua email?", ["Có", "Không cần"], a[0] !== 0], ["Muốn có hộp, đĩa?", ["Có hộp", "Không cần hộp"], a[0] !== 0 || a[1] !== 1]];
  const res = useMemo(() => (a[0] === 1 ? "Retail" : a[0] === 0 && a[1] === 0 ? "ESD" : a[0] === 0 && a[1] === 1 && a[2] != null ? (a[2] === 0 ? "FQC" : "OEM") : ""), [a]);
  const pick = (i, v) => setA((x) => [...x.slice(0, i), v]);
  return (
    <>
      <header className="w dc-hero"><Back go={go} /><h1>Windows 11 Pro: <span>bạn cần loại nào?</span></h1></header>
      <div className="w dc-quiz"><div className="qs">{Q.map(([q, os, off], i) => <fieldset key={q} disabled={!!off}><legend>{q}</legend>{os.map((o, v) => <button key={o} type="button" aria-pressed={a[i] === v} onClick={() => pick(i, v)}>{o}</button>)}</fieldset>)}</div>
        <div className={"rs" + (res ? " on" : "")} aria-live="polite"><span className="win" aria-hidden="true"><i /><i /><i /><i /></span>{res ? <><small>Hợp với bạn</small><h2>{res}</h2><p>{LIC[res][0]}.</p>{res === "FQC" && p ? <a className="st-btn w" href={`/san-pham/${p.slug}`} onClick={go(`/san-pham/${p.slug}`)}>Mua FQC, {formatVND(p.price)} <ArrowRight size={18} /></a> : <Zalo className="w">Hỏi giá bản {res}</Zalo>}<button type="button" className="re" onClick={() => setA([])}>Chọn lại</button></> : <p className="wait">Trả lời bên trái, kết quả hiện ở đây.</p>}</div></div>
      <section className="w dc-four"><h2>Bốn loại, đặt cạnh nhau</h2><div className="g">{Object.entries(LIC).map(([k, v]) => <div key={k} className={k === res ? "on" : ""}><h3>{k}</h3><p>{v[0]}</p><dl><dt>Đổi máy</dt><dd>{v[1]}</dd><dt>Có hộp</dt><dd>{v[2]}</dd></dl></div>)}</div></section>
      <section className="dc-law"><div className="w"><b>500 triệu</b><p>Mức phạt hành chính tối đa với tổ chức vi phạm quyền tác giả, theo Nghị định 341/2025/NĐ-CP, từ 15/02/2026.</p><a className="st-btn y" href={meta.cta.to} onClick={go(meta.cta.to)}>Bản quyền cho công ty <ArrowRight size={18} /></a></div></section>
      <section className="w dc-chk"><h2>Máy đã kích hoạt chưa?</h2><ol><li>Cài đặt</li><li>Hệ thống</li><li>Kích hoạt</li><li className="ok"><Check size={20} /> Đã kích hoạt</li></ol></section>
    </>
  );
}
