import React, { useRef } from "react";
import { Plus, Check, Gift } from "lucide-react";
import { formatVND, discountPercent, placeholderImage } from "../lib/format.js";
import { prefetchProduct } from "../lib/api.js";
import { LOW_STOCK_THRESHOLD } from "../config.js";
import { useCart } from "../cart.jsx";
import { askStockAlert } from "./StockNotify.jsx";

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

  // Tải trước chi tiết sản phẩm khi rê chuột dừng lại ~150ms (không bắn request khi chỉ lướt qua)
  // hoặc vừa chạm ngón tay (điện thoại) — lúc bấm vào đã có sẵn dữ liệu.
  const warmTimer = useRef(null);
  const warm = () => { clearTimeout(warmTimer.current); warmTimer.current = setTimeout(() => prefetchProduct(p.slug), 150); };
  const cancelWarm = () => clearTimeout(warmTimer.current);

  return (
    <div
      onMouseEnter={warm}
      onMouseLeave={cancelWarm}
      onTouchStart={() => prefetchProduct(p.slug)}
      className="group flex h-full flex-col bg-white overflow-hidden transition duration-300 hover:-translate-y-0.5 hover:shadow-card"
    >
      <a
        href={`/san-pham/${p.slug}`}
        onClick={(e) => { e.preventDefault(); onOpen(p.slug); }}
        className="block relative aspect-square overflow-hidden bg-[#E9ECF6]"
      >
        <img src={img} alt={p.name} loading="lazy" decoding="async" width="400" height="400" className={"w-full h-full object-cover transition duration-700 group-hover:scale-[1.03]" + (out ? " grayscale opacity-75" : "")} />
        {off > 0 && (
          <span className="absolute top-2 left-2 bg-yellow text-ink text-[13px] font-bold px-1.5 py-0.5">
            −{off}%
          </span>
        )}
        {out ? (
          <span className="absolute top-2 right-2 bg-ink text-white text-[12px] px-2 py-1">Hết hàng</span>
        ) : low ? (
          <span className="absolute top-2 right-2 bg-[#B4540A] text-white text-[12px] px-2 py-1">Còn ít</span>
        ) : null}
      </a>

      {/* Bố cục cố định chiều cao từng dòng → giá đỏ luôn nằm đúng một vị trí trên mọi thẻ */}
      <div className="flex flex-col flex-1 p-3">
        <div className="flex items-center justify-between gap-2 min-h-[15px]">
          <span className="text-[13px] text-mute line-clamp-1">{p.brand}</span>
          {p.variantCount > 1 && (
            <span className="shrink-0 text-[12px] text-navy bg-navy-050 px-1.5 py-0.5">{p.variantCount} tuỳ chọn</span>
          )}
        </div>
        <a
          href={`/san-pham/${p.slug}`}
          onClick={(e) => { e.preventDefault(); onOpen(p.slug); }}
          className="mt-1 text-[15px] font-medium leading-snug text-ink line-clamp-2 hover:text-navy h-[42px]"
        >
          {p.name}
        </a>
        <div className="mt-1 h-[18px] truncate text-[13px] text-mute">{(p.specChips || []).slice(0, 2).join(" · ")}</div>

        {/* Giá — vị trí cố định, không cho xuống dòng chữ "đ"; luôn chừa dòng giá gạch */}
        <div className="mt-2.5">
          <div className="font-display font-bold text-[20px] sm:text-[26px] text-navy leading-none whitespace-nowrap tabular-nums">
            {formatVND(p.price)}
          </div>
          <div className="mt-0.5 h-[15px] font-mono text-[11px] text-mute/80 line-through whitespace-nowrap">
            {off > 0 ? formatVND(p.listPrice) : ""}
          </div>
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

        {out ? (
          <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
            <button onClick={() => askStockAlert(p)} className="min-h-[44px] px-1 border-[1.5px] border-ink text-[13px] font-semibold text-ink transition hover:bg-yellow">Báo khi có hàng</button>
            <button onClick={buy} className="min-h-[44px] px-1 bg-yellow text-[13px] font-semibold text-ink transition hover:brightness-95">Đặt trước</button>
          </div>
        ) : (
        <button
          onClick={buy}
          className="mt-2 w-full min-h-[44px] inline-flex items-center justify-center gap-1.5 text-[14px] font-semibold transition bg-ink text-white hover:bg-navy"
        >
          {inCart ? <Check size={15} /> : <Plus size={15} />} Đặt hàng
        </button>
        )}
      </div>
    </div>
  );
}
