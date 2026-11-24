import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Clock, MessageCircle, ChevronRight } from "lucide-react";
import { NEWS_KINDS, NEWS_PATH, SITE } from "../config.js";
import { formatVND } from "../lib/format.js";
import RichText from "../components/RichText.jsx";
import "./article.css";
import { useEdPage } from "./edFonts.js";

const slugify = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

/**
 * Bài viết tin tức (/trang/<slug> có meta.news): kiểu tạp chí.
 * Đầu bài nền navy Hili, cột phải có mục lục + sản phẩm trong bài, thanh đọc màu vàng.
 */
export default function ArticleView({ meta, page, failed, mins, products, navigate }) {
  const body = useRef(null);
  const [toc, setToc] = useState([]);
  const [active, setActive] = useState("");
  const [prog, setProg] = useState(0);
  const zalo = SITE.zaloHref || "https://zalo.me/" + (SITE.phoneRaw || "");
  const go = (to) => (e) => { e.preventDefault(); navigate(to.replace(/^\//, "")); };
  const list = useMemo(() => (meta.products || []).map((s) => (products || []).find((p) => p.slug === s)).filter(Boolean), [meta.products, products]);

  useEdPage();

  // Mục lục: lấy các tiêu đề H2 trong bài sau khi hiện.
  useEffect(() => {
    const el = body.current;
    if (!el || !page) return;
    const hs = [...el.querySelectorAll("h2")];
    hs.forEach((h, i) => { if (!h.id) h.id = slugify(h.textContent) || "muc-" + i; });
    setToc(hs.map((h) => ({ id: h.id, t: h.textContent })));
  }, [page]);

  // Thanh tiến độ đọc + mục đang đọc.
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = body.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const k = (innerHeight * 0.35 - r.top) / Math.max(1, r.height - innerHeight * 0.3);
        setProg(Math.max(0, Math.min(1, k)));
        let cur = "";
        el.querySelectorAll("h2[id]").forEach((h) => { if (h.getBoundingClientRect().top < 160) cur = h.id; });
        setActive(cur);
      });
    };
    on();
    addEventListener("scroll", on, { passive: true });
    return () => { removeEventListener("scroll", on); cancelAnimationFrame(raf); };
  }, [page]);

  const jump = (id) => (e) => {
    e.preventDefault();
    const h = document.getElementById(id);
    if (h) scrollTo({ top: h.getBoundingClientRect().top + scrollY - 110, behavior: "smooth" });
  };
  const date = meta.date ? meta.date.split("-").reverse().join("/") : "";
  const text = page ? [meta.videoUrl && !String(page.body).includes(meta.videoUrl) ? meta.videoUrl : "", page.body].filter(Boolean).join("\n\n") : "";

  return (
    <div className="ar">
      <div className="ar-prog" style={{ transform: `scaleX(${prog})` }} aria-hidden="true" />

      {/* ===== Đầu bài ===== */}
      <header className="ar-head">
        <div className="ar-wrap ar-head-in">
          <div>
            <nav className="ar-crumb" aria-label="Đường dẫn">
              <a href={NEWS_PATH} onClick={go(NEWS_PATH)}><ArrowLeft size={15} /> Tin tức</a>
              <ChevronRight size={14} /><span>{NEWS_KINDS[meta.news]}</span>
            </nav>
            <h1>{meta.title}</h1>
            {meta.summary && <p className="ar-lead">{meta.summary}</p>}
            <div className="ar-meta">
              <span className="ar-by">Hilitek</span>
              {date && <span>{date}</span>}
              {page && <span><Clock size={14} /> {mins} phút đọc</span>}
            </div>
          </div>
          {meta.cover && !meta.videoUrl && (
            <div className="ar-cover"><img src={meta.cover} alt={meta.title} loading="eager" decoding="async" /></div>
          )}
        </div>
      </header>

      <div className="ar-wrap ar-grid">
        <article className="ar-main">
          {Array.isArray(meta.points) && meta.points.length > 0 && (
            <aside className="ar-tldr">
              <b>Đọc nhanh</b>
              <ul>{meta.points.map((x) => <li key={x}>{x}</li>)}</ul>
            </aside>
          )}

          {page ? (
            <div ref={body} className="ar-body"><RichText text={text} imgAlt={meta.title} /></div>
          ) : failed ? (
            <p className="ar-note">Không tải được nội dung bài. Bạn tải lại trang giúp Hili nhé.</p>
          ) : (
            <div className="ar-skel" aria-label="Đang tải"><i /><i /><i /><i /></div>
          )}

          {/* So sánh hai mẫu cạnh nhau */}
          {Array.isArray(meta.pairs) && meta.pairs.map((pr) => (
            <section key={pr.title} className="ar-vs">
              <h2>{pr.title}</h2>
              <div className="ar-vs-grid">
                {[pr.left, pr.right].map((x, i) => (
                  <div key={x.name} className={"ar-vs-card" + (i === 0 ? " own" : "")}>
                    {i === 0 && <span className="ar-vs-tag">Có tại Hilitek</span>}
                    <div className="ar-vs-img"><img src={x.img} alt={x.name} loading="lazy" decoding="async" /></div>
                    <b>{x.name}</b>
                    <ul>{x.specs.map((sp) => <li key={sp}>{sp}</li>)}</ul>
                    {x.slug ? (
                      <a href={`/san-pham/${x.slug}`} onClick={go(`/san-pham/${x.slug}`)} className="ar-btn y">Xem giá, nghe gõ <ArrowRight size={15} /></a>
                    ) : x.credit ? <span className="ar-credit">{x.credit}</span> : null}
                  </div>
                ))}
                <span className="ar-vs-badge" aria-hidden="true">VS</span>
              </div>
            </section>
          ))}

          {meta.table && (
            <section className="ar-sec">
              {meta.table.title && <h2>{meta.table.title}</h2>}
              <div className="ar-table">
                <table>
                  <thead><tr>{meta.table.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
                  <tbody>{meta.table.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
                </table>
              </div>
            </section>
          )}

          {list.length > 0 && (
            <section className="ar-sec">
              <h2>Sản phẩm trong bài</h2>
              <div className="ar-prods">
                {list.map((p) => {
                  const img = p.images?.[0]?.src || p.images?.[0] || "";
                  return (
                    <a key={p.id} href={`/san-pham/${p.slug}`} onClick={go(`/san-pham/${p.slug}`)} className="ar-prod">
                      <span className="pic">{img && <img src={img} alt={p.name} loading="lazy" decoding="async" />}</span>
                      <span className="tx"><b>{p.name}</b><em>{p.priceFrom ? "Từ " : ""}{formatVND(p.price)}</em><span>Xem chi tiết <ArrowRight size={14} /></span></span>
                    </a>
                  );
                })}
              </div>
            </section>
          )}

          <div className="ar-cta">
            <div><b>Cần Hili tư vấn thêm?</b><p>Nhắn Zalo hoặc ghé cửa hàng ở Phú Thọ, TP.HCM để xem và dùng thử trực tiếp.</p></div>
            <div className="btns">
              {meta.cta && <a href={meta.cta.to} onClick={go(meta.cta.to)} className="ar-btn y">{meta.cta.label} <ArrowRight size={15} /></a>}
              <a href={zalo} target="_blank" rel="noreferrer" className="ar-btn w"><MessageCircle size={16} /> Nhắn Zalo</a>
            </div>
          </div>
        </article>

        {/* ===== Cột phải ===== */}
        <aside className="ar-side">
          {toc.length > 1 && (
            <nav className="ar-toc" aria-label="Mục lục">
              <b>Trong bài này</b>
              <ol>{toc.map((x) => <li key={x.id}><a href={"#" + x.id} onClick={jump(x.id)} className={active === x.id ? "on" : ""}>{x.t}</a></li>)}</ol>
            </nav>
          )}
          {list.length > 0 && (
            <div className="ar-mini">
              <b>Sản phẩm nhắc tới</b>
              {list.slice(0, 5).map((p) => {
                const img = p.images?.[0]?.src || p.images?.[0] || "";
                return (
                  <a key={p.id} href={`/san-pham/${p.slug}`} onClick={go(`/san-pham/${p.slug}`)}>
                    <span className="pic">{img && <img src={img} alt="" loading="lazy" decoding="async" />}</span>
                    <span><i>{p.name}</i><em>{formatVND(p.price)}</em></span>
                  </a>
                );
              })}
            </div>
          )}
          <a href={zalo} target="_blank" rel="noreferrer" className="ar-ask"><MessageCircle size={18} /><span><b>Hỏi Hili qua Zalo</b>Tư vấn miễn phí, trả lời nhanh</span></a>
        </aside>
      </div>
    </div>
  );
}
