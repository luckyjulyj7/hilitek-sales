import React, { useCallback, useEffect, useRef, useState } from "react";

const W = 480;
const H = 300;
const WORD = "HILITEK";
const INK = "#060A2A";
const YELLOW = "#F7C600";
const FONT = "800 22px Archivo, sans-serif";

function fresh() {
  return { mode: "title", x: W / 2, keys: [], got: 0, hearts: 4, spawn: 0, speed: 92, flash: 0, t: 0 };
}

function keycap(c, x, y, s, ch, on) {
  c.fillStyle = on ? "#A98600" : "#0B0F33";
  c.fillRect(x - s / 2, y - s / 2 + 4, s, s);
  c.fillStyle = on ? YELLOW : "#2B3590";
  c.fillRect(x - s / 2, y - s / 2, s, s - 3);
  c.fillStyle = on ? INK : "#fff";
  c.font = FONT;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText(ch, x, y);
}

function draw(c, g) {
  const sky = c.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, INK);
  sky.addColorStop(1, "#1E2A8A");
  c.fillStyle = sky;
  c.fillRect(0, 0, W, H);
  c.fillStyle = "rgba(255,255,255,.5)";
  for (let i = 0; i < 26; i += 1) {
    const y = (i * 53 + g.t * (12 + (i % 3) * 10)) % H;
    c.fillRect((i * 97) % W, y, 2, 2);
  }

  if (g.mode === "title") {
    const n = Math.min(WORD.length, Math.floor(g.t * 7));
    for (let i = 0; i < n; i += 1) keycap(c, W / 2 + (i - 3) * 50, 112, 42, WORD[i], true);
    c.textAlign = "center";
    c.fillStyle = "#fff";
    c.font = "700 24px Archivo, sans-serif";
    c.fillText("Hứng đúng thứ tự chữ", W / 2, 180);
    if (Math.floor(g.t * 2) % 2 === 0) {
      c.fillStyle = YELLOW;
      c.font = "800 24px Archivo, sans-serif";
      c.fillText("Bấm START", W / 2, 228);
    }
    return;
  }

  [...WORD].forEach((ch, i) => keycap(c, 24 + i * 34, 26, 28, ch, i < g.got));
  c.textAlign = "right";
  c.fillStyle = "#FF5A5F";
  c.font = FONT;
  c.fillText("♥".repeat(g.hearts), W - 14, 28);

  g.keys.forEach((k) => keycap(c, k.x, k.y, 38, k.ch, true));
  c.fillStyle = g.flash > 0 ? "#fff" : YELLOW;
  c.fillRect(g.x - 42, H - 26, 84, 10);
  c.fillStyle = "#A98600";
  c.fillRect(g.x - 42, H - 16, 84, 4);

  if (g.mode === "win" || g.mode === "over") {
    c.fillStyle = "rgba(6,10,42,.82)";
    c.fillRect(0, 0, W, H);
    c.textAlign = "center";
    c.fillStyle = g.mode === "win" ? YELLOW : "#fff";
    c.font = "800 34px Archivo, sans-serif";
    c.fillText(g.mode === "win" ? "Bạn gõ đủ HILITEK!" : "Hết lượt rồi", W / 2, 124);
    c.fillStyle = "#fff";
    c.font = "600 22px Archivo, sans-serif";
    c.fillText("Bấm START để chơi lại", W / 2, 176);
  }
}

function step(g, dt, dir) {
  g.t += dt;
  g.flash = Math.max(0, g.flash - dt);
  if (g.mode !== "play") return;
  g.x = Math.max(44, Math.min(W - 44, g.x + dir * 340 * dt));
  g.spawn -= dt;
  if (g.spawn <= 0) {
    const need = WORD[g.got];
    const others = [...new Set(WORD)].filter((ch) => ch !== need);
    const ch = Math.random() < 0.76 ? need : others[Math.floor(Math.random() * others.length)];
    g.keys.push({ x: 40 + Math.random() * (W - 80), y: 56, ch });
    g.spawn = Math.max(0.62, 1.05 - g.got * 0.06);
  }
  g.keys = g.keys.filter((k) => {
    k.y += g.speed * dt;
    if (k.y > H - 44 && k.y < H - 12 && Math.abs(k.x - g.x) < 54) {
      if (k.ch === WORD[g.got]) {
        g.got += 1;
        g.speed += 7;
        g.flash = 0.15;
        if (g.got === WORD.length) g.mode = "win";
      } else {
        g.hearts -= 1;
        if (g.hearts <= 0) g.mode = "over";
      }
      return false;
    }
    return k.y < H + 30;
  });
}

/**
 * Máy cầm tay Hilitek chơi được ngay trên trang. Trò chơi tự vẽ, không dùng tài nguyên của game nào khác.
 * Điều khiển bằng nút trên máy, phím mũi tên hoặc chạm vào hai nửa màn hình.
 */
export default function HiliPlay() {
  const canvas = useRef(null);
  const game = useRef(fresh());
  const dir = useRef(0);
  const [held, setHeld] = useState("");

  const start = useCallback(() => {
    game.current = { ...fresh(), mode: "play" };
  }, []);

  useEffect(() => {
    const el = canvas.current;
    const c = el.getContext("2d");
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = 0;
    let seen = true;
    const loop = (now) => {
      raf = 0;
      if (!seen || document.hidden) return;
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      step(game.current, dt, dir.current);
      draw(c, game.current);
      raf = requestAnimationFrame(loop);
    };
    const wake = () => { if (!raf && seen && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(loop); } };
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; wake(); }, { threshold: 0.1 });
    io.observe(el);
    document.addEventListener("visibilitychange", wake);
    if (still) { game.current.t = 2; draw(c, game.current); }
    document.fonts?.ready.then(wake);

    const onKey = (e) => {
      const down = e.type === "keydown";
      if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || "") || !seen) return;
      const g = game.current;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        if (g.mode !== "play") return;
        e.preventDefault();
        const d = e.key === "ArrowLeft" ? -1 : 1;
        if (down) dir.current = d; else if (dir.current === d) dir.current = 0;
        setHeld(down ? e.key : "");
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
    };
  }, []);

  const hold = (d, key) => ({
    onPointerDown: (e) => { e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); dir.current = d; setHeld(key); },
    onPointerUp: () => { dir.current = 0; setHeld(""); },
    onPointerCancel: () => { dir.current = 0; setHeld(""); },
  });

  const onScreen = (e) => {
    if (game.current.mode !== "play") { start(); return; }
    const r = e.currentTarget.getBoundingClientRect();
    dir.current = e.clientX < r.left + r.width / 2 ? -1 : 1;
  };

  return (
    <div className="hp" role="group" aria-label="Máy cầm tay Hilitek chơi thử">
      <div className="hp-grip hp-grip-l">
        <div className="hp-pad" aria-label="Di chuyển">
          <button type="button" aria-label="Sang trái" className={"hp-d hp-d-l" + (held === "ArrowLeft" ? " dn" : "")} {...hold(-1, "ArrowLeft")} />
          <button type="button" aria-label="Sang phải" className={"hp-d hp-d-r" + (held === "ArrowRight" ? " dn" : "")} {...hold(1, "ArrowRight")} />
          <span className="hp-d hp-d-u" /><span className="hp-d hp-d-b" /><span className="hp-d-c" />
        </div>
      </div>
      <div className="hp-screen">
        <canvas ref={canvas} width={W} height={H} onPointerDown={onScreen} onPointerUp={() => { dir.current = 0; }} />
      </div>
      <div className="hp-grip hp-grip-r">
        <button type="button" className="hp-key" onClick={start}>START</button>
      </div>
    </div>
  );
}
