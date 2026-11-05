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
  // Kênh chưa có link thì ẩn hẳn, không hiện nút mờ bấm không được trước mặt khách.
  const items = (SITE.socials || []).filter((s) => s.href && !/^C</.test(s.href));
  if (!items.length) return null;

  return (
    <div className={className}>
      {title && <div className={"text-[13px] uppercase tracking-wide mb-2 " + titleClass}>{title}</div>}
      <div className="flex flex-wrap gap-2">
        {items.map((s) => {
          const style = STYLE[s.kind] || { icon: Link2, bg: "bg-mute" };
          const Icon = style.icon;
          return (
            <a
              key={s.kind + s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              title={s.label}
              className={
                "inline-flex items-center gap-1.5 rounded-full pl-2 pr-3 py-1.5 text-[13px] font-medium text-white hover:brightness-110 " +
                style.bg
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
