import React, { useState } from "react";
import { ImagePlus } from "lucide-react";

/**
 * Khung poster/banner. Chưa có ảnh -> khung trống kèm gợi ý kích thước.
 * Có `image` -> hiện ảnh, bấm vào đi tới `href`.
 * `fill` -> chiếm trọn ô cha (không theo tỉ lệ w/h); ngược lại dùng aspect-ratio từ w/h.
 * `zoom` -> rê chuột vào thì phóng to ảnh, tâm phóng bám theo con trỏ (không cần bấm).
 */
export default function PosterSlot({ slot, fill = false, className = "", navigate, zoom = false }) {
  const { image, href: link, label, w, h } = slot || {};
  const style = fill ? undefined : w && h ? { aspectRatio: `${w} / ${h}` } : undefined;
  // w-full + max-w-full: giữ chiều rộng bằng ô lưới — tránh aspect-ratio (kết hợp min-h)
  // "kéo" khung phình ngang ra ngoài màn hình trên mobile.
  const box = (fill ? "h-full " : "") + "w-full max-w-full " + className;

  const [origin, setOrigin] = useState(null); // null = đang không rê chuột

  const go = (e) => {
    if (!link) return;
    if (link.startsWith("#") || link.startsWith("/")) {
      e.preventDefault();
      navigate?.(link.replace(/^#/, ""));
    }
  };

  const onMove = (e) => {
    if (!zoom) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  if (image) {
    return (
      <a
        href={link || "#"}
        onClick={go}
        onMouseMove={onMove}
        onMouseLeave={() => setOrigin(null)}
        className={
          "block overflow-hidden rounded-md border border-line bg-white " +
          (zoom ? "cursor-zoom-in " : "") + box
        }
        style={style}
      >
        <img
          src={image}
          alt={label || "Poster"}
          className="w-full h-full object-cover transition-transform duration-300 ease-out will-change-transform"
          style={zoom ? { transform: origin ? "scale(1.9)" : "scale(1)", transformOrigin: origin || "center" } : undefined}
        />
      </a>
    );
  }

  return (
    <div
      className={
        "flex flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-line " +
        "bg-navy-050/40 text-mute text-center px-3 min-h-[110px] " + box
      }
      style={style}
    >
      <ImagePlus size={20} />
      <div className="text-[12.5px] font-medium">{label || "Khu vực đặt poster"}</div>
      {w && h && <div className="text-[11px] font-mono">{w} × {h} px</div>}
    </div>
  );
}
