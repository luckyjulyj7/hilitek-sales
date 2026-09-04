import React, { useRef, useState, useEffect } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { href } from "../router.js";
import { homeSectionProducts, homeSectionSeeAll } from "../config.js";
import ProductCard from "./ProductCard.jsx";
import FlashSaleCard from "./FlashSaleCard.jsx";

/**
 * 1 hàng sản phẩm ở trang chủ (kiểu hotgear.vn / nguyencongpc.vn).
 * - layout "carousel": tự chạy phải→trái mỗi 3.5s + 2 mũi tên tròn 2 bên (rê chuột = dừng).
 * - layout "marquee":  băng chuyền chạy liên tục bằng CSS.
 * - layout "grid":     lưới tĩnh.
 * Cấu hình từng khối: app quản lý → Website → Cấu hình web.
 */
export default function HomeSectionRow({ section, products, navigate, flash = false, bare = false }) {
  const items = homeSectionProducts(products, section);
  const scroller = useRef(null);
  const hoverRef = useRef(false);
  const pauseUntil = useRef(0);
  const [edge, setEdge] = useState({ left: true, right: true });

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

  // Tự chạy ngang cho layout carousel.
  useEffect(() => {
    if (layout !== "carousel") return;
    const el = scroller.current;
    if (!el) return;
    const id = setInterval(() => {
      if (hoverRef.current || Date.now() < pauseUntil.current) return;
      if (el.scrollWidth <= el.clientWidth + 8) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
      if (atEnd) el.scrollTo({ left: 0, behavior: "smooth" });
      else el.scrollBy({ left: Math.round(el.clientWidth * 0.8), behavior: "smooth" });
    }, 3500);
    return () => clearInterval(id);
  }, [layout, items.length, rows]);

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
  const nudge = (e, dir) => {
    e.preventDefault();
    e.stopPropagation();
    const el = scroller.current;
    if (!el) return;
    pauseUntil.current = Date.now() + 7000; // tạm dừng tự chạy sau khi bấm tay
    const step = Math.max(240, el.clientWidth * 0.8);
    const max = el.scrollWidth - el.clientWidth;
    // Tới mép: vòng lại đầu/cuối. Ở giữa: tiến/lùi 1 bước. Nút LUÔN nuốt click, không rơi xuống thẻ.
    let target;
    if (dir > 0) target = el.scrollLeft >= max - 8 ? 0 : Math.min(max, el.scrollLeft + step);
    else target = el.scrollLeft <= 8 ? max : Math.max(0, el.scrollLeft - step);
    el.scrollTo({ left: target, behavior: "smooth" });
  };

  const cardW = "min-w-[44%] sm:min-w-[31%] lg:min-w-[19.2%] max-w-[44%] sm:max-w-[31%] lg:max-w-[19.2%]";
  const card = (p, key) =>
    flash
      ? <FlashSaleCard key={key} product={p} onOpen={openProduct} navigate={navigate} />
      : <ProductCard key={key} product={p} onOpen={openProduct} />;

  const Header = flash ? null : (
    <div className="flex items-end justify-between mb-3 gap-3">
      <h2 className="font-display text-xl sm:text-2xl font-bold text-ink border-l-4 border-yellow pl-3">
        {section.title}
      </h2>
      <a
        href={seeAllTo}
        onClick={goSeeAll}
        className="shrink-0 text-[14px] font-semibold text-navy hover:underline inline-flex items-center gap-1"
      >
        {section.seeAllText || "Xem tất cả"} <ArrowRight size={14} />
      </a>
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
    const dur = Math.max(18, items.length * 4.5);
    const loop = [...items, ...items];
    Body = (
      <div className="overflow-hidden">
        <div
          className="flex items-stretch gap-3 w-max animate-marquee hover:[animation-play-state:paused]"
          style={{ "--marquee-duration": `${dur}s` }}
        >
          {loop.map((p, i) => (
            <div key={i} className="w-[44%] sm:w-[31%] lg:w-[19.2%] shrink-0">{card(p, i)}</div>
          ))}
        </div>
      </div>
    );
  } else {
    Body = (
      <div
        ref={scroller}
        onScroll={updateEdges}
        className={
          "overflow-x-auto pb-1 [scrollbar-width:thin] scroll-smooth " +
          (rows === 2
            ? "grid grid-rows-2 grid-flow-col auto-cols-[44%] sm:auto-cols-[31%] lg:auto-cols-[19.2%] gap-2 sm:gap-3"
            : "flex items-stretch gap-2 sm:gap-3")
        }
      >
        {items.map((p) => (
          <div key={p.id} className={rows === 2 ? "" : cardW + " shrink-0"}>
            {card(p, p.id)}
          </div>
        ))}
      </div>
    );
  }

  // Nút luôn nhận click (không disabled / không pointer-events-none) để không "xuyên" xuống thẻ sản phẩm phía sau.
  const sideBtn =
    "hidden md:flex absolute top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-line " +
    "items-center justify-center text-ink hover:bg-navy hover:text-white transition";

  const bodyWrap = (
    <div
      className="relative"
      onMouseEnter={() => { hoverRef.current = true; }}
      onMouseLeave={() => { hoverRef.current = false; }}
    >
      {layout === "carousel" && (
        <>
          <button
            type="button" aria-label="Trước"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => nudge(e, -1)}
            className={sideBtn + " -left-1 sm:-left-3 " + (edge.left ? "opacity-40" : "")}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button" aria-label="Sau"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => nudge(e, 1)}
            className={sideBtn + " -right-1 sm:-right-3 " + (edge.right ? "opacity-40" : "")}
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
      {Body}
    </div>
  );

  const inner = (
    <>
      {Header}
      {bodyWrap}
    </>
  );

  if (bare) return <div className="min-w-0">{inner}</div>;
  return <section className="mx-auto max-w-[1500px] px-3 sm:px-4 py-3">{inner}</section>;
}
