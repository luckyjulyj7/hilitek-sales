import React from "react";

// Ảnh chụp đã có trong public/landing/. Muse gửi ảnh nào thì thêm tên file đó vào đây;
// ảnh chưa có thì khung không hiện (không ô trống, không chú thích kiểu "ảnh minh hoạ").
export const LANDING_IMAGES = new Set([
  // "hd-hero.webp", "hd-onsite.webp", "hd-remote.webp", "hd-network.webp", "hd-printer.webp", "hd-team.webp",
  // "sw-office-team.webp", "sw-install.webp", "sw-meeting.webp", "sw-security.webp",
]);
export const hasLandingImage = (src) => LANDING_IMAGES.has(String(src || "").split("/").pop());

/** Ảnh chụp thật cho trang giới thiệu. Không có file thì không hiện gì. */
export default function LandingFigure({ src, alt, className = "", eager = false }) {
  if (!hasLandingImage(src)) return null;
  return (
    <figure className={"lp-photo " + className}>
      <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async"
        onError={(e) => { const f = e.currentTarget.closest("figure"); if (f) f.style.display = "none"; }} />
    </figure>
  );
}
