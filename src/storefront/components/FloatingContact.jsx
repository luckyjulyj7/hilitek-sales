import React, { useEffect, useState } from "react";
import { Phone, Mail, MessagesSquare, ChevronUp } from "lucide-react";
import { SITE } from "../config.js";

/** Cụm liên hệ nổi góc phải — Email / Messenger / Zalo / Gọi.
 *  Trên điện thoại: bong bóng nhỏ lại và nằm phía trên thanh menu đáy. */
export default function FloatingContact() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="fixed right-2 lg:right-3 z-40 flex flex-col items-center gap-2 lg:gap-2.5 print:hidden"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 64px)" }}
    >
      {SITE.email && (
        <Bubble href={"mailto:" + SITE.email} label={"Email: " + SITE.email} bg="bg-[#0A7CFF]">
          <Mail />
        </Bubble>
      )}
      {SITE.messengerHref && (
        <Bubble href={SITE.messengerHref} label="Nhắn Messenger" bg="bg-[#0068FF]" pulse>
          <MessagesSquare />
        </Bubble>
      )}
      {SITE.zaloHref && (
        <Bubble href={SITE.zaloHref} label="Chat Zalo" bg="bg-white" className="border border-line hover:bg-navy-050" pulse pulseColor="bg-[#0068FF]">
          <img src="/zalo.png" alt="Zalo" className="w-6 h-6 lg:w-8 lg:h-8 object-contain" />
        </Bubble>
      )}
      <Bubble href={"tel:" + SITE.phoneRaw} label={"Gọi " + SITE.phone} bg="bg-navy" pulse>
        <Phone />
      </Bubble>
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Lên đầu trang"
          className="w-10 h-10 lg:w-12 lg:h-12 grid place-items-center rounded-full bg-white text-navy border border-line shadow-card hover:bg-navy-050"
        >
          <ChevronUp size={18} />
        </button>
      )}
    </div>
  );
}

function Bubble({ href, label, bg, pulse, pulseColor, className = "", children }) {
  return (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      aria-label={label}
      title={label}
      className={`relative w-10 h-10 lg:w-12 lg:h-12 grid place-items-center rounded-full text-white shadow-card ${bg} ${className} hover:brightness-105 [&_svg]:w-[18px] [&_svg]:h-[18px] lg:[&_svg]:w-[22px] lg:[&_svg]:h-[22px]`}
    >
      {pulse && <span className={`absolute inset-0 rounded-full ${pulseColor || bg} opacity-60 animate-ping`} />}
      <span className="relative grid place-items-center">{children}</span>
    </a>
  );
}
