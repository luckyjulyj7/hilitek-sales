import React, { useEffect, useState } from "react";
import { ArrowLeft, Clock, MessageCircle } from "lucide-react";
import "./landing-extra.css";
import { NEWS_KINDS, NEWS_PATH, SITE, findPage } from "../config.js";
import { fetchLanding } from "../lib/api.js";
import RichText from "../components/RichText.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { useCatalog } from "../catalogContext.js";
import ArticleView from "./ArticleView.jsx";
import ArticlePicks from "./ArticlePicks.jsx";

/** Trang nội dung / landing tự tạo — poster / banner trỏ tới bằng /trang/<slug>. */
export default function LandingPage({ slug, navigate }) {
  // Cấu hình chung chỉ giữ tiêu đề/slug (nội dung nặng — có thể vài MB nếu nhúng ảnh — tải riêng
  // khi mở đúng trang này). Bản mặc định trong config.js (chưa cấu hình) thì còn nguyên nội dung.
  const meta = findPage(slug);
  const { products: allProducts } = useCatalog() || {};
  const hasMeta = !!meta;
  const hasInlineBody = !!(meta && meta.body);
  const [fetched, setFetched] = useState(null);
  const [failed, setFailed] = useState(false);

  // Chỉ phụ thuộc slug/hasMeta (không phụ thuộc object meta): cứ 60s cấu hình web tự làm mới và
  // tạo object mới — không được vì vậy mà tải lại trang đang đọc.
  useEffect(() => {
    setFailed(false);
    if (!hasMeta || hasInlineBody) return;
    let alive = true;
    fetchLanding(slug)
      .then((p) => { if (alive) { setFetched(p); if (!p) setFailed(true); } })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [slug, hasMeta, hasInlineBody]);

  const page = hasInlineBody ? meta : (fetched && fetched.slug === slug ? fetched : null);
  const title = (page || meta || {}).title;

  useEffect(() => {
    if (!title) return;
    const prev = document.title;
    document.title = `${title} | ${SITE.name}`;
    return () => { document.title = prev; };
  }, [title]);

  if (!meta) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 font-sans text-center">
        <p className="text-mute">Trang này đang được cập nhật hoặc không tồn tại.</p>
        <button onClick={() => navigate("/")} className="mt-4 text-navy font-semibold">Về trang chủ</button>
      </div>
    );
  }

  // Thời gian đọc ước tính: ~220 chữ/phút.
  const words = String((page && page.body) || "").split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 220));
  const zalo = SITE.zaloHref || "https://zalo.me/" + (SITE.phoneRaw || "");

  // Bài tin tức: giao diện tạp chí riêng (ArticleView.jsx).
  if (meta.news && meta.picks) return <ArticlePicks meta={meta} products={allProducts} navigate={navigate} />;
  if (meta.news) return <ArticleView meta={meta} page={page} failed={failed} mins={mins} products={allProducts} navigate={navigate} />;

  return (
    <div className="art mx-auto max-w-3xl px-4 py-8 sm:py-12 font-sans">
      {meta.news && (
        <>
          <a href={NEWS_PATH} onClick={(e) => { e.preventDefault(); navigate(NEWS_PATH.slice(1)); }} className="mb-3 inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-navy hover:underline"><ArrowLeft size={16} /> Tin tức &amp; video</a>
          <div className="art-meta">
            <span className="art-kind">{NEWS_KINDS[meta.news]}</span>
            {meta.date && <span>{meta.date.split("-").reverse().join("/")}</span>}
            {page && <span className="inline-flex items-center gap-1"><Clock size={14} /> {mins} phút đọc</span>}
          </div>
        </>
      )}
      <h1 className="font-display text-[28px] sm:text-[40px] leading-[1.08] font-bold text-ink">{meta.title}</h1>
      {meta.news && meta.summary && <p className="art-lead">{meta.summary}</p>}
      {meta.news && meta.cover && !meta.videoUrl && <div className="art-hero mt-6"><img src={meta.cover} alt={meta.title} loading="eager" decoding="async" /></div>}
      {/* Tóm tắt nhanh: đọc 10 giây là nắm ý chính */}
      {Array.isArray(meta.points) && meta.points.length > 0 && (
        <aside className="art-tldr">
          <h2>Tóm tắt nhanh</h2>
          <ul>{meta.points.map((x) => <li key={x}>{x}</li>)}</ul>
        </aside>
      )}
      {!meta.points && <div className="mt-6" />}
      {page ? (
        <div className="art-body"><RichText text={[meta.videoUrl && !String(page.body).includes(meta.videoUrl) ? meta.videoUrl : "", page.body].filter(Boolean).join("\n\n")} imgAlt={meta.title} /></div>
      ) : failed ? (
        <p className="text-mute">Không tải được nội dung trang. Vui lòng tải lại trang.</p>
      ) : (
        <p className="text-mute">Đang tải…</p>
      )}
      {/* So sánh trực quan: 2 mẫu cạnh nhau, ảnh thật + thông số */}
      {Array.isArray(meta.pairs) && meta.pairs.map((pr) => (
        <section key={pr.title} className="art-vs">
          <h2>{pr.title}</h2>
          <div className="art-vs-grid">
            {[pr.left, pr.right].map((x, i) => (
              <div key={x.name} className={"art-vs-card" + (i === 0 ? " own" : "")}>
                <div className="art-vs-img"><img src={x.img} alt={x.name} loading="lazy" decoding="async" /></div>
                <b>{x.name}</b>
                <ul>{x.specs.map((sp) => <li key={sp}>{sp}</li>)}</ul>
                {x.slug ? (
                  <a href={`/san-pham/${x.slug}`} onClick={(e) => { e.preventDefault(); navigate(`san-pham/${x.slug}`); }} className="hx-key y art-vs-btn">Xem giá &amp; nghe gõ</a>
                ) : x.credit ? <span className="art-vs-credit">{x.credit}</span> : null}
              </div>
            ))}
            <span className="art-vs-badge" aria-hidden="true">VS</span>
          </div>
        </section>
      ))}
      {/* Bảng so sánh (nếu bài có) */}
      {meta.table && (
        <section className="mt-8">
          {meta.table.title && <h2 className="mb-3 font-display text-[22px] font-bold text-ink">{meta.table.title}</h2>}
          <div className="sw-table-wrap" style={{ marginTop: 0 }}>
            <table className="sw-table">
              <thead><tr>{meta.table.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>{meta.table.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </section>
      )}
      {Array.isArray(meta.products) && meta.products.length > 0 && (() => {
        const list = meta.products.map((s) => (allProducts || []).find((p) => p.slug === s)).filter(Boolean);
        if (!list.length) return null;
        return (
          <section className="mt-8">
            <h2 className="mb-3 font-display text-[22px] font-bold text-ink">Sản phẩm trong bài</h2>
            <div className="art-products grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {list.map((p) => <ProductCard key={p.id} product={p} onOpen={(s2) => navigate(`san-pham/${s2}`)} />)}
            </div>
          </section>
        );
      })()}
      {meta.cta && !meta.news && (
        <a href={meta.cta.to} onClick={(e) => { e.preventDefault(); navigate(meta.cta.to.slice(1)); }} className="mt-6 inline-flex min-h-[46px] items-center rounded-lg bg-ink px-4 font-semibold text-white hover:bg-navy">{meta.cta.label}</a>
      )}
      {/* Cuối bài: kêu gọi rõ ràng */}
      {meta.news && (
        <div className="art-cta">
          <div><b>Cần Hili tư vấn thêm?</b><p>Nhắn Zalo hoặc ghé cửa hàng ở Phú Thọ, TP.HCM để xem, dùng thử trực tiếp.</p></div>
          <div className="flex flex-wrap gap-2">
            {meta.cta && <a href={meta.cta.to} onClick={(e) => { e.preventDefault(); navigate(meta.cta.to.slice(1)); }} className="hx-key y min-h-[46px] px-4 text-[14.5px]">{meta.cta.label}</a>}
            <a href={zalo} target="_blank" rel="noreferrer" className="hx-key min-h-[46px] px-4 text-[14.5px]"><MessageCircle size={16} /> Nhắn Zalo</a>
          </div>
        </div>
      )}
    </div>
  );
}
