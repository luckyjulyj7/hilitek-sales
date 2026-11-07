import React, { useEffect, useMemo, useRef, useState } from "react";
import { GAME_GROUP, SITE, isGameProduct } from "../config.js";
import { discountPercent, formatVND, placeholderImage, warrantyLabel } from "../lib/format.js";
import { href } from "../router.js";
import { useCart } from "../cart.jsx";
import { askStockAlert } from "../components/StockNotify.jsx";
import RichText from "../components/RichText.jsx";
import "./game-product.css";

const srcOf = (im) => im?.src || im || "";
const norm = (s) => String(s || "").trim().toLowerCase();
const uniq = (arr) => { const seen = new Set(); return arr.filter((x) => x.src && !seen.has(x.src) && seen.add(x.src)); };

/** "| Lite | Base" rồi "Chip | 865 | 8 Gen 2": bảng so sánh chủ shop gõ theo dòng. */
function parseCompare(text) {
  const lines = String(text || "").split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return null;
  const cells = (l) => l.split("|").map((c) => c.trim());
  const heads = cells(lines[0]).filter(Boolean);
  const rows = lines.slice(1).map(cells).map(([label, ...v]) => ({ label, v }));
  return heads.length ? { heads, rows } : null;
}

const SPANS = [7, 5, 4, 3, 5, 5, 7];
function bentoSpans(n) {
  const out = [];
  let used = 0;
  for (let i = 0; i < n; i++) {
    let s = SPANS[i % SPANS.length];
    if (used + s > 12) { out[out.length - 1] += 12 - used; used = 0; }
    if (i === n - 1) s = 12 - used;
    out.push(s);
    used = (used + s) % 12;
  }
  return out;
}

/** Trang bán riêng cho máy chơi game: tông tối, chọn phiên bản và màu, nội dung lấy từ web.game. */
export default function GameProduct({ p, navigate, catalog }) {
  const { add, openOrder } = useCart();
  const g = p.game || {};
  const variants = p.variants?.length > 1 ? p.variants : [];
  const [sel, setSel] = useState(p.id);
  const [localColor, setLocalColor] = useState("");
  const [shot, setShot] = useState(0);
  const [addons, setAddons] = useState([]);
  const [askI, setAskI] = useState(0);
  const [sceneI, setSceneI] = useState(0);
  const [sceneHold, setSceneHold] = useState(false);
  const [wide, setWide] = useState({});
  const [lineI, setLineI] = useState(0);
  const [barOn, setBarOn] = useState(false);
  const [more, setMore] = useState(false);
  const root = useRef(null);
  const film = useRef(null);
  const filmImg = useRef(null);
  const buy = useRef(null);
  const cmpRef = useRef(null);

  useEffect(() => { setSel(p.id); }, [p.id]);
  useEffect(() => { window.scrollTo(0, 0); }, []);
  // Font riêng của trang máy game, chỉ tải khi mở trang này.
  useEffect(() => {
    if (document.getElementById("gp-font")) return;
    const l = document.createElement("link");
    l.id = "gp-font"; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(l);
  }, []);

  const v = variants.find((x) => x.id === sel) || null;
  const attrs = v?.attrs || p.variantAttrs || {};
  const price = v ? v.price : p.price;
  const list = v?.listPrice ?? p.listPrice;
  const stock = v ? v.stock : p.stock;
  const out = !stock;
  const off = discountPercent(price, list);

  const keys = useMemo(() => {
    const k = [];
    variants.forEach((x) => Object.keys(x.attrs || {}).forEach((a) => { if (!k.includes(a)) k.push(a); }));
    return k;
  }, [variants]);
  const colorKey = keys.find((k) => /màu/i.test(k));
  const verKeys = keys.filter((k) => k !== colorKey);
  const colors = g.colors || [];
  const colorNames = colorKey ? [...new Set(variants.map((x) => x.attrs[colorKey]).filter(Boolean))] : colors.map((c) => c.name);
  const colorName = colorKey ? attrs[colorKey] : localColor || colorNames[0] || "";
  const colorOf = (name) => colors.find((c) => norm(c.name) === norm(name));
  const col = colorOf(colorName);
  const accent = col?.accent || g.accent || "#FF7A2E";

  const pick = (key, val) => {
    const want = { ...attrs, [key]: val };
    const target = variants.find((x) => keys.every((k) => norm(x.attrs[k]) === norm(want[k]))) || variants.find((x) => x.attrs[key] === val);
    if (!target) return;
    setSel(target.id);
    setShot(0);
    if (target.slug !== p.slug) navigate(`/san-pham/${target.slug}`, { replace: true });
  };
  const pickColor = (name) => { setShot(0); if (colorKey) pick(colorKey, name); else setLocalColor(name); };

  const shots = useMemo(() => uniq([
    { src: col?.image, tag: colorName ? `Màu ${colorName}` : "", cover: true },
    ...(g.gallery || []).map((x) => ({ src: x.image, tag: x.title, cover: true })),
    { src: v?.image, tag: "" },
    ...(p.images || []).map((im) => ({ src: srcOf(im), tag: "" })),
  ]), [col?.image, colorName, g.gallery, v?.image, p.images]);
  const main = shots[Math.min(shot, shots.length - 1)] || { src: placeholderImage(p.brand, p.category), tag: "" };

  const word = (g.word || String(p.name).trim().split(/\s+/).pop() || "").toUpperCase();
  const tape = (g.tape?.length ? g.tape : p.specChips || []).filter(Boolean);
  const scenes = (g.scenes || []).filter((s) => s.image);
  const lines = (g.film?.lines || []).filter(Boolean);
  const details = (g.details || []).filter((d) => d.image);
  const spans = bentoSpans(details.length);
  const rows = (g.power?.rows || []).filter((r) => r.label && Number(r.a) > 0);
  const asks = (g.advisor || []).filter((a) => a.q);
  const stats = (g.size?.stats || []).filter((s) => s.value);
  const faq = (g.faq || []).filter((f) => f.q);
  const compare = parseCompare(g.compareText);
  const promos = String(p.promo || "").split("\n").map((l) => l.trim().replace(/^[-+•*]\s*/, "")).filter(Boolean);
  const descText = (p.description && p.description.trim()) || "";
  const specs = (p.specs || []).filter((r) => r[0] || r[1]);

  const inCatalog = (id) => (catalog.products || []).find((x) => x.id === id || (x.variantGroupId && x.variantGroupId === id));
  const addonList = (g.addons || []).map((a) => inCatalog(a)).filter(Boolean);
  const chosen = addonList.filter((a) => addons.includes(a.id));
  const total = price + chosen.reduce((s, a) => s + a.price, 0);
  const same = (x) => x.slug === p.slug || (p.variantGroupId && x.variantGroupId === p.variantGroupId);
  const related = (catalog.products || []).filter((x) => isGameProduct(x) && !same(x)).slice(0, 4);

  const item = { ...p, id: v?.id || p.id, slug: v?.slug || p.slug, sku: v?.sku || p.sku, price, listPrice: list, images: [main.src, ...(p.images || [])], name: [p.name, ...Object.values(attrs)].join(" ") };
  const toCart = () => { add(item, 1, { preorder: out }); chosen.forEach((a) => add(a, 1, { silent: true })); };
  const buyNow = () => { toCart(); openOrder(item); };

  /* Tìm phiên bản theo chữ K nhập ở "Gợi ý chọn bản" hoặc tên cột bảng so sánh. */
  const findVer = (text) => variants.filter((x) => verKeys.some((k) => norm(x.attrs[k]).includes(norm(text)))).sort((a, b) => a.price - b.price);
  const verOf = (text) => findVer(text).find((x) => norm(x.attrs[colorKey]) === norm(colorName)) || findVer(text)[0];
  const goVer = (x) => {
    if (!x) return;
    setSel(x.id);
    setShot(0);
    if (x.slug !== p.slug) navigate(`/san-pham/${x.slug}`, { replace: true });
    buy.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const verSub = (val) => {
    if (!compare) return "";
    const c = compare.heads.findIndex((h) => norm(val).includes(norm(h)) || norm(h).includes(norm(val)));
    return c < 0 ? "" : compare.rows.slice(0, 2).map((r) => r.v[c]).filter(Boolean).join(" · ");
  };

  useEffect(() => {
    const el = root.current;
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { rootMargin: "9999px 0px -8% 0px" });
    el.querySelectorAll(".rise").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [p.id]);

  useEffect(() => {
    if (sceneHold || scenes.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const t = setInterval(() => { if (!document.hidden) setSceneI((i) => (i + 1) % scenes.length); }, 5200);
    return () => clearInterval(t);
  }, [sceneHold, scenes.length]);

  useEffect(() => {
    // Máy tính: lướt xuống thì thanh xanh trên cùng tự ẩn để trang rộng hơn, lướt lên thì hiện lại.
    const head = document.querySelector("header");
    let lastY = scrollY;
    let hidden = false;
    if (head) head.style.transition = "transform .35s cubic-bezier(.16,1,.3,1)";
    const setTop = () => {
      const h = innerWidth >= 1024 && head && !hidden ? head.offsetHeight : 0;
      root.current?.style.setProperty("--top", h + "px");
    };
    const hide = (v) => {
      if (!head || v === hidden) return;
      hidden = v;
      head.style.transform = v ? "translateY(-100%)" : "";
      setTop();
    };
    const onScroll = () => {
      const y = scrollY;
      if (innerWidth >= 1024 && Math.abs(y - lastY) > 6) { hide(y > lastY && y > 240); lastY = y; }
      const f = film.current;
      if (f) {
        const r = f.getBoundingClientRect();
        const k = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - innerHeight)));
        filmImg.current?.style.setProperty("--z", (1.18 - k * 0.18).toFixed(3));
        setLineI(Math.min(Math.max(lines.length, 1) - 1, Math.floor(k * Math.max(lines.length, 1))));
      }
      const b = buy.current;
      if (b) setBarOn(b.getBoundingClientRect().bottom < 40);
    };
    const onResize = () => { if (innerWidth < 1024) hide(false); setTop(); };
    setTop(); onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    return () => {
      removeEventListener("scroll", onScroll); removeEventListener("resize", onResize);
      if (head) { head.style.transform = ""; head.style.transition = ""; }
    };
  }, [lines.length]);

  const go = (e, to) => { e.preventDefault(); navigate(to.replace(/^\//, "")); };
  const catLink = href("/danh-muc", { cat: p.category });
  const ColorPills = () => (
    <div className="cols" role="radiogroup" aria-label="Chọn màu">
      {colorNames.map((name) => {
        const can = !colorKey || variants.some((x) => x.attrs[colorKey] === name && verKeys.every((k) => x.attrs[k] === attrs[k]));
        return (
          <button key={name} className="col" type="button" role="radio" aria-checked={norm(name) === norm(colorName)} disabled={!can} onClick={() => pickColor(name)}>
            <i style={{ background: colorOf(name)?.dot || "#555" }} />{name}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="gp" ref={root} style={{ "--ac": accent }}>
      <section className="buy" ref={buy}>
        <div className="glow" aria-hidden="true" />
        <div className="runword" aria-hidden="true">{[0, 1, 2, 3].map((i) => <span key={i}>{word}</span>)}</div>
        <div className="wrap">
          <nav className="crumb" aria-label="Đường dẫn">
            <a href="/may-choi-game-cam-tay" onClick={(e) => go(e, "/may-choi-game-cam-tay")}>{GAME_GROUP}</a><i>/</i>
            {p.category && p.category !== GAME_GROUP && <><a href={catLink} onClick={(e) => go(e, catLink)}>{p.category}</a><i>/</i></>}
            <span>{p.name}</span>
          </nav>
        </div>
        <div className="wrap buy-grid">
          <div className="gallery">
            <div className={"stage" + (main.cover ? "" : " fit")}>
              <img key={main.src} src={main.src} alt={p.name} />
              {main.tag && <span className="tag">{main.tag}</span>}
            </div>
            {shots.length > 1 && (
              <div className="thumbs">
                {shots.slice(0, 6).map((s, i) => (
                  <button key={s.src} type="button" aria-label={`Ảnh ${i + 1}`} aria-pressed={i === shot} onClick={() => setShot(i)}><img src={s.src} alt="" /></button>
                ))}
              </div>
            )}
          </div>

          <div className="panel">
            <p className="kick"><i className="sl" />{[p.brand, g.kicker || p.category].filter(Boolean).join(" · ")}</p>
            <h1>{p.name}</h1>
            {(g.tagline || p.shortDesc) && <p className="lead">{g.tagline || p.shortDesc}</p>}
            <div className="price">
              <strong>{price > 0 ? formatVND(price) : "Liên hệ"}</strong>
              {off > 0 && <><s>{formatVND(list)}</s><em>-{off}%</em></>}
            </div>
            <p className={"stock" + (out ? " no" : "")}>{out ? "Hết hàng, có thể đặt trước" : "Còn hàng"}</p>

            {verKeys.map((k) => {
              const low = (val) => Math.min(...variants.filter((x) => x.attrs[k] === val).map((x) => x.price || Infinity));
              const vals = [...new Set(variants.map((x) => x.attrs[k]).filter(Boolean))].sort((a, b) => low(a) - low(b));
              return (
                <div className="opt" key={k}>
                  <div className="opt-h"><span>{k}</span></div>
                  <div className="vers" role="radiogroup" aria-label={k}>
                    {vals.map((val) => (
                      <button key={val} className="ver" type="button" role="radio" aria-checked={attrs[k] === val} onClick={() => pick(k, val)}>
                        <b>{val}</b>{verSub(val) && <span>{verSub(val)}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {colorNames.length > 0 && (
              <div className="opt">
                <div className="opt-h"><span>Màu sắc</span><small>{colorName}</small></div>
                <ColorPills />
              </div>
            )}

            <div className="cta">
              <button className="btn y" type="button" onClick={buyNow}>{out ? "Đặt trước" : "Mua ngay"} <span>{price > 0 ? formatVND(total) : ""}</span></button>
              {out
                ? <button className="btn o" type="button" onClick={() => askStockAlert(p)}>Báo khi có hàng</button>
                : <button className="btn o" type="button" onClick={toCart}>Thêm vào giỏ</button>}
            </div>
            <a className="zalo" href={SITE.zaloHref} target="_blank" rel="noreferrer">Chưa chắc chọn bản nào? Chat Zalo với Hili</a>
            <ul className="trust">
              <li>Đủ hoá đơn VAT</li><li>{p.warrantyMonths ? warrantyLabel(p.warrantyMonths) : "Bảo hành theo serial"}</li><li>Giao nhanh toàn quốc</li>
            </ul>
            {promos.length > 0 && <ul className="gifts">{promos.map((l) => <li key={l}>{l}</li>)}</ul>}

            {addonList.length > 0 && (
              <div className="opt">
                <div className="opt-h"><span>Mua kèm</span><small>Bấm để thêm</small></div>
                <div className="adds">
                  {addonList.map((a) => (
                    <button key={a.id} className="add" type="button" aria-pressed={addons.includes(a.id)} onClick={() => setAddons((x) => (x.includes(a.id) ? x.filter((y) => y !== a.id) : [...x, a.id]))}>
                      <img src={srcOf(a.images?.[0])} alt="" /><b>{a.name}</b><span>+{formatVND(a.price)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {tape.length > 0 && <div className="tape" aria-hidden="true"><div>{[...tape, ...tape, ...tape, ...tape].map((t, i) => <span key={i}>{t}</span>)}</div></div>}

      {g.film?.image && (
        <section className="film" ref={film}>
          <div className="film-sticky">
            <img ref={filmImg} src={g.film.image} alt={p.name} />
            <div className="film-shade" />
            <div className="wrap film-tx">{lines.map((l, i) => <h2 key={i} className={i === lineI ? "on" : ""}>{l}</h2>)}</div>
          </div>
        </section>
      )}

      {scenes.length > 0 && (
        <section className="sec wrap">
          <h2 className="rise">{g.sceneTitle || "Điểm nổi bật"}</h2>
          <div className="dual rise">
            <div className="dual-tabs" role="tablist">
              {scenes.map((s, i) => (
                <button key={i} className="dtab" type="button" role="tab" aria-selected={i === sceneI} onClick={() => { setSceneHold(true); setSceneI(i); }}><b>{s.title}</b>{s.text && <span>{s.text}</span>}</button>
              ))}
            </div>
            <div className="dual-pic">{scenes.map((s, i) => (
              // Ảnh quá ngang (ảnh giao diện, ảnh chụp màn hình) thì hiện trọn, không cắt.
              <img key={i} src={s.image} alt={s.title} loading="lazy" className={(i === sceneI ? "on" : "") + (wide[i] ? " fit" : "")}
                onLoad={(e) => { const im = e.currentTarget; if (im.naturalWidth / im.naturalHeight > 1.75) setWide((w) => ({ ...w, [i]: true })); }} />
            ))}</div>
          </div>
          {(g.screens || []).length > 0 && (
            <div className="screens rise">
              {g.screens.map((s, i) => (
                <div className="scr" key={i}><h3>{s.title}</h3><p className="big">{s.value}</p>{s.tags && <ul>{String(s.tags).split(",").map((t) => <li key={t}>{t.trim()}</li>)}</ul>}</div>
              ))}
            </div>
          )}
        </section>
      )}

      {rows.length > 0 && (
        <section className="power">
          <div className={"wrap power-grid" + (g.power.image ? "" : " solo")}>
            {g.power.image && <div className="rise power-pic"><img src={g.power.image} alt="" loading="lazy" /></div>}
            <div className="rise">
              <h2>{g.power.title}</h2>
              {g.power.text && <p className="sub">{g.power.text}</p>}
              <div className="bars">
                {rows.map((r) => {
                  const top = Math.max(Number(r.a), Number(r.b) || 0) * 1.2;
                  const up = Number(r.b) > 0 ? Math.round((r.a / r.b - 1) * 100) : 0;
                  return (
                    <div key={r.label}>
                      <div className="bar-h"><span>{r.label}</span>{up > 0 && <em>+{up}%</em>}</div>
                      <div className="row hi"><span>{g.power.nameA}</span><u><i style={{ "--w": `${(r.a / top) * 100}%` }} /></u><span>{r.a}</span></div>
                      {Number(r.b) > 0 && <div className="row"><span>{g.power.nameB}</span><u><i style={{ "--w": `${(r.b / top) * 100}%` }} /></u><span>{r.b}</span></div>}
                    </div>
                  );
                })}
              </div>
              {g.power.note && <p className="fine">{g.power.note}</p>}
            </div>
          </div>
        </section>
      )}

      {asks.length > 0 && (
        <section className="sec wrap">
          <div className="pick rise">
            <div>
              <h2>{g.advisorTitle || "Bạn hay chơi gì?"}</h2>
              <p className="sub">Chọn một mục, Hili gợi ý bản vừa đủ để bạn khỏi tốn thêm tiền.</p>
              <div className="pick-q">{asks.map((a, i) => <button key={i} className="pq" type="button" aria-pressed={i === askI} onClick={() => setAskI(i)}>{a.q}</button>)}</div>
            </div>
            {(() => {
              const a = asks[Math.min(askI, asks.length - 1)];
              const x = verOf(a.pick);
              return (
                <div className="pick-a">
                  <small>Hili gợi ý</small>
                  <h3>{a.pick || p.name}</h3>
                  {a.why && <p>{a.why}</p>}
                  {x && <strong className="pr">{formatVND(x.price)}</strong>}
                  <button className="btn y" type="button" onClick={() => (x ? goVer(x) : buy.current?.scrollIntoView({ behavior: "smooth" }))}>Chọn bản này</button>
                </div>
              );
            })()}
          </div>
        </section>
      )}

      {details.length > 0 && (
        <section className="sec wrap">
          <h2 className="rise">{g.detailTitle || "Từng chi tiết đều cho người chơi"}</h2>
          <div className={"bento rise" + (details.length === 7 ? " seven" : "")}>
            {details.map((d, i) => (
              <figure key={i} className={"b" + (i + 1)} style={details.length === 7 ? undefined : { gridColumn: `span ${spans[i]}` }}>
                <img src={d.image} alt={d.title} loading="lazy" /><figcaption><b>{d.title}</b>{d.text}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {col?.image && colorNames.length > 1 && (
        <section className="colors">
          <img key={col.image} className="sw" src={col.image} alt={`${p.name} màu ${colorName}`} loading="lazy" />
          <div className="colors-shade" />
          <div className="wrap colors-tx rise">
            <h2>{g.colorTitle || `${colorNames.length} màu, chọn màu của bạn`}</h2>
            <div className="big-cols"><ColorPills /></div>
          </div>
        </section>
      )}

      {(g.size?.image || stats.length > 0) && (
        <section className="sec wrap">
          <div className={"size" + (g.size?.image ? "" : " solo")}>
            {g.size?.image && <div className="rise size-pic"><img src={g.size.image} alt="" loading="lazy" /></div>}
            <div className="rise">
              <h2>{g.size?.title || "Kích thước"}</h2>
              {stats.length > 0 && <dl className="dims">{stats.map((s) => <div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd><span>{s.unit}</span></div>)}</dl>}
              {g.size?.drawing && <img className="dimpic" src={g.size.drawing} alt="" loading="lazy" />}
            </div>
          </div>
        </section>
      )}

      {compare && (
        <section className="sec wrap" ref={cmpRef}>
          <h2 className="rise">So sánh các phiên bản</h2>
          <div className="tbl rise">
            <table>
              <thead><tr><th />{compare.heads.map((h) => <th key={h} className={verKeys.some((k) => norm(attrs[k]).includes(norm(h))) ? "on-col" : ""}>{h}</th>)}</tr></thead>
              <tbody>
                {compare.rows.map((r) => (
                  <tr key={r.label}><th>{r.label}</th>{compare.heads.map((h, i) => <td key={h} className={verKeys.some((k) => norm(attrs[k]).includes(norm(h))) ? "on-col" : ""}>{r.v[i]}</td>)}</tr>
                ))}
                {variants.length > 0 && (
                  <>
                    <tr><th>Giá</th>{compare.heads.map((h) => { const x = verOf(h); return <td key={h} className={verKeys.some((k) => norm(attrs[k]).includes(norm(h))) ? "on-col" : ""}>{x ? formatVND(x.price) : ""}</td>; })}</tr>
                    <tr><th />{compare.heads.map((h) => { const x = verOf(h); const on = verKeys.some((k) => norm(attrs[k]).includes(norm(h))); return <td key={h} className={on ? "on-col" : ""}>{x && <button type="button" onClick={() => goVer(x)}>{on ? "Đang chọn" : "Chọn"}</button>}</td>; })}</tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {descText && (
        <section className="sec wrap">
          <h2 className="rise">Giới thiệu sản phẩm</h2>
          <div className={"rich rise" + (more ? " open" : "")}><RichText text={descText} /></div>
          {!more && <button className="btn o moreb" type="button" onClick={() => setMore(true)}>Xem thêm</button>}
        </section>
      )}

      {(specs.length > 0 || faq.length > 0) && (
        <section className={"sec wrap two" + (specs.length && faq.length ? "" : " solo")}>
          {specs.length > 0 && (
            <div className="rise">
              <h2>Thông số</h2>
              <dl className="spec">{specs.map(([k, val], i) => <div key={i}><dt>{k}</dt><dd>{val}</dd></div>)}</dl>
            </div>
          )}
          {faq.length > 0 && (
            <div className="rise">
              <h2>Hỏi nhanh</h2>
              <div className="faq">{faq.map((f, i) => <details key={i} open={i === 0}><summary>{f.q}</summary><p>{f.a}</p></details>)}</div>
            </div>
          )}
        </section>
      )}

      {related.length > 0 && (
        <section className="sec wrap">
          <h2 className="rise">Xem thêm máy khác</h2>
          <div className="more rise">
            {related.map((r) => (
              <a key={r.id} href={`/san-pham/${r.slug}`} onClick={(e) => go(e, `/san-pham/${r.slug}`)}>
                <img src={srcOf(r.images?.[0]) || placeholderImage(r.brand, r.category)} alt="" loading="lazy" /><b>{r.name}</b><span>{formatVND(r.price)}</span>
              </a>
            ))}
          </div>
        </section>
      )}
      <div className="endpad" />

      <div className={"bar" + (barOn ? " on" : "")} aria-hidden={!barOn}>
        <div className="wrap bar-in">
          <img src={main.src} alt="" />
          <div className="bar-tx"><b>{p.name}</b><span>{Object.values(attrs).join(" · ")}</span></div>
          <strong>{price > 0 ? formatVND(total) : "Liên hệ"}</strong>
          <button className="btn y" type="button" onClick={buyNow} tabIndex={barOn ? 0 : -1}>{out ? "Đặt trước" : "Mua ngay"}</button>
        </div>
      </div>
    </div>
  );
}
