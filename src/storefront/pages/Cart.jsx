import React from "react";
import { Trash2, ShoppingCart, ArrowRight, ArrowLeft } from "lucide-react";
import { useCart } from "../cart.jsx";
import { formatVND } from "../lib/format.js";

export default function Cart({ navigate }) {
  const { items, subtotal, setQty, remove } = useCart();

  if (items.length === 0)
    return (
      <div className="mx-auto max-w-[1500px] px-4 py-16 font-sans text-center">
        <ShoppingCart size={40} className="mx-auto text-line" />
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">Giỏ hàng trống</h1>
        <p className="mt-2 text-mute text-sm">Chưa có sản phẩm nào trong giỏ.</p>
        <button onClick={() => navigate("/danh-muc")} className="mt-5 inline-flex items-center gap-2 rounded-md bg-navy text-white px-5 py-3 font-display font-semibold hover:bg-navy-600">
          <ArrowLeft size={18} /> Tiếp tục mua sắm
        </button>
      </div>
    );

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 font-sans">
      <h1 className="font-display text-3xl font-bold text-ink">Giỏ hàng</h1>
      <p className="mt-1 text-mute text-sm">{items.reduce((s, x) => s + x.qty, 0)} sản phẩm</p>

      <div className="mt-6 grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.id} className="border border-line rounded-lg bg-white p-4 flex flex-wrap gap-4 items-start">
              <div className="flex-1 min-w-[200px]">
                <div className="font-mono text-[11px] uppercase tracking-wide text-mute">{it.brand} · {it.sku}</div>
                <a
                  href={`#/san-pham/${it.slug}`}
                  onClick={(e) => { e.preventDefault(); navigate(`/san-pham/${it.slug}`); }}
                  className="mt-0.5 block text-[15px] font-medium text-ink hover:text-navy leading-snug"
                >
                  {it.name}
                </a>
                {it.preorder && (
                  <span className="mt-1 inline-block bg-[#E8730C]/10 text-[#E8730C] text-[11px] font-semibold px-2 py-0.5 rounded">
                    Đặt trước — chờ hàng về
                  </span>
                )}
                {it.specChips?.length > 0 && (
                  <div className="mt-1.5 inline-block border-l-[3px] border-yellow bg-navy-050 rounded-r px-2 py-1 text-[11.5px] font-mono text-ink/70">
                    {it.specChips.join(" · ")}
                  </div>
                )}
              </div>

              <div className="inline-flex items-center border border-line rounded-md">
                <button onClick={() => setQty(it.id, it.qty - 1)} className="px-2.5 py-1.5 text-mute hover:text-navy">−</button>
                <input
                  value={it.qty}
                  onChange={(e) => setQty(it.id, parseInt(e.target.value.replace(/\D/g, "")) || 0)}
                  className="w-10 text-center text-[14px] font-mono outline-none"
                  inputMode="numeric"
                />
                <button onClick={() => setQty(it.id, it.qty + 1)} className="px-2.5 py-1.5 text-mute hover:text-navy">+</button>
              </div>

              <div className="text-right min-w-[120px]">
                <div className="font-mono font-bold text-sale">{formatVND(it.qty * it.price)}</div>
                <div className="font-mono text-[11px] text-mute">{formatVND(it.price)} / cái</div>
                <button onClick={() => remove(it.id)} className="mt-1 inline-flex items-center gap-1 text-[12px] text-mute hover:text-navy">
                  <Trash2 size={13} /> Xoá
                </button>
              </div>
            </div>
          ))}
          <button onClick={() => navigate("/danh-muc")} className="inline-flex items-center gap-2 text-[13px] text-navy font-semibold">
            <ArrowLeft size={15} /> Tiếp tục mua sắm
          </button>
        </div>

        <div className="border border-line rounded-lg bg-white p-5 lg:sticky lg:top-[150px]">
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-mute">Tạm tính</span>
            <span className="font-mono text-2xl font-bold text-sale">{formatVND(subtotal)}</span>
          </div>
          <div className="mt-1 text-right text-[12px] text-mute">Đã bao gồm VAT</div>
          <p className="mt-3 text-[12.5px] text-mute leading-relaxed">
            Phí vận chuyển tính ở bước tiếp theo, sau khi chọn địa chỉ giao hàng.
          </p>
          <button
            onClick={() => navigate("/dat-hang")}
            className="mt-4 w-full rounded-md bg-navy text-white font-display font-bold py-3 text-[15px] tracking-wide hover:bg-navy-600 inline-flex items-center justify-center gap-2"
          >
            TIẾN HÀNH ĐẶT HÀNG <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
