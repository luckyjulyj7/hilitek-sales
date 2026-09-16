import React, { useEffect, useState } from "react";
import { X, Minus, Plus, ShoppingCart, CreditCard, Zap, ArrowLeft, CheckCircle2 } from "lucide-react";
import { formatVND, placeholderImage } from "../lib/format.js";
import { useCart } from "../cart.jsx";
import { placeOrder } from "../lib/api.js";
import { SITE } from "../config.js";

// Bỏ dấu tiếng Việt — tên chủ TK hiện trên QR ngân hàng theo chuẩn không dấu.
const stripVN = (s) =>
  String(s || "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D");

// Link ảnh QR VietQR — tự điền sẵn số tiền + nội dung chuyển khoản, quét bằng app ngân hàng bất kỳ.
// Cần đủ bin (mã ngân hàng) + accountNumber (đặt ở Cấu hình web → Tài khoản ngân hàng).
function vietQrUrl({ amount, code, phone }) {
  const bank = SITE.bank || {};
  if (!bank.bin || !bank.accountNumber) return "";
  const addInfo = encodeURIComponent(`${code} ${phone}`.trim());
  const accountName = encodeURIComponent(stripVN(bank.holder || "").toUpperCase());
  return `https://img.vietqr.io/image/${bank.bin}-${bank.accountNumber}-compact2.png?amount=${Math.max(0, Math.round(amount))}&addInfo=${addInfo}&accountName=${accountName}`;
}

/**
 * Popup xác nhận sau khi khách bấm "Đặt hàng" trên thẻ sản phẩm. 3 bước:
 *   cart  → hiện sản phẩm + số lượng, 3 lựa chọn: GIỎ HÀNG / THANH TOÁN / THANH TOÁN NHANH
 *   quick → form tối giản (tên, SĐT, địa chỉ đánh tay — không chọn tỉnh/phường) cho THANH TOÁN NHANH
 *   done  → đơn đã tạo xong, hiện mã QR chuyển khoản đúng số tiền + thông tin ngân hàng
 * Dùng chung cho cả máy tính và điện thoại.
 */
export default function OrderConfirmModal({ navigate }) {
  const { orderItem, closeOrder, items, changeQty, count, remove } = useCart();
  const [step, setStep] = useState("cart"); // cart | quick | done
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [sendErr, setSendErr] = useState("");
  const [placed, setPlaced] = useState(null); // { code, total, phone }

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

  // Mở popup cho 1 lần bấm "Đặt hàng" mới (hoặc đóng popup) → luôn về lại bước đầu, xoá sạch
  // form/kết quả của lần trước (tránh hiện nhầm đơn/QR cũ khi khách bấm đặt sản phẩm khác).
  useEffect(() => {
    setStep("cart");
    setForm({ name: "", phone: "", address: "" });
    setErrors({});
    setSendErr("");
    setPlaced(null);
  }, [orderItem]);

  if (!orderItem) return null;

  const line = items.find((x) => x.id === orderItem.id);
  const qty = line ? line.qty : 1;
  const price = Number(orderItem.price ?? (line && line.price) ?? 0);
  const total = price * qty;
  const img =
    orderItem.images?.[0]?.src || orderItem.images?.[0] || placeholderImage(orderItem.brand, orderItem.category);

  const go = (to) => { closeOrder(); navigate(to); };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Thanh toán nhanh chỉ tạo đơn cho ĐÚNG sản phẩm đang xem trong popup này (không gộp cả giỏ
  // hàng) — khớp đúng ngữ cảnh khách đang thấy trên màn hình.
  const submitQuick = async (e) => {
    e.preventDefault();
    if (sending) return;
    const er = {};
    if (!form.name.trim()) er.name = "Nhập họ tên";
    if (!/^0\d{8,10}$/.test(form.phone.replace(/\s/g, ""))) er.phone = "Số điện thoại chưa đúng";
    if (!form.address.trim()) er.address = "Nhập địa chỉ nhận hàng";
    setErrors(er);
    if (Object.keys(er).length) return;

    const phone = form.phone.replace(/\s/g, "");
    const code = "WEB" + Date.now().toString(36).toUpperCase().slice(-8);
    const order = {
      source: "Thanh toán nhanh (website)",
      code,
      createdAt: new Date().toISOString(),
      customer: { name: form.name.trim(), phone, email: "" },
      shipping: { address: form.address.trim(), fullAddress: form.address.trim(), note: "" },
      payment: "bank",
      items: [{ productId: orderItem.id, sku: orderItem.sku, name: orderItem.name, price, qty, preorder: !!orderItem.preorder }],
      subtotal: total,
      coupon: "",
      discount: 0,
      total,
      hasPreorder: !!orderItem.preorder,
    };

    setSending(true);
    setSendErr("");
    try {
      const r = await placeOrder(order);
      remove(orderItem.id); // đã lên đơn — bỏ khỏi giỏ để tránh đặt trùng lần sau
      setPlaced({ code: r.code || code, total, phone });
      setStep("done");
    } catch (err) {
      setSendErr((err.message || "Không gửi được đơn.") + ` — Vui lòng thử lại hoặc gọi ${SITE.phone} để đặt hàng.`);
    } finally {
      setSending(false);
    }
  };

  const qrUrl = placed ? vietQrUrl({ amount: placed.total, code: placed.code, phone: placed.phone }) : "";

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
          <span className="text-[13px] text-white/70">{step === "cart" ? `(${count})` : " "}</span>
          <button onClick={closeOrder} aria-label="Đóng" className="p-1 -mr-1 text-white/70 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {step === "cart" && (
          <>
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
              <span className="font-mono font-bold text-yellow text-[18px]">{formatVND(total)}</span>
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
              onClick={() => setStep("quick")}
              style={{ background: "#00B14F" }}
              className="mt-2 w-full text-white font-bold py-2.5 rounded-md text-[13px] inline-flex items-center justify-center gap-1.5 hover:brightness-110"
            >
              <Zap size={15} /> THANH TOÁN NHANH (QR chuyển khoản)
            </button>

            <button
              onClick={closeOrder}
              className="mt-2.5 w-full text-center text-[13px] text-white/75 hover:text-white underline underline-offset-2 py-1"
            >
              TIẾP TỤC MUA HÀNG
            </button>
          </>
        )}

        {step === "quick" && (
          <form onSubmit={submitQuick}>
            <button type="button" onClick={() => setStep("cart")} className="inline-flex items-center gap-1 text-[13px] text-white/75 hover:text-white mb-2">
              <ArrowLeft size={14} /> Quay lại
            </button>

            <div className="bg-white text-ink rounded-lg p-3 flex gap-3 mb-3">
              <img src={img} alt="" className="w-12 h-12 object-contain rounded shrink-0 bg-white" />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] leading-snug line-clamp-2">
                  {orderItem.name} <span className="text-mute">× {qty}</span>
                </div>
                <div className="mt-1 font-mono font-bold text-[14px] text-sale">{formatVND(total)}</div>
              </div>
            </div>

            <div className="space-y-2.5">
              <div>
                <input value={form.name} onChange={set("name")} placeholder="Họ và tên *" className={inp(errors.name)} />
                {errors.name && <p className="mt-1 text-[12px] text-yellow">{errors.name}</p>}
              </div>
              <div>
                <input value={form.phone} onChange={set("phone")} placeholder="Số điện thoại *" inputMode="tel" className={inp(errors.phone)} />
                {errors.phone && <p className="mt-1 text-[12px] text-yellow">{errors.phone}</p>}
              </div>
              <div>
                <textarea
                  value={form.address}
                  onChange={set("address")}
                  placeholder="Địa chỉ nhận hàng (số nhà, đường, phường/xã, tỉnh/thành) *"
                  rows={2}
                  className={inp(errors.address) + " resize-none"}
                />
                {errors.address && <p className="mt-1 text-[12px] text-yellow">{errors.address}</p>}
              </div>
            </div>

            {sendErr && <p className="mt-2 text-[12px] text-yellow leading-relaxed">{sendErr}</p>}

            <button
              type="submit"
              disabled={sending}
              style={{ background: sending ? undefined : "#00B14F" }}
              className="mt-3 w-full text-white font-bold py-2.5 rounded-md text-[13px] disabled:opacity-60 inline-flex items-center justify-center gap-1.5"
            >
              {sending ? "ĐANG TẠO ĐƠN…" : <><Zap size={15} /> TẠO ĐƠN & LẤY MÃ QR</>}
            </button>
          </form>
        )}

        {step === "done" && placed && (
          <div className="text-center">
            <CheckCircle2 size={40} className="mx-auto text-yellow" />
            <p className="mt-2 font-semibold">Đã ghi nhận đơn hàng</p>
            <p className="text-[13px] text-white/75 mt-0.5">
              Mã đơn: <span className="font-mono font-semibold text-white">{placed.code}</span>
            </p>

            <div className="mt-3 bg-white rounded-lg p-3">
              {qrUrl ? (
                <img src={qrUrl} alt="Mã QR chuyển khoản" className="w-full max-w-[260px] mx-auto rounded" />
              ) : (
                <p className="text-ink text-[13px] py-6">
                  Chưa đủ thông tin ngân hàng để tạo QR — vui lòng chuyển khoản thủ công theo thông tin bên dưới.
                </p>
              )}
              <div className="mt-2 text-ink text-[13px] text-left space-y-0.5">
                <div>{SITE.bank.name} — <b className="font-mono">{SITE.bank.accountNumber}</b></div>
                <div>{SITE.bank.holder}</div>
                <div className="text-mute">Số tiền: <b className="text-ink">{formatVND(placed.total)}</b></div>
                <div className="text-mute">Nội dung CK: {placed.code} {placed.phone}</div>
              </div>
            </div>

            <p className="mt-3 text-[12.5px] text-white/70 leading-relaxed">
              Quét mã QR bằng app ngân hàng bất kỳ để chuyển khoản đúng số tiền. Hilitek sẽ gọi lại số{" "}
              <span className="font-mono">{placed.phone}</span> để xác nhận và giao hàng sau khi nhận được tiền.
            </p>

            <button onClick={closeOrder} className="mt-4 w-full bg-white text-navy font-bold py-2.5 rounded-md text-[13px]">
              Đã hiểu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function inp(err) {
  return (
    "w-full border rounded-md px-3 py-2 text-[14px] outline-none bg-white text-ink placeholder:text-mute " +
    (err ? "border-sale" : "border-line focus:border-navy")
  );
}
