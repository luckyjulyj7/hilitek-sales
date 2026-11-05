import React, { useMemo } from "react";
import { href } from "../router.js";
import "./brand-rail.css";

// Thứ tự hiển thị: linh kiện và màn hình, phím chuột, rồi máy chơi game cầm tay.
const BRANDS = [
  "ASUS", "MSI", "Gigabyte", "Zotac", "SSTC", "ViewSonic", "VSP", "Corsair", "Kingston", "Samsung",
  "VOICSKY", "Logitech", "Razer", "AKKO", "Rapoo",
  "Anbernic", "Miyoo", "Trimui", "Retroid", "AYN", "Mangmi", "GPD", "Ayaneo",
];

/**
 * Hàng phím thương hiệu chạy ngang, cùng ngôn ngữ với phím HILITEK cuối trang.
 * Hãng đang có hàng là phím vàng bấm được, rê chuột vào thì dừng và phím nhấn xuống.
 */
export default function BrandRail({ products, navigate }) {
  const sold = useMemo(() => {
    const map = new Map();
    products.forEach((p) => { if (p.brand) map.set(p.brand.toLowerCase(), p.brand); });
    return map;
  }, [products]);

  // Hãng có trên web mà chưa nằm trong danh sách sẽ tự thêm vào cuối.
  const names = useMemo(() => {
    const known = new Set(BRANDS.map((b) => b.toLowerCase()));
    return [...BRANDS, ...[...sold.entries()].filter(([k]) => !known.has(k)).map(([, v]) => v)];
  }, [sold]);

  const item = (name, key, hidden) => {
    const real = sold.get(name.toLowerCase());
    if (!real) return <span key={key} aria-hidden={hidden} className="bk"><b>{name}</b></span>;
    const to = href("/danh-muc", { brand: real });
    return (
      <a key={key} href={to} tabIndex={hidden ? -1 : undefined} aria-hidden={hidden} className="bk on"
        onClick={(e) => { e.preventDefault(); navigate(to.slice(1)); }}><b>{name}</b></a>
    );
  };

  return (
    <section aria-label="Thương hiệu nổi bật" className="mx-auto max-w-[1500px] px-3 pt-8 sm:px-4">
      <div className="br">
        <h2 className="br-t font-display">Thương hiệu<br />nổi bật</h2>
        <div className="br-m">
          <div className="br-r">
            {names.map((n) => item(n, n, false))}
            {names.map((n) => item(n, `${n}-2`, true))}
          </div>
        </div>
      </div>
    </section>
  );
}
