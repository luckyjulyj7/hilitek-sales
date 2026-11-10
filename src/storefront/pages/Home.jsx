import React, { useEffect, useRef } from "react";
import "./home-pro.css";
import { HOME_POSTERS, HOME_TILES, HOME_TITLES, FLASH_SALE, FLASH_SALE_CATEGORY, homeSectionProducts, tilePick, SITE } from "../config.js";
import { formatVND } from "../lib/format.js";
import NeedForm from "../components/NeedForm.jsx";
import { resolveLink } from "../router.js";
import TrustBar from "../components/TrustBar.jsx";
import PosterSlot from "../components/PosterSlot.jsx";
import PosterSlider from "../components/PosterSlider.jsx";
import FlashSaleBar from "../components/FlashSaleBar.jsx";
import HomeSectionRow from "../components/HomeSectionRow.jsx";
import HiliKeys from "../components/HiliKeys.jsx";
import ProductTabs from "../components/ProductTabs.jsx";
import BrandRail from "../components/BrandRail.jsx";
import HeroFilm from "../components/HeroFilm.jsx";
import NewsVideo from "../components/NewsVideo.jsx";

const WRAP = "mx-auto max-w-[1500px] px-3 sm:px-4";

/** Tiêu đề mục: 3 vạch chéo vàng kiểu logo Hili + dòng phụ bên phải. */
function H({ children, sub }) {
  return (
    <div className="hc-h">
      <h2 className="font-display"><span className="hc-mark" aria-hidden="true"><i /><i /><i /></span>{children}</h2>
      {sub && <p className="hc-sub">{sub}</p>}
    </div>
  );
}

/** Các khối .hc-rv hiện dần khi cuộn tới. */
function useReveal(ref) {
  useEffect(() => {
    const root = ref.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const els = root.querySelectorAll(".hc-rv");
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ref]);
}

const SLOTS = [
  "col-span-2 max-lg:min-h-[285px] lg:[grid-area:1/1/3/6]",
  "col-span-2 max-lg:min-h-[215px] lg:[grid-area:1/6/2/13]",
  "max-lg:min-h-[255px] lg:[grid-area:2/6/4/9]",
  "lg:[grid-area:2/9/3/13] [&_h3]:max-w-[58%] [&_p]:max-w-[52%]",
  "col-span-2 max-lg:min-h-[320px] lg:col-span-1 lg:[grid-area:3/9/5/13]",
  "col-span-2 [&_h3]:max-w-[62%] [&_p]:max-w-[56%] lg:[grid-area:3/1/4/6]",
  "col-span-2 [&_h3]:max-w-[56%] [&_p]:max-w-[52%] lg:[grid-area:4/1/5/5]",
  "col-span-2 [&_h3]:max-w-[52%] [&_p]:max-w-[50%] lg:[grid-area:4/5/5/9]",
];
const TONES = { light: "bg-white text-ink", dark: "bg-ink text-white", navy: "bg-navy text-white", yellow: "bg-yellow text-ink" };
// Vị trí ảnh tách nền theo từng ô của lưới.
const CUT = [
  "absolute bottom-0 right-[3%] w-[54%] sm:w-[40%] lg:w-[64%]",
  "absolute bottom-3 right-[3%] w-[56%] sm:w-[44%] lg:bottom-auto lg:top-1/2 lg:w-[52%] lg:-translate-y-1/2 drop-shadow-[0_14px_14px_rgba(6,10,42,.22)]",
  "absolute bottom-0 left-1/2 h-[38%] -translate-x-1/2 object-contain lg:h-[62%]",
  "absolute right-[4%] top-1/2 h-[82%] w-[40%] -translate-y-1/2 object-contain drop-shadow-[0_10px_10px_rgba(6,10,42,.3)]",
  "absolute bottom-3 left-1/2 max-h-[62%] w-[84%] -translate-x-1/2 object-contain object-bottom drop-shadow-[0_16px_14px_rgba(6,10,42,.3)]",
  "absolute right-[3%] top-1/2 h-[82%] w-[38%] -translate-y-1/2 object-contain drop-shadow-[0_10px_10px_rgba(6,10,42,.3)]",
  "absolute right-[3%] top-1/2 h-[82%] w-[38%] -translate-y-1/2 object-contain drop-shadow-[0_10px_10px_rgba(6,10,42,.3)]",
  "absolute right-[3%] top-1/2 h-[82%] w-[38%] -translate-y-1/2 object-contain drop-shadow-[0_10px_10px_rgba(6,10,42,.3)]",
];
const FAN = [["-rotate-6 z-10", "-mr-[7%]"], ["-rotate-2 z-20", "-mr-[7%]"], ["rotate-2 z-30", "-mr-[7%]"], ["rotate-6 z-40", ""]];

/** Một ô danh mục. Nội dung lấy từ HOME_TILES nên chủ shop tự đổi tên, ảnh, link, giá. */
function Tile({ t, slot, products, navigate }) {
  const tone = TONES[t.tone] ? t.tone : "light";
  const dark = tone === "dark" || tone === "navy";
  const style = ["cut", "photo", "side", "fan"].includes(t.style) ? t.style : "cut";
  const price = tilePick(products, t.price);
  const auto = !t.image;
  const img = t.image || price.image;
  const to = t.href === "zalo" ? SITE.zaloHref : t.href || "/danh-muc";
  const { internalPath } = resolveLink(to);
  const fan = (Array.isArray(t.images) ? t.images : []).filter(Boolean).slice(0, 4);
  const link = internalPath != null
    ? { href: internalPath, onClick: (e) => { e.preventDefault(); navigate(internalPath.replace(/^\//, "")); } }
    : { href: to, target: "_blank", rel: "noreferrer" };
  return (
    <a
      {...link}
      data-tile={slot}
      className={"group relative block min-h-[190px] lg:min-h-0 overflow-hidden rounded-2xl ring-1 transition duration-300 hover:-translate-y-0.5 hover:shadow-card " + (dark ? "ring-white/10 " : "ring-[#D9DFEE] ") + TONES[tone] + " " + SLOTS[slot]}
    >
      {style === "photo" && img && (
        <>
          <img src={img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" style={t.pos ? { objectPosition: t.pos } : undefined} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg,rgba(6,10,42,.9),rgba(6,10,42,.5) 50%,transparent 85%)" }} />
        </>
      )}
      {style === "side" && img && <img src={img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-right transition duration-700 group-hover:scale-[1.03]" />}
      {style === "cut" && img && (
        <>
          {tone === "yellow" && <div className="absolute bottom-[-8%] left-[8%] h-[92%] w-[46%] -skew-x-[20deg] rounded-2xl bg-white/35 transition duration-700 group-hover:translate-x-3" />}
          <img src={img} alt="" loading="lazy" className={CUT[slot] + (auto && !dark ? " mix-blend-multiply" : "") + " transition duration-700 group-hover:scale-[1.04]"} />
        </>
      )}
      {style === "fan" && fan.length > 0 && (
        <div className="absolute inset-y-0 right-[2%] flex w-[50%] items-center justify-end">
          {fan.map((f, i) => (
            <img key={i} src={f} alt="" loading="lazy" className={"relative max-h-[78%] w-[31%] object-contain drop-shadow-[0_8px_8px_rgba(6,10,42,.22)] transition duration-500 group-hover:-translate-y-1 " + FAN[i][0] + " " + FAN[i][1]} />
          ))}
        </div>
      )}
      <span className={"hc-key hc-num" + (tone === "yellow" ? "" : " y")} aria-hidden="true">{slot + 1}</span>
      <div className="relative z-10 p-4 sm:p-5">
        <h3 className="font-display text-[22px] sm:text-[26px] font-bold leading-tight">{t.title}</h3>
        {t.sub && <p className={"mt-1 text-[14px] " + (dark ? "text-white/80" : "text-ink/70")}>{t.sub}</p>}
        {price.from > 0 && <p className={"mt-2 font-display text-[20px] font-bold " + (dark ? "text-yellow" : "text-navy")}>Từ {formatVND(price.from)}</p>}
      </div>
    </a>
  );
}

export default function Home({ catalog, navigate }) {
  const { products } = catalog;
  const flashSection = {
    ...FLASH_SALE,
    group: "", brand: "", cat: FLASH_SALE_CATEGORY,
    onSale: false, minDiscount: 0, pmin: null, pmax: null, skus: [],
  };
  const flashItems = FLASH_SALE.enabled ? homeSectionProducts(products, flashSection) : [];
  // Cột phải chỉ có 2 khối: nếu dữ liệu cũ còn 3 banner thì bỏ banner đầu.
  const strip = HOME_POSTERS.strip || [];
  const stripShown = strip.slice(Math.max(0, strip.length - 2));

  const rootRef = useRef(null);
  useReveal(rootRef);
  // Trang chủ nền tối: header/chân trang theo (giống trang Máy chơi game).
  useEffect(() => { document.documentElement.classList.add("hili-dark"); return () => document.documentElement.classList.remove("hili-dark"); }, []);
  // Phím tắt: bấm 1–8 để nhảy tới ô danh mục tương ứng.
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.target.isContentEditable) return;
      if (!/^[1-8]$/.test(e.key)) return;
      const t = rootRef.current?.querySelector(`[data-tile="${+e.key - 1}"]`);
      if (!t) return;
      t.scrollIntoView({ behavior: "smooth", block: "center" });
      const k = t.querySelector(".hc-num"); k?.classList.add("dn"); setTimeout(() => k?.classList.remove("dn"), 160);
      t.animate?.([{ boxShadow: "0 0 0 0 rgba(247,198,0,.9)" }, { boxShadow: "0 0 0 14px rgba(247,198,0,0)" }], { duration: 900 });
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  return (
    <div ref={rootRef} className="hc font-sans">
      <h1 className="sr-only">Hilitek: máy chơi game cầm tay, phím chuột và linh kiện PC chính hãng tại TP.HCM</h1>

      <HeroFilm products={products} navigate={navigate} />

      {/* Danh mục */}
      <section className={WRAP + " hc-cats hc-rv pt-10"}>
        <H sub="Bấm phím số 1 đến 8 để nhảy nhanh tới danh mục">{HOME_TITLES.cats}</H>
        <div className="grid grid-cols-2 gap-3 lg:auto-rows-[176px] lg:grid-cols-12">
          {HOME_TILES.map((t, i) => <Tile key={t.id || i} t={t} slot={i} products={products} navigate={navigate} />)}
        </div>
      </section>

      <BrandRail products={products} navigate={navigate} />

      {/* Ưu đãi do chủ shop cấu hình */}
      <section className={WRAP + " hc-promo hc-rv pt-10"}>
        <H sub="Khuyến mãi đang chạy tại Hilitek">{HOME_TITLES.promo}</H>
        <div className="grid gap-2 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-2xl lg:aspect-[2/1] [&_a]:h-full [&_div]:h-full [&_img]:h-full [&_img]:w-full [&_img]:object-cover"><PosterSlider slot={HOME_POSTERS.hero} navigate={navigate} /></div>
          <div className="grid grid-cols-2 gap-2 lg:min-h-0 lg:grid-cols-1 lg:grid-rows-2">
            {stripShown.map((p, i) => (
              <div key={i} className="aspect-[2.63/1] min-h-0 overflow-hidden rounded-2xl lg:aspect-auto [&_a]:block [&_a]:h-full [&_div]:h-full [&_img]:h-full [&_img]:w-full [&_img]:object-cover"><PosterSlot slot={p} navigate={navigate} /></div>
            ))}
          </div>
        </div>
      </section>

      {FLASH_SALE.enabled && flashItems.length > 0 && (
        <section className={WRAP + " hc-flash hc-rv pt-10"}>
          <div className="rounded-2xl bg-white p-2.5 sm:p-6">
            <FlashSaleBar navigate={navigate} />
            <div className="mt-3 sm:mt-5">
              <HomeSectionRow section={{ ...flashSection, title: "", seeAllText: "", seeAllHref: "" }} products={products} navigate={navigate} bare noHeader />
            </div>
          </div>
        </section>
      )}

      <div className="hc-show hc-rv pt-10"><ProductTabs products={products} navigate={navigate} /></div>

      <section className={WRAP + " hc-need hc-rv pt-10"}><NeedForm /></section>

      <div className="hc-news hc-rv pt-10"><NewsVideo navigate={navigate} /></div>

      <section className={WRAP + " hc-trust hc-rv pt-8"}>
        <TrustBar />
      </section>

      <section className={WRAP + " pt-6 pb-8"}>
        <HiliKeys />
      </section>
    </div>
  );
}
