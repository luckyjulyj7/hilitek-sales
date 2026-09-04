import React from "react";
import { HOME_POSTERS, HOME_SECTIONS, FLASH_SALE } from "../config.js";
import ProductCard from "../components/ProductCard.jsx";
import TrustBar from "../components/TrustBar.jsx";
import CategoryRail from "../components/CategoryRail.jsx";
import PosterSlot from "../components/PosterSlot.jsx";
import PosterSlider from "../components/PosterSlider.jsx";
import FlashSaleBar from "../components/FlashSaleBar.jsx";
import HomeSectionRow from "../components/HomeSectionRow.jsx";
import { discountPercent } from "../lib/format.js";

export default function Home({ catalog, navigate }) {
  const { products } = catalog;

  const deals = [...products]
    .filter((p) => discountPercent(p.price, p.listPrice) > 0)
    .sort((a, b) => discountPercent(b.price, b.listPrice) - discountPercent(a.price, a.listPrice))
    .slice(0, 10);

  return (
    <div className="font-sans">
      {/* ===== Danh mục (trái) + khu poster (giữa/phải) ===== */}
      <section className="mx-auto max-w-[1500px] px-3 sm:px-4 pt-3">
        <div className="grid lg:grid-cols-[256px_minmax(0,1fr)] gap-2">
          <CategoryRail navigate={navigate} className="hidden lg:block self-start" />

          <div className="space-y-2 min-w-0">
            <div className="grid md:grid-cols-[minmax(0,1fr)_300px] gap-2">
              <PosterSlider slot={HOME_POSTERS.hero} navigate={navigate} />
              <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                {HOME_POSTERS.side.map((s, i) => (
                  <PosterSlot key={i} slot={s} navigate={navigate} />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {HOME_POSTERS.strip.map((s, i) => (
                <PosterSlot key={i} slot={s} navigate={navigate} className={i === 2 ? "col-span-2 sm:col-span-1" : ""} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Flash sale ===== */}
      {FLASH_SALE.enabled && deals.length > 0 && (
        <section className="mx-auto max-w-[1500px] px-3 sm:px-4 pt-5">
          <FlashSaleBar navigate={navigate} />
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            {deals.map((p) => (
              <ProductCard key={p.id} product={p} onOpen={(slug) => navigate(`/san-pham/${slug}`)} />
            ))}
          </div>
        </section>
      )}

      {/* ===== Cam kết ===== */}
      <section className="mx-auto max-w-[1500px] px-3 sm:px-4 py-6">
        <TrustBar />
      </section>

      {/* ===== Khối sản phẩm trang chủ (cấu hình ở app quản lý) ===== */}
      {HOME_SECTIONS.filter((s) => s && s.enabled !== false).map((s, i) => (
        <HomeSectionRow key={i} section={s} products={products} navigate={navigate} />
      ))}
    </div>
  );
}
