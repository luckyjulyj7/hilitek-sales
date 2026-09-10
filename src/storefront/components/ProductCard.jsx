import React from "react";
import { Plus, Check, Gift } from "lucide-react";
import { formatVND, discountPercent, placeholderImage } from "../lib/format.js";
import { LOW_STOCK_THRESHOLD } from "../config.js";
import { useCart } from "../cart.jsx";

export default function ProductCard({ product, onOpen }) {
  const p = product;
  const { items, add, openOrder } = useCart();
  const inCart = items.some((x) => x.id === p.id);
  const buy = () => {
    if (!inCart) add(p, 1, { preorder: !p.stock });
    openOrder(p);
  };
  const off = discountPercent(p.price, p.listPrice);
  const img = p.images?.[0]?.src || p.images?.[0] || placeholderImage(p.brand, p.category);
  const low = p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD;
  const out = !p.stock;

  return (
    <div className="group flex h-full flex-col bg-white border border-line rounded-lg overflow-hidden hover:shadow-card hover:border-navy/30 transition">
      <a
        href={`/san-pham/${p.slug}`}
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
        {off > 0 && (
          <span className="absolute left-0 bottom-2 bg-[#00A8E8] text-white text-[11px] font-semibold px-2 py-0.5 rounded-r-md shadow-sm">
            Tiết kiệm {off}%
          </span>
        )}
      </a>

      {/* Bố cục cố định chiều cao từng dòng → giá đỏ luôn nằm đúng một vị trí trên mọi thẻ */}
      <div className="flex flex-col flex-1 p-3">
        <div className="text-[12px] uppercase tracking-wide text-mute font-mono line-clamp-1 min-h-[15px]">{p.brand}</div>
        <a
          href={`/san-pham/${p.slug}`}
          onClick={(e) => { e.preventDefault(); onOpen(p.slug); }}
          className="mt-1 text-[14px] leading-snug text-ink line-clamp-2 hover:text-navy h-[38px]"
        >
          {p.name}
        </a>

        {/* Giá — vị trí cố định */}
        <div className="mt-2.5 flex items-baseline gap-1.5 flex-wrap">
          <span className="font-mono font-extrabold text-[21px] sm:text-[23px] text-sale leading-none">{formatVND(p.price)}</span>
          {off > 0 && (
            <span className="font-mono text-[11px] text-mute/80 line-through">{formatVND(p.listPrice)}</span>
          )}
        </div>

        {/* Dòng khuyến mãi — luôn chừa 1 dòng để nút bên dưới cũng thẳng hàng */}
        <div className="mt-1 min-h-[18px] flex items-start gap-1 text-[12px] leading-snug text-[#E8730C]">
          {p.promo && (
            <>
              <Gift size={13} className="mt-[1px] shrink-0" />
              <span className="line-clamp-1">{String(p.promo).split("\n")[0].replace(/^[-+•*]\s*/, "")}</span>
            </>
          )}
        </div>

        <button
          onClick={buy}
          className="mt-2 w-full inline-flex items-center justify-center gap-1.5 rounded-md text-[14px] font-semibold py-2 transition bg-navy text-white hover:bg-navy-600"
        >
          {inCart ? <Check size={15} /> : <Plus size={15} />} Đặt hàng
        </button>
      </div>
    </div>
  );
}
