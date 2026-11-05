import React, { useEffect, useRef, useState } from "react";
import "./hili-keys.css";

const WORD = [..."HILITEK"];

/**
 * Bàn phím chữ HILITEK: phím rơi xuống khi cuộn tới, nhấn và sáng mỗi 10 giây, bấm được từng phím
 * và nhấn theo khi khách gõ H I L I T E K trên bàn phím thật.
 */
export default function HiliKeys() {
  const box = useRef(null);
  const [seen, setSeen] = useState(false);
  const [down, setDown] = useState(() => new Set());
  const timers = useRef(new Set());

  const later = (fn, ms) => {
    const t = setTimeout(() => { timers.current.delete(t); fn(); }, ms);
    timers.current.add(t);
  };
  const press = (i, ms = 170) => {
    setDown((s) => new Set(s).add(i));
    later(() => setDown((s) => { const n = new Set(s); n.delete(i); return n; }), ms);
  };
  const wave = () => WORD.forEach((_, i) => later(() => press(i, 200), i * 85));

  useEffect(() => {
    // Phím nhấn một lượt và sáng lên mỗi 10 giây, chỉ khi khách đang nhìn thấy khối này.
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let loop = null;
    const stop = () => { clearInterval(loop); loop = null; };
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) { stop(); return; }
      setSeen(true);
      if (still || loop) return;
      later(wave, 1300);
      loop = setInterval(() => { if (!document.hidden) wave(); }, 10000);
    }, { threshold: 0.35 });
    io.observe(box.current);

    let typed = "";
    const onKey = (e) => {
      if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || e.repeat) return;
      const c = e.key.toUpperCase();
      const hits = WORD.flatMap((ch, i) => (ch === c ? [i] : []));
      if (!hits.length) { typed = ""; return; }
      hits.forEach((i) => press(i));
      typed = (typed + c).slice(-7);
      if (typed === "HILITEK") { later(wave, 180); later(wave, 800); }
    };
    window.addEventListener("keydown", onKey);
    const all = timers.current;
    return () => {
      io.disconnect();
      stop();
      window.removeEventListener("keydown", onKey);
      all.forEach(clearTimeout);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={box} className={"hk" + (seen ? " in" : "")} role="img" aria-label="Hilitek">
      <div className="hk-plate">
        {WORD.map((ch, i) => (
          <div key={i} className={"hk-key" + (down.has(i) ? " dn" : "")} style={{ "--i": i }} onPointerDown={() => press(i)}>
            <div className="hk-cap"><b>{ch}</b></div>
          </div>
        ))}
      </div>
    </div>
  );
}
