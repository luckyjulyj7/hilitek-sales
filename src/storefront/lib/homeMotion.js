/**
 * Chuyển động và tương tác của trang chủ, chạy trên phần HTML tĩnh trong .hv.
 * GSAP và Lenis chỉ tải ở trang chủ. Trả về hàm dọn dẹp để khi rời trang không còn gì chạy nền.
 */

const TIERS = [
  { max: 3, name: "Retro", era: "Game tuổi thơ", size: "Màn hình khoảng 3,5 tới 5 inch", w: "40%", h: "42%", play: "Game cổ 8-bit tới PS1", line: "Anbernic, Miyoo, Trimui", go: "Hỏi Hili máy retro" },
  { max: 12, name: "Android", era: "Giả lập và game mobile", size: "Màn hình khoảng 5 tới 7 inch", w: "64%", h: "58%", play: "Game Android, giả lập tới PS2", line: "Retroid, Mangmi, AYN", go: "Hỏi Hili máy Android" },
  { max: 61, name: "PC cầm tay", era: "Game PC trên Steam, Xbox", size: "Màn hình khoảng 7 tới 9 inch", w: "90%", h: "76%", play: "Game PC bản quyền", line: "Steam Deck, ROG Ally, Legion Go, MSI Claw", go: "Hỏi Hili PC cầm tay" },
];
const TAPE_A = ["Hàng chính hãng", "<em>Bảo hành theo serial</em>", "Giao nhanh toàn quốc", "<em>Đổi mới 7 ngày</em>", "Đủ hoá đơn VAT"];
const TAPE_B = ["Máy cầm tay", "Gaming gear", "<em>Linh kiện PC</em>", "Màn hình", "<em>Phần mềm bản quyền</em>", "Doanh nghiệp"];

export function initHome(root, { onLead }) {
  const $ = (s) => root.querySelector(s);
  const $$ = (s) => [...root.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  const phone = innerWidth <= 820;
  const off = [];
  const on = (el, ev, fn, opt) => { el.addEventListener(ev, fn, opt); off.push(() => el.removeEventListener(ev, fn, opt)); };

  // chiều cao đầu trang: chỉ tính khi đầu trang dính ở máy tính
  const setTop = () => {
    const h = document.querySelector("header");
    root.style.setProperty("--hv-top", h && getComputedStyle(h).position === "sticky" ? `${h.offsetHeight}px` : "0px");
    root.style.setProperty("--hv-head", `${h ? h.offsetHeight : 0}px`);
  };
  setTop();

  const tape = (a) => a.map((t) => `<span>${t}</span>`).join("");
  $("#ta").innerHTML = tape(TAPE_A).repeat(6);
  $("#tb").innerHTML = tape(TAPE_B).repeat(6);

  // phím HILITEK
  const plate = $("#plate");
  plate.innerHTML = "";
  const keys = [..."HILITEK"].map((ch) => {
    const k = document.createElement("div");
    k.className = "key"; k.dataset.k = ch; k.innerHTML = `<div class="cap"><b>${ch}</b></div>`;
    plate.append(k);
    return k;
  });
  const timers = new Set();
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
  const press = (k, ms = 170) => { k.classList.add("dn"); later(() => k.classList.remove("dn"), ms); };
  const wave = () => keys.forEach((k, i) => later(() => press(k, 200), i * 85));
  keys.forEach((k) => on(k, "pointerdown", () => press(k)));
  let typed = "";
  on(window, "keydown", (e) => {
    if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || e.repeat) return;
    const c = e.key.toUpperCase();
    const hit = keys.filter((k) => k.dataset.k === c);
    if (!hit.length) { typed = ""; return; }
    hit.forEach((k) => press(k));
    typed = (typed + c).slice(-7);
    if (typed === "HILITEK") { later(wave, 180); later(wave, 800); }
  });

  // chọn máy cầm tay theo ngân sách
  const rng = $("#rng"), tabs = $$("#tabs button");
  let tierNow = -1;
  const setBud = () => {
    const v = +rng.value, m = Math.exp((Math.log(60) * v) / 100), r = m < 10 ? Math.round(m * 2) / 2 : Math.round(m);
    $("#bud").textContent = `${String(r).replace(".", ",")} triệu`;
    rng.style.setProperty("--v", `${v}%`);
    const i = TIERS.findIndex((t) => r < t.max);
    if (i === tierNow) return;
    tierNow = i;
    const t = TIERS[i];
    $("#iName").textContent = t.name; $("#iEra").textContent = t.era; $("#iSize").textContent = t.size;
    $("#iPlay").textContent = t.play; $("#iLine").textContent = t.line; $("#iGo").textContent = t.go;
    $("#scr").style.width = t.w; $("#scr").style.height = t.h;
    tabs.forEach((b, k) => { b.classList.toggle("on", k === i); b.setAttribute("aria-pressed", k === i); });
  };
  on(rng, "input", setBud);
  tabs.forEach((b) => on(b, "click", () => { rng.value = b.dataset.v; setBud(); }));
  setBud();

  // ô nhập trong câu tự giãn theo chữ
  const inputs = $$(".ask input");
  const ruler = document.createElement("span");
  ruler.style.cssText = "position:absolute;visibility:hidden;white-space:pre;left:-9999px";
  $(".ask form").append(ruler);
  const fitIn = (i) => {
    if (phone) return;
    const c = getComputedStyle(i);
    ["fontFamily", "fontSize", "fontWeight", "fontStretch", "letterSpacing"].forEach((k) => { ruler.style[k] = c[k]; });
    ruler.textContent = i.value || i.placeholder;
    i.style.width = `${ruler.getBoundingClientRect().width + parseFloat(c.fontSize) * 0.3}px`;
  };
  inputs.forEach((i) => on(i, "input", () => fitIn(i)));
  const fitAll = () => inputs.forEach(fitIn);

  // gửi nhu cầu về app quản lý
  const msg = $("#askMsg"), go = $("#go");
  on(go, "click", async () => {
    const zalo = inputs[2].value.replace(/\D/g, "");
    if (!inputs[0].value.trim()) { msg.textContent = "Bạn ghi giúp Hili đang cần gì nhé."; inputs[0].focus(); return; }
    if (!/^0\d{8,10}$/.test(zalo)) { msg.textContent = "Số Zalo chưa đúng, bạn kiểm tra lại giúp Hili."; inputs[2].focus(); return; }
    go.disabled = true; msg.textContent = "Đang gửi…";
    try {
      await onLead({ need: inputs[0].value.trim(), budget: inputs[1].value.trim(), phone: zalo });
      msg.textContent = "Hili đã nhận nhu cầu của bạn và sẽ nhắn qua Zalo.";
      $("#go span").textContent = "Đã gửi";
    } catch (e) {
      msg.textContent = e.message || "Chưa gửi được, bạn thử lại giúp Hili."; go.disabled = false;
    }
  });

  document.fonts?.ready.then(fitAll);
  let stopMotion = () => {};
  let alive = true;
  if (!reduce) {
    Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("lenis")]).then(([g, st, l]) => {
      if (alive) stopMotion = motion(g.gsap, st.ScrollTrigger, l.default);
    }).catch(() => {});
  }

  function motion(gsap, ScrollTrigger, Lenis) {
    root.classList.remove("nojs");
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95 });
    let vel = 0;
    lenis.on("scroll", (e) => { vel = e.velocity; ScrollTrigger.update(); });
    const raf = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      $$("[data-split]").forEach((h) => {
        const walk = (el) => [...el.childNodes].forEach((c) => {
          if (c.nodeType === 3) {
            const f = document.createDocumentFragment();
            c.textContent.split(/(\s+)/).forEach((t) => {
              if (!t.trim()) { f.append(t); return; }
              const w = document.createElement("span"); w.className = "w";
              const i = document.createElement("i"); i.textContent = t;
              w.append(i); f.append(w);
            });
            c.replaceWith(f);
          } else if (c.nodeType === 1) walk(c);
        });
        walk(h);
      });

      gsap.set("#kbw", { xPercent: -50, yPercent: -50, rotation: -7 });
      gsap.timeline({ scrollTrigger: { trigger: "#hero", start: "top top+=" + (parseFloat(root.style.getPropertyValue("--hv-top")) || 0), end: "+=90%", scrub: 0.7 } })
        .to(".ln.one", { xPercent: -34, autoAlpha: 0, ease: "power2.in" }, 0)
        .to(".ln.two", { xPercent: 34, autoAlpha: 0, ease: "power2.in" }, 0)
        .to(".bar", { autoAlpha: 0, y: 40, duration: 0.4 }, 0)
        .to("#kbw", { scale: phone ? 1.25 : 1.5, rotation: 5, x: () => (phone ? 0 : -innerWidth * 0.12), ease: "power1.inOut" }, 0);

      const track = $("#track"), dist = () => track.scrollWidth - innerWidth, ticks = $$("#tick i");
      const setFilm = () => { setTop(); $("#filmw").style.height = `${$("#film").offsetHeight + dist() * (phone ? 2.4 : 1.1)}px`; };
      setFilm();
      ScrollTrigger.addEventListener("refreshInit", setFilm);
      off.push(() => ScrollTrigger.removeEventListener("refreshInit", setFilm));
      const mix = gsap.utils.interpolate(["#0C1344", "#14205F", "#1E2A8A"]);
      const film = gsap.to(track, {
        x: () => -dist(), ease: "none",
        scrollTrigger: {
          trigger: "#filmw", start: () => `top top+=${parseFloat(root.style.getPropertyValue("--hv-top")) || 0}`, end: "bottom bottom", scrub: 0.8, invalidateOnRefresh: true,
          onUpdate: (s) => {
            $("#film").style.background = mix(s.progress);
            ticks.forEach((k, i) => k.style.setProperty("--p", gsap.utils.clamp(0, 1, s.progress * 3 - i)));
          },
        },
      });
      $$(".pane").forEach((p) => {
        const st2 = { containerAnimation: film, trigger: p, start: "left right", end: "right left", scrub: true };
        gsap.fromTo(p.querySelector(".word"), { x: () => innerWidth * 0.22 }, { x: () => -innerWidth * 0.22, ease: "none", scrollTrigger: st2 });
        gsap.fromTo(p.querySelector(".sh"), { rotation: 16, scale: 0.8, x: () => innerWidth * 0.1 }, { rotation: -14, scale: 1, x: () => -innerWidth * 0.1, ease: "none", scrollTrigger: { ...st2 } });
      });

      const cards = $$(".card");
      cards.forEach((c, i) => {
        const n = cards[i + 1];
        if (!n) return;
        const s = { trigger: n, start: "top bottom", end: "top top", scrub: true };
        gsap.to(c.querySelector(".in"), { scale: 0.9, ease: "none", scrollTrigger: s });
        gsap.to(c.querySelector(".dim"), { opacity: 0.62, ease: "none", scrollTrigger: { ...s } });
      });
      const enter = (el) => ({ trigger: el, start: "top bottom", end: "top top", scrub: true });
      gsap.fromTo(".c1 .ph", { scale: 1.2 }, { scale: 1, ease: "none", scrollTrigger: enter(".c1") });
      gsap.fromTo(".c2 .ph2", { scale: 1.12 }, { scale: 1, ease: "none", scrollTrigger: enter(".c2") });
      gsap.fromTo(".c3 .ph3", { y: 180 }, { y: 0, ease: "none", scrollTrigger: enter(".c3") });

      $$("[data-split]").forEach((h) => gsap.from(h.querySelectorAll(".w>i"), { yPercent: 125, rotation: 5, duration: 1.25, ease: "expo.out", stagger: 0.07, scrollTrigger: { trigger: h, start: "top 86%", once: true } }));
      $$("[data-up]").filter((e) => getComputedStyle(e).display !== "contents").forEach((e) => gsap.from(e, { y: 36, autoAlpha: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: e, start: "top 90%", once: true } }));
      gsap.from(keys, { y: -180, autoAlpha: 0, duration: 0.9, ease: "bounce.out", stagger: 0.07, scrollTrigger: { trigger: "#plate", start: "top 82%", once: true, onEnter: () => later(wave, 1400) } });

      const tp = $(".tape");
      let tapeOff = false, sk = 0;
      on(tp, "mouseenter", () => { tapeOff = true; });
      on(tp, "mouseleave", () => { tapeOff = false; });
      const bands = [[$("#ta"), 1, 0], [$("#tb"), -1, 0]];
      const roll = () => {
        if (tapeOff) return;
        const sp = 1.1 + Math.min(Math.abs(vel) * 0.35, 22);
        bands.forEach((b) => {
          const half = b[0].scrollWidth / 2;
          b[2] -= sp * b[1];
          if (b[2] <= -half) b[2] += half;
          if (b[2] > 0) b[2] -= half;
          b[0].style.transform = `translateX(${b[2]}px) skewX(${sk}deg)`;
        });
        sk += (gsap.utils.clamp(-9, 9, vel * -0.3) - sk) * 0.1;
      };
      gsap.ticker.add(roll);
      off.push(() => gsap.ticker.remove(roll));

      if (fine) {
        const hero = $("#hero");
        const rx = gsap.quickTo("#kb3", "rotationX", { duration: 0.9, ease: "power3" });
        const ry = gsap.quickTo("#kb3", "rotationY", { duration: 0.9, ease: "power3" });
        const sx = gsap.quickTo("#spot", "x", { duration: 0.7, ease: "power3" });
        const sy = gsap.quickTo("#spot", "y", { duration: 0.7, ease: "power3" });
        on(hero, "mousemove", (e) => {
          const r = hero.getBoundingClientRect();
          rx(((e.clientY - r.top) / r.height - 0.5) * -16); ry((e.clientX / innerWidth - 0.5) * 20);
          sx(e.clientX); sy(e.clientY - r.top);
        });
      }

      gsap.from(".ln b", { yPercent: 118, duration: 1.1, ease: "expo.out", stagger: 0.1 });
      gsap.from("#kb3", { scale: 0.7, rotation: 16, y: 50, autoAlpha: 0, duration: 1.2, ease: "expo.out" });
      gsap.from(".glow", { opacity: 0, duration: 1.1, ease: "power2.out" });
    }, root);

    const refresh = () => { setTop(); fitAll(); ScrollTrigger.refresh(); };
    refresh();
    on(window, "load", refresh);
    document.fonts?.ready.then(() => alive && refresh());
    on(root, "click", (e) => {
      const a = e.target.closest('a[href="#s1"]');
      if (a) { e.preventDefault(); lenis.scrollTo($("#s1"), { duration: 1.6, offset: -(parseFloat(root.style.getPropertyValue("--hv-top")) || 0) }); }
    });

    return () => {
      ctx.revert();
      gsap.ticker.remove(raf);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }

  return () => {
    alive = false;
    stopMotion();
    off.forEach((f) => f());
    timers.forEach(clearTimeout);
  };
}
