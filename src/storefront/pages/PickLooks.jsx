import React, { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { NEWS_PATH, SITE } from "../config.js";
import { formatVND } from "../lib/format.js";
import { LxEnd, useLx } from "./lxParts.jsx";
import { EXTRAS } from "./pickExtras.jsx";
import "./lx.css";
import "./picks.css";
import "./pickLooks.css";

/** Giao diện khác cho bài chọn mua (picks.look): "hz" cho màn hình, "select" cho máy chơi game. */
export default function PickLooks({ meta, products, navigate }) {
  useLx(`${meta.title} | ${SITE.name}`);
  const P = meta.picks;
  const find = (slug) => (slug ? (products || []).find((p) => p.slug === slug) : null);
  const price = (slug) => { const p = find(slug); return p ? (p.priceFrom ? "Từ " : "") + formatVND(p.price) : ""; };
  const go = (to) => (e) => { e.preventDefault(); navigate(to.replace(/^\//, "")); };
  const link = (x) => x.to || `/san-pham/${x.slug}`;
  const Look = P.look === "hz" ? Hz : Select;
  return (
    <div className={"lx pk pl pl-" + P.look}>
      <Look {...{ meta, P, find, price, go, link }} />
      {(P.extras || []).map((k) => { const E = EXTRAS[k]; return E ? <E key={k} P={P} price={price} go={go} /> : null; })}
      <LxEnd title={P.end[0]} text={P.end[1]} phone={SITE.phone} phoneRaw={SITE.phoneRaw} />
    </div>
  );
}

/* Màn hình: chọn nhu cầu, tần số quét làm hình nền, bên dưới là bảng xếp giá */
function Hz({ meta, P, find, price, go, link }) {
  const L = P.items.map((x) => ({ ...x, v: find(x.slug)?.price || 9e12 }));
  const [use, setUse] = useState(0);
  const x = L[use];
  return (
    <>
      <header className="hz-top"><div className="lx-w">
        <a className="pk-back" href={NEWS_PATH} onClick={go(NEWS_PATH)}><ArrowLeft size={17} /> Tin tức</a>
        <h1>{meta.title}</h1>
        <div className="hz-use" role="group" aria-label={P.nav}>{L.map((y, i) => <button key={y.id} type="button" aria-pressed={i === use} onClick={() => setUse(i)}>{y.need}</button>)}</div>
        <div className="hz-stage"><div className="info" aria-live="polite"><b className="big" aria-hidden="true" key={"n" + x.id}>{x.hz}</b><h2>{x.name}</h2><p>{x.size}, {x.link}</p><strong>{price(x.slug)}</strong><a className="lx-b y" href={link(x)} onClick={go(link(x))}>Xem chi tiết <ArrowRight size={17} /></a></div><img key={x.id} src={x.img} alt={x.name} /></div>
      </div></header>
      <section className="lx-w hz-rank"><h2>Xếp từ rẻ tới đắt</h2>{[...L].sort((a, b) => a.v - b.v).map((y) => (
        <a key={y.id} href={link(y)} onClick={go(link(y))}><img src={y.img} alt="" loading="lazy" /><span className="n"><b>{y.name}</b><small>{y.text}</small></span><span className="s">{y.specs.slice(0, 2).map(([a, b]) => <i key={b}><b>{a}</b>{b}</i>)}</span><strong>{price(y.slug)}</strong></a>))}</section>
    </>
  );
}

/* Máy chơi game: khung chọn máy kiểu máy retro */
function Select({ meta, P, price, go, link }) {
  const [i, setI] = useState(0);
  const x = P.items[i], pr = x.priceText || price(x.slug);
  const pics = x.imgs || [x.img], names = x.names || [x.name];
  return (
    <section className="se"><div className="lx-w">
      <a className="pk-back" href={NEWS_PATH} onClick={go(NEWS_PATH)}><ArrowLeft size={17} /> Tin tức</a>
      <h1>{meta.title}</h1>
      <div className="se-box">
        <div className="se-scr" key={x.id}><div className={"ph n" + pics.length}>{pics.map((s, k) => <figure key={s}><img src={s} alt={names[k]} />{pics.length > 1 && <figcaption>{names[k]}</figcaption>}</figure>)}</div></div>
        <div className="se-inf" aria-live="polite"><h2>{x.name}</h2><p>{x.text}</p><dl>{x.specs.map(([a, b]) => <div key={a + b}><dt>{b}</dt><dd>{a}</dd></div>)}</dl>{pr && <strong>{pr}</strong>}<a className="lx-b" href={link(x)} onClick={go(link(x))}>{x.cta || "Xem chi tiết"} <ArrowRight size={17} /></a></div>
        <div className="se-pick" role="group" aria-label={P.nav}>{P.items.map((y, k) => <button key={y.id} type="button" aria-pressed={k === i} onClick={() => setI(k)}><img src={y.img || y.imgs[0]} alt="" /><span>{y.need}</span></button>)}</div>
      </div>
    </div></section>
  );
}
