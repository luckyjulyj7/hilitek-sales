import React, { useEffect, useRef, useState } from "react";
import { Phone, Mail, MessagesSquare, ChevronUp, X, MessageCircle } from "lucide-react";
import { SITE } from "../config.js";

/**
 * Nút liên hệ nổi góc phải. Bình thường thu gọn thành một nút mờ để không che sản phẩm,
 * bấm vào mới mở Gọi / Zalo / Messenger / Email. Trên điện thoại nằm phía trên thanh menu đáy.
 */
export default function FloatingContact() {
  const [showTop, setShowTop] = useState(false);
  const [open, setOpen] = useState(false);
  const box = useRef(null);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (!box.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items = [
    { href: "tel:" + SITE.phoneRaw, text: "Gọi " + SITE.phone, bg: "bg-navy", icon: <Phone /> },
    SITE.zaloHref && { href: SITE.zaloHref, text: "Chat Zalo", bg: "bg-white border border-line", icon: <img src="/zalo-sm.png" alt="" className="h-6 w-6 object-contain" /> },
    SITE.messengerHref && { href: SITE.messengerHref, text: "Nhắn Messenger", bg: "bg-[#0068FF]", icon: <MessagesSquare /> },
    SITE.email && { href: "mailto:" + SITE.email, text: "Gửi email", bg: "bg-[#0A7CFF]", icon: <Mail /> },
  ].filter(Boolean);

  return (
    <div
      ref={box}
      className="fixed right-2 lg:right-3 z-40 flex flex-col items-end gap-2 print:hidden"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 64px)" }}
    >
      {open && items.map((it, i) => (
        <a
          key={it.text}
          href={it.href}
          target={it.href.startsWith("http") ? "_blank" : undefined}
          rel="noreferrer"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 animate-[fc-in_.18s_ease-out_both]"
          style={{ animationDelay: `${(items.length - 1 - i) * 35}ms` }}
        >
          <span className="rounded-lg bg-ink px-2.5 py-1.5 text-[14px] font-semibold text-white shadow-card">{it.text}</span>
          <span className={`grid h-11 w-11 place-items-center rounded-full text-white shadow-card ${it.bg} [&_svg]:h-5 [&_svg]:w-5`}>{it.icon}</span>
        </a>
      ))}
      <style>{"@keyframes fc-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}"}</style>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Đóng liên hệ" : "Mở liên hệ"}
        className={"grid h-11 w-11 place-items-center rounded-full bg-navy text-white shadow-card transition-opacity duration-200 hover:opacity-100 focus-visible:opacity-100 " + (open ? "opacity-100" : "opacity-60")}
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
      </button>
      {showTop && !open && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Lên đầu trang"
          className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white text-navy opacity-60 shadow-card transition-opacity duration-200 hover:opacity-100 focus-visible:opacity-100"
        >
          <ChevronUp size={18} />
        </button>
      )}
    </div>
  );
}
