import React, { useState } from "react";
import { submitNeed } from "../lib/api.js";

/** Khách ghi nhu cầu, ngân sách, số Zalo. Thông tin lưu vào ghi chú khách hàng trong app quản lý. */
export default function NeedForm({ title = "Chưa rành linh kiện? Hili chọn giúp bạn", placeholder = "Bộ máy chơi Valorant", budgetHint = "20 triệu" }) {
  const [need, setNeed] = useState("");
  const [budget, setBudget] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (busy || sent) return;
    const z = phone.replace(/\D/g, "");
    if (!need.trim()) { setMsg("Bạn ghi giúp Hili đang cần gì nhé."); return; }
    if (!/^0\d{8,10}$/.test(z)) { setMsg("Số Zalo chưa đúng, bạn kiểm tra lại giúp Hili."); return; }
    setBusy(true); setMsg("Đang gửi…");
    try {
      await submitNeed({ need: need.trim(), budget: budget.trim(), phone: z });
      setSent(true); setMsg("Hili đã nhận nhu cầu của bạn và sẽ nhắn qua Zalo.");
    } catch (e2) {
      setMsg(e2.message || "Chưa gửi được, bạn thử lại giúp Hili.");
    } finally { setBusy(false); }
  };
  const field = "mt-1 block w-full rounded-lg border-0 bg-white px-3 py-2.5 text-[16px] text-ink outline-none focus:ring-2 focus:ring-navy";
  return (
    <form onSubmit={submit} className="rounded-2xl bg-yellow p-5 text-ink sm:p-7">
      <h2 className="font-display text-[30px] sm:text-[38px] font-bold leading-tight">{title}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-[2fr_1fr_1fr_auto] md:items-end">
        <label className="text-[14px] font-medium">Bạn cần gì<input className={field} value={need} onChange={(e) => setNeed(e.target.value)} placeholder={placeholder} /></label>
        <label className="text-[14px] font-medium">Ngân sách<input className={field} value={budget} onChange={(e) => setBudget(e.target.value)} placeholder={budgetHint} /></label>
        <label className="text-[14px] font-medium">Số Zalo<input className={field} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="0900 000 000" /></label>
        <button type="submit" disabled={busy || sent} className="min-h-[46px] rounded-lg bg-ink px-5 font-semibold text-white hover:bg-navy disabled:opacity-60">{sent ? "Đã gửi" : "Gửi cho Hili"}</button>
      </div>
      <p role="status" className="mt-2 min-h-[22px] text-[15px] font-medium">{msg}</p>
    </form>
  );
}
