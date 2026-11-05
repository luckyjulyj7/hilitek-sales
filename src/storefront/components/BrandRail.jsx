import React, { useMemo } from "react";
import { href } from "../router.js";

// Thứ tự hiển thị: linh kiện và màn hình, phím chuột, rồi máy chơi game cầm tay.
const BRANDS = [
  "ASUS", "MSI", "Gigabyte", "Zotac", "SSTC", "ViewSonic", "VSP", "Corsair", "Kingston", "Samsung",
  "VOICSKY", "Logitech", "Razer", "AKKO", "Rapoo",
  "Anbernic", "Miyoo", "Trimui", "Retroid", "AYN", "Mangmi", "GPD", "Ayaneo",
];

/** Dãy tên thương hiệu chạy ngang. Hãng đang có hàng trên web bấm được, rê chuột vào thì dừng. */
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
    const cls = "mx-5 sm:mx-8 shrink-0 font-display text-[24px] sm:text-[30px] font-bold whitespace-nowrap";
    if (!real) return <span key={key} aria-hidden={hidden} className={cls + " text-ink/45"}>{name}</span>;
    const to = href("/danh-muc", { brand: real });
    return (
      <a key={key} href={to} tabIndex={hidden ? -1 : undefined} aria-hidden={hidden}
        onClick={(e) => { e.preventDefault(); navigate(to.slice(1)); }}
        className={cls + " text-ink/70 transition hover:text-navy"}>{name}</a>
    );
  };

  return (
    <section aria-label="Thương hiệu" className="mt-6 overflow-hidden border-y border-line bg-white py-4 group"
      style={{ maskImage: "linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)" }}>
      <div className="flex w-max animate-[marquee_48s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {names.map((n) => item(n, n, false))}
        {names.map((n) => item(n, `${n}-2`, true))}
      </div>
    </section>
  );
}
