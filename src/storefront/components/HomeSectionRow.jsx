import React, { useRef, useState, useEffect } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { href } from "../router.js";
import { homeSectionProducts, homeSectionSeeAll } from "../config.js";
import ProductCard from "./ProductCard.jsx";

/**
 * 1 hàng sản phẩm ở trang chủ (kiểu hotgear.vn / nguyencongpc.vn).
 * Cấu hình từng khối: app quản lý → Website → Cấu hình web → "Khối sản phẩm trang chủ".
 * `flash` = khối Flash Sale nổi bật (viền đỏ phát sáng, nhãn ⚡ trên thẻ).
 */
export default function HomeSectionRow({ section, products, navigate, flash = false, bare = false }) {
  const items = homeSectionProducts(products, section);
  const scroller = useRef(null);
  const [edge, setEdge] = useState({ left: true, right: false });

  const rows = Number(section.rows) === 2 ? 2 : 1;
  const layout = section.layout || "carousel";

  const updateEdges = () => {
    const el = scroller.current;
    if (!el) return;
    setEdge({
      left: el.scrollLeft <= 4,
      right: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  };
  useEffect(() => { updateEdges(); }, [items.length, layout, rows]);

  if (items.length === 0) return null;

  const seeAll = homeSectionSeeAll(section);
  const seeAllTo = seeAll._href ? seeAll._href : href("/danh-muc", seeAll);
  const goSeeAll = (e) => {
    e.preventDefault();
    if (seeAll._href) {
      if (/^https?:\/\//i.test(seeAll._href)) { window.location.href = seeAll._href; return; }
      navigate(seeAll._href.replace(/^#/, "") || "/");
    } else {
      navigate(seeAllTo.slice(1));
    }
  };

  const openProduct = (slug) => navigate(`/san-pham/${slug}`);
  const nudge = (dir) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(240, el.clientWidth * 0.85), behavior: "smooth" });
  };

  // bề rộng 1 thẻ khi cuộn ngang: ~2 / 3 / 5 thẻ nhìn thấy theo bề ngang màn hình
  const cardW = "min-w-[44%] sm:min-w-[31%] lg:min-w-[19.2%] max-w-[44%] sm:max-w-[31%] lg:max-w-[19.2%]";
  const card = (p, key) => <ProductCard key={key} product={p} onOpen={openProduct} flash={flash} />;

  const arrows = layout === "carousel" && (
    <div className="hidden sm:flex items-center gap-1">
      <button
        type="button" onClick={() => nudge(-1)} disabled={edge.left}
        className="w-8 h-8 rounded-full border border-line bg-white flex items-center justify-center text-ink disabled:opacity-30 hover:border-navy"
        aria-label="Trước"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        type="button" onClick={() => nudge(1)} disabled={edge.right}
        className="w-8 h-8 rounded-full border border-line bg-white flex items-center justify-center text-ink disabled:opacity-30 hover:border-navy"
        aria-label="Sau"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );

  // Với Flash Sale, tiêu đề + "Xem tất cả" đã nằm ở dải đếm ngược phía trên → chỉ hiện nút ‹ ›.
  const Header = flash ? (
    arrows && <div className="flex justify-end mb-2">{arrows}</div>
  ) : (
    <div className="flex items-end justify-between mb-3 gap-3">
      <h2 className="font-display text-xl sm:text-2xl font-bold text-ink border-l-4 border-yellow pl-3">
        {section.title}
      </h2>
      <div className="flex items-center gap-2 shrink-0">
        {arrows}
        <a
          href={seeAllTo}
          onClick={goSeeAll}
          className="text-[14px] font-semibold text-navy hover:underline inline-flex items-center gap-1"
        >
          {section.seeAllText || "Xem tất cả"} <ArrowRight size={14} />
        </a>
      </div>
    </div>
  );

  let Body;
  if (layout === "grid") {
    Body = (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        {items.map((p) => card(p, p.id))}
      </div>
    );
  } else if (layout === "marquee") {
    // Tự chạy phải → trái, lặp vô hạn (nhân đôi danh sách). Rê chuột = tạm dừng.
    const dur = Math.max(18, items.length * 4.5);
    const loop = [...items, ...items];
    Body = (
      <div className="overflow-hidden">
        <div
          className="flex items-stretch gap-3 w-max animate-marquee hover:[animation-play-state:paused]"
          style={{ "--marquee-duration": `${dur}s` }}
        >
          {loop.map((p, i) => (
            <div key={i} className="w-[44%] sm:w-[31%] lg:w-[19.2%] shrink-0">
              {card(p, i)}
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    // carousel — cuộn ngang + nút ‹ ›, hỗ trợ 1 hoặc 2 dòng
    Body = (
      <div
        ref={scroller}
        onScroll={updateEdges}
        className={
          "overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:thin] snap-x snap-mandatory " +
          (rows === 2
            ? "grid grid-rows-2 grid-flow-col auto-cols-[44%] sm:auto-cols-[31%] lg:auto-cols-[19.2%] gap-2 sm:gap-3"
            : "flex items-stretch gap-2 sm:gap-3")
        }
      >
        {items.map((p) => (
          <div key={p.id} className={"snap-start " + (rows === 2 ? "" : cardW + " shrink-0")}>
            {card(p, p.id)}
          </div>
        ))}
      </div>
    );
  }

  const inner = (
    <>
      {Header}
      {flash ? (
        <div className="rounded-xl border-2 border-sale/30 bg-gradient-to-b from-sale/[0.06] to-transparent p-3 shadow-[0_0_28px_rgba(237,28,36,0.16)]">
          {Body}
        </div>
      ) : (
        Body
      )}
    </>
  );

  if (bare) return <div className="min-w-0">{inner}</div>;
  return <section className="mx-auto max-w-[1500px] px-3 sm:px-4 py-3">{inner}</section>;
}
