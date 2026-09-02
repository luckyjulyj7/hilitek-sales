import React from "react";
import { ImagePlus } from "lucide-react";

/**
 * Khung poster/banner trang chủ. Chưa có ảnh -> khung trống kèm gợi ý kích thước.
 * Có `image` -> hiện ảnh, bấm vào đi tới `href`.
 * `fill` -> chiếm trọn ô cha (không theo tỉ lệ w/h); ngược lại dùng aspect-ratio từ w/h.
 */
export default function PosterSlot({ slot, fill = false, className = "", navigate }) {
  const { image, href: link, label, w, h } = slot || {};
  const style = fill ? undefined : w && h ? { aspectRatio: `${w} / ${h}` } : undefined;
  // w-full + max-w-full: giữ chiều rộng bằng ô lưới — tránh aspect-ratio (kết hợp min-h)
  // "kéo" khung phình ngang ra ngoài màn hình trên mobile.
  const box = (fill ? "h-full " : "") + "w-full max-w-full " + className;

  const go = (e) => {
    if (!link) return;
    if (link.startsWith("#") || link.startsWith("/")) {
      e.preventDefault();
      navigate?.(link.replace(/^#/, ""));
    }
  };

  if (image) {
    return (
      <a
        href={link || "#"}
        onClick={go}
        className={"block overflow-hidden rounded-md border border-line bg-white " + box}
        style={style}
      >
        <img src={image} alt={label || "Poster"} className="w-full h-full object-cover" />
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
