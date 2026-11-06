import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Gamepad2, X } from "lucide-react";
import { SITE, newsItems } from "../config.js";
import { formatVND } from "../lib/format.js";
import { submitNeed } from "../lib/api.js";
import { ERAS, HH_BRANDS, MODELS, SPOTLIGHT, TIERS } from "../data/handhelds.js";
import HiliPlay from "../components/HiliPlay.jsx";
import NewsVideo from "../components/NewsVideo.jsx";
import ProductCard from "../components/ProductCard.jsx";
import NeedForm from "../components/NeedForm.jsx";
import TrustBar from "../components/TrustBar.jsx";
import "./handheld.css";

export const HANDHELD_PATH = "/may-choi-game-cam-tay";
const GROUP = "Máy chơi game cầm tay";
const WRAP = "mx-auto max-w-[1500px] px-3 sm:px-4";
const H2 = "font-display text-[30px] sm:text-[38px] font-bold text-ink";
const SIZES = [
  { id: "", label: "Mọi cỡ màn" },
  { id: "s", label: "Dưới 5 inch", test: (m) => m.inch < 5 },
  { id: "m", label: "5 tới 7 inch", test: (m) => m.inch >= 5 && m.inch <= 7 },
  { id: "l", label: "Trên 7 inch", test: (m) => m.inch > 7 },
];
const FAQ = [
  ["Nên mua dòng nào cho người mới?", "Nếu chỉ muốn chơi lại game tuổi thơ, dòng Retro là đủ. Muốn chơi game PC bản quyền thì chọn PC cầm tay. Bạn nói game hay chơi, Hili gợi ý máy phù hợp."],
  ["Máy Android khác máy Retro thế nào?", "Máy Android mạnh hơn, chơi được game trên kho ứng dụng và các đời máy sau. Máy Retro gọn và rẻ hơn, tập trung vào game cổ."],
  ["PC cầm tay và Mini PC cầm tay khác nhau ra sao?", "PC cầm tay thiết kế để chơi bằng tay cầm tích hợp. Mini PC cầm tay có thêm bàn phím, hợp khi cần làm việc trên Windows."],
  ["Mua tại Hilitek có hoá đơn không?", "Có. Hilitek xuất đủ hoá đơn VAT và bảo hành theo serial."],
  ["Mẫu chưa có sẵn thì sao?", "Bạn để lại số Zalo ở mẫu đang quan tâm, Hili báo giá và thời gian có hàng."],
];

// Bật khi đã có đủ 4 ảnh public/handheld/life-*.webp.
const LIFE_READY = false;
const LIFE = [
  { id: "retro", title: "Trên chuyến xe về", tier: "Retro", span: "lg:col-span-5" },
  { id: "android", title: "Ở quán cà phê", tier: "Android", span: "lg:col-span-7" },
  { id: "pc", title: "Tối ở nhà", tier: "PC cầm tay", span: "lg:col-span-7" },
  { id: "mini", title: "Giờ làm việc", tier: "Mini PC cầm tay", span: "lg:col-span-5" },
];

/** Dãy nhà pixel tự vẽ làm nền, không cần tải ảnh. */
function cityTile(seed, tall, body, light) {
  const c = document.createElement("canvas");
  c.width = 960; c.height = tall;
  const x = c.getContext("2d");
  let s = seed;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let px = 0; px < 960;) {
    const w = 8 * (6 + Math.floor(rnd() * 9));
    const h = Math.round(tall * (0.3 + rnd() * 0.66) / 8) * 8;
    x.fillStyle = body;
    x.fillRect(px, tall - h, w, h);
    for (let wy = tall - h + 12; wy < tall - 8; wy += 16) {
      for (let wx = px + 8; wx < px + w - 8; wx += 16) {
        if (rnd() < 0.3) { x.fillStyle = rnd() < 0.8 ? light : "#fff"; x.fillRect(wx, wy, 8, 8); }
      }
    }
    px += w;
  }
  return `url(${c.toDataURL("image/png")})`;
}

function useRise() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { rootMargin: "9999px 0px -8% 0px" });
    el.querySelectorAll(".hh-rise").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
  return ref;
}

function Shot({ m, className = "" }) {
  const [bad, setBad] = useState(false);
  if (bad) return <div className={"flex h-full w-full items-center justify-center text-ink/70 " + className}><Gamepad2 size="42%" strokeWidth={1.2} /></div>;
  return <img src={`/handheld/${m.slug}.webp`} alt={m.name} loading="lazy" decoding="async" onError={() => setBad(true)} className={className} />;
}

/** Khối máy tiêu điểm: ảnh lớn nền tối, tự chuyển mỗi 6 giây, rê chuột thì dừng. */
function Spotlight({ onAsk }) {
  const list = SPOTLIGHT.map((s) => MODELS.find((m) => m.slug === s));
  const [i, setI] = useState(0);
  const hold = useRef(false);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const t = setInterval(() => { if (!hold.current && !document.hidden) setI((v) => (v + 1) % list.length); }, 6000);
    return () => clearInterval(t);
  }, [list.length]);
  const m = list[i];
  return (
    <div className="hh-spot" onMouseEnter={() => { hold.current = true; }} onMouseLeave={() => { hold.current = false; }}>
      <div className="hh-spot-pic">
        {list.map((x, k) => <img key={x.slug} src={`/handheld/${x.slug}.webp`} alt={k === i ? x.name : ""} loading="lazy" className={k === i ? "on" : ""} />)}
      </div>
      <div key={m.slug} className="hh-spot-tx">
        <p className="text-[15px] font-semibold text-yellow">{TIERS.find((t) => t.id === m.tier).name}</p>
        <h3 className="mt-1 font-display text-[36px] font-bold leading-[1.04] sm:text-[52px]">{m.name}</h3>
        <dl className="mt-4 space-y-2 text-[16px]">
          <div><dt className="text-white/65">Màn hình</dt><dd className="font-semibold">{m.screen}</dd></div>
          <div><dt className="text-white/65">Chip</dt><dd className="font-semibold">{m.chip}</dd></div>
        </dl>
        <button type="button" onClick={() => onAsk(m)} className="hh-k y mt-5">Hỏi giá <ArrowRight size={17} /></button>
      </div>
      <div className="hh-spot-nav" role="tablist" aria-label="Chọn máy tiêu điểm">
        {list.map((x, k) => (
          <button key={x.slug} type="button" role="tab" aria-selected={k === i} aria-label={x.name} onClick={() => setI(k)} className={k === i ? "on" : ""}><span>{x.name}</span></button>
        ))}
      </div>
    </div>
  );
}

function AskModal({ model, onClose }) {
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  useEffect(() => {
    const esc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);
  const send = async (e) => {
    e.preventDefault();
    const z = phone.replace(/\D/g, "");
    if (!/^0\d{8,10}$/.test(z)) { setMsg("Số Zalo chưa đúng."); return; }
    try { await submitNeed({ need: `Hỏi giá ${model.name}`, budget: "", phone: z }); setSent(true); }
    catch (err) { setMsg(err.message || "Không gửi được, bạn nhắn Zalo giúp Hili nhé."); }
  };
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/60 p-3 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={`Hỏi giá ${model.name}`} className="relative w-full max-w-md rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Đóng" className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center text-ink/70"><X size={20} /></button>
        <h3 className="pr-10 font-display text-[28px] font-bold leading-tight text-ink">{model.name}</h3>
        {sent ? (
          <p className="mt-3 text-[16px] text-ink">Hili đã nhận, sẽ báo giá qua Zalo sớm cho bạn.</p>
        ) : (
          <form onSubmit={send} className="mt-3">
            <label className="text-[15px] font-medium text-ink" htmlFor="hh-ask">Số Zalo để Hili báo giá</label>
            <input id="hh-ask" inputMode="tel" autoFocus value={phone} onChange={(e) => { setPhone(e.target.value); setMsg(""); }} placeholder="0900 000 000" className="mt-1 h-12 w-full rounded-lg border border-line px-3 text-[16px]" />
            {msg && <p className="mt-1 text-[14px] text-sale">{msg}</p>}
            <button type="submit" className="hh-k y mt-3 w-full">Gửi cho Hili</button>
            <a href={SITE.zaloHref} target="_blank" rel="noreferrer" className="mt-3 block text-center text-[15px] font-semibold text-navy hover:underline">Hoặc chat Zalo ngay</a>
          </form>
        )}
      </div>
    </div>
  );
}

function ModelCard({ m, real, onAsk, navigate }) {
  const open = (e) => { e.preventDefault(); navigate(`san-pham/${real.slug}`); };
  return (
    <article className="hh-card group/card">
      <div className={"hh-stage" + (m.photo ? " photo" : "")}>
        <Shot m={m} />
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="text-[13px] text-mute">{m.brand}</p>
        <h3 className="font-display text-[19px] font-bold leading-tight text-ink sm:text-[22px]">{m.name}</h3>
        <p className="mt-1.5 text-[14px] leading-snug text-ink/75">{m.screen}</p>
        <p className="text-[14px] leading-snug text-ink/75">{m.chip}</p>
        <div className="mt-auto pt-3">
          {real ? (
            <a href={`/san-pham/${real.slug}`} onClick={open} className="flex min-h-[44px] items-center justify-between gap-2 rounded-lg bg-ink px-3 font-semibold text-white">
              <span>{formatVND(real.price)}</span><ArrowRight size={17} />
            </a>
          ) : (
            <button type="button" onClick={() => onAsk(m)} className="flex min-h-[44px] w-full items-center justify-between gap-2 rounded-lg bg-navy-050 px-3 font-semibold text-ink transition group-hover/card:bg-ink group-hover/card:text-white">
              Hỏi giá <ArrowRight size={17} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Handheld({ catalog, navigate }) {
  const products = catalog.products || [];
  const [tierOn, setTierOn] = useState("android");
  const [era, setEra] = useState("ps2");
  const [tier, setTier] = useState("");
  const [size, setSize] = useState("");
  const [brand, setBrand] = useState("");
  const [asking, setAsking] = useState(null);
  const [more, setMore] = useState(false);
  const [far, setFar] = useState("");
  const [near, setNear] = useState("");
  const page = useRise();
  const list = useRef(null);
  const tierHold = useRef(false);
  const tierBox = useRef(null);
  const tierTouch = useRef(false);
  const tierWait = useRef(0);

  // Bốn dòng máy tự chuyển lần lượt, rê chuột vào thì dừng để khách chọn.
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const t = setInterval(() => {
      if (tierHold.current || document.hidden) return;
      setTierOn((v) => TIERS[(TIERS.findIndex((x) => x.id === v) + 1) % TIERS.length].id);
    }, 4200);
    return () => clearInterval(t);
  }, []);

  // Điện thoại chỉ thấy một ô mỗi lúc: tự lướt tới ô đang mở để máy và chữ chạy trước mắt khách.
  useEffect(() => {
    const box = tierBox.current;
    if (!box || box.scrollWidth <= box.clientWidth + 8 || tierTouch.current) return;
    const r = box.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    const el = box.querySelector(`[data-tier="${tierOn}"]`);
    if (el) box.scrollTo({ left: el.offsetLeft - box.offsetLeft, behavior: "smooth" });
  }, [tierOn]);

  // Khách tự vuốt thì ô giữa màn hình là ô đang mở, tạm dừng tự chuyển vài giây.
  const onTierScroll = () => {
    if (!tierTouch.current) return;
    const box = tierBox.current;
    const mid = box.scrollLeft + box.clientWidth / 2;
    const hit = [...box.children].find((c) => c.offsetLeft - box.offsetLeft <= mid && c.offsetLeft - box.offsetLeft + c.offsetWidth > mid);
    if (hit?.dataset.tier) setTierOn(hit.dataset.tier);
  };
  const touchTier = () => {
    tierTouch.current = true; tierHold.current = true;
    clearTimeout(tierWait.current);
    tierWait.current = setTimeout(() => { tierTouch.current = false; tierHold.current = false; }, 6000);
  };

  useEffect(() => {
    const prev = document.title;
    document.title = "Máy chơi game cầm tay chính hãng | Hilitek";
    setFar(cityTile(11, 320, "#141C6E", "#2C3FD0"));
    setNear(cityTile(29, 230, "#060A2A", "#F7C600"));
    return () => { document.title = prev; };
  }, []);

  const realOf = useMemo(() => {
    const low = products.map((p) => [p.name.toLowerCase(), p]);
    return (m) => low.find(([n]) => n.includes(m.name.toLowerCase()))?.[1];
  }, [products]);
  // Máy thật trong nhóm chưa có trong danh sách trưng bày thì hiện riêng ở đầu.
  const extra = useMemo(() => products.filter((p) => ((p.categories || []).includes(GROUP) || p.category === GROUP)
    && !MODELS.some((m) => p.name.toLowerCase().includes(m.name.toLowerCase()))), [products]);

  const shown = MODELS.filter((m) => (!tier || m.tier === tier)
    && (!brand || m.brand === brand)
    && (SIZES.find((s) => s.id === size)?.test?.(m) ?? true));
  const visible = more ? shown : shown.slice(0, 8);
  const brands = [...new Set(MODELS.filter((m) => !tier || m.tier === tier).map((m) => m.brand))];
  const eraNow = ERAS.find((e) => e.id === era);
  const toList = (id) => {
    setTier(id); setSize(""); setBrand("");
    list.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const chip = (on) => "min-h-[44px] shrink-0 rounded-lg px-4 text-[15px] font-semibold transition " + (on ? "bg-ink text-yellow" : "bg-white text-ink hover:bg-yellow");

  return (
    <div ref={page} className="font-sans">
      <section className="hh-hero">
        <div className="hh-moon" />
        <div className="hh-city" style={{ backgroundImage: far, opacity: 0.8 }} />
        <div className="hh-city near" style={{ backgroundImage: near }} />
        <div className={WRAP + " hh-in"}>
          <div>
            <h1 className="font-display text-[42px] font-bold leading-[1.02] sm:text-[64px]">Máy chơi game <span className="text-yellow">cầm tay</span></h1>
            <p className="mt-3 max-w-[30em] text-[17px] leading-snug text-white/90">Từ máy Retro nhỏ gọn tới PC cầm tay chơi game bản quyền. Bấm START, chơi thử một ván rồi chọn máy hợp bạn.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={() => toList("")} className="hh-k y">Xem các máy <ArrowRight size={17} /></button>
              <a href={SITE.zaloHref} target="_blank" rel="noreferrer" className="hh-k n">Hỏi Hili qua Zalo</a>
            </div>
          </div>
          <HiliPlay />
        </div>
      </section>

      <div className="overflow-hidden bg-yellow text-ink" aria-hidden="true">
        <div className="hh-tape font-display text-[18px] font-bold">
          {[...HH_BRANDS, ...HH_BRANDS, ...HH_BRANDS].map((b, i) => <span key={i} className="shrink-0">{b}</span>)}
        </div>
      </div>

      <section className={WRAP + " pt-9"}>
        <h2 className={H2 + " hh-rise mb-3"}>Chọn theo dòng máy</h2>
        <div ref={tierBox} className="hh-tiers hh-rise" onScroll={onTierScroll} onTouchStart={touchTier} onMouseEnter={() => { tierHold.current = true; }} onMouseLeave={() => { tierHold.current = false; }}>
          {TIERS.map((t) => (
            <button key={t.id} type="button" data-tier={t.id} onMouseEnter={() => setTierOn(t.id)} onFocus={() => setTierOn(t.id)} onClick={() => toList(t.id)} className={"hh-tier " + t.tone + (tierOn === t.id ? " on" : "")}>
              <span className="hh-word" aria-hidden="true"><i>{t.word}</i><i>{t.word}</i><i>{t.word}</i><i>{t.word}</i></span>
              <Shot m={{ slug: t.cover, name: t.name }} />
              <span className="hh-tx">
                <span className="block font-display text-[28px] font-bold leading-tight sm:text-[32px]">{t.name}</span>
                <span className="mt-1 block text-[16px] font-semibold opacity-90">{t.note}</span>
                <span className="more mt-2 block max-w-[20em] text-[15px] leading-snug opacity-85">{t.for}</span>
                <span className="more mt-3 inline-flex items-center gap-1.5 font-semibold">Xem dòng này <ArrowRight size={16} /></span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className={WRAP + " pt-9"}>
        <h2 className={H2 + " hh-rise mb-3"}>Máy đáng chú ý</h2>
        <div className="hh-rise"><Spotlight onAsk={setAsking} /></div>
      </section>

      <section className={WRAP + " pt-9"}>
        <div className="hh-rise overflow-hidden rounded-2xl p-5 text-white sm:p-7" style={{ background: "radial-gradient(70% 120% at 80% 20%,#1E2A8A,#060A2A 75%)" }}>
          <h2 className="font-display text-[30px] font-bold sm:text-[38px]">Bạn muốn chơi gì?</h2>
          <div className="hh-eras mt-3">
            {ERAS.map((e) => <button key={e.id} type="button" aria-pressed={e.id === era} onClick={() => setEra(e.id)} className="hh-era">{e.label}</button>)}
          </div>
          <div key={era} className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-center">
            <div>
              <p className="font-display text-[26px] font-bold text-yellow">{TIERS.find((t) => t.id === eraNow.tier).name}</p>
              <p className="mt-1 max-w-[28em] text-[16px] leading-snug text-white/90">{eraNow.text}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {eraNow.picks.map((slug) => {
                const m = MODELS.find((x) => x.slug === slug);
                return (
                  <button key={slug} type="button" onClick={() => setAsking(m)} className="group min-w-0 overflow-hidden rounded-xl bg-white text-left text-ink">
                    <span className={"block aspect-[5/4] overflow-hidden " + (m.photo ? "" : "p-2")}><Shot m={m} className={"h-full w-full transition duration-500 group-hover:scale-105 " + (m.photo ? "object-cover" : "object-contain")} /></span>
                    <span className="block px-2.5 pb-2.5 text-[14px] font-semibold leading-tight sm:text-[16px]">{m.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {LIFE_READY && <section className={WRAP + " pt-9"}>
        <h2 className={H2 + " hh-rise mb-3"}>Chơi ở đâu cũng được</h2>
        <div className="hh-rise grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-12">
          {LIFE.map((l) => (
            <button key={l.id} type="button" onClick={() => toList(l.id)} className={"group relative h-[190px] overflow-hidden rounded-2xl bg-ink text-left text-white sm:h-[300px] " + l.span}>
              <img src={`/handheld/life-${l.id}.webp`} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]" />
              <span className="absolute inset-0" style={{ background: "linear-gradient(0deg,rgba(6,10,42,.86),transparent 58%)" }} />
              <span className="absolute inset-x-0 bottom-0 block p-3 sm:p-5">
                <span className="block font-display text-[20px] font-bold leading-tight sm:text-[28px]">{l.title}</span>
                <span className="mt-0.5 block text-[14px] font-semibold text-yellow sm:text-[15px]">{l.tier}</span>
              </span>
            </button>
          ))}
        </div>
      </section>}

      <section ref={list} className={WRAP + " scroll-mt-40 pt-9"}>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className={H2}>Tất cả máy</h2>
          <span className="shrink-0 text-[15px] font-semibold text-mute">{shown.length} máy</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          <button type="button" aria-pressed={!tier} onClick={() => { setTier(""); setBrand(""); }} className={chip(!tier)}>Tất cả</button>
          {TIERS.map((t) => <button key={t.id} type="button" aria-pressed={tier === t.id} onClick={() => { setTier(t.id); setBrand(""); }} className={chip(tier === t.id)}>{t.name}</button>)}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <div className="relative">
            <select aria-label="Cỡ màn hình" value={size} onChange={(e) => setSize(e.target.value)} className="h-11 appearance-none rounded-lg border border-line bg-white pl-3 pr-9 text-[15px] font-medium text-ink">
              {SIZES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-3.5 text-ink/60" />
          </div>
          <div className="relative">
            <select aria-label="Hãng" value={brand} onChange={(e) => setBrand(e.target.value)} className="h-11 appearance-none rounded-lg border border-line bg-white pl-3 pr-9 text-[15px] font-medium text-ink">
              <option value="">Mọi hãng</option>
              {brands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-3.5 text-ink/60" />
          </div>
        </div>
        {extra.length > 0 && !tier && (
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {extra.map((p) => <ProductCard key={p.id} product={p} onOpen={(slug) => navigate(`san-pham/${slug}`)} />)}
          </div>
        )}
        {shown.length > 0 ? (
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 sm:gap-3">
            {visible.map((m) => <ModelCard key={m.slug} m={m} real={realOf(m)} onAsk={setAsking} navigate={navigate} />)}
          </div>
        ) : (
          <p className="mt-3 rounded-2xl bg-white p-6 text-[16px] text-ink">Chưa có máy khớp bộ lọc. Bạn thử chọn cỡ màn hoặc hãng khác nhé.</p>
        )}
        {!more && shown.length > 8 && (
          <div className="mt-5 text-center">
            <button type="button" onClick={() => setMore(true)} className="hh-k y w-full sm:w-auto">Xem thêm {shown.length - 8} máy <ChevronDown size={17} /></button>
          </div>
        )}
      </section>

      <NewsVideo navigate={navigate} title="Tin tức máy chơi game" items={newsItems("handheld")} />

      <section className={WRAP + " pt-9"}>
        <h2 className={H2 + " hh-rise mb-3"}>Câu hỏi thường gặp</h2>
        <div className="hh-rise divide-y divide-line rounded-2xl bg-white px-5">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group py-1">
              <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-3 font-display text-[19px] font-bold text-ink [&::-webkit-details-marker]:hidden">
                {q}<ChevronDown size={20} className="shrink-0 transition group-open:rotate-180" />
              </summary>
              <p className="pb-3 text-[16px] leading-snug text-ink/80">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={WRAP + " pt-8"}>
        <NeedForm title="Chưa biết chọn máy nào? Nói Hili nghe" placeholder="Máy chơi Pokémon, mang đi làm" budgetHint="5 triệu" />
      </section>
      <section className={WRAP + " pb-8 pt-6"}><TrustBar /></section>

      {asking && <AskModal model={asking} onClose={() => setAsking(null)} />}
    </div>
  );
}
