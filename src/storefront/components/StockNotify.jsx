import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { submitStockAlert } from "../lib/api.js";

/** Mở hộp "Báo khi có hàng" từ bất kỳ đâu, không cần truyền state qua nhiều lớp. */
export const askStockAlert = (product) =>
  window.dispatchEvent(new CustomEvent("hili:stock-alert", { detail: { id: product.id, name: product.name } }));

/** Khách để lại tên và số điện thoại, thông tin lưu vào ghi chú khách hàng trong app quản lý. */
export default function StockNotify() {
  const [product, setProduct] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const open = (e) => { setProduct(e.detail); setErr(""); setDone(false); };
    window.addEventListener("hili:stock-alert", open);
    return () => window.removeEventListener("hili:stock-alert", open);
  }, []);

  useEffect(() => {
    if (!product) return undefined;
    const esc = (e) => { if (e.key === "Escape") setProduct(null); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [product]);

  if (!product) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    const cleanPhone = phone.replace(/\s/g, "");
    if (!name.trim()) { setErr("Bạn nhập giúp Hili họ tên nhé."); return; }
    if (!/^0\d{8,10}$/.test(cleanPhone)) { setErr("Số điện thoại chưa đúng, bạn kiểm tra lại giúp Hili."); return; }
    setErr(""); setSending(true);
    try {
      await submitStockAlert(name.trim(), cleanPhone, product.id);
      setDone(true);
    } catch (e2) {
      setErr(e2.message || "Chưa gửi được, bạn thử lại giúp Hili.");
    } finally {
      setSending(false);
    }
  };

  const field = "mt-1 block w-full border-0 border-b-2 border-ink bg-transparent py-2 text-[18px] outline-none focus:border-navy";
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/60 p-4 font-sans" onClick={() => setProduct(null)}>
      <div role="dialog" aria-modal="true" aria-label="Báo khi có hàng" className="relative w-full max-w-md bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <button type="button" aria-label="Đóng" onClick={() => setProduct(null)} className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center text-mute hover:text-ink">
          <X size={20} />
        </button>
        <h3 className="pr-10 font-display text-[32px] font-bold leading-none text-ink">Báo khi có hàng</h3>
        <p className="mt-3 text-[15px] text-mute">{product.name}</p>
        {done ? (
          <>
            <p className="mt-4 text-[16px] text-ink">Hili đã ghi nhận. Hàng về Hili sẽ liên hệ bạn ngay.</p>
            <button type="button" onClick={() => setProduct(null)} className="mt-5 min-h-[48px] w-full bg-ink font-semibold text-white">Đóng</button>
          </>
        ) : (
          <form onSubmit={submit} className="mt-4 space-y-4">
            <label className="block text-[14px] text-mute">Họ tên
              <input autoFocus className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </label>
            <label className="block text-[14px] text-mute">Số điện thoại Zalo
              <input className={field} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="0900 000 000" />
            </label>
            {err && <p role="alert" className="text-[14px] text-[#B3261E]">{err}</p>}
            <button type="submit" disabled={sending} className="min-h-[48px] w-full bg-yellow font-semibold text-ink disabled:opacity-60">
              {sending ? "Đang gửi…" : "Gửi cho Hili"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
