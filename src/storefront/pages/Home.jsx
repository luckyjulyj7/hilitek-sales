import React from "react";
import { Building2, Cpu, Gamepad2 } from "lucide-react";
import { HOME_POSTERS, FLASH_SALE, FLASH_SALE_CATEGORY, SITE, homeSectionProducts } from "../config.js";
import { formatVND } from "../lib/format.js";
import NeedForm from "../components/NeedForm.jsx";
import { HANDHELD_PATH } from "./Handheld.jsx";
import { href } from "../router.js";
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

/** Giá thấp nhất và ảnh đại diện của một nhóm, tính từ sản phẩm đang bán. */
function pick(products, test) {
  const list = products.filter((p) => test.test(`${p.category} ${(p.categories || []).join(" ")}`) && p.price > 0);
  if (!list.length) return { from: 0, image: "" };
  const shown = list.find((p) => p.stock > 0 && p.images?.length) || list.find((p) => p.images?.length);
  const first = shown?.images?.[0];
  return { from: Math.min(...list.map((p) => p.price)), image: first?.src || first || "" };
}

function Tile({ to, title, sub, price, tone = "dark", className = "", children, navigate }) {
  const dark = tone === "dark" || tone === "navy";
  const external = /^https?:/.test(to);
  return (
    <a
      href={to}
      {...(external ? { target: "_blank", rel: "noreferrer" } : { onClick: (e) => { e.preventDefault(); navigate(to.slice(1)); } })}
      className={"group relative block min-h-[190px] lg:min-h-0 overflow-hidden rounded-2xl transition duration-300 hover:-translate-y-0.5 hover:shadow-card " +
        (tone === "navy" ? "bg-navy text-white " : dark ? "bg-ink text-white " : tone === "yellow" ? "bg-yellow text-ink " : "bg-white text-ink ") + className}
    >
      {children}
      <div className="relative z-10 p-4 sm:p-5">
        <h3 className="font-display text-[22px] sm:text-[26px] font-bold leading-tight">{title}</h3>
        {sub && <p className={"mt-1 text-[14px] " + (dark ? "text-white/80" : "text-ink/70")}>{sub}</p>}
        {price > 0 && <p className={"mt-2 font-display text-[20px] font-bold " + (dark ? "text-yellow" : "text-navy")}>Từ {formatVND(price)}</p>}
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
  const keyboard = pick(products, /bàn phím/i);
  const screen = pick(products, /màn hình/i);
  const mouse = pick(products.filter((p) => /^chuột/i.test(p.name)), /./);
  const parts = pick(products, /psu|case|cooling|ssd/i);
  const go = (q) => href("/danh-muc", q);
  const tile = { navigate };

  return (
    <div className="font-sans">
      <h1 className="sr-only">Hilitek: máy chơi game cầm tay, phím chuột và linh kiện PC chính hãng tại TP.HCM</h1>

      <HeroFilm products={products} navigate={navigate} />

      {/* Danh mục */}
      <section className={WRAP + " pt-8"}>
        <h2 className="mb-3 font-display text-[30px] sm:text-[38px] font-bold text-ink">Mua theo danh mục</h2>
        <div className="grid grid-cols-2 gap-3 lg:auto-rows-[176px] lg:grid-cols-12">
          <Tile {...tile} to={go({ group: "Màn hình" })} title="Màn hình" sub="Gaming và văn phòng" price={screen.from} tone="light" className="col-span-2 min-h-[260px] lg:[grid-area:1/1/3/6]">
            <img src="/home/cut-monitor.webp" alt="" loading="lazy" className="absolute bottom-0 right-[3%] w-[64%] transition duration-700 group-hover:scale-[1.03]" />
          </Tile>
          <Tile {...tile} to={go({ group: "Bàn phím" })} title="Bàn phím" sub="Cơ, không dây, văn phòng" price={keyboard.from} tone="light" className="col-span-2 lg:[grid-area:1/6/2/13]">
            <img src="/home/cut-echo96.webp" alt="" loading="lazy" className="absolute right-[3%] top-1/2 w-[52%] -translate-y-1/2 drop-shadow-[0_14px_14px_rgba(6,10,42,.22)] transition duration-700 group-hover:scale-[1.03]" />
          </Tile>
          <Tile {...tile} to={go({ group: "Chuột" })} title="Chuột" sub="Gaming, không dây" price={mouse.from} tone="light" className="lg:[grid-area:2/6/4/9]">
            {mouse.image && <img src={mouse.image} alt="" loading="lazy" className="absolute bottom-0 left-1/2 h-[62%] -translate-x-1/2 mix-blend-multiply transition duration-700 group-hover:scale-105" />}
          </Tile>
          <Tile {...tile} to={go({ group: "Linh kiện PC" })} title="Linh kiện PC" sub="SSD, nguồn, vỏ, tản nhiệt" price={parts.from} className="lg:[grid-area:2/9/3/13]">
            <img src="/home/m03.webp" alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04] object-[70%_60%]" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg,rgba(6,10,42,.9),rgba(6,10,42,.55) 48%,transparent 82%)" }} />
          </Tile>
          <Tile {...tile} to={HANDHELD_PATH} title="Máy chơi game cầm tay" sub="Retro, Android, PC cầm tay. Chọn theo ngân sách." tone="yellow" className="col-span-2 lg:col-span-1 lg:[grid-area:3/9/5/13]">
            <Gamepad2 size={250} strokeWidth={1} className="absolute -bottom-12 -right-8 text-ink/15 transition duration-700 group-hover:scale-105" />
          </Tile>
          <Tile {...tile} to={go({ group: "Phụ kiện" })} title="Phụ kiện Decor góc máy" sub="Arm màn hình, mặt bàn, loa để bàn" className="col-span-2 lg:[grid-area:3/1/4/6]">
            <img src="/home/m02.webp" alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg,rgba(6,10,42,.88),rgba(6,10,42,.2) 70%)" }} />
          </Tile>
          <Tile {...tile} to="/xay-dung-cau-hinh" title="Build PC" sub="Web tự cộng tổng tiền" tone="navy" className="lg:[grid-area:4/1/5/4]">
            <Cpu size={130} strokeWidth={1.1} className="absolute -bottom-6 -right-4 text-white/15" />
          </Tile>
          <Tile {...tile} to={SITE.zaloHref} title="Cho công ty" sub="Báo giá nhanh, hoá đơn VAT, công nợ" className="lg:[grid-area:4/4/5/9]">
            <Building2 size={130} strokeWidth={1.1} className="absolute -bottom-6 -right-3 text-white/15" />
          </Tile>
        </div>
      </section>

      <BrandRail products={products} navigate={navigate} />

      {/* Ưu đãi do chủ shop cấu hình */}
      <section className={WRAP + " pt-8"}>
        <h2 className="mb-3 font-display text-[30px] sm:text-[38px] font-bold text-ink">Chương trình đang diễn ra</h2>
        <div className="grid gap-2 lg:h-[420px] lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-2xl lg:h-[420px] [&_a]:h-full [&_div]:h-full [&_img]:h-full [&_img]:w-full [&_img]:object-cover"><PosterSlider slot={HOME_POSTERS.hero} navigate={navigate} /></div>
          <div className="grid grid-cols-3 gap-2 lg:min-h-0 lg:grid-cols-1 lg:grid-rows-3">
            {HOME_POSTERS.strip.map((p, i) => (
              <div key={i} className="min-h-0 overflow-hidden rounded-2xl [&_a]:block [&_a]:h-full [&_div]:h-full [&_img]:h-full [&_img]:w-full [&_img]:object-cover"><PosterSlot slot={p} navigate={navigate} /></div>
            ))}
          </div>
        </div>
      </section>

      {FLASH_SALE.enabled && flashItems.length > 0 && (
        <section className={WRAP + " pt-6"}>
          <div className="rounded-2xl bg-white p-2.5 sm:p-6">
            <FlashSaleBar navigate={navigate} />
            <div className="mt-3 sm:mt-5">
              <HomeSectionRow section={{ ...flashSection, title: "", seeAllText: "", seeAllHref: "" }} products={products} navigate={navigate} />
            </div>
          </div>
        </section>
      )}

      <ProductTabs products={products} navigate={navigate} />

      <section className={WRAP + " pt-8"}><NeedForm /></section>

      <NewsVideo navigate={navigate} />

      <section className={WRAP + " pt-6"}>
        <TrustBar />
      </section>

      <section className={WRAP + " pt-6 pb-8"}>
        <HiliKeys />
      </section>
    </div>
  );
}
