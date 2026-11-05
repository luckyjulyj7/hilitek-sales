import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { HOME_POSTERS, HOME_SECTIONS, FLASH_SALE, FLASH_SALE_CATEGORY, SITE, homeSectionProducts } from "../config.js";
import { formatVND } from "../lib/format.js";
import { submitNeed } from "../lib/api.js";
import { href } from "../router.js";
import TrustBar from "../components/TrustBar.jsx";
import PosterSlot from "../components/PosterSlot.jsx";
import PosterSlider from "../components/PosterSlider.jsx";
import FlashSaleBar from "../components/FlashSaleBar.jsx";
import HomeSectionRow from "../components/HomeSectionRow.jsx";

const HANDHELD = "Máy chơi game cầm tay";
const WRAP = "mx-auto max-w-[1500px] px-3 sm:px-4";

const TIERS = [
  { name: "Retro", note: "Dưới 3 triệu", play: "Game cổ 8-bit tới PS1", line: "Anbernic, Miyoo, Trimui", w: "46%", h: "48%" },
  { name: "Android", note: "3 tới 12 triệu", play: "Game Android, giả lập tới PS2", line: "Retroid, Mangmi, AYN", w: "68%", h: "62%" },
  { name: "PC cầm tay", note: "Từ 12 triệu", play: "Game PC bản quyền", line: "Steam Deck, ROG Ally, Legion Go, MSI Claw", w: "92%", h: "78%" },
];

/** Giá thấp nhất và ảnh đại diện của một nhóm, tính từ sản phẩm đang bán. */
function pick(products, test) {
  const list = products.filter((p) => test.test(`${p.category} ${(p.categories || []).join(" ")}`) && p.price > 0);
  if (!list.length) return { from: 0, image: "" };
  const shown = list.find((p) => p.stock > 0 && p.images?.length) || list.find((p) => p.images?.length);
  const first = shown?.images?.[0];
  return { from: Math.min(...list.map((p) => p.price)), image: first?.src || first || "" };
}

function Tile({ to, title, sub, price, tone = "dark", className = "", children, navigate }) {
  const dark = tone === "dark";
  const external = /^https?:/.test(to);
  return (
    <a
      href={to}
      {...(external ? { target: "_blank", rel: "noreferrer" } : { onClick: (e) => { e.preventDefault(); navigate(to.slice(1)); } })}
      className={"group relative block min-h-[190px] overflow-hidden rounded-2xl transition duration-300 hover:-translate-y-0.5 hover:shadow-card " +
        (dark ? "bg-ink text-white " : tone === "yellow" ? "bg-yellow text-ink " : "bg-white text-ink ") + className}
    >
      {children}
      <div className="relative z-10 p-4 sm:p-5">
        <h3 className="font-display text-[22px] sm:text-[26px] font-bold leading-tight">{title}</h3>
        {sub && <p className={"mt-1 text-[14px] " + (dark ? "text-white/80" : "text-ink/70")}>{sub}</p>}
        {price > 0 && <p className={"mt-2 font-display text-[20px] font-bold " + (dark ? "text-yellow" : "text-navy")}>Từ {formatVND(price)}</p>}
      </div>
    </a>
  );
}

const photo = "absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]";

function Handheld({ ready, navigate }) {
  const [i, setI] = useState(0);
  const t = TIERS[i];
  const to = `/danh-muc?group=${encodeURIComponent(HANDHELD)}`;
  return (
    <section id="may-cam-tay" className={WRAP + " pt-8"}>
      <div className="grid gap-5 overflow-hidden rounded-2xl bg-ink p-5 text-white sm:p-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <h2 className="font-display text-[30px] sm:text-[38px] font-bold leading-tight">Máy chơi game cầm tay</h2>
          <p className="mt-1 text-[15px] text-white/80">Chọn mức ngân sách, Hili gợi ý dòng máy phù hợp.</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {TIERS.map((x, k) => (
              <button key={x.name} type="button" aria-pressed={k === i} onClick={() => setI(k)}
                className={"min-h-[56px] rounded-lg px-2 py-1 text-left text-[15px] font-semibold leading-tight transition " + (k === i ? "bg-yellow text-ink" : "bg-white/10 hover:bg-white/20")}>
                {x.name}<span className={"block text-[13px] font-normal " + (k === i ? "text-ink/75" : "text-white/70")}>{x.note}</span>
              </button>
            ))}
          </div>
          <dl className="mt-4 grid gap-2 text-[15px] sm:grid-cols-2">
            <div><dt className="text-white/65 text-[13px]">Chơi được</dt><dd className="font-semibold">{t.play}</dd></div>
            <div><dt className="text-white/65 text-[13px]">Dòng nên xem</dt><dd className="font-semibold">{t.line}</dd></div>
          </dl>
          <a href={ready ? to : SITE.zaloHref} target={ready ? undefined : "_blank"} rel="noreferrer"
            onClick={ready ? (e) => { e.preventDefault(); navigate(to.slice(1)); } : undefined}
            className="mt-4 inline-flex min-h-[46px] items-center gap-2 rounded-lg bg-yellow px-4 font-semibold text-ink hover:brightness-95">
            {ready ? "Xem máy cầm tay" : "Hỏi Hili về dòng này"} <ArrowRight size={16} />
          </a>
        </div>
        <div className="relative flex min-h-[220px] items-center justify-center rounded-xl" style={{ background: "radial-gradient(70% 80% at 50% 50%,#2C3FD0,#0C1344)" }}>
          <div className="flex flex-col items-center justify-center rounded-md border-4 border-[#03051a] text-center transition-all duration-700"
            style={{ width: t.w, height: t.h, background: "radial-gradient(90% 90% at 40% 30%,#3A4FE6,#141E72)", boxShadow: "0 0 60px rgba(58,79,230,.6)" }}>
            <b className="font-display text-[28px] sm:text-[36px] leading-none">{t.name}</b>
          </div>
        </div>
      </div>
    </section>
  );
}

function NeedForm() {
  const [need, setNeed] = useState("");
  const [budget, setBudget] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (busy || sent) return;
    const z = phone.replace(/\D/g, "");
    if (!need.trim()) { setMsg("Bạn ghi giúp Hili đang cần gì nhé."); return; }
    if (!/^0\d{8,10}$/.test(z)) { setMsg("Số Zalo chưa đúng, bạn kiểm tra lại giúp Hili."); return; }
    setBusy(true); setMsg("Đang gửi…");
    try {
      await submitNeed({ need: need.trim(), budget: budget.trim(), phone: z });
      setSent(true); setMsg("Hili đã nhận nhu cầu của bạn và sẽ nhắn qua Zalo.");
    } catch (e2) {
      setMsg(e2.message || "Chưa gửi được, bạn thử lại giúp Hili.");
    } finally { setBusy(false); }
  };
  const field = "mt-1 block w-full rounded-lg border-0 bg-white px-3 py-2.5 text-[16px] text-ink outline-none focus:ring-2 focus:ring-navy";
  return (
    <section className={WRAP + " pt-8"}>
      <form onSubmit={submit} className="rounded-2xl bg-yellow p-5 text-ink sm:p-7">
        <h2 className="font-display text-[30px] sm:text-[38px] font-bold leading-tight">Chưa rành linh kiện? Hili chọn giúp bạn</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-[2fr_1fr_1fr_auto] md:items-end">
          <label className="text-[14px] font-medium">Bạn cần gì<input className={field} value={need} onChange={(e) => setNeed(e.target.value)} placeholder="Bộ máy chơi Valorant" /></label>
          <label className="text-[14px] font-medium">Ngân sách<input className={field} value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="20 triệu" /></label>
          <label className="text-[14px] font-medium">Số Zalo<input className={field} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="0900 000 000" /></label>
          <button type="submit" disabled={busy || sent} className="min-h-[46px] rounded-lg bg-ink px-5 font-semibold text-white hover:bg-navy disabled:opacity-60">{sent ? "Đã gửi" : "Gửi cho Hili"}</button>
        </div>
        <p role="status" className="mt-2 min-h-[22px] text-[15px] font-medium">{msg}</p>
      </form>
    </section>
  );
}

export default function Home({ catalog, navigate }) {
  const { products } = catalog;
  const flashSection = {
    ...FLASH_SALE,
    group: "", brand: "", cat: FLASH_SALE_CATEGORY,
    onSale: false, minDiscount: 0, pmin: null, pmax: null, skus: [],
  };
  const flashItems = FLASH_SALE.enabled ? homeSectionProducts(products, flashSection) : [];
  const nimbus = products.find((p) => /nimbus 65/i.test(p.name));
  const hasHandheld = products.some((p) => (p.categories || []).includes(HANDHELD));
  const keyboard = pick(products, /bàn phím/i);
  const screen = pick(products, /màn hình/i);
  const mouse = pick(products, /^(chuột|lót chuột)/i);
  const parts = pick(products, /psu|case|cooling|ssd/i);
  const go = (q) => href("/danh-muc", q);
  const tile = { navigate };

  return (
    <div className="font-sans">
      <h1 className="sr-only">Hilitek: máy chơi game cầm tay, phím chuột và linh kiện PC chính hãng tại TP.HCM</h1>

      {/* Mở đầu: thấy ngay hàng nổi bật và ưu đãi */}
      <section className={WRAP + " pt-3"}>
        <div className="grid gap-2 lg:h-[440px] lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="relative min-h-[300px] overflow-hidden rounded-2xl bg-ink text-white sm:min-h-[400px]">
            <img src="/home/m01.webp" alt="" width="1800" height="1013" fetchpriority="high" className="absolute inset-0 h-full w-full object-cover object-[70%_60%]" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg,rgba(6,10,42,.88),rgba(6,10,42,.35) 58%,transparent)" }} />
            <div className="relative flex h-full min-h-[300px] flex-col justify-end p-5 sm:min-h-[400px] sm:p-8">
              <p className="font-display text-[44px] sm:text-[64px] font-bold leading-[1.02]">Bật máy.<br /><span className="text-yellow">Vào trận.</span></p>
              <p className="mt-2 max-w-[30em] text-[15px] text-white/85">Phím chuột, màn hình và linh kiện PC chính hãng. Đủ hoá đơn VAT, bảo hành theo serial.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={go({ group: "Bàn phím" })} onClick={(e) => { e.preventDefault(); navigate(go({ group: "Bàn phím" }).slice(1)); }} className="inline-flex min-h-[46px] items-center gap-2 rounded-lg bg-yellow px-4 font-semibold text-ink hover:brightness-95">Xem phím chuột <ArrowRight size={16} /></a>
                <a href="/danh-muc" onClick={(e) => { e.preventDefault(); navigate("danh-muc"); }} className="inline-flex min-h-[46px] items-center rounded-lg bg-white/15 px-4 font-semibold hover:bg-white/25">Tất cả sản phẩm</a>
              </div>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:min-h-0 lg:grid-cols-1 lg:grid-rows-2">
            {nimbus && (
              <Tile {...tile} to={`/san-pham/${nimbus.slug}`} title="VOICSKY Nimbus 65" className="min-h-[210px] lg:min-h-0" tone="dark">
                <div className="absolute inset-0" style={{ background: "radial-gradient(80% 90% at 80% 90%,#2C3FD0,transparent)" }} />
                <img src="/home/cut-nimbus.webp" alt="" loading="lazy" className="absolute -bottom-5 -right-12 w-[74%] rotate-[-8deg] transition duration-700 group-hover:scale-105" />
                <span className="absolute bottom-4 left-5 z-10 font-display text-[22px] font-bold text-yellow">{formatVND(nimbus.price)}</span>
              </Tile>
            )}
            <div className="min-h-0 overflow-hidden rounded-2xl [&_a]:block [&_a]:h-full [&_div]:h-full [&_img]:h-full [&_img]:w-full [&_img]:object-cover"><PosterSlot slot={HOME_POSTERS.side[0]} navigate={navigate} /></div>
          </div>
        </div>
      </section>

      {/* Danh mục */}
      <section className={WRAP + " pt-8"}>
        <h2 className="mb-3 font-display text-[30px] sm:text-[38px] font-bold text-ink">Mua theo danh mục</h2>
        <div className="grid grid-cols-2 gap-2 lg:auto-rows-[200px] lg:grid-cols-12">
          <Tile {...tile} to={go({ group: "Bàn phím" })} title="Bàn phím" sub="Cơ, không dây, văn phòng" price={keyboard.from} className="col-span-2 min-h-[240px] lg:col-span-5 lg:row-span-2">
            <div className="absolute inset-0" style={{ background: "radial-gradient(90% 90% at 75% 85%,#2C3FD0,transparent)" }} />
            <img src="/home/cut-echo96.webp" alt="" loading="lazy" className="absolute -bottom-8 -right-16 w-[96%] rotate-[-9deg] transition duration-700 group-hover:scale-105" />
          </Tile>
          <Tile {...tile} to={go({ group: "Màn hình" })} title="Màn hình" sub="Gaming và văn phòng" price={screen.from} tone="light" className="col-span-2 lg:col-span-4">
            <img src="/home/cut-monitor.webp" alt="" loading="lazy" className="absolute -bottom-3 -right-6 h-[62%] sm:h-[92%] transition duration-700 group-hover:scale-105" />
          </Tile>
          <Tile {...tile} to={go({ group: "Chuột" })} title="Chuột" price={mouse.from} tone="light" className="lg:col-span-3">
            {mouse.image && <img src={mouse.image} alt="" loading="lazy" className="absolute -right-2 bottom-0 h-[72%] mix-blend-multiply transition duration-700 group-hover:scale-105" />}
          </Tile>
          <Tile {...tile} to={go({ group: "Linh kiện PC" })} title="Linh kiện PC" sub="SSD, nguồn, vỏ, tản nhiệt" price={parts.from} className="lg:col-span-4">
            <img src="/home/m03.webp" alt="" loading="lazy" className={photo + " opacity-70"} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg,rgba(6,10,42,.85),transparent 75%)" }} />
          </Tile>
          <Tile {...tile} to="/xay-dung-cau-hinh" title="Build PC" sub="Chọn từng món, tự tính tổng tiền" tone="yellow" className="lg:col-span-3" />
          <Tile {...tile} to={go({ group: "Phụ kiện" })} title="Phụ kiện Decor góc máy" sub="Arm màn hình, mặt bàn, loa để bàn" className="col-span-2 lg:col-span-5">
            <img src="/home/m02.webp" alt="" loading="lazy" className={photo} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg,rgba(6,10,42,.88),rgba(6,10,42,.2) 70%)" }} />
          </Tile>
          <Tile {...tile} to={SITE.zaloHref} title="Cho công ty" sub="Báo giá nhanh, hoá đơn VAT, công nợ" className="col-span-2 lg:col-span-4">
            <img src="/home/m04.webp" alt="" loading="lazy" className={photo + " object-[50%_30%]"} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(0deg,rgba(6,10,42,.2),rgba(6,10,42,.82) 75%)" }} />
          </Tile>
          <a href="#may-cam-tay" onClick={(e) => { e.preventDefault(); document.getElementById("may-cam-tay")?.scrollIntoView({ behavior: "smooth" }); }}
            className="col-span-2 flex min-h-[110px] flex-col justify-center rounded-2xl bg-navy p-4 text-white transition hover:bg-navy-600 sm:p-5 lg:col-span-3">
            <span className="font-display text-[22px] sm:text-[26px] font-bold leading-tight">Máy chơi game cầm tay</span>
            <span className="mt-1 text-[14px] text-white/80">Retro, Android, PC cầm tay</span>
          </a>
        </div>
      </section>

      {/* Ưu đãi do chủ shop cấu hình */}
      <section className={WRAP + " pt-8"}>
        <h2 className="mb-3 font-display text-[30px] sm:text-[38px] font-bold text-ink">Chương trình đang diễn ra</h2>
        <div className="overflow-hidden rounded-2xl"><PosterSlider slot={HOME_POSTERS.hero} navigate={navigate} /></div>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {HOME_POSTERS.strip.map((s, i) => (
            <PosterSlot key={i} slot={s} navigate={navigate} className={i === 2 ? "col-span-2 sm:col-span-1" : ""} />
          ))}
        </div>
      </section>

      {FLASH_SALE.enabled && flashItems.length > 0 && (
        <section className={WRAP + " pt-6"}>
          <div className="rounded-2xl bg-white p-2.5 sm:p-6">
            <FlashSaleBar navigate={navigate} />
            <div className="mt-3 sm:mt-5">
              <HomeSectionRow section={{ ...flashSection, title: "", seeAllText: "", seeAllHref: "" }} products={products} navigate={navigate} />
            </div>
          </div>
        </section>
      )}

      {HOME_SECTIONS.filter((s) => s && s.enabled !== false).map((s, i) => (
        <HomeSectionRow key={i} section={s} products={products} navigate={navigate} />
      ))}

      <Handheld ready={hasHandheld} navigate={navigate} />
      <NeedForm />

      <section className={WRAP + " pt-6 pb-8"}>
        <TrustBar />
      </section>
    </div>
  );
}
