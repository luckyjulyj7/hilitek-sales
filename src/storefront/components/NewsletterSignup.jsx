import React, { useState } from "react";
import { submitLead } from "../lib/api.js";

/**
 * Băng "Đăng ký để nhận ưu đãi" — Họ tên + SĐT (bắt buộc) + Email (không bắt buộc), hiện ở
 * chân trang (mọi trang, xem Footer.jsx). Khách gửi form này chỉ là khách TIỀM NĂNG (chưa mua gì)
 * nên vẫn được tự thêm vào danh sách "Khách hàng" ở app quản lý — xem upsertWebCustomer() ở
 * api/web/_supa.js, gọi qua submitLead() (dùng chung endpoint /api/web/orders, cờ leadOnly).
 */
export default function NewsletterSignup() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    setErr(""); setMsg("");
    if (!name.trim()) { setErr("Vui lòng nhập họ và tên."); return; }
    if (!/^0\d{8,10}$/.test(phone.replace(/\s/g, ""))) { setErr("Số điện thoại chưa đúng."); return; }
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) { setErr("Email chưa đúng định dạng."); return; }
    setSending(true);
    try {
      await submitLead(name.trim(), phone.replace(/\s/g, ""), email.trim());
      setMsg("Cảm ơn bạn đã đăng ký! Hilitek sẽ liên hệ khi có ưu đãi mới.");
      setName(""); setPhone(""); setEmail("");
    } catch (e2) {
      setErr(e2.message || "Không gửi được, vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1180px] px-4 pt-10 font-sans">
      <div className="hx-deal">
        <div className="hx-ticket">
          <span className="pct" aria-hidden="true">%</span>
          <h3>Nhận mã ưu đãi<br />từ Hilitek</h3>
          <p>Chỉ mất 3 giây. Có hàng mới, giảm giá, Hili nhắn bạn trước.</p>
        </div>
        <form onSubmit={submit} className="hx-form">
          <label>Họ và tên<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập họ và tên" autoComplete="name" /></label>
          <label>Số điện thoại<input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xx xxx xxx" inputMode="tel" autoComplete="tel" /></label>
          <label>Email (không bắt buộc)<input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ban@gmail.com" inputMode="email" autoComplete="email" /></label>
          <button type="submit" disabled={sending} className="hx-key y disabled:opacity-60">{sending ? "Đang gửi…" : "Nhận ưu đãi"}</button>
          <p role="status" className="msg" style={err ? { color: "#FF8A80" } : undefined}>{err || msg}</p>
        </form>
      </div>
    </div>
  );
}
