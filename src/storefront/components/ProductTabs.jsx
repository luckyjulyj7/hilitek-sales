import React, { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { HOME_SECTIONS, homeSectionProducts, homeSectionSeeAll } from "../config.js";
import { href } from "../router.js";
import ProductCard from "./ProductCard.jsx";
import "./product-tabs.css";

const SHOW = 12;

/**
 * Gom các khối sản phẩm cấu hình trong app quản lý thành một khu có tab.
 * Tab đầu là hàng có sẵn nhiều, các tab sau là từng khối đang bật. Tab không có hàng tự ẩn.
 */
export default function ProductTabs({ products, navigate }) {
  const tabs = useMemo(() => {
    // Hàng còn nhiều xếp trước, thiếu thì lấy thêm mẫu đang hết để luôn đủ 2 dòng.
    const ready = [...products].sort((a, b) => b.stock - a.stock).slice(0, SHOW);
    const list = [{ key: "hot", label: "Nổi bật", items: ready, to: "/danh-muc", total: products.length, all: "sản phẩm" }];
    HOME_SECTIONS.filter((s) => s && s.enabled !== false).forEach((s, i) => {
      const q = homeSectionSeeAll(s);
      const every = homeSectionProducts(products, { ...s, limit: 9999 });
      const label = s.title || s.group;
      list.push({
        key: `s${i}`, label, items: every.slice(0, SHOW), total: every.length, all: label,
        to: q._href || href("/danh-muc", q),
      });
    });
    return list.filter((t) => t.items.length);
  }, [products]);
  const [cur, setCur] = useState("hot");
  const tab = tabs.find((t) => t.key === cur) || tabs[0];
  if (!tab) return null;

  const openAll = (e) => {
    if (/^https?:/.test(tab.to)) return;
    e.preventDefault();
    navigate(tab.to.replace(/^\//, ""));
  };

  const seeAll = `Xem tất cả ${tab.total > SHOW ? `${tab.total} ` : ""}${tab.all}`;

  return (
    <section className="mx-auto max-w-[1500px] px-3 pt-8 sm:px-4">
      <h2 className="font-display text-[30px] sm:text-[38px] font-bold text-ink">Đang được săn đón</h2>
      <div className="mt-3 flex items-center justify-between gap-4">
        <div role="tablist" aria-label="Nhóm sản phẩm" className="flex min-w-0 gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {tabs.map((t) => (
            <button key={t.key} type="button" role="tab" aria-selected={t.key === tab.key} onClick={() => setCur(t.key)}
              className={"min-h-[44px] shrink-0 rounded-lg px-4 text-[15px] font-semibold transition " + (t.key === tab.key ? "bg-ink text-yellow" : "bg-white text-ink hover:bg-yellow")}>
              {t.label}
            </button>
          ))}
        </div>
        <a href={tab.to} onClick={openAll} className="pt-all mb-1 hidden shrink-0 lg:inline-flex">{seeAll} <ArrowRight size={17} /></a>
      </div>
      <div key={tab.key} role="tabpanel" className="pt-grid mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {tab.items.map((p) => (
          <ProductCard key={p.id} product={p} onOpen={(slug) => navigate(`san-pham/${slug}`)} />
        ))}
      </div>
      <div className="mt-5 text-center lg:hidden">
        <a href={tab.to} onClick={openAll} className="pt-all w-full sm:w-auto">{seeAll} <ArrowRight size={17} /></a>
      </div>
    </section>
  );
}
