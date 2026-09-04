import React from "react";
import { Plus, Check, Gift } from "lucide-react";
import { formatVND, discountPercent, placeholderImage } from "../lib/format.js";
import { LOW_STOCK_THRESHOLD } from "../config.js";
import { useCart } from "../cart.jsx";

export default function ProductCard({ product, onOpen }) {
  const p = product;
  const { items, add } = useCart();
  const inCart = items.some((x) => x.id === p.id);
  const off = discountPercent(p.price, p.listPrice);
  const img = p.images?.[0]?.src || p.images?.[0] || placeholderImage(p.brand, p.category);
  const low = p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD;
  const out = !p.stock;

  return (
    <div className="group flex h-full flex-col bg-white border border-line rounded-lg overflow-hidden hover:shadow-card hover:border-navy/30 transition">
      <a
        href={`#/san-pham/${p.slug}`}
        onClick={(e) => { e.preventDefault(); onOpen(p.slug); }}
        className="block relative aspect-square bg-navy-050"
      >
        <img src={img} alt={p.name} loading="lazy" className="w-full h-full object-cover" />
        {off > 0 && (
          <span className="absolute top-2 left-2 bg-yellow text-ink text-[13px] font-bold px-1.5 py-0.5 rounded font-mono">
            −{off}%
          </span>
        )}
        {out ? (
          <span className="absolute top-2 right-2 bg-ink/85 text-white text-[12px] px-1.5 py-0.5 rounded">Hết hàng</span>
        ) : low ? (
          <span className="absolute top-2 right-2 bg-[#E8730C] text-white text-[12px] px-1.5 py-0.5 rounded">Còn ít</span>
        ) : null}
      </a>

      <div className="flex flex-col flex-1 p-3">
        <div className="text-[12px] uppercase tracking-wide text-mute font-mono">{p.brand}</div>
        <a
          href={`#/san-pham/${p.slug}`}
          onClick={(e) => { e.preventDefault(); onOpen(p.slug); }}
          className="mt-1 text-[14px] leading-snug text-ink line-clamp-2 hover:text-navy min-h-[38px]"
        >
          {p.name}
        </a>

        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-mono font-bold text-[15px] text-sale">{formatVND(p.price)}</span>
            {off > 0 && (
              <span className="font-mono text-[12px] text-mute line-through">{formatVND(p.listPrice)}</span>
            )}
          </div>

          {p.promo && (
            <div className="mt-1.5 flex items-start gap-1 text-[12px] leading-snug text-[#E8730C]">
              <Gift size={13} className="mt-[1px] shrink-0" />
              <span className="line-clamp-1">{String(p.promo).split("\n")[0].replace(/^[-+•*]\s*/, "")}</span>
            </div>
          )}

          <button
            onClick={() => add(p, 1, { preorder: out })}
            className={
              "mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-md text-[14px] font-semibold py-2 transition " +
              (inCart ? "bg-navy-050 text-navy" : "bg-navy text-white hover:bg-navy-600")
            }
          >
            {inCart ? (<><Check size={15} /> Đã thêm</>) : (<><Plus size={15} /> Thêm vào giỏ</>)}
          </button>
        </div>
      </div>
    </div>
  );
}
