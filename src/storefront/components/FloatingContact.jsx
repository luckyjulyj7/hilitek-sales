import React, { useEffect, useState } from "react";
import { Phone, Mail, MessagesSquare, ChevronUp } from "lucide-react";
import { SITE } from "../config.js";

/** Cụm liên hệ nổi góc phải — Email / Messenger / Zalo / Gọi. */
export default function FloatingContact() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed right-3 bottom-3 z-40 flex flex-col items-center gap-2.5 print:hidden">
      {SITE.email && (
        <Bubble href={"mailto:" + SITE.email} label={"Email: " + SITE.email} bg="bg-[#0A7CFF]">
          <Mail size={22} />
        </Bubble>
      )}
      {SITE.messengerHref && (
        <Bubble href={SITE.messengerHref} label="Nhắn Messenger" bg="bg-[#0068FF]" pulse>
          <MessagesSquare size={22} />
        </Bubble>
      )}
      {SITE.zaloHref && (
        <Bubble href={SITE.zaloHref} label="Chat Zalo" bg="bg-white" className="border border-line hover:bg-navy-050" pulse pulseColor="bg-[#0068FF]">
          <img src="/zalo.png" alt="Zalo" className="w-8 h-8 object-contain" />
        </Bubble>
      )}
      <Bubble href={"tel:" + SITE.phoneRaw} label={"Gọi " + SITE.phone} bg="bg-navy" pulse>
        <Phone size={22} />
      </Bubble>
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Lên đầu trang"
          className="w-12 h-12 grid place-items-center rounded-full bg-white text-navy border border-line shadow-card hover:bg-navy-050"
        >
          <ChevronUp size={20} />
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
      className={`relative w-12 h-12 grid place-items-center rounded-full text-white shadow-card ${bg} ${className} hover:brightness-105`}
    >
      {pulse && <span className={`absolute inset-0 rounded-full ${pulseColor || bg} opacity-60 animate-ping`} />}
      <span className="relative grid place-items-center">{children}</span>
    </a>
  );
}
