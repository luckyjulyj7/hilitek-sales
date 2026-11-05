import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { formatVND } from "../lib/format.js";
import { href } from "../router.js";
import "./hero-film.css";

const MS = 5200;
const SLIDES = [
  { word: "Nimbus", match: /nimbus 65/i, img: "/home/cut-nimbus.webp", bg: "#0B1140", glow: "#2C3FD0" },
  { word: "Echo", match: /voicsky echo 75/i, img: "/home/cut-echo.webp", bg: "#101A5C", glow: "#3A6BE0" },
  { word: "Apex", match: /voicsky apex 75/i, img: "/home/cut-apex.webp", bg: "#1E2A8A", glow: "#5468F0" },
  { word: "Pulse", match: /voicsky pulse 75/i, img: "/home/cut-pulse.webp", bg: "#0E1650", glow: "#2C8FD0" },
];
const TAPE = ["Hàng chính hãng", "Bảo hành theo serial", "Đủ hoá đơn VAT", "Giao nhanh toàn quốc", "Kỹ thuật tận nơi", "Báo giá doanh nghiệp"];

/** Màn đầu trang chủ: sản phẩm nổi bật tự chuyển, tên sản phẩm chạy nền, dãy chữ chạy bên dưới. */
export default function HeroFilm({ products, navigate }) {
  const slides = useMemo(
    () => SLIDES.map((s) => ({ ...s, p: products.find((x) => s.match.test(x.name)) })).filter((s) => s.p),
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
  const all = href("/danh-muc", { group: "Bàn phím" });

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
          <div key={s.word} className={"hf-s" + (k === i ? " on" : "")} aria-hidden={k !== i}>
            <div className="hf-word">{s.word}</div>
            <img className="hf-kb" src={s.img} alt={s.p.name} fetchpriority={k === 0 ? "high" : undefined} />
            <div className="hf-tx">
              <p className="hf-a">Bàn phím cơ VOICSKY</p>
              <h2 className="hf-b">{s.word} <em>{(s.p.name.match(/\b\d{2}\b/) || [""])[0]}</em></h2>
              <p className="hf-c">{formatVND(s.p.price)}</p>
              <div className="hf-d">
                <a href={`/san-pham/${s.p.slug}`} tabIndex={k === i ? undefined : -1} onClick={open(`/san-pham/${s.p.slug}`)} className="hf-btn">Xem sản phẩm <ArrowRight size={16} /></a>
                <a href={all} tabIndex={k === i ? undefined : -1} onClick={open(all)} className="hf-btn ghost">Tất cả phím chuột</a>
              </div>
            </div>
          </div>
        ))}
        {n > 1 && (
          <div className="hf-nav">
            <div className="hf-ticks">
              {slides.map((s, k) => (
                <button key={s.word} type="button" aria-label={`Xem ${s.word}`} aria-current={k === i} onClick={() => go(k)} className={k === i ? (hold ? "on hold" : "on") : k < i ? "done" : ""}><i key={`${i}-${round}`} /></button>
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
