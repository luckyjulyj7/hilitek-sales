import React, { useState } from "react";
import { submitLead } from "../lib/api.js";

/**
 * Băng "Đăng ký để nhận ưu đãi" — chỉ Họ tên + SĐT (giữ tối giản để khách chịu điền), hiện ở
 * chân trang (mọi trang, xem Footer.jsx). Khách gửi form này chỉ là khách TIỀM NĂNG (chưa mua gì)
 * nên vẫn được tự thêm vào danh sách "Khách hàng" ở app quản lý — xem upsertWebCustomer() ở
 * api/web/_supa.js, gọi qua submitLead() (dùng chung endpoint /api/web/orders, cờ leadOnly).
 */
export default function NewsletterSignup() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    setErr(""); setMsg("");
    if (!name.trim()) { setErr("Vui lòng nhập họ và tên."); return; }
    if (!/^0\d{8,10}$/.test(phone.replace(/\s/g, ""))) { setErr("Số điện thoại chưa đúng."); return; }
    setSending(true);
    try {
      await submitLead(name.trim(), phone.replace(/\s/g, ""));
      setMsg("Cảm ơn bạn đã đăng ký! Hilitek sẽ liên hệ khi có ưu đãi mới.");
      setName(""); setPhone("");
    } catch (e2) {
      setErr(e2.message || "Không gửi được, vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-navy-050">
      <div className="mx-auto max-w-[1500px] px-4 py-8 font-sans">
        <div className="flex items-center gap-4 mb-5">
          <div className="flex-1 h-px bg-line" />
          <h3 className="font-display text-lg sm:text-xl font-semibold text-ink text-center whitespace-nowrap">
            Đăng ký để nhận ưu đãi
          </h3>
          <div className="flex-1 h-px bg-line" />
        </div>
        <form onSubmit={submit} className="flex flex-wrap items-end justify-center gap-3">
          <label className="text-[13px] text-ink/70 flex-1 min-w-[180px] max-w-xs">
            Họ và tên
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập họ và tên"
              className="mt-1 w-full border border-line rounded-md px-3 py-2 text-[14px] bg-white text-ink outline-none focus:border-navy"
            />
          </label>
          <label className="text-[13px] text-ink/70 flex-1 min-w-[180px] max-w-xs">
            Số điện thoại
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09xx xxx xxx"
              inputMode="tel"
              className="mt-1 w-full border border-line rounded-md px-3 py-2 text-[14px] bg-white text-ink outline-none focus:border-navy"
            />
          </label>
          <button
            type="submit"
            disabled={sending}
            className="px-6 py-2.5 rounded-full bg-navy text-white font-display font-semibold text-[14px] hover:bg-navy-600 disabled:opacity-60 whitespace-nowrap"
          >
            {sending ? "ĐANG GỬI…" : "ĐĂNG KÝ"}
          </button>
        </form>
        {msg && <p className="mt-3 text-[13px] text-center font-medium" style={{ color: "#1a7a3c" }}>{msg}</p>}
        {err && <p className="mt-3 text-[13px] text-center text-sale">{err}</p>}
      </div>
    </div>
  );
}
