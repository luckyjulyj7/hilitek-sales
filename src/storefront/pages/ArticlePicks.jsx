import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { NEWS_PATH, SITE } from "../config.js";
import { formatVND } from "../lib/format.js";
import { LxEnd, useLx } from "./lxParts.jsx";
import { EXTRAS } from "./pickExtras.jsx";
import "./lx.css";
import "./picks.css";

/**
 * Bài "chọn mua" dạng hình ảnh (bài có trường `picks` trong data/articles.js).
 * Chữ trong `body` vẫn dùng cho SEO phía máy chủ. Giá lấy từ danh mục đang bán.
 * picks: lead, hero[3 ảnh], nav, items[], extras[tên trong pickExtras.jsx], cols[[tiêu đề, trường]], end.
 */
export default function ArticlePicks({ meta, products, navigate }) {
  useLx(`${meta.title} | ${SITE.name}`);
  const P = meta.picks;
  const find = (slug) => (slug ? (products || []).find((p) => p.slug === slug) : null);
  const price = (slug) => { const p = find(slug); return p ? (p.priceFrom ? "Từ " : "") + formatVND(p.price) : ""; };
  const num = (slug) => find(slug)?.price || 9e12;
  const go = (to) => (e) => { e.preventDefault(); navigate(to.replace(/^\//, "")); };
  const jump = (id) => (e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const link = (x) => x.to || `/san-pham/${x.slug}`;

  return (
    <div className="lx pk">
      <section className="lx-hero"><div className="lx-mesh soft" /><div className="lx-w pk-hero">
        <a className="pk-back" href={NEWS_PATH} onClick={go(NEWS_PATH)}><ArrowLeft size={17} /> Tin tức</a>
        <h1>{meta.title}</h1>
        <p>{P.lead}</p>
        <div className={"pk-stack " + (P.heroClass || "")} aria-hidden="true">{P.hero.map((src, i) => <img key={src} src={src} alt="" className={"k" + i} />)}</div>
      </div></section>

      <section className="lx-w lx-s">
        <div className="lx-c"><h2>{P.nav}</h2></div>
        <div className="pk-nav">{P.items.map((x) => (
          <a key={x.id} href={"#" + x.id} onClick={jump(x.id)}><span><img src={x.img || x.imgs[0]} alt="" loading="lazy" /></span><b>{x.need}</b><small>{x.name}</small></a>
        ))}</div>
      </section>

      <section className="lx-w lx-s pk-list">{P.items.map((x) => {
        const pr = x.priceText || price(x.slug);
        return (
          <article key={x.id} id={x.id} className={"pk-i " + x.tone}>
            <div className="t"><h2>{x.name}</h2><p>{x.text}</p></div>
            {x.imgs ? <div className="pk-row">{x.imgs.map((src, i) => <figure key={src}><img src={src} alt={x.names[i]} loading="lazy" /><figcaption>{x.names[i]}</figcaption></figure>)}</div> : <img src={x.img} alt={x.name} loading="lazy" />}
            <ul>{x.specs.map(([a, b]) => <li key={a + b}><b>{a}</b><span>{b}</span></li>)}</ul>
            <div className="b">{pr ? <strong>{pr}</strong> : <span />}<a className="lx-b y" href={link(x)} onClick={go(link(x))}>{x.cta || (x.sound ? "Xem và nghe tiếng gõ" : "Xem chi tiết")} <ArrowRight size={17} /></a></div>
          </article>
        );
      })}</section>

      {(P.extras || []).map((k) => { const E = EXTRAS[k]; return E ? <E key={k} P={P} price={price} go={go} /> : null; })}

      {P.cols && <section className="lx-w lx-s">
        <div className="lx-c"><h2>{P.items.length} mẫu, xếp từ rẻ tới đắt</h2></div>
        <div className="pk-tb"><table><thead><tr><th /><th>Mẫu</th>{P.cols.map(([h]) => <th key={h}>{h}</th>)}<th>Giá</th></tr></thead>
          <tbody>{[...P.items].sort((a, b) => num(a.slug) - num(b.slug)).map((x) => (
            <tr key={x.id}><td><img src={x.img} alt="" loading="lazy" /></td><td><a href={link(x)} onClick={go(link(x))}>{x.name}</a></td>{P.cols.map(([h, f]) => <td key={h}>{x[f]}</td>)}<td><b>{price(x.slug)}</b></td></tr>
          ))}</tbody></table></div>
      </section>}

      <LxEnd title={P.end[0]} text={P.end[1]} phone={SITE.phone} phoneRaw={SITE.phoneRaw} />
    </div>
  );
}
