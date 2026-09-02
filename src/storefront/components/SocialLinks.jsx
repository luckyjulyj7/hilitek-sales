import React from "react";
import { Facebook, Youtube, MessageCircle, ShoppingBag, Music2, Link2 } from "lucide-react";
import { SITE } from "../config.js";

const STYLE = {
  facebook: { icon: Facebook, bg: "bg-[#1877F2]" },
  zalo: { icon: MessageCircle, bg: "bg-[#0068FF]" },
  shopee: { icon: ShoppingBag, bg: "bg-[#EE4D2D]" },
  tiktok: { icon: Music2, bg: "bg-ink" },
  youtube: { icon: Youtube, bg: "bg-[#FF0000]" },
};

/** Các kênh bán hàng / mạng xã hội (SITE.socials trong config.js) — pill có màu theo nền tảng. */
export default function SocialLinks({ title = "Kênh chính thức", titleClass = "text-mute", className = "" }) {
  const items = SITE.socials || [];
  if (!items.length) return null;

  return (
    <div className={className}>
      {title && <div className={"text-[12px] uppercase tracking-wide mb-2 " + titleClass}>{title}</div>}
      <div className="flex flex-wrap gap-2">
        {items.map((s) => {
          const style = STYLE[s.kind] || { icon: Link2, bg: "bg-mute" };
          const Icon = style.icon;
          const missing = /^C</.test(s.href || "");
          return (
            <a
              key={s.kind + s.label}
              href={missing ? undefined : s.href}
              target="_blank"
              rel="noreferrer"
              title={missing ? `${s.label} — chưa gắn link` : s.label}
              className={
                "inline-flex items-center gap-1.5 rounded-full pl-2 pr-3 py-1.5 text-[12.5px] font-medium text-white " +
                style.bg +
                (missing ? " opacity-40 cursor-not-allowed" : " hover:brightness-110")
              }
            >
              <Icon size={14} /> {s.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}
