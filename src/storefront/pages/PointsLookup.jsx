import React, { useState } from "react";
import { Gift, Loader2 } from "lucide-react";
import { SITE } from "../config.js";
import { lookupPoints } from "../lib/api.js";

/** /diem-tich-luy — khách tra cứu điểm tích luỹ theo SĐT (không cần đăng nhập). */
export default function PointsLookup() {
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [res, setRes] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setErr(""); setRes(null);
    if (!phone.trim()) { setErr("Nhập số điện thoại đã mua hàng."); return; }
    setBusy(true);
    try {
      setRes(await lookupPoints(phone));
    } catch (e2) {
      setErr(e2.message || "Không tra cứu được điểm tích luỹ.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 font-sans">
      <div className="flex items-center gap-2 text-navy">
        <Gift size={20} />
        <span className="font-mono text-[13px] uppercase tracking-[0.2em]">Điểm tích luỹ</span>
      </div>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink">Tra cứu điểm tích luỹ</h1>
      <p className="mt-2 text-[15px] text-ink/70 leading-relaxed">
        Mỗi đơn hàng đã hoàn thành đều được tự động cộng điểm theo số điện thoại đặt hàng.
        Nhập số điện thoại để xem điểm hiện có.
      </p>

      <form onSubmit={submit} className="mt-6 border border-line rounded-lg bg-white p-5 flex gap-3 items-end">
        <label className="block flex-1">
          <span className="block text-[13px] font-medium text-ink mb-1">Số điện thoại đặt hàng</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="09xx xxx xxx"
            inputMode="tel"
            className="w-full border border-line rounded-md px-3 py-2 text-[15px] outline-none focus:border-navy"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="h-[42px] rounded-md bg-navy text-white font-display font-bold px-5 text-[14px] tracking-wide hover:bg-navy-600 disabled:opacity-60 inline-flex items-center justify-center gap-2"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Gift size={16} />} Tra cứu
        </button>
      </form>

      {err && <p className="mt-3 text-[14px] text-sale">{err}</p>}

      {res && !res.enabled && (
        <div className="mt-5 border border-line rounded-lg bg-white p-4 text-[14px] text-mute">
          Chương trình tích điểm hiện chưa mở. Vui lòng quay lại sau.
        </div>
      )}

      {res && res.enabled && (
        <div className="mt-5 border border-line rounded-lg bg-white p-6 text-center">
          <div className="text-[13px] text-mute">Điểm hiện có</div>
          <div className="mt-1 font-display text-4xl font-bold text-navy">{res.points.toLocaleString("vi-VN")}</div>
          <div className="mt-1 text-[13px] text-mute">điểm · từ {res.orderCount} đơn hàng đã hoàn thành</div>
        </div>
      )}

      <div className="mt-5 text-[13px] text-mute leading-relaxed">
        Cần hỗ trợ? Gọi{" "}
        <a href={"tel:" + SITE.phoneRaw} className="font-mono text-navy">{SITE.phone}</a>{" "}
        hoặc Zalo <a href={SITE.zaloHref} target="_blank" rel="noreferrer" className="text-navy">{SITE.zalo}</a>.
      </div>
    </div>
  );
}
