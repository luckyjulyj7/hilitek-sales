import React, { useState } from "react";
import { SITE } from "../config.js";

/**
 * Logo Hilitek — dùng ĐÚNG file ảnh của Hilitek.
 * Thứ tự thử: SITE.logo.src (mặc định /logo.png) -> SITE.logo.fallbackSrc
 * (/logo.svg, bản vẽ vector tạm) -> chỉ chữ.
 * >>> Chép file logo thật vào `hilitek-app/public/logo.png` là nó thay ngay bản tạm.
 */
export default function Logo({ size = 40, wordmark = true, className = "", textClass = "" }) {
  const chain = [SITE.logo?.src, ...(SITE.logo?.alts || []), SITE.logo?.fallbackSrc].filter(Boolean);
  const [idx, setIdx] = useState(0);
  const src = chain[idx];
  const showWord = SITE.logo?.wordmark === false ? false : wordmark;

  return (
    <span className={"flex items-center gap-2.5 " + className}>
      {src && (
        <img
          src={src}
          alt="Hilitek"
          onError={() => setIdx((i) => i + 1)}
          className="shrink-0 rounded-md object-contain"
          style={{ width: size, height: size }}
        />
      )}
      {(showWord || !src) && (
        <span className={"font-display font-bold tracking-[0.04em] leading-none " + (textClass || "text-2xl")}>
          Hilitek
        </span>
      )}
    </span>
  );
}

// Dấu Hili: 2 vạch chéo dài + chữ "i" (thân ngắn + chấm), cùng góc nghiêng như logo.
const MARK = "M4 50h8l13.1-36h-8zM18 50h8l13.1-36h-8zM32 50h8l7.3-20h-8zM40.7 26h8l2.6-7h-8z";
export function HiliMark({ className = "", style }) {
  return (
    <svg viewBox="2 12 51 40" className={className} style={style} aria-hidden="true" fill="currentColor"><path d="M4 50h8l13.1-36h-8z" opacity=".42" /><path d={MARK.replace(/^M4 50h8l13\.1-36h-8z/, "")} /></svg>
  );
}
/** Logo kiểu Hili Lab: ô vàng, dấu xanh đêm (vạch đầu mờ) + chữ HILITEK. */
export function LabLogo({ size = 40, textClass = "" }) {
  return (
    <span className="flex items-center gap-2.5">
      <svg viewBox="0 0 60 60" width={size} height={size} className="shrink-0" aria-hidden="true">
        <rect width="60" height="60" rx="14" fill="#F7C600" />
        <g fill="#0B1230" transform="translate(2.5 -2)">
          <path d="M4 50h8l13.1-36h-8z" opacity=".45" />
          <path d="M18 50h8l13.1-36h-8zM32 50h8l7.3-20h-8zM40.7 26h8l2.6-7h-8z" />
        </g>
      </svg>
      <span className={"font-display font-bold tracking-[0.04em] leading-none " + (textClass || "text-2xl")}>HILITEK</span>
    </span>
  );
}
