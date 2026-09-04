import React from "react";
import { ArrowDown } from "lucide-react";
import { formatVND, discountPercent, placeholderImage } from "../lib/format.js";
import { useCart } from "../cart.jsx";

/**
 * Thẻ sản phẩm trong khối Flash Sale — kiểu nguyencongpc.vn:
 *   • nhãn "↓ N%" đỏ bo tròn góc trên phải
 *   • tag "Tiết kiệm <số tiền>" xanh dương ở góc dưới trái ảnh
 *   • giá cũ gạch nhỏ → giá bán đỏ to
 *   • nút "Đặt hàng" đỏ (thêm vào giỏ rồi sang trang đặt hàng)
 */
export default function FlashSaleCard({ product, onOpen, navigate }) {
  const p = product;
  const { add } = useCart();
  const off = discountPercent(p.price, p.listPrice);
  const saving = Math.max(0, (Number(p.listPrice) || 0) - (Number(p.price) || 0));
  const img = p.images?.[0]?.src || p.images?.[0] || placeholderImage(p.brand, p.category);
  const out = !p.stock;

  const order = () => {
    add(p, 1, { preorder: out });
    if (navigate) navigate("/dat-hang");
  };
  const open = (e) => { e.preventDefault(); onOpen(p.slug); };

  return (
    <div className="group flex h-full flex-col bg-white border border-line rounded-xl overflow-hidden hover:shadow-card hover:border-navy/30 transition">
      <a href={`#/san-pham/${p.slug}`} onClick={open} className="block relative p-3 pb-0">
        <div className="relative aspect-square">
          <img src={img} alt={p.name} loading="lazy" className="w-full h-full object-contain" />
        </div>
        {off > 0 && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-0.5 bg-gradient-to-br from-[#ff4b2b] to-[#c40812] text-white text-[12px] font-extrabold px-2 py-0.5 rounded-full animate-emberglow">
            <ArrowDown size={11} strokeWidth={3} /> {off}%
          </span>
        )}
        {saving > 0 && (
          <span className="absolute left-0 bottom-1 bg-[#00A8E8] text-white text-[10px] font-medium leading-tight px-2 py-1 rounded-r-md">
            Tiết kiệm
            <br />
            <b className="text-[12px] font-bold">{formatVND(saving)}</b>
          </span>
        )}
      </a>

      <div className="flex flex-col flex-1 px-3 pb-3 pt-2">
        <a
          href={`#/san-pham/${p.slug}`}
          onClick={open}
          className="text-[13px] leading-snug text-ink line-clamp-2 min-h-[36px] hover:text-navy"
        >
          {p.name}
        </a>

        <div className="mt-auto pt-2">
          {off > 0 && (
            <div className="font-mono text-[12px] text-mute line-through">{formatVND(p.listPrice)}</div>
          )}
          <div className="font-mono font-bold text-[16px] text-sale">{formatVND(p.price)}</div>

          <button
            onClick={order}
            className="mt-2 inline-flex items-center justify-center bg-sale text-white text-[13px] font-semibold rounded-md px-5 py-1.5 hover:brightness-110 transition"
          >
            Đặt hàng
          </button>
        </div>
      </div>
    </div>
  );
}
