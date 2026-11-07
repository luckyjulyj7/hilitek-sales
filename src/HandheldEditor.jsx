import React, { useMemo, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, ExternalLink, ImageOff, Link2, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { ERAS, HH_BRANDS, HH_FAQ, HH_HERO, HH_LIFE, MODELS, SPOTLIGHT, TIERS, hhImage } from "./storefront/data/handhelds.js";
import { uploadProductImage } from "./lib/mediaUpload.js";
import { ProductPicker } from "./HomePanels.jsx";

const INK = "#1E2A8A";
const TEXT = "#111827";
const MUTE = "#6B7280";
const LINE = "#E5E7EB";
const PAPER = "#F6F7FB";
const RUST = "#C62828";
const GOLD = "#F7C600";
const FOREST = "#15803D";
const field = "w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200";
const iconBtn = "grid h-9 w-9 shrink-0 place-items-center rounded-md border bg-white transition hover:bg-[#F6F7FB] disabled:opacity-30 disabled:hover:bg-white";
const PANES = [["models", "Danh sách máy"], ["tiers", "Dòng máy"], ["spot", "Máy đáng chú ý"], ["eras", "Bạn muốn chơi gì"], ["life", "Ảnh đời sống"], ["faq", "Câu hỏi"], ["hero", "Đầu trang"]];
const newId = () => "m" + Math.random().toString(36).slice(2, 9);
const money = (n) => `${Number(n).toLocaleString("vi-VN")} đ`;
const swapped = (arr, a, b) => { const n = [...arr]; [n[a], n[b]] = [n[b], n[a]]; return n; };

function Label({ children, hint }) {
  return <div className="mb-1.5"><div className="text-[13px] font-semibold" style={{ color: TEXT }}>{children}</div>{hint && <div className="text-xs" style={{ color: MUTE }}>{hint}</div>}</div>;
}
function Text({ label, hint, value, onChange, placeholder, rows }) {
  return (
    <label className="block">
      <Label hint={hint}>{label}</Label>
      {rows
        ? <textarea rows={rows} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={field} style={{ borderColor: LINE }} />
        : <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={field} style={{ borderColor: LINE }} />}
    </label>
  );
}
function Chip({ on, children, onClick }) {
  return <button type="button" onClick={onClick} className="rounded-full px-3 py-1.5 text-[13px] font-medium" style={{ background: on ? "#EEF1FB" : "#fff", color: on ? INK : TEXT, border: `1px solid ${on ? INK : LINE}` }}>{children}</button>;
}
function Toggle({ on, onChange, label, disabled }) {
  return (
    <button type="button" role="switch" aria-checked={!!on} aria-label={label} title={label} disabled={disabled} onClick={() => onChange(!on)} className="relative inline-block shrink-0 rounded-full transition-colors disabled:opacity-40" style={{ width: 38, height: 22, background: on ? INK : "#D1D5DB" }}>
      <span className="absolute rounded-full bg-white transition-all" style={{ width: 18, height: 18, top: 2, left: on ? 18 : 2 }} />
    </button>
  );
}
function Pic({ src, photo, className = "", style }) {
  const [bad, setBad] = useState("");
  return (
    <div className={"grid place-items-center overflow-hidden " + className} style={{ background: photo ? "#060A2A" : "#fff", ...style }}>
      {src && bad !== src ? <img src={src} alt="" draggable={false} onError={() => setBad(src)} className={"h-full w-full " + (photo ? "object-cover" : "object-contain p-1.5")} /> : <ImageOff size={18} style={{ color: "#9CA3AF" }} />}
    </div>
  );
}
function UploadBtn({ busy, children, onFile, primary }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium" style={primary ? { background: INK, borderColor: INK, color: "#fff" } : { borderColor: LINE, color: TEXT, background: "#fff" }}>
      <Upload size={14} /> {busy ? "Đang tải…" : children}
      <input type="file" accept="image/png,image/webp,image/jpeg" className="hidden" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
    </label>
  );
}

export default function HandheldEditor({ webConfig, setWebConfig, products, displayImage, askConfirm, notify }) {
  const H = webConfig.HANDHELD || {};
  const models = Array.isArray(H.models) ? H.models : MODELS;
  const tiers = Array.isArray(H.tiers) && H.tiers.length === TIERS.length ? H.tiers : TIERS;
  const spot = Array.isArray(H.spotlight) ? H.spotlight : SPOTLIGHT;
  const eras = Array.isArray(H.eras) ? H.eras : ERAS;
  const faq = Array.isArray(H.faq) ? H.faq : HH_FAQ;
  const brandTape = Array.isArray(H.brands) ? H.brands : HH_BRANDS;
  const hero = { ...HH_HERO, ...(H.hero || {}) };
  const life = { on: !!H.life?.on, items: H.life?.items?.length === 4 ? H.life.items : HH_LIFE.items };
  const set = (k, v) => setWebConfig((x) => ({ ...x, HANDHELD: { ...(x.HANDHELD || {}), [k]: v } }));

  const [pane, setPane] = useState("models");
  const [open, setOpen] = useState("");
  const [tierF, setTierF] = useState("");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState(-1);
  const [eraSel, setEraSel] = useState(0);
  const [busy, setBusy] = useState("");
  const [brandText, setBrandText] = useState("");

  const up = async (key, file, done) => {
    if (!file) return;
    setBusy(key);
    try { done((await uploadProductImage(file)).url); }
    catch (e) { notify?.(`Chưa tải được ảnh: ${e.message || e}`); }
    finally { setBusy(""); }
  };
  const tierName = (id) => tiers.find((t) => t.id === id)?.name || "";
  const realOf = (m) => (m.productId && products.find((p) => p.id === m.productId))
    || products.find((p) => String(p.name).toLowerCase().includes(String(m.name).toLowerCase()));

  const list = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return models.map((m, i) => ({ m, i })).filter(({ m }) => (!tierF || m.tier === tierF) && (!kw || `${m.name} ${m.brand}`.toLowerCase().includes(kw)));
  }, [models, tierF, q]);

  const addModel = () => {
    const slug = newId();
    set("models", [...models, { slug, name: "Máy mới", brand: "", tier: tierF || "android", inch: 6, screen: "", chip: "", hidden: true }]);
    setOpen(slug);
  };
  const m = open ? models.find((x) => x.slug === open) : null;
  const mi = m ? models.indexOf(m) : -1;
  const setM = (patch) => set("models", models.map((x) => (x.slug === open ? { ...x, ...patch } : x)));
  const delM = async () => {
    if (!await askConfirm(`Xoá "${m.name}" khỏi trang?`)) return;
    setWebConfig((x) => {
      const h = x.HANDHELD || {};
      return { ...x, HANDHELD: { ...h, models: models.filter((y) => y.slug !== open), spotlight: spot.filter((s) => s !== open), eras: eras.map((e) => ({ ...e, picks: e.picks.filter((s) => s !== open) })) } };
    });
    setOpen("");
  };
  const reset = async () => {
    if (!await askConfirm("Khôi phục toàn bộ trang máy cầm tay về bản mặc định? Những gì đã sửa ở đây sẽ mất.")) return;
    setWebConfig((x) => { const y = { ...x }; delete y.HANDHELD; return y; });
    setOpen("");
  };

  const modelDetail = m && (() => {
    const real = realOf(m);
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setOpen("")} className="inline-flex items-center gap-1 rounded-md border bg-white px-2.5 py-1.5 text-sm" style={{ borderColor: LINE, color: TEXT }}><ArrowLeft size={15} /> Tất cả máy</button>
          <div className="flex-1" />
          <button type="button" onClick={() => mi > 0 && set("models", swapped(models, mi, mi - 1))} disabled={mi === 0} className={iconBtn} style={{ borderColor: LINE, color: TEXT }} title="Hiện sớm hơn"><ArrowUp size={16} /></button>
          <button type="button" onClick={() => mi < models.length - 1 && set("models", swapped(models, mi, mi + 1))} disabled={mi === models.length - 1} className={iconBtn} style={{ borderColor: LINE, color: TEXT }} title="Hiện muộn hơn"><ArrowDown size={16} /></button>
          <button type="button" onClick={delM} className={iconBtn} style={{ borderColor: LINE, color: RUST }} title="Xoá máy"><Trash2 size={16} /></button>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-[250px_minmax(0,1fr)]">
          <div className="space-y-3">
            <Pic src={hhImage(m)} photo={m.photo} className="aspect-[5/4] rounded-xl" style={{ border: `1px solid ${LINE}` }} />
            <UploadBtn busy={busy === "m"} onFile={(f) => up("m", f, (url) => setM({ image: url }))}>{m.image ? "Đổi ảnh" : "Tải ảnh máy"}</UploadBtn>
            <div>
              <Label>Kiểu ảnh</Label>
              <div className="flex flex-wrap gap-1.5">
                <Chip on={!m.photo} onClick={() => setM({ photo: false })}>Tách nền</Chip>
                <Chip on={!!m.photo} onClick={() => setM({ photo: true })}>Nền tối, phủ kín</Chip>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 rounded-lg px-3 py-2.5" style={{ background: m.hidden ? PAPER : "#F0FDF4" }}>
              <span className="text-sm font-semibold" style={{ color: m.hidden ? TEXT : FOREST }}>{m.hidden ? "Đang ẩn" : "Đang hiện"}</span>
              <Toggle on={!m.hidden} onChange={(v) => setM({ hidden: !v })} label="Hiện máy này trên trang" />
            </div>
          </div>
          <div className="min-w-0 space-y-3">
            <Text label="Tên máy" value={m.name} onChange={(v) => setM({ name: v })} />
            <div className="grid grid-cols-2 gap-3">
              <Text label="Hãng" value={m.brand} onChange={(v) => setM({ brand: v })} />
              <label className="block"><Label>Cỡ màn (inch)</Label><input type="number" step="0.1" min={1} value={m.inch ?? ""} onChange={(e) => setM({ inch: Number(e.target.value) || 0 })} className={field} style={{ borderColor: LINE }} /></label>
            </div>
            <div>
              <Label>Dòng máy</Label>
              <div className="flex flex-wrap gap-1.5">{tiers.map((t) => <Chip key={t.id} on={m.tier === t.id} onClick={() => setM({ tier: t.id })}>{t.name}</Chip>)}</div>
            </div>
            <Text label="Màn hình" value={m.screen} onChange={(v) => setM({ screen: v })} placeholder="6 inch AMOLED 120Hz" />
            <Text label="Chip" value={m.chip} onChange={(v) => setM({ chip: v })} placeholder="Snapdragon 8 Elite" />
            <div>
              <Label hint="Gắn rồi thì khách thấy giá và bấm vào trang sản phẩm. Chưa gắn thì hiện nút Hỏi giá.">Sản phẩm đang bán</Label>
              {real && (
                <div className="mb-2 flex items-center gap-2 rounded-md px-2.5 py-2 text-sm" style={{ background: "#F0FDF4", color: TEXT }}>
                  <Link2 size={15} className="shrink-0" style={{ color: FOREST }} />
                  <span className="min-w-0 flex-1 truncate">{real.name}</span>
                  <span className="shrink-0 font-semibold" style={{ color: INK }}>{money(real.retailPrice)}</span>
                  {m.productId && <button type="button" onClick={() => setM({ productId: "", groupId: "" })} className="shrink-0" style={{ color: RUST }} title="Bỏ gắn"><X size={15} /></button>}
                </div>
              )}
              <ProductPicker products={products} displayImage={displayImage} onPick={(p) => setM({ productId: p.id, groupId: p.variantGroupId || "" })} placeholder={real ? "Đổi sang sản phẩm khác" : "Tìm sản phẩm trong kho để gắn"} />
            </div>
          </div>
        </div>
      </div>
    );
  })();

  const modelsPane = (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[180px] flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTE }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm máy" className={field + " pl-9"} style={{ borderColor: LINE }} />
        </div>
        <button type="button" onClick={addModel} className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-white" style={{ background: INK }}><Plus size={15} /> Thêm máy</button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Chip on={!tierF} onClick={() => setTierF("")}>Tất cả {models.length}</Chip>
        {tiers.map((t) => <Chip key={t.id} on={tierF === t.id} onClick={() => setTierF(t.id)}>{t.name} {models.filter((x) => x.tier === t.id).length}</Chip>)}
      </div>
      <p className="text-xs" style={{ color: MUTE }}>Bấm một máy để sửa, kéo thả để đổi thứ tự. Web hiện 8 máy đầu, khách bấm Xem thêm để thấy hết.</p>
      {list.length === 0 && <p className="rounded-lg p-8 text-center text-sm" style={{ background: PAPER, color: MUTE }}>Không có máy nào.</p>}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {list.map(({ m: x, i }) => {
          const real = realOf(x);
          return (
            <button key={x.slug} type="button" draggable onClick={() => setOpen(x.slug)}
              onDragStart={() => setFrom(i)} onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); if (from >= 0 && from !== i) set("models", swapped(models, from, i)); setFrom(-1); }}
              className="overflow-hidden rounded-xl bg-white text-left transition hover:-translate-y-0.5" style={{ border: `1px solid ${LINE}`, opacity: x.hidden ? 0.55 : 1, cursor: "grab" }}>
              <Pic src={hhImage(x)} photo={x.photo} className="aspect-[5/4]" />
              <div className="p-2.5">
                <div className="truncate text-sm font-semibold" style={{ color: TEXT }}>{x.name}</div>
                <div className="truncate text-xs" style={{ color: MUTE }}>{tierName(x.tier)}{x.hidden ? " · Đang ẩn" : ""}</div>
                <div className="mt-1 truncate text-xs font-semibold" style={{ color: real ? FOREST : INK }}>{real ? money(real.retailPrice) : "Hỏi giá"}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const setTier = (i, patch) => set("tiers", tiers.map((t, j) => (j === i ? { ...t, ...patch } : t)));
  const tiersPane = (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {tiers.map((t, i) => {
        const cover = t.image || hhImage(models.find((x) => x.slug === t.cover) || { slug: t.cover });
        return (
          <div key={t.id} className="space-y-3 rounded-xl p-3.5" style={{ border: `1px solid ${LINE}` }}>
            <div className="flex items-center gap-3">
              <Pic src={cover} className="h-20 w-24 shrink-0 rounded-lg" style={{ border: `1px solid ${LINE}` }} />
              <div className="min-w-0 flex-1 space-y-1.5">
                <select value={models.some((x) => x.slug === t.cover) ? t.cover : ""} onChange={(e) => setTier(i, { cover: e.target.value, image: "" })} className={field} style={{ borderColor: LINE }}>
                  <option value="">Chọn máy làm ảnh</option>
                  {models.map((x) => <option key={x.slug} value={x.slug}>{x.name}</option>)}
                </select>
                <UploadBtn busy={busy === t.id} onFile={(f) => up(t.id, f, (url) => setTier(i, { image: url }))}>Tải ảnh riêng</UploadBtn>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <Text label="Tên dòng" value={t.name} onChange={(v) => setTier(i, { name: v })} />
              <Text label="Chữ chạy nền" value={t.word} onChange={(v) => setTier(i, { word: v })} />
            </div>
            <Text label="Tầm giá" value={t.note} onChange={(v) => setTier(i, { note: v })} />
            <Text label="Mô tả ngắn" value={t.for} onChange={(v) => setTier(i, { for: v })} />
          </div>
        );
      })}
    </div>
  );

  const spotModels = spot.map((s) => models.find((x) => x.slug === s)).filter(Boolean);
  const spotPane = (
    <div className="space-y-4">
      <div>
        <Label hint="Tối đa 6 máy, tự chuyển mỗi 6 giây. Ảnh nền tối phủ kín sẽ đẹp nhất.">Đang chạy ({spotModels.length})</Label>
        {spotModels.length === 0 && <p className="rounded-lg p-5 text-center text-sm" style={{ background: PAPER, color: MUTE }}>Chưa chọn máy nào, khối này sẽ ẩn trên web.</p>}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {spotModels.map((x, i) => (
            <div key={x.slug} className="overflow-hidden rounded-xl" style={{ border: `1px solid ${LINE}` }}>
              <Pic src={hhImage(x)} photo={x.photo} className="aspect-[5/4]" />
              <div className="flex items-center gap-1 p-1.5">
                <span className="min-w-0 flex-1 truncate px-1 text-xs font-semibold" style={{ color: TEXT }}>{x.name}</span>
                <button type="button" onClick={() => set("spotlight", swapped(spot, i, i - 1))} disabled={i === 0} className="grid h-7 w-7 place-items-center rounded disabled:opacity-30" title="Sớm hơn"><ArrowLeft size={14} /></button>
                <button type="button" onClick={() => set("spotlight", swapped(spot, i, i + 1))} disabled={i === spotModels.length - 1} className="grid h-7 w-7 place-items-center rounded disabled:opacity-30" title="Muộn hơn"><ArrowRight size={14} /></button>
                <button type="button" onClick={() => set("spotlight", spot.filter((s) => s !== x.slug))} className="grid h-7 w-7 place-items-center rounded" style={{ color: RUST }} title="Bỏ"><X size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label>Thêm máy</Label>
        <div className="flex flex-wrap gap-1.5">
          {models.filter((x) => !spot.includes(x.slug)).map((x) => <button key={x.slug} type="button" disabled={spot.length >= 6} onClick={() => set("spotlight", [...spot, x.slug])} className="inline-flex items-center gap-1 rounded-full border bg-white px-3 py-1.5 text-[13px] disabled:opacity-40" style={{ borderColor: LINE, color: TEXT }}><Plus size={13} /> {x.name}</button>)}
        </div>
      </div>
    </div>
  );

  const ei = Math.min(eraSel, Math.max(0, eras.length - 1));
  const e = eras[ei];
  const setE = (patch) => set("eras", eras.map((x, j) => (j === ei ? { ...x, ...patch } : x)));
  const erasPane = (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {eras.map((x, i) => <Chip key={x.id} on={i === ei} onClick={() => setEraSel(i)}>{x.label || "Chưa đặt tên"}</Chip>)}
        <button type="button" onClick={() => { set("eras", [...eras, { id: newId(), label: "Mục mới", tier: "android", text: "", picks: [] }]); setEraSel(eras.length); }} className="inline-flex items-center gap-1 rounded-full border border-dashed px-3 py-1.5 text-[13px] font-medium" style={{ borderColor: "#9CA3AF", color: INK }}><Plus size={14} /> Thêm</button>
      </div>
      {e ? (
        <div className="space-y-3 rounded-xl p-4" style={{ border: `1px solid ${LINE}` }}>
          <div className="flex items-end gap-2">
            <div className="flex-1"><Text label="Khách chọn" value={e.label} onChange={(v) => setE({ label: v })} /></div>
            <button type="button" onClick={() => { set("eras", eras.filter((_, j) => j !== ei)); setEraSel(0); }} className={iconBtn} style={{ borderColor: LINE, color: RUST }} title="Xoá mục"><Trash2 size={16} /></button>
          </div>
          <div><Label>Gợi ý dòng máy</Label><div className="flex flex-wrap gap-1.5">{tiers.map((t) => <Chip key={t.id} on={e.tier === t.id} onClick={() => setE({ tier: t.id })}>{t.name}</Chip>)}</div></div>
          <Text label="Lời khuyên" rows={2} value={e.text} onChange={(v) => setE({ text: v })} />
          <div>
            <Label>3 máy gợi ý</Label>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {[0, 1, 2].map((k) => {
                const x = models.find((y) => y.slug === e.picks[k]);
                return (
                  <div key={k} className="space-y-1.5">
                    <Pic src={x && hhImage(x)} photo={x?.photo} className="aspect-[5/4] rounded-lg" style={{ border: `1px solid ${LINE}` }} />
                    <select value={e.picks[k] || ""} onChange={(ev) => { const p = [...e.picks]; p[k] = ev.target.value; setE({ picks: p.filter(Boolean) }); }} className={field} style={{ borderColor: LINE }}>
                      <option value="">Chọn máy</option>
                      {models.map((y) => <option key={y.slug} value={y.slug}>{y.name}</option>)}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : <p className="rounded-lg p-6 text-center text-sm" style={{ background: PAPER, color: MUTE }}>Chưa có mục nào, khối này sẽ ẩn trên web.</p>}
    </div>
  );

  const setLife = (i, patch) => set("life", { on: life.on, items: life.items.map((l, j) => (j === i ? { ...l, ...patch } : l)) });
  const lifeReady = life.items.every((l) => l.image);
  const lifePane = (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 rounded-lg px-3.5 py-3" style={{ background: life.on && lifeReady ? "#F0FDF4" : PAPER }}>
        <div>
          <div className="text-sm font-semibold" style={{ color: TEXT }}>Khối “Chơi ở đâu cũng được”</div>
          <div className="text-xs" style={{ color: MUTE }}>{lifeReady ? (life.on ? "Đang hiện trên web." : "Đủ ảnh, bật lên là hiện.") : `Cần đủ 4 ảnh, còn thiếu ${life.items.filter((l) => !l.image).length}.`}</div>
        </div>
        <Toggle on={life.on && lifeReady} disabled={!lifeReady} onChange={(v) => set("life", { on: v, items: life.items })} label="Hiện khối ảnh đời sống" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {life.items.map((l, i) => (
          <div key={i} className="space-y-2.5 rounded-xl p-3" style={{ border: `1px solid ${LINE}` }}>
            <Pic src={l.image} photo className="aspect-video rounded-lg" />
            <UploadBtn busy={busy === `l${i}`} onFile={(f) => up(`l${i}`, f, (url) => setLife(i, { image: url }))}>{l.image ? "Đổi ảnh" : "Tải ảnh"}</UploadBtn>
            <Text label="Dòng chữ" value={l.title} onChange={(v) => setLife(i, { title: v })} />
            <div><Label>Bấm vào đi tới dòng máy</Label><div className="flex flex-wrap gap-1.5">{tiers.map((t) => <Chip key={t.id} on={l.id === t.id} onClick={() => setLife(i, { id: t.id })}>{t.name}</Chip>)}</div></div>
          </div>
        ))}
      </div>
    </div>
  );

  const setF = (i, patch) => set("faq", faq.map((f, j) => (j === i ? { ...f, ...patch } : f)));
  const faqPane = (
    <div className="space-y-2.5">
      {faq.map((f, i) => (
        <div key={i} className="space-y-2 rounded-xl p-3" style={{ border: `1px solid ${LINE}` }}>
          <div className="flex items-center gap-1.5">
            <input value={f.q} onChange={(e) => setF(i, { q: e.target.value })} placeholder="Câu hỏi" className={field + " font-semibold"} style={{ borderColor: LINE }} />
            <button type="button" onClick={() => set("faq", swapped(faq, i, i - 1))} disabled={i === 0} className={iconBtn} style={{ borderColor: LINE, color: TEXT }} title="Đưa lên"><ArrowUp size={15} /></button>
            <button type="button" onClick={() => set("faq", swapped(faq, i, i + 1))} disabled={i === faq.length - 1} className={iconBtn} style={{ borderColor: LINE, color: TEXT }} title="Đưa xuống"><ArrowDown size={15} /></button>
            <button type="button" onClick={() => set("faq", faq.filter((_, j) => j !== i))} className={iconBtn} style={{ borderColor: LINE, color: RUST }} title="Xoá"><Trash2 size={15} /></button>
          </div>
          <textarea rows={2} value={f.a} onChange={(e) => setF(i, { a: e.target.value })} placeholder="Câu trả lời" className={field} style={{ borderColor: LINE }} />
        </div>
      ))}
      <button type="button" onClick={() => set("faq", [...faq, { q: "", a: "" }])} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed px-3 py-2.5 text-sm font-medium" style={{ borderColor: "#9CA3AF", color: INK }}><Plus size={16} /> Thêm câu hỏi</button>
    </div>
  );

  const heroPane = (
    <div className="space-y-4">
      <div className="rounded-xl p-5 text-white" style={{ background: "radial-gradient(70% 120% at 80% 20%,#1E2A8A,#060A2A 75%)" }}>
        <div className="text-3xl font-bold leading-tight">{hero.head} <span style={{ color: GOLD }}>{hero.accent}</span></div>
        <p className="mt-2 max-w-md text-sm opacity-90">{hero.sub}</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Text label="Tiêu đề, phần chữ trắng" value={hero.head} onChange={(v) => set("hero", { ...hero, head: v })} />
        <Text label="Tiêu đề, phần chữ vàng" value={hero.accent} onChange={(v) => set("hero", { ...hero, accent: v })} />
      </div>
      <Text label="Dòng giới thiệu" rows={2} value={hero.sub} onChange={(v) => set("hero", { ...hero, sub: v })} />
      <div>
        <Label>Tên hãng chạy trên dải vàng</Label>
        <div className="flex flex-wrap gap-1.5">
          {brandTape.map((b) => <span key={b} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-medium" style={{ background: GOLD, color: TEXT }}>{b}<button type="button" onClick={() => set("brands", brandTape.filter((x) => x !== b))} title="Bỏ"><X size={13} /></button></span>)}
        </div>
        <form className="mt-2 flex gap-2" onSubmit={(ev) => { ev.preventDefault(); const t = brandText.trim(); if (t && !brandTape.includes(t)) set("brands", [...brandTape, t]); setBrandText(""); }}>
          <input value={brandText} onChange={(ev) => setBrandText(ev.target.value)} placeholder="Thêm hãng" className={field} style={{ borderColor: LINE }} />
          <button type="submit" className="rounded-md border px-3 text-sm font-medium" style={{ borderColor: LINE, color: INK }}><Check size={16} /></button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold" style={{ color: TEXT }}>Trang máy chơi game cầm tay</h3>
        <a href="https://hilipc.vn/may-choi-game-cam-tay" target="_blank" rel="noopener" className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-sm" style={{ borderColor: LINE, color: TEXT }}>Xem trang <ExternalLink size={14} /></a>
      </div>
      <div className="flex gap-1 overflow-x-auto rounded-lg p-1" style={{ background: PAPER }}>
        {PANES.map(([id, label]) => (
          <button key={id} type="button" onClick={() => { setPane(id); setOpen(""); }} className="shrink-0 rounded-md px-3 py-1.5 text-sm font-medium" style={{ background: pane === id ? "#fff" : "transparent", color: pane === id ? INK : "#4B5563", boxShadow: pane === id ? "0 1px 3px rgba(15,23,70,.14)" : "none" }}>{label}</button>
        ))}
      </div>
      {pane === "models" && (m ? modelDetail : modelsPane)}
      {pane === "tiers" && tiersPane}
      {pane === "spot" && spotPane}
      {pane === "eras" && erasPane}
      {pane === "life" && lifePane}
      {pane === "faq" && faqPane}
      {pane === "hero" && heroPane}
      <div className="flex items-center justify-between gap-2 pt-1">
        <p className="text-xs" style={{ color: MUTE }}>Thay đổi tự lưu.</p>
        <button type="button" onClick={reset} className="text-xs underline" style={{ color: RUST }}>Khôi phục mặc định</button>
      </div>
    </div>
  );
}
