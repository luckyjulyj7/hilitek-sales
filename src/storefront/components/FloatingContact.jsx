import React, { useEffect, useState } from "react";
import { Phone, MessageCircle, MessagesSquare, ChevronUp } from "lucide-react";
import { SITE } from "../config.js";

/** Cụm liên hệ nổi góc phải — chuẩn website bán hàng VN (Zalo / Messenger / gọi). */
export default function FloatingContact() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed right-3 bottom-3 z-40 flex flex-col items-center gap-2 print:hidden">
      <Bubble href={SITE.zaloHref} label="Chat Zalo" bg="bg-[#0068FF]" pulse>
        <MessageCircle size={22} />
      </Bubble>
      <Bubble href={SITE.messengerHref} label="Messenger" bg="bg-[#0A7CFF]">
        <MessagesSquare size={22} />
      </Bubble>
      <Bubble href={"tel:" + SITE.phoneRaw} label={"Gọi " + SITE.phone} bg="bg-navy" pulse>
        <Phone size={22} />
      </Bubble>
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Lên đầu trang"
          className="w-11 h-11 grid place-items-center rounded-full bg-white text-navy border border-line shadow-card hover:bg-navy-050"
        >
          <ChevronUp size={20} />
        </button>
      )}
    </div>
  );
}

function Bubble({ href, label, bg, pulse, children }) {
  return (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      aria-label={label}
      title={label}
      className={`relative w-11 h-11 grid place-items-center rounded-full text-white shadow-card ${bg} hover:brightness-110`}
    >
      {pulse && <span className={`absolute inset-0 rounded-full ${bg} opacity-60 animate-ping`} />}
      <span className="relative">{children}</span>
    </a>
  );
}
