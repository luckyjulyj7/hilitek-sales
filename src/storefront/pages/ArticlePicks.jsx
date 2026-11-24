import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { NEWS_PATH, SITE } from "../config.js";
import { formatVND } from "../lib/format.js";
import { LxEnd, useLx } from "./lxParts.jsx";
import "./lx.css";
import "./picks.css";

/**
 * Bài "chọn mua" dạng hình ảnh (bài có trường `picks` trong data/articles.js).
 * Chữ trong `body` vẫn dùng cho SEO phía máy chủ. Giá lấy từ danh mục đang bán.
 */
export default function ArticlePicks({ meta, products, navigate }) {
  useLx(`${meta.title} | ${SITE.name}`);
  const P = meta.picks;
  const price = (slug) => (products || []).find((p) => p.slug === slug)?.price;
  const go = (to) => (e) => { e.preventDefault(); navigate(to.replace(/^\//, "")); };
  const jump = (id) => (e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  return (
    <div className="lx pk">
      <section className="lx-hero"><div className="lx-mesh soft" /><div className="lx-w pk-hero">
        <a className="pk-back" href={NEWS_PATH} onClick={go(NEWS_PATH)}><ArrowLeft size={17} /> Tin tức</a>
        <h1>{meta.title}</h1>
        <p>{P.lead}</p>
        <div className="pk-stack" aria-hidden="true">{P.hero.map((src, i) => <img key={src} src={src} alt="" className={"k" + i} />)}</div>
      </div></section>

      <section className="lx-w lx-s">
        <div className="lx-c"><h2>Bạn cần bàn phím kiểu nào?</h2></div>
        <div className="pk-nav">{P.items.map((x) => (
          <a key={x.id} href={"#" + x.id} onClick={jump(x.id)}><span><img src={x.img} alt="" loading="lazy" /></span><b>{x.need}</b><small>{x.name}</small></a>
        ))}</div>
      </section>

      <section className="lx-w lx-s pk-list">{P.items.map((x) => {
        const pr = price(x.slug);
        return (
          <article key={x.id} id={x.id} className={"pk-i " + x.tone}>
            <div className="t"><h2>{x.name}</h2><p>{x.text}</p></div>
            <img src={x.img} alt={x.name} loading="lazy" />
            <ul>{x.specs.map(([a, b]) => <li key={b}><b>{a}</b><span>{b}</span></li>)}</ul>
            <div className="b">{pr ? <strong>{formatVND(pr)}</strong> : <span />}<a className="lx-b y" href={`/san-pham/${x.slug}`} onClick={go(`/san-pham/${x.slug}`)}>{x.sound ? "Xem và nghe tiếng gõ" : "Xem chi tiết"} <ArrowRight size={17} /></a></div>
          </article>
        );
      })}</section>

      <section className="lx-w lx-s">
        <div className="lx-c"><h2>Gõ êm hay gõ có khấc?</h2></div>
        <div className="pk-sw">
          <div className="lx-t bl"><h3>TONE: êm, nhẹ</h3><p>Nhấn thẳng một mạch. Hợp phòng làm việc chung.</p><svg viewBox="0 0 400 170" aria-hidden="true"><path d="M20 150C150 130 250 90 380 40" fill="none" stroke="#1E2A8A" strokeWidth="9" strokeLinecap="round" /></svg></div>
          <div className="lx-t ye"><h3>CLOUDY: có khấc</h3><p>Cảm nhận rõ lúc phím nhận. Hợp người gõ nhiều chữ.</p><svg viewBox="0 0 400 170" aria-hidden="true"><path d="M20 150C70 130 100 40 140 40S200 110 240 110 330 60 380 40" fill="none" stroke="#0B1230" strokeWidth="9" strokeLinecap="round" /></svg></div>
        </div>
      </section>

      <section className="lx-w lx-s">
        <div className="lx-c"><h2>Đặt cạnh AKKO cùng cỡ</h2><p>Hilitek không bán AKKO. Thông số theo công bố của hãng, ảnh: AKKO.</p></div>
        <div className="pk-vs">{P.versus.map((v) => (
          <div key={v.size} className="pk-v">
            <h3>{v.size}</h3>
            {[v.a, v.b].map((k, i) => (
              <div key={k.name} className={"r" + (i ? "" : " own")}>
                <img src={k.img} alt={k.name} loading="lazy" />
                <div><b>{k.name}</b>
                  <div className="bat"><i style={{ width: `${k.mah / 40}%` }} /></div>
                  <small>Pin {k.mah.toLocaleString("vi-VN")} mAh</small>
                  <em>{k.slug ? (price(k.slug) ? formatVND(price(k.slug)) : "") : k.note}</em></div>
              </div>
            ))}
          </div>
        ))}</div>
      </section>

      <section className="lx-w lx-s">
        <div className="lx-c"><h2>{P.items.length} mẫu, xếp từ rẻ tới đắt</h2></div>
        <div className="pk-tb"><table><thead><tr><th /><th>Mẫu</th><th>Cỡ</th><th>Kết nối</th><th>Giá</th></tr></thead>
          <tbody>{[...P.items].sort((a, b) => (price(a.slug) || 9e9) - (price(b.slug) || 9e9)).map((x) => (
            <tr key={x.id}><td><img src={x.img} alt="" loading="lazy" /></td><td><a href={`/san-pham/${x.slug}`} onClick={go(`/san-pham/${x.slug}`)}>{x.name}</a></td><td>{x.size}</td><td>{x.link}</td><td><b>{price(x.slug) ? formatVND(price(x.slug)) : ""}</b></td></tr>
          ))}</tbody></table></div>
      </section>

      <LxEnd title="Chưa biết chọn mẫu nào?" text="Nhắn Hili hoặc ghé cửa hàng ở Phú Thọ, TP.HCM để gõ thử." phone={SITE.phone} phoneRaw={SITE.phoneRaw} />
    </div>
  );
}
