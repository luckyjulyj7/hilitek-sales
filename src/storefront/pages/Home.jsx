import React from "react";
import { HOME_POSTERS, HOME_SECTIONS, FLASH_SALE, FLASH_SALE_CATEGORY, homeSectionProducts } from "../config.js";
import TrustBar from "../components/TrustBar.jsx";
import CategoryRail from "../components/CategoryRail.jsx";
import PosterSlot from "../components/PosterSlot.jsx";
import PosterSlider from "../components/PosterSlider.jsx";
import FlashSaleBar from "../components/FlashSaleBar.jsx";
import HomeSectionRow from "../components/HomeSectionRow.jsx";

export default function Home({ catalog, navigate }) {
  const { products } = catalog;

  // Khối Flash Sale = đúng các sản phẩm được gán danh mục "Flash Sale" (chọn tay từng cái),
  // KHÔNG lọc theo nhóm/thương hiệu/% giảm — chỉ sắp xếp + giới hạn số lượng theo cấu hình.
  const flashSection = {
    ...FLASH_SALE,
    group: "", brand: "", cat: FLASH_SALE_CATEGORY,
    onSale: false, minDiscount: 0, pmin: null, pmax: null, skus: [],
  };
  const flashItems = FLASH_SALE.enabled ? homeSectionProducts(products, flashSection) : [];

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
      {FLASH_SALE.enabled && flashItems.length > 0 && (
        <section className="mx-auto max-w-[1500px] px-3 sm:px-4 pt-5">
          <div className="rounded-xl sm:rounded-2xl bg-white border border-line shadow-card p-2.5 sm:p-6">
            <FlashSaleBar navigate={navigate} />
            <div className="mt-3 sm:mt-5">
              <HomeSectionRow section={{ ...flashSection, title: "", seeAllText: "", seeAllHref: "" }} products={products} navigate={navigate} flash bare />
            </div>
          </div>
        </section>
      )}

      {/* ===== Khối sản phẩm trang chủ (cấu hình ở app quản lý) ===== */}
      {HOME_SECTIONS.filter((s) => s && s.enabled !== false).map((s, i) => (
        <HomeSectionRow key={i} section={s} products={products} navigate={navigate} />
      ))}

      {/* ===== Cam kết (cuối trang) ===== */}
      <section className="mx-auto max-w-[1500px] px-3 sm:px-4 pt-4 pb-8">
        <TrustBar />
      </section>
    </div>
  );
}
