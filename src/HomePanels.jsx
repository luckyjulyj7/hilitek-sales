import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, ImageOff, Plus, RotateCcw, Search, Trash2, Upload, X } from "lucide-react";
import { HERO_BRAND_LOGOS, HOME_SECTION_SORTS, heroShortName } from "./storefront/config.js";

const INK = "#1E2A8A";
const TEXT = "#111827";
const MUTE = "#6B7280";
const LINE = "#E5E7EB";
const PAPER = "#F6F7FB";
const RUST = "#C62828";
const GOLD = "#F7C600";
const HERO_BG = [["#0B1140", "#2C3FD0"], ["#101A5C", "#3A6BE0"], ["#1E2A8A", "#5468F0"], ["#0E1650", "#2C8FD0"]];

const field = "w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200";
const iconBtn = "grid h-9 w-9 shrink-0 place-items-center rounded-md border bg-white transition hover:bg-[#F6F7FB] disabled:opacity-30 disabled:hover:bg-white";
const money = (n) => (Number(n) > 0 ? `${Number(n).toLocaleString("vi-VN")} đ` : "Liên hệ");
const fullName = (p) => [p.name, ...Object.values(p.variantAttrs || {})].join(" · ");

function Toggle({ on, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={!!on} aria-label={label} title={label} onClick={() => onChange(!on)}
      className="relative inline-block shrink-0 rounded-full transition-colors" style={{ width: 38, height: 22, background: on ? INK : "#D1D5DB" }}>
      <span className="absolute rounded-full bg-white transition-all" style={{ width: 18, height: 18, top: 2, left: on ? 18 : 2 }} />
    </button>
  );
}

function Label({ children }) {
  return <div className="mb-1.5 text-[13px] font-semibold" style={{ color: TEXT }}>{children}</div>;
}

/** Ô tìm sản phẩm theo tên hoặc mã, có ảnh, thay cho danh sách thả xuống dài. */
function ProductPicker({ products, displayImage, onPick, placeholder = "Tìm theo tên hoặc mã sản phẩm" }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const found = useMemo(() => {
    const kw = q.trim().toLowerCase();
    const list = kw ? products.filter((p) => `${fullName(p)} ${p.sku || ""}`.toLowerCase().includes(kw)) : products;
    return list.slice(0, 30);
  }, [products, q]);
  return (
    <div className="relative">
      <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTE }} />
      <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
        placeholder={placeholder} className={field + " pl-9"} style={{ borderColor: LINE }} />
      {open && (
        <div className="absolute left-0 right-0 z-30 mt-1 max-h-72 overflow-y-auto rounded-lg bg-white p-1" style={{ border: `1px solid ${LINE}`, boxShadow: "0 12px 28px rgba(15,23,70,.16)" }}>
          {found.length === 0 && <p className="px-3 py-4 text-center text-sm" style={{ color: MUTE }}>Không tìm thấy sản phẩm</p>}
          {found.map((p) => (
            <button key={p.id} type="button" onMouseDown={(e) => { e.preventDefault(); onPick(p); setQ(""); setOpen(false); }}
              className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left hover:bg-[#F6F7FB]">
              <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-md bg-white" style={{ border: `1px solid ${LINE}` }}>
                {displayImage(p) ? <img src={displayImage(p)} alt="" className="h-full w-full object-contain" /> : <ImageOff size={14} style={{ color: "#9CA3AF" }} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm" style={{ color: TEXT }}>{fullName(p)}</span>
                <span className="block text-xs" style={{ color: MUTE }}>{p.sku} · {money(p.retailPrice)}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function UploadBtn({ busy, children, accept, onFile, primary }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium"
      style={primary ? { background: INK, borderColor: INK, color: "#fff" } : { borderColor: LINE, color: TEXT, background: "#fff" }}>
      <Upload size={14} /> {busy ? "Đang tải…" : children}
      <input type="file" accept={accept} className="hidden" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
    </label>
  );
}

/** Khung xem trước một slide, vẽ theo màn đầu trang chủ. */
function HeroMock({ view, k, big }) {
  const [bg, glow] = HERO_BG[k % HERO_BG.length];
  return (
    <div className="relative overflow-hidden rounded-lg" style={{ aspectRatio: big ? "2.3 / 1" : "16 / 9", background: `radial-gradient(70% 90% at 62% 50%, ${glow}, ${bg} 78%)`, color: "#fff" }}>
      {big && <span className="pointer-events-none absolute left-[-1%] top-1/2 -translate-y-1/2 whitespace-nowrap font-black uppercase leading-none" style={{ fontSize: "clamp(70px,13vw,130px)", color: "transparent", WebkitTextStroke: "1px rgba(255,255,255,.16)" }}>{view.word}</span>}
      {view.logo && <img src={view.logo} alt="" className="absolute object-contain object-left-top" style={big ? { left: 14, top: 12, width: 110, height: 34 } : { left: 8, top: 7, width: 62, height: 18 }} />}
      {view.img
        ? <img src={view.img} alt="" className="absolute right-[3%] top-1/2 h-[80%] w-[56%] -translate-y-1/2 object-contain" draggable={false} />
        : <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-70">Chưa có ảnh</span>}
      <div className="absolute bottom-0 left-0" style={{ padding: big ? 14 : 8, maxWidth: "52%" }}>
        {big && <div className="truncate text-xs opacity-85">{view.sub}</div>}
        <div className="truncate font-bold leading-tight" style={{ fontSize: big ? 24 : 13 }}>{view.title || "Chưa chọn sản phẩm"}</div>
        {big && view.price > 0 && <div className="mt-0.5 text-base font-bold" style={{ color: GOLD }}>{money(view.price)}</div>}
      </div>
    </div>
  );
}

/** Màn trình chiếu: dãy slide xem được ngay, bấm để sửa, kéo để đổi thứ tự. */
export function HomeHeroEditor({ slides, products, mut, pick, add, displayImage, upload, uploadLogo, uploading }) {
  const [sel, setSel] = useState(0);
  const [from, setFrom] = useState(-1);
  const [over, setOver] = useState(-1);
  const count = useRef(slides.length);
  useEffect(() => {
    if (slides.length > count.current) setSel(slides.length - 1);
    else if (sel >= slides.length) setSel(Math.max(0, slides.length - 1));
    count.current = slides.length;
  }, [slides.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const viewOf = (h) => {
    const p = products.find((x) => x.id === h.productId);
    const title = (h.title || "").trim() || (p ? heroShortName(p) : "");
    return {
      p, title, price: Number(p?.retailPrice) || 0,
      autoTitle: p ? heroShortName(p) : "",
      autoLogo: HERO_BRAND_LOGOS[String(p?.brand || "").toLowerCase()] || "",
      word: title.split(/\s+/)[0] || "",
      sub: (h.sub || "").trim() || p?.category || "",
      img: h.image || (p && displayImage(p)) || "",
      logo: h.logo || HERO_BRAND_LOGOS[String(p?.brand || "").toLowerCase()] || "",
    };
  };
  const set = (k, v) => mut((arr) => { arr[sel] = { ...(arr[sel] || {}), [k]: v }; return arr; });
  const swap = (a, b) => {
    if (a < 0 || b < 0 || a === b || b >= slides.length) return;
    mut((arr) => { [arr[a], arr[b]] = [arr[b], arr[a]]; return arr; });
    setSel(b);
  };
  const del = () => mut((arr) => arr.filter((_, j) => j !== sel));
  const h = slides[sel];
  const v = h ? viewOf(h) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold" style={{ color: TEXT }}>Màn trình chiếu đầu trang chủ</h3>
          <p className="text-xs" style={{ color: MUTE }}>Bấm một sản phẩm để sửa, kéo để đổi thứ tự.</p>
        </div>
        <button type="button" onClick={add} className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-white" style={{ background: INK }}><Plus size={15} /> Thêm sản phẩm</button>
      </div>

      {slides.length === 0 && <div className="rounded-lg p-6 text-center text-sm" style={{ background: PAPER, color: MUTE }}>Web đang chạy các mẫu VOICSKY mặc định. Bấm “Thêm sản phẩm” để nạp các mẫu đó và thêm mẫu mới.</div>}

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {slides.map((s, i) => (
          <button key={i} type="button" draggable onClick={() => setSel(i)}
            onDragStart={(e) => { setFrom(i); e.dataTransfer.effectAllowed = "move"; }}
            onDragOver={(e) => { e.preventDefault(); setOver(i); }} onDragLeave={() => setOver(-1)}
            onDrop={(e) => { e.preventDefault(); swap(from, i); setFrom(-1); setOver(-1); }}
            className="relative rounded-lg text-left transition" style={{ cursor: "grab", boxShadow: i === sel ? `0 0 0 3px ${GOLD}, 0 0 0 4px ${INK}` : over === i && from !== i ? `0 0 0 3px ${GOLD}` : "none" }}>
            <HeroMock view={viewOf(s)} k={i} />
            <span className="absolute right-1.5 top-1.5 grid h-5 min-w-[20px] place-items-center rounded-full px-1 text-[11px] font-bold" style={{ background: "rgba(255,255,255,.9)", color: INK }}>{i + 1}</span>
          </button>
        ))}
      </div>

      {h && (
        <div className="rounded-xl p-4" style={{ border: `1px solid ${LINE}`, background: "#fff" }}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="min-w-0 truncate text-sm font-semibold" style={{ color: TEXT }}>Sản phẩm {sel + 1} / {slides.length}</div>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => swap(sel, sel - 1)} disabled={sel === 0} className={iconBtn} style={{ borderColor: LINE, color: TEXT }} title="Chạy sớm hơn"><ArrowLeft size={16} /></button>
              <button type="button" onClick={() => swap(sel, sel + 1)} disabled={sel === slides.length - 1} className={iconBtn} style={{ borderColor: LINE, color: TEXT }} title="Chạy muộn hơn"><ArrowRight size={16} /></button>
              <button type="button" onClick={del} className={iconBtn} style={{ borderColor: LINE, color: RUST }} title="Bỏ khỏi màn trình chiếu"><Trash2 size={16} /></button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <div className="min-w-0 space-y-3">
              <HeroMock view={v} k={sel} big />
              <div className="flex flex-wrap items-center gap-2">
                <UploadBtn busy={uploading === sel} accept="image/png,image/webp" onFile={(f) => upload(sel, f)}>{h.image ? "Đổi ảnh" : "Tải ảnh tách nền"}</UploadBtn>
                {h.image && <button type="button" onClick={() => set("image", "")} className="text-xs underline" style={{ color: RUST }}>Dùng ảnh sản phẩm</button>}
                <UploadBtn busy={uploading === sel} accept="image/png,image/webp,image/svg+xml" onFile={(f) => uploadLogo(sel, f)}>{h.logo ? "Đổi logo" : "Tải logo"}</UploadBtn>
                {h.logo && <button type="button" onClick={() => set("logo", "")} className="text-xs underline" style={{ color: RUST }}>Bỏ logo</button>}
              </div>
              <p className="text-xs" style={{ color: MUTE }}>Ảnh PNG nền trong suốt. Logo chữ sáng, ngang 600 đến 800px.{!h.logo && v.autoLogo ? " Logo hãng này đã có sẵn." : ""}</p>
            </div>
            <div className="min-w-0 space-y-3">
              <div>
                <Label>Sản phẩm</Label>
                {v.p && <div className="mb-2 flex items-center gap-2 rounded-md px-2.5 py-2 text-sm" style={{ background: PAPER, color: TEXT }}><span className="min-w-0 flex-1">{fullName(v.p)}</span><span className="shrink-0 font-semibold" style={{ color: INK }}>{money(v.price)}</span></div>}
                <ProductPicker products={products} displayImage={displayImage} onPick={(p) => pick(sel, p.id)} placeholder={v.p ? "Đổi sang sản phẩm khác" : "Tìm sản phẩm để chạy ở đây"} />
              </div>
              <div>
                <Label>Tên hiện to</Label>
                <input value={h.title || ""} onChange={(e) => set("title", e.target.value)} placeholder={v.autoTitle || "Tự lấy theo sản phẩm"} className={field} style={{ borderColor: LINE }} />
              </div>
              <div>
                <Label>Dòng chữ nhỏ</Label>
                <input value={h.sub || ""} onChange={(e) => set("sub", e.target.value)} placeholder={v.p?.category || "Tự lấy theo sản phẩm"} className={field} style={{ borderColor: LINE }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Lọc thử ngay trong trang quản lý để chủ shop thấy tab sẽ có những sản phẩm nào. */
function tabProducts(s, units, menu) {
  const skus = s.skus || [];
  if (skus.length) {
    const by = new Map(units.flatMap((u) => u.skus.map((k) => [k, u.p])));
    return skus.map((k) => by.get(String(k).trim().toLowerCase())).filter(Boolean);
  }
  const names = (n) => [n.name, ...(n.subs || []).flatMap(names)];
  const find = (nodes, name) => {
    for (const n of nodes || []) {
      if (n.name === name) return n;
      const r = find(n.subs, name);
      if (r) return r;
    }
    return null;
  };
  const g = s.group && menu.find((x) => x.group === s.group);
  const groupNames = g ? new Set((g.subs || []).flatMap(names)) : null;
  const c = s.cat && menu.map((x) => find(x.subs, s.cat)).find(Boolean);
  const catNames = s.cat ? new Set(c ? names(c) : [s.cat]) : null;
  const price = (p) => Number(p.retailPrice) || 0;
  const list = (p) => Math.max(Number(p.web?.compareAtPrice) || 0, price(p));
  const r = units.map((u) => u.p).filter((p) => {
    const cats = (p.web?.categories || []).length ? p.web.categories : [p.category].filter(Boolean);
    if (groupNames && !cats.some((x) => groupNames.has(x))) return false;
    if (catNames && !cats.some((x) => catNames.has(x))) return false;
    if (s.brand && (p.brand || "") !== s.brand) return false;
    if (s.onSale && !(list(p) > price(p))) return false;
    if (s.pmin != null && price(p) < s.pmin) return false;
    if (s.pmax != null && price(p) > s.pmax) return false;
    return true;
  });
  const cmp = {
    discount: (a, b) => (list(b) - price(b)) / (list(b) || 1) - (list(a) - price(a)) / (list(a) || 1),
    priceAsc: (a, b) => price(a) - price(b),
    priceDesc: (a, b) => price(b) - price(a),
    name: (a, b) => String(a.name).localeCompare(String(b.name), "vi"),
  }[s.sort];
  return cmp ? [...r].sort(cmp) : r;
}

/** Khối sản phẩm: mỗi khối là một tab ở mục sản phẩm trang chủ, sửa và xem kết quả ngay. */
export function HomeTabsEditor({ sections, products, menu, mut, reset, displayImage, askConfirm }) {
  const [sel, setSel] = useState(0);
  const [manual, setManual] = useState(false);
  const [more, setMore] = useState(false);
  const units = useMemo(() => {
    const map = new Map();
    (products || []).filter((p) => p.web?.published).forEach((p) => {
      const k = p.variantGroupId || p.id;
      const cur = map.get(k);
      const sku = String(p.sku || "").toLowerCase();
      if (!cur) map.set(k, { p, skus: [sku] });
      else { cur.skus.push(sku); if (p.web?.isDefaultVariant) cur.p = p; }
    });
    return [...map.values()];
  }, [products]);
  const pickList = useMemo(() => units.map((u) => u.p), [units]);
  const brands = useMemo(() => [...new Set(pickList.map((p) => p.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b, "vi")), [pickList]);

  const i = Math.min(sel, Math.max(0, sections.length - 1));
  const s = sections[i];
  const set = (patch) => mut((arr) => { arr[i] = { ...arr[i], ...patch }; return arr; });
  const go = (k) => { setSel(k); setManual(false); setMore(false); };
  const addTab = () => {
    mut((arr) => [...arr, { title: "Tab mới", group: "", cat: "", brand: "", onSale: false, pmin: null, pmax: null, skus: [], sort: "discount", limit: 12, rows: 1, layout: "carousel", seeAllText: "Xem tất cả", seeAllHref: "", enabled: true }]);
    go(sections.length);
  };
  const del = async () => {
    if (!await askConfirm(`Xoá tab "${s.title || "chưa đặt tên"}"?`)) return;
    mut((arr) => arr.filter((_, j) => j !== i));
    go(Math.max(0, i - 1));
  };
  const move = (d) => {
    const j = i + d;
    if (j < 0 || j >= sections.length) return;
    mut((arr) => { [arr[i], arr[j]] = [arr[j], arr[i]]; return arr; });
    setSel(j);
  };
  const hand = !!s && (manual || (s.skus || []).length > 0);
  const found = s && !(hand && !(s.skus || []).length) ? tabProducts(s, units, menu) : [];
  const shown = found.slice(0, 12);
  const subs = (() => {
    const flat = (nodes, d = 0) => (nodes || []).flatMap((n) => [{ name: n.name, d }, ...flat(n.subs, d + 1)]);
    const g = s?.group && menu.find((x) => x.group === s.group);
    return g ? flat(g.subs) : menu.flatMap((x) => flat(x.subs));
  })();
  const pill = (on, off) => ({ background: on ? "#060A2A" : "#fff", color: on ? GOLD : TEXT, border: `1px solid ${on ? "#060A2A" : LINE}`, opacity: off ? 0.5 : 1 });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold" style={{ color: TEXT }}>Khối sản phẩm trang chủ</h3>
        <p className="text-xs" style={{ color: MUTE }}>Đây là các tab khách thấy ở mục sản phẩm. Bấm một tab để sửa.</p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl p-3" style={{ background: PAPER, border: `1px solid ${LINE}` }}>
        <span className="rounded-lg px-3.5 py-2 text-sm font-semibold" style={{ background: "#fff", color: MUTE, border: `1px dashed ${LINE}` }} title="Tab này tự lấy hàng còn nhiều, không cần chỉnh">Nổi bật (tự động)</span>
        {sections.map((x, k) => (
          <button key={k} type="button" onClick={() => go(k)} className="rounded-lg px-3.5 py-2 text-sm font-semibold transition" style={pill(k === i, x.enabled === false)}>
            {x.title || x.group || "Chưa đặt tên"}
          </button>
        ))}
        <button type="button" onClick={addTab} className="inline-flex items-center gap-1 rounded-lg border border-dashed px-3 py-2 text-sm font-medium" style={{ borderColor: "#9CA3AF", color: INK }}><Plus size={15} /> Thêm tab</button>
      </div>

      {s ? (
        <div className="rounded-xl p-4" style={{ border: `1px solid ${LINE}`, background: "#fff" }}>
          <div className="flex flex-wrap items-center gap-2">
            <input value={s.title || ""} onChange={(e) => set({ title: e.target.value })} placeholder="Tên tab" className="min-w-[180px] flex-1 rounded-md border bg-white px-3 py-2 text-base font-semibold outline-none focus:ring-2 focus:ring-blue-200" style={{ borderColor: LINE }} />
            <label className="mx-1 flex items-center gap-2 text-sm" style={{ color: TEXT }}><Toggle on={s.enabled !== false} onChange={(v) => set({ enabled: v })} label="Hiện tab này" /> {s.enabled !== false ? "Đang hiện" : "Đang ẩn"}</label>
            <button type="button" onClick={() => move(-1)} disabled={i === 0} className={iconBtn} style={{ borderColor: LINE, color: TEXT }} title="Chuyển sang trái"><ArrowLeft size={16} /></button>
            <button type="button" onClick={() => move(1)} disabled={i === sections.length - 1} className={iconBtn} style={{ borderColor: LINE, color: TEXT }} title="Chuyển sang phải"><ArrowRight size={16} /></button>
            <button type="button" onClick={del} className={iconBtn} style={{ borderColor: LINE, color: RUST }} title="Xoá tab"><Trash2 size={16} /></button>
          </div>

          <div className="mt-4 inline-flex rounded-lg p-1" style={{ background: PAPER }}>
            {[[false, "Tự lấy theo danh mục"], [true, "Tự chọn từng sản phẩm"]].map(([m, l]) => (
              <button key={l} type="button" onClick={() => { setManual(m); if (!m && (s.skus || []).length) set({ skus: [] }); }} className="rounded-md px-3 py-1.5 text-sm font-medium"
                style={{ background: hand === m ? "#fff" : "transparent", color: hand === m ? INK : MUTE, boxShadow: hand === m ? "0 1px 3px rgba(15,23,70,.14)" : "none" }}>{l}</button>
            ))}
          </div>

          {hand ? (
            <div className="mt-3">
              <ProductPicker products={pickList} displayImage={displayImage} onPick={(p) => { if (!(s.skus || []).includes(p.sku)) set({ skus: [...(s.skus || []), p.sku] }); }} placeholder="Tìm sản phẩm để thêm vào tab" />
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="block"><Label>Nhóm</Label>
                  <select value={s.group || ""} onChange={(e) => set({ group: e.target.value, cat: "" })} className={field} style={{ borderColor: LINE }}>
                    <option value="">Tất cả nhóm</option>
                    {menu.map((g) => <option key={g.group} value={g.group}>{g.group}</option>)}
                  </select>
                </label>
                <label className="block"><Label>Danh mục</Label>
                  <select value={s.cat || ""} onChange={(e) => set({ cat: e.target.value })} className={field} style={{ borderColor: LINE }}>
                    <option value="">Tất cả danh mục</option>
                    {subs.map((n) => <option key={n.name} value={n.name}>{"  ".repeat(n.d)}{n.name}</option>)}
                  </select>
                </label>
                <label className="block"><Label>Thương hiệu</Label>
                  <select value={s.brand || ""} onChange={(e) => set({ brand: e.target.value })} className={field} style={{ borderColor: LINE }}>
                    <option value="">Tất cả thương hiệu</option>
                    {brands.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </label>
              </div>
              <div>
                <Label>Ưu tiên hiện trước</Label>
                <div className="flex flex-wrap gap-1.5">
                  {HOME_SECTION_SORTS.map((o) => {
                    const on = (s.sort || "discount") === o.id;
                    return <button key={o.id} type="button" onClick={() => set({ sort: o.id })} className="rounded-full px-3 py-1.5 text-[13px] font-medium" style={{ background: on ? "#EEF1FB" : "#fff", color: on ? INK : TEXT, border: `1px solid ${on ? INK : LINE}` }}>{o.label}</button>;
                  })}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm" style={{ color: TEXT }}><Toggle on={!!s.onSale} onChange={(v) => set({ onSale: v })} label="Chỉ hàng đang giảm giá" /> Chỉ hàng đang giảm giá</label>
                <button type="button" onClick={() => setMore((v) => !v)} className="inline-flex items-center gap-1 text-[13px] font-medium" style={{ color: INK }}>Thêm bộ lọc <ChevronDown size={15} style={{ transform: more ? "rotate(180deg)" : "none" }} /></button>
              </div>
              {(more || s.pmin != null || s.pmax != null || s.seeAllHref) && (
                <div className="grid grid-cols-1 gap-3 rounded-lg p-3 sm:grid-cols-3" style={{ background: PAPER }}>
                  <label className="block"><Label>Giá từ</Label><input type="number" min={0} value={s.pmin ?? ""} onChange={(e) => set({ pmin: e.target.value === "" ? null : Number(e.target.value) })} className={field} style={{ borderColor: LINE }} /></label>
                  <label className="block"><Label>Giá đến</Label><input type="number" min={0} value={s.pmax ?? ""} onChange={(e) => set({ pmax: e.target.value === "" ? null : Number(e.target.value) })} className={field} style={{ borderColor: LINE }} /></label>
                  <label className="block"><Label>Link nút Xem tất cả</Label><input value={s.seeAllHref || ""} onChange={(e) => set({ seeAllHref: e.target.value })} placeholder="Để trống là tự tạo" className={field} style={{ borderColor: LINE }} /></label>
                </div>
              )}
            </div>
          )}

          <div className="mt-5 flex items-baseline justify-between gap-2">
            <div className="text-sm font-semibold" style={{ color: TEXT }}>Khách sẽ thấy</div>
            <div className="text-xs" style={{ color: MUTE }}>{found.length > 12 ? `12 trong ${found.length} sản phẩm` : `${found.length} sản phẩm`}</div>
          </div>
          {shown.length === 0
            ? <p className="mt-2 rounded-lg p-6 text-center text-sm" style={{ background: PAPER, color: MUTE }}>{hand ? "Chưa chọn sản phẩm nào. Tìm ở ô phía trên để thêm." : "Không có sản phẩm khớp. Tab trống sẽ tự ẩn ngoài web."}</p>
            : (
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                {shown.map((p) => (
                  <div key={p.id} className="relative overflow-hidden rounded-lg bg-white p-1.5" style={{ border: `1px solid ${LINE}` }}>
                    <div className="grid aspect-square place-items-center overflow-hidden rounded-md">{displayImage(p) ? <img src={displayImage(p)} alt="" loading="lazy" className="h-full w-full object-contain" /> : <ImageOff size={16} style={{ color: "#9CA3AF" }} />}</div>
                    <div className="mt-1 truncate text-[11px]" style={{ color: TEXT }} title={p.name}>{p.name}</div>
                    <div className="text-[11px] font-semibold" style={{ color: INK }}>{money(p.retailPrice)}</div>
                    {hand && <button type="button" onClick={() => set({ skus: (s.skus || []).filter((k) => String(k).toLowerCase() !== String(p.sku).toLowerCase()) })} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white" style={{ border: `1px solid ${LINE}`, color: RUST }} title="Bỏ khỏi tab"><X size={13} /></button>}
                  </div>
                ))}
              </div>
            )}
        </div>
      ) : (
        <p className="rounded-lg p-6 text-center text-sm" style={{ background: PAPER, color: MUTE }}>Chưa có tab nào. Bấm “Thêm tab”.</p>
      )}

      <button type="button" onClick={async () => { if (await askConfirm("Khôi phục các tab về mặc định? Các tab bạn đã sửa sẽ mất.")) { reset(); go(0); } }} className="inline-flex items-center gap-1 text-xs underline" style={{ color: RUST }}><RotateCcw size={12} /> Khôi phục mặc định</button>
    </div>
  );
}
