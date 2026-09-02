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
