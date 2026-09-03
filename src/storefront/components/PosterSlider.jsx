import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PosterSlot from "./PosterSlot.jsx";

/**
 * Poster chính có thể chạy slide nhiều ảnh.
 *  - slot.slides: [{ image, href }]  -> 2 ảnh trở lên = tự chạy (mỗi `interval` ms) + nút ‹ › + chấm.
 *  - không có slides -> fallback slot.image đơn, hoặc khung gợi ý (PosterSlot).
 */
export default function PosterSlider({ slot, navigate, interval = 5000, className = "" }) {
  const { w, h, image: image0, href: link0 } = slot || {};
  const fromSlides = ((slot && slot.slides) || []).filter((s) => s && s.image);
  const list = fromSlides.length ? fromSlides : image0 ? [{ image: image0, href: link0 }] : [];

  const [idx, setIdx] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    if (idx > list.length - 1) setIdx(0);
  }, [list.length, idx]);

  useEffect(() => {
    if (list.length < 2) return;
    const t = setInterval(() => {
      if (!paused.current) setIdx((i) => (i + 1) % list.length);
    }, interval);
    return () => clearInterval(t);
  }, [list.length, interval]);

  if (list.length === 0) {
    return <PosterSlot slot={slot} navigate={navigate} className={className} />;
  }

  const style = w && h ? { aspectRatio: `${w} / ${h}` } : undefined;
  const openLink = (link) => (e) => {
    if (!link) return;
    if (link.startsWith("#") || link.startsWith("/")) {
      e.preventDefault();
      navigate?.(link.replace(/^#/, ""));
    }
  };
  const prev = (e) => { e.preventDefault(); setIdx((i) => (i - 1 + list.length) % list.length); };
  const next = (e) => { e.preventDefault(); setIdx((i) => (i + 1) % list.length); };

  return (
    <div
      className={"group relative w-full max-w-full overflow-hidden rounded-md border border-line bg-white " + className}
      style={style}
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
    >
      {list.map((s, i) => (
        <a
          key={i}
          href={s.href || "#"}
          onClick={openLink(s.href)}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === idx ? 1 : 0, pointerEvents: i === idx ? "auto" : "none" }}
          aria-hidden={i === idx ? undefined : true}
          tabIndex={i === idx ? undefined : -1}
        >
          <img src={s.image} alt={"Poster " + (i + 1)} className="w-full h-full object-cover" loading={i === 0 ? "eager" : "lazy"} />
        </a>
      ))}

      {list.length > 1 && (
        <>
          <button
            type="button" onClick={prev} aria-label="Ảnh trước"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white text-ink rounded-full p-1.5 shadow-card opacity-0 group-hover:opacity-100 transition"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button" onClick={next} aria-label="Ảnh sau"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white text-ink rounded-full p-1.5 shadow-card opacity-0 group-hover:opacity-100 transition"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
            {list.map((_, i) => (
              <button
                key={i} type="button" onClick={() => setIdx(i)} aria-label={"Tới ảnh " + (i + 1)}
                className={"h-2 rounded-full transition-all " + (i === idx ? "w-5 bg-yellow" : "w-2 bg-white/70 hover:bg-white")}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
