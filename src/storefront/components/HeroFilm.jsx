import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { formatVND } from "../lib/format.js";
import { HOME_HERO } from "../config.js";
import "./hero-film.css";

const MS = 5200;
const COLORS = [["#0B1140", "#2C3FD0"], ["#101A5C", "#3A6BE0"], ["#1E2A8A", "#5468F0"], ["#0E1650", "#2C8FD0"]];
// Dùng khi chủ shop chưa cấu hình mục "Màn trình chiếu".
const DEFAULTS = [
  { title: "Nimbus 65", match: /nimbus 65/i, image: "/home/cut-nimbus.webp" },
  { title: "Echo 75", match: /voicsky echo 75/i, image: "/home/cut-echo.webp" },
  { title: "Apex 75", match: /voicsky apex 75/i, image: "/home/cut-apex.webp" },
  { title: "Pulse 75", match: /voicsky pulse 75/i, image: "/home/cut-pulse.webp" },
  { title: "Pulse 96", match: /voicsky pulse 96/i, image: "/home/cut-pulse96.webp" },
  { title: "Atmos 87", match: /voicsky atmos 87/i, image: "/home/cut-atmos87.webp" },
];

/** Tên ngắn cho slide: bỏ phần loại hàng đứng trước tên hãng. */
function shortName(p) {
  const n = String(p.name || "").split(" (")[0].replace(/^(bàn phím( cơ)?( không dây)?|chuột( gaming)?( không dây)?|màn hình( gaming)?|tai nghe)\s+/i, "");
  const brand = String(p.brand || "").toLowerCase();
  return brand && n.toLowerCase().startsWith(`${brand} `) ? n.slice(brand.length + 1) : n;
}
const TAPE = ["Hàng chính hãng", "Bảo hành theo serial", "Đủ hoá đơn VAT", "Giao nhanh toàn quốc", "Kỹ thuật tận nơi", "Báo giá doanh nghiệp"];

/** Màn đầu trang chủ: sản phẩm nổi bật tự chuyển, tên sản phẩm chạy nền, dãy chữ chạy bên dưới. */
export default function HeroFilm({ products, navigate }) {
  const slides = useMemo(
    () => {
      const list = HOME_HERO.length
        ? HOME_HERO.map((h) => ({ ...h, p: products.find((x) => x.id === h.productId) }))
        : DEFAULTS.map((d) => ({ ...d, p: products.find((x) => d.match.test(x.name)) }));
      return list.filter((s) => s.p).map((s, k) => {
        const first = s.p.images?.[0];
        const title = (s.title && s.title.trim()) || shortName(s.p);
        const parts = title.trim().split(/\s+/);
        return {
          ...s, key: `${s.p.id}-${k}`, title, cut: !!s.image, img: s.image || first?.src || first || "",
          head: parts.length > 1 ? parts.slice(0, -1).join(" ") : title,
          tail: parts.length > 1 ? parts[parts.length - 1] : "",
          word: parts[0], sub: (s.sub && s.sub.trim()) || s.p.category || "",
          bg: COLORS[k % COLORS.length][0], glow: COLORS[k % COLORS.length][1],
        };
      });
    },
    [products],
  );
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);
  const [round, setRound] = useState(0);
  const touch = useRef(null);
  const n = slides.length;
  const go = useCallback((k) => { setI((k + n) % n); setRound((r) => r + 1); }, [n]);

  useEffect(() => {
    if (hold || n < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const t = setTimeout(() => setI((v) => (v + 1) % n), MS);
    return () => clearTimeout(t);
  }, [i, hold, n, round]);

  if (!n) return null;
  const cur = slides[Math.min(i, n - 1)];
  const open = (to) => (e) => { e.preventDefault(); navigate(to.slice(1)); };
  const all = "/danh-muc";

  return (
    <>
      <section
        className="hf" aria-roledescription="carousel" aria-label="Sản phẩm nổi bật"
        style={{ "--bg": cur.bg, "--glow": cur.glow, "--ms": `${MS}ms` }}
        onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)}
        onFocus={() => setHold(true)} onBlur={() => setHold(false)}
        onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const d = e.changedTouches[0].clientX - (touch.current ?? 0);
          if (Math.abs(d) > 44) go(i + (d < 0 ? 1 : -1));
        }}
      >
        {slides.map((s, k) => (
          <div key={s.key} className={"hf-s" + (k === i ? " on" : "")} aria-hidden={k !== i}>
            <div className="hf-word">{s.word}</div>
            <img className={"hf-kb" + (s.cut ? "" : " plain")} src={s.img} alt={s.p.name} fetchpriority={k === 0 ? "high" : undefined} />
            <div className="hf-tx">
              <p className="hf-a">{s.sub}</p>
              <h2 className="hf-b">{s.head} <em>{s.tail}</em></h2>
              <p className="hf-c">{formatVND(s.p.price)}</p>
              <div className="hf-d">
                <a href={`/san-pham/${s.p.slug}`} tabIndex={k === i ? undefined : -1} onClick={open(`/san-pham/${s.p.slug}`)} className="hf-btn">Xem sản phẩm <ArrowRight size={16} /></a>
                <a href={all} tabIndex={k === i ? undefined : -1} onClick={open(all)} className="hf-btn ghost">Tất cả sản phẩm</a>
              </div>
            </div>
          </div>
        ))}
        {n > 1 && (
          <div className="hf-nav">
            <div className="hf-ticks">
              {slides.map((s, k) => (
                <button key={s.key} type="button" aria-label={`Xem ${s.title}`} aria-current={k === i} onClick={() => go(k)} className={k === i ? (hold ? "on hold" : "on") : k < i ? "done" : ""}><i key={`${i}-${round}`} /></button>
              ))}
            </div>
            <button type="button" aria-label="Sản phẩm trước" className="hf-ar" onClick={() => go(i - 1)}><ChevronLeft size={20} /></button>
            <button type="button" aria-label="Sản phẩm sau" className="hf-ar" onClick={() => go(i + 1)}><ChevronRight size={20} /></button>
          </div>
        )}
      </section>
      <div className="hf-tape" aria-hidden="true">
        <div>{[...TAPE, ...TAPE, ...TAPE, ...TAPE].map((t, k) => <span key={k}>{t}</span>)}</div>
      </div>
    </>
  );
}
