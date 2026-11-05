import React, { useEffect, useMemo, useRef } from "react";
import { HOME_SECTIONS, FLASH_SALE, FLASH_SALE_CATEGORY, SITE, homeSectionProducts } from "../config.js";
import { formatVND } from "../lib/format.js";
import { submitNeed } from "../lib/api.js";
import { initHome } from "../lib/homeMotion.js";
import TrustBar from "../components/TrustBar.jsx";
import FlashSaleBar from "../components/FlashSaleBar.jsx";
import HomeSectionRow from "../components/HomeSectionRow.jsx";
import { TOP, BOTTOM } from "./homeMarkup.js";
import "./home-v3.css";

const HANDHELD = "Máy chơi game cầm tay";

// Giá giữ theo bản mẫu nếu sản phẩm bị ẩn, tránh hiện ô trống; link khi đó về trang danh mục.
const FEATURED = {
  nimbus: { match: /nimbus 65/i, price: "1.539.000đ" },
  echo: { match: /voicsky echo 75/i, price: "1.479.000đ" },
  apex: { match: /voicsky apex 75/i, price: "2.379.000đ" },
};

function fill(html, products) {
  const hasHandheld = products.some((p) => (p.categories || []).includes(HANDHELD) || p.category === HANDHELD);
  let out = html
    .replaceAll("{{zalo}}", SITE.zaloHref)
    // Ngành máy cầm tay chưa có sản phẩm thì dẫn tới chương chọn máy, không dẫn tới trang rỗng.
    .replaceAll("{{hhHref}}", hasHandheld ? `/danh-muc?group=${encodeURIComponent(HANDHELD)}` : "#hh");
  Object.entries(FEATURED).forEach(([key, f]) => {
    const p = products.find((x) => f.match.test(x.name));
    out = out
      .replaceAll(`{{${key}.price}}`, p ? formatVND(p.price).replace(/\s/g, "") : f.price)
      .replaceAll(`{{${key}.url}}`, p ? `/san-pham/${p.slug}` : "/danh-muc?group=B%C3%A0n%20ph%C3%ADm");
  });
  return out;
}

export default function Home({ catalog, navigate }) {
  const { products } = catalog;
  const root = useRef(null);

  const flashSection = {
    ...FLASH_SALE,
    group: "", brand: "", cat: FLASH_SALE_CATEGORY,
    onSale: false, minDiscount: 0, pmin: null, pmax: null, skus: [],
  };
  const flashItems = FLASH_SALE.enabled ? homeSectionProducts(products, flashSection) : [];

  // Chỉ dựng phần tĩnh một lần: làm mới giá mỗi 60s không được xoá chuyển động đang chạy.
  const top = useMemo(() => ({ __html: fill(TOP, products) }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const bottom = useMemo(() => ({ __html: BOTTOM }), []);

  useEffect(() => initHome(root.current, { onLead: submitNeed }), []);

  // Link nội bộ trong phần tĩnh đi qua router, không tải lại trang.
  const onClick = (e) => {
    const a = e.target.closest("a[href]");
    if (!a) return;
    const href = a.getAttribute("href");
    if (href === "#hh") { e.preventDefault(); root.current.querySelector("#hh").scrollIntoView({ behavior: "smooth" }); return; }
    if (href.startsWith("/")) { e.preventDefault(); navigate(href.slice(1)); }
  };

  return (
    <div ref={root} className="hv nojs" onClick={onClick}>
      <h1 className="sr-only">Hilitek: máy chơi game cầm tay, phím chuột và linh kiện PC chính hãng tại TP.HCM</h1>
      <div dangerouslySetInnerHTML={top} />

      <section className="rows-host font-sans">
        <div className="hdr"><h2 className="d big">Lấy được <em>ngay</em></h2></div>
        {FLASH_SALE.enabled && flashItems.length > 0 && (
          <div className="mx-auto max-w-[1500px] px-3 sm:px-4 pt-3">
            <div className="bg-white p-2.5 sm:p-6">
              <FlashSaleBar navigate={navigate} />
              <div className="mt-3 sm:mt-5">
                <HomeSectionRow section={{ ...flashSection, title: "", seeAllText: "", seeAllHref: "" }} products={products} navigate={navigate} />
              </div>
            </div>
          </div>
        )}
        {HOME_SECTIONS.filter((s) => s && s.enabled !== false).map((s, i) => (
          <HomeSectionRow key={i} section={s} products={products} navigate={navigate} />
        ))}
        <div className="mx-auto max-w-[1500px] px-3 sm:px-4 pt-4"><TrustBar /></div>
      </section>

      <div dangerouslySetInnerHTML={bottom} />
    </div>
  );
}
