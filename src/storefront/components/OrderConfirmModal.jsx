import React, { useEffect } from "react";
import { X, Minus, Plus, ShoppingCart, CreditCard } from "lucide-react";
import { formatVND, placeholderImage } from "../lib/format.js";
import { useCart } from "../cart.jsx";

/**
 * Popup xác nhận sau khi khách bấm "Đặt hàng" trên thẻ sản phẩm.
 * Hiện sản phẩm + số lượng (chỉnh được), tổng tiền, và 3 lựa chọn:
 *   • GIỎ HÀNG      → mở trang giỏ
 *   • THANH TOÁN    → sang trang đặt hàng
 *   • TIẾP TỤC MUA HÀNG → đóng popup (sản phẩm vẫn nằm trong giỏ)
 * Dùng chung cho cả máy tính và điện thoại.
 */
export default function OrderConfirmModal({ navigate }) {
  const { orderItem, closeOrder, items, changeQty, count } = useCart();

  useEffect(() => {
    if (!orderItem) return;
    const onKey = (e) => e.key === "Escape" && closeOrder();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [orderItem, closeOrder]);

  if (!orderItem) return null;

  const line = items.find((x) => x.id === orderItem.id);
  const qty = line ? line.qty : 1;
  const price = Number(orderItem.price ?? (line && line.price) ?? 0);
  const img =
    orderItem.images?.[0]?.src || orderItem.images?.[0] || placeholderImage(orderItem.brand, orderItem.category);

  const go = (to) => { closeOrder(); navigate(to); };

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-4 font-sans"
      onClick={closeOrder}
    >
      <div
        className="w-full max-w-[430px] bg-navy text-white rounded-xl p-4 sm:p-5 shadow-2xl max-h-[92vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] text-white/70">({count})</span>
          <button onClick={closeOrder} aria-label="Đóng" className="p-1 -mr-1 text-white/70 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="bg-white text-ink rounded-lg p-3 flex gap-3">
          <img src={img} alt="" className="w-16 h-16 object-contain rounded shrink-0 bg-white" />
          <div className="flex-1 min-w-0">
            <div className="text-[13px] leading-snug line-clamp-2">{orderItem.name}</div>
            <div className="mt-1 font-mono text-[13px] text-mute">{formatVND(price)}</div>
          </div>
          <div className="flex items-center gap-1 self-start">
            <button
              onClick={() => changeQty(orderItem.id, -1)}
              className="w-7 h-7 grid place-items-center border border-line rounded text-mute hover:text-navy"
              aria-label="Giảm"
            >
              <Minus size={13} />
            </button>
            <span className="w-7 text-center font-mono text-[14px]">{qty}</span>
            <button
              onClick={() => changeQty(orderItem.id, 1)}
              className="w-7 h-7 grid place-items-center border border-line rounded text-mute hover:text-navy"
              aria-label="Tăng"
            >
              <Plus size={13} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between py-3 text-[15px]">
          <span className="text-white/80">Tổng</span>
          <span className="font-mono font-bold text-yellow text-[18px]">{formatVND(price * qty)}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => go("/gio-hang")}
            className="bg-white text-navy font-bold py-2.5 rounded-md text-[13px] inline-flex items-center justify-center gap-1.5 hover:bg-navy-050"
          >
            <ShoppingCart size={15} /> GIỎ HÀNG
          </button>
          <button
            onClick={() => go("/dat-hang")}
            className="bg-yellow text-ink font-bold py-2.5 rounded-md text-[13px] inline-flex items-center justify-center gap-1.5 hover:bg-yellow-300"
          >
            <CreditCard size={15} /> THANH TOÁN
          </button>
        </div>

        <button
          onClick={closeOrder}
          className="mt-2.5 w-full text-center text-[13px] text-white/75 hover:text-white underline underline-offset-2 py-1"
        >
          TIẾP TỤC MUA HÀNG
        </button>
      </div>
    </div>
  );
}
