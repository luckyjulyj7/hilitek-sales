import React, { useMemo, useState } from "react";
import { ImageOff, Upload, RotateCcw, Check, Link2, Move } from "lucide-react";
import { HOME_TILES as DEFAULT_TILES, HOME_TITLES as DEFAULT_TITLES } from "./storefront/config.js";
import { uploadProductImage } from "./lib/mediaUpload.js";

const INK = "#1E2A8A";
const TEXT = "#111827";
const LINE = "#E5E7EB";
const PAPER = "#F6F7FB";
const RUST = "#C62828";
const GOLD = "#F7C600";

// Vị trí 8 ô trên lưới 12 cột x 4 hàng của trang chủ (giống hệt web khách).
const AREAS = ["1/1/3/6", "1/6/2/13", "2/6/4/9", "2/9/3/13", "3/9/5/13", "3/1/4/6", "4/1/5/5", "4/5/5/9"];
const TONES = [
  ["light", "Trắng", "#FFFFFF", TEXT],
  ["dark", "Xanh đen", "#060A2A", "#FFFFFF"],
  ["navy", "Xanh đậm", "#1E2A8A", "#FFFFFF"],
  ["yellow", "Vàng", GOLD, TEXT],
];
const STYLES = [
  ["cut", "Ảnh tách nền", "Sản phẩm PNG nền trong suốt, đặt nổi trên màu nền"],
  ["photo", "Ảnh phủ kín", "Ảnh rộng phủ cả ô, chữ trắng đè lên bên trái"],
  ["side", "Ảnh bên phải", "Chữ bên trái, ảnh chiếm nửa phải"],
  ["fan", "Xếp quạt", "Tối đa 4 ảnh nhỏ xếp chồng nghiêng"],
];
const toneOf = (t) => TONES.find((x) => x[0] === t) || TONES[0];

/** Hình thu nhỏ của một ô, vẽ gần giống ngoài web để chủ shop nhìn là hiểu. */
function Mock({ t, selected, over, onPick, drag }) {
  const [, , bg, fg] = toneOf(t.tone);
  const imgs = t.style === "fan" ? (t.images || []).filter(Boolean).slice(0, 4) : t.image ? [t.image] : [];
  return (
    <button
      type="button"
      draggable
      onDragStart={drag.start}
      onDragOver={drag.over}
      onDragLeave={drag.leave}
      onDrop={drag.drop}
      onClick={onPick}
      className="relative overflow-hidden rounded-lg text-left transition"
      style={{
        gridArea: t._area, background: bg, color: fg, cursor: "grab",
        boxShadow: selected ? `0 0 0 3px ${INK}` : over ? `0 0 0 3px ${GOLD}` : `inset 0 0 0 1px ${LINE}`,
        opacity: over ? 0.85 : 1,
      }}
    >
      {t.style === "photo" && t.image && <img src={t.image} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />}
      {t.style === "photo" && t.image && <div className="absolute inset-0" style={{ background: "linear-gradient(90deg,rgba(6,10,42,.85),transparent 80%)" }} />}
      {t.style === "side" && t.image && <img src={t.image} alt="" className="absolute inset-0 h-full w-full object-cover object-right" draggable={false} />}
      {t.style === "cut" && t.image && <img src={t.image} alt="" className="absolute bottom-1 right-1 h-[78%] max-w-[55%] object-contain" draggable={false} />}
      {t.style === "fan" && (
        <div className="absolute inset-y-0 right-1 flex w-1/2 items-center justify-end">
          {imgs.map((s, i) => <img key={i} src={s} alt="" className="-mr-2 h-[70%] w-[28%] object-contain" draggable={false} />)}
        </div>
      )}
      {!t.image && t.style !== "fan" && (
        <span className="absolute bottom-1 right-1.5 rounded px-1 text-[10px]" style={{ background: "rgba(0,0,0,.08)" }}>ảnh tự lấy</span>
      )}
      <span className="relative z-10 block px-2 pt-1.5 text-[12px] font-bold leading-tight" style={{ maxWidth: "62%" }}>{t.title || "Chưa đặt tên"}</span>
      {selected && <span className="absolute left-1 top-1 hidden" />}
    </button>
  );
}

function Label({ children, hint }) {
  return (
    <div className="mb-1.5">
      <div className="text-[13px] font-semibold" style={{ color: TEXT }}>{children}</div>
      {hint && <div className="text-xs" style={{ color: "#6B7280" }}>{hint}</div>}
    </div>
  );
}

export default function HomeTilesEditor({ webConfig, setWebConfig, menu, landings, notify }) {
  const saved = Array.isArray(webConfig.HOME_TILES) && webConfig.HOME_TILES.length === DEFAULT_TILES.length ? webConfig.HOME_TILES : null;
  const tiles = useMemo(() => DEFAULT_TILES.map((d, i) => ({ ...d, ...((saved && saved[i]) || {}) })), [saved]);
  const titles = { ...DEFAULT_TITLES, ...(webConfig.HOME_TITLES || {}) };
  const [sel, setSel] = useState(0);
  const [dragFrom, setDragFrom] = useState(-1);
  const [dragOver, setDragOver] = useState(-1);
  const [busy, setBusy] = useState("");
  const t = tiles[sel] || tiles[0];

  const commit = (next) => setWebConfig((x) => ({ ...x, HOME_TILES: next }));
  const patch = (k, v) => commit(tiles.map((x, i) => (i === sel ? { ...x, [k]: v } : x)));
  const patchMany = (o) => commit(tiles.map((x, i) => (i === sel ? { ...x, ...o } : x)));
  const swap = (a, b) => {
    if (a === b || a < 0 || b < 0) return;
    const n = [...tiles];
    [n[a], n[b]] = [n[b], n[a]];
    commit(n);
    setSel(b);
  };
  const setTitle = (k, v) => setWebConfig((x) => ({ ...x, HOME_TITLES: { ...(x.HOME_TITLES || {}), [k]: v } }));
  const resetTile = () => commit(tiles.map((x, i) => (i === sel ? { ...DEFAULT_TILES.find((d) => d.id === x.id) || DEFAULT_TILES[i] } : x)));
  const resetAll = () => setWebConfig((x) => { const y = { ...x }; delete y.HOME_TILES; delete y.HOME_TITLES; return y; });

  const upload = async (file, slot) => {
    if (!file) return;
    setBusy(String(slot));
    try {
      const url = (await uploadProductImage(file)).url;
      if (slot === "main") patch("image", url);
      else {
        const arr = [...(t.images || [])];
        while (arr.length < 4) arr.push("");
        arr[slot] = url;
        patch("images", arr);
      }
    } catch (e) {
      notify?.(`Chưa tải được ảnh: ${e.message || e}`);
    } finally { setBusy(""); }
  };

  // Danh sách link chọn nhanh.
  const linkOpts = useMemo(() => {
    const o = [];
    (menu || []).forEach((g) => o.push([`/danh-muc?group=${encodeURIComponent(g.group)}`, `Danh mục: ${g.group}`]));
    o.push(["/danh-muc?sort=discount", "Danh mục: đang giảm giá"]);
    o.push(["/may-choi-game-cam-tay", "Trang Máy chơi game cầm tay"]);
    o.push(["/tin-tuc", "Trang Tin tức"]);
    (landings || []).forEach((l) => l.slug && o.push([`/trang/${l.slug}`, `Trang nội dung: ${l.title || l.slug}`]));
    o.push(["zalo", "Chat Zalo của shop"]);
    return o;
  }, [menu, landings]);
  const known = linkOpts.some(([v]) => v === t.href);
  const [custom, setCustom] = useState(false);
  const linkMode = custom || !known ? "custom" : t.href;

  const priceOpts = [["", "Không hiện giá"], ...(menu || []).map((g) => [`group:${g.group}`, `Giá thấp nhất của nhóm ${g.group}`])];
  const priceKnown = priceOpts.some(([v]) => v === (t.price || ""));

  const dragFor = (i) => ({
    start: (e) => { setDragFrom(i); e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", String(i)); } catch { /* bỏ qua */ } },
    over: (e) => { e.preventDefault(); if (dragOver !== i) setDragOver(i); },
    leave: () => setDragOver(-1),
    drop: (e) => { e.preventDefault(); const from = dragFrom; setDragFrom(-1); setDragOver(-1); swap(from, i); },
  });

  const chip = (on) => ({ border: `1px solid ${on ? INK : LINE}`, background: on ? "#EEF1FB" : "#fff", boxShadow: on ? `inset 0 0 0 1px ${INK}` : "none" });

  return (
    <div className="space-y-5">
      <div className="rounded-lg p-4" style={{ background: PAPER, border: `1px solid ${LINE}` }}>
        <div className="mb-2 text-sm font-semibold" style={{ color: TEXT }}>Tiêu đề các khối ở trang chủ</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[["cats", "Khối danh mục"], ["promo", "Khối chương trình"], ["hot", "Khối sản phẩm"]].map(([k, l]) => (
            <label key={k} className="block">
              <span className="mb-1 block text-xs" style={{ color: "#6B7280" }}>{l}</span>
              <input value={titles[k] || ""} onChange={(e) => setTitle(k, e.target.value)} placeholder={DEFAULT_TITLES[k]} className="w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200" style={{ borderColor: LINE }} />
            </label>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-sm font-semibold" style={{ color: TEXT }}>Khối danh mục: bấm một ô để sửa, kéo ô này thả lên ô kia để đổi chỗ</div>
            <div className="text-xs" style={{ color: "#6B7280" }}>Hình thu nhỏ bên dưới giống bố cục ngoài web khách.</div>
          </div>
          <button type="button" onClick={resetAll} className="inline-flex items-center gap-1 text-xs underline" style={{ color: RUST }}><RotateCcw size={12} /> Khôi phục mặc định cả khối</button>
        </div>
        <div className="grid gap-1.5 rounded-xl p-2" style={{ gridTemplateColumns: "repeat(12,minmax(0,1fr))", gridAutoRows: "clamp(40px,6vw,60px)", background: PAPER, border: `1px solid ${LINE}` }}>
          {tiles.map((x, i) => (
            <Mock key={x.id || i} t={{ ...x, _area: AREAS[i] }} selected={i === sel} over={i === dragOver && dragFrom !== i} onPick={() => { setSel(i); setCustom(false); }} drag={dragFor(i)} />
          ))}
        </div>
      </div>

      <div className="rounded-xl p-4 md:p-5" style={{ border: `1px solid ${LINE}`, background: "#fff" }}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="text-base font-semibold" style={{ color: TEXT }}>Đang sửa ô {sel + 1}: {t.title || "Chưa đặt tên"}</div>
          <div className="flex items-center gap-2">
            <Move size={14} style={{ color: "#6B7280" }} />
            <select value="" onChange={(e) => swap(sel, Number(e.target.value))} className="rounded-md border bg-white px-2 py-1.5 text-xs" style={{ borderColor: LINE }}>
              <option value="">Đổi chỗ với ô…</option>
              {tiles.map((x, i) => i !== sel && <option key={i} value={i}>{i + 1}. {x.title}</option>)}
            </select>
            <button type="button" onClick={resetTile} className="inline-flex items-center gap-1 rounded-md border px-2 py-1.5 text-xs" style={{ borderColor: LINE, color: TEXT }}><RotateCcw size={12} /> Về mặc định</button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <Label>Tên ô</Label>
              <input value={t.title || ""} onChange={(e) => patch("title", e.target.value)} className="w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200" style={{ borderColor: LINE }} />
            </div>
            <div>
              <Label>Dòng chữ nhỏ bên dưới tên</Label>
              <input value={t.sub || ""} onChange={(e) => patch("sub", e.target.value)} placeholder="Để trống nếu không cần" className="w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200" style={{ borderColor: LINE }} />
            </div>
            <div>
              <Label hint="Khách bấm vào ô sẽ đi tới đâu.">Bấm vào ô đi tới</Label>
              <div className="flex items-center gap-2">
                <Link2 size={16} className="shrink-0" style={{ color: "#6B7280" }} />
                <select value={linkMode} onChange={(e) => { if (e.target.value === "custom") { setCustom(true); } else { setCustom(false); patch("href", e.target.value); } }} className="w-full rounded-md border bg-white px-3 py-2 text-sm" style={{ borderColor: LINE }}>
                  {linkOpts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  <option value="custom">Nhập link khác…</option>
                </select>
              </div>
              {linkMode === "custom" && (
                <input value={t.href || ""} onChange={(e) => patch("href", e.target.value)} placeholder="/danh-muc?group=… hoặc https://…" className="mt-2 w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200" style={{ borderColor: LINE }} />
              )}
            </div>
            <div>
              <Label hint="Web tự tìm giá rẻ nhất trong nhóm và hiện “Từ … đ”.">Giá hiện trong ô</Label>
              <select value={t.price || ""} onChange={(e) => patch("price", e.target.value)} className="w-full rounded-md border bg-white px-3 py-2 text-sm" style={{ borderColor: LINE }}>
                {!priceKnown && <option value={t.price}>Giá mặc định của ô này</option>}
                {priceOpts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Màu nền ô</Label>
              <div className="flex flex-wrap gap-2">
                {TONES.map(([id, name, bg]) => (
                  <button key={id} type="button" onClick={() => patch("tone", id)} className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium" style={chip(t.tone === id)}>
                    <span className="grid h-5 w-5 place-items-center rounded" style={{ background: bg, border: `1px solid ${LINE}` }}>{t.tone === id && <Check size={12} color={id === "light" || id === "yellow" ? TEXT : "#fff"} />}</span>
                    {name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Kiểu hiện ảnh</Label>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map(([id, name, hint]) => (
                  <button key={id} type="button" onClick={() => patch("style", id)} className="rounded-lg p-2.5 text-left" style={chip(t.style === id)}>
                    <div className="text-[13px] font-semibold" style={{ color: t.style === id ? INK : TEXT }}>{name}</div>
                    <div className="mt-0.5 text-[11px] leading-snug" style={{ color: "#6B7280" }}>{hint}</div>
                  </button>
                ))}
              </div>
            </div>
            {t.style === "fan" ? (
              <div>
                <Label hint="PNG nền trong suốt, tối đa 4 ảnh. Ảnh đầu nằm sau cùng.">Ảnh xếp quạt</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3].map((i) => {
                    const src = (t.images || [])[i];
                    return (
                      <label key={i} className="grid aspect-square cursor-pointer place-items-center overflow-hidden rounded-lg" style={{ border: `1px dashed ${LINE}`, background: PAPER }}>
                        {src ? <img src={src} alt="" className="h-full w-full object-contain" /> : busy === String(i) ? <span className="text-xs">Đang tải</span> : <Upload size={16} style={{ color: "#9CA3AF" }} />}
                        <input type="file" accept="image/png,image/webp" className="hidden" onChange={(e) => { upload(e.target.files?.[0], i); e.target.value = ""; }} />
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div>
                <Label hint={t.style === "cut" ? "Nên là PNG hoặc WebP đã xoá nền, chiều ngang từ 800px." : "Ảnh ngang, từ 1200px trở lên cho nét."}>Ảnh của ô</Label>
                <div className="flex items-center gap-3">
                  <div className="grid h-20 w-32 shrink-0 place-items-center overflow-hidden rounded-lg" style={{ background: t.tone === "light" ? "#fff" : toneOf(t.tone)[2], border: `1px solid ${LINE}` }}>
                    {t.image ? <img src={t.image} alt="" className="h-full w-full object-contain" /> : <ImageOff size={18} style={{ color: "#9CA3AF" }} />}
                  </div>
                  <div className="flex flex-col items-start gap-1.5">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-white" style={{ background: INK }}>
                      <Upload size={14} /> {busy === "main" ? "Đang tải…" : t.image ? "Đổi ảnh" : "Tải ảnh lên"}
                      <input type="file" accept="image/png,image/webp,image/jpeg" className="hidden" onChange={(e) => { upload(e.target.files?.[0], "main"); e.target.value = ""; }} />
                    </label>
                    {t.image && <button type="button" onClick={() => patch("image", "")} className="text-xs underline" style={{ color: RUST }}>Bỏ ảnh, dùng ảnh sản phẩm tự động</button>}
                    {!t.image && <span className="text-xs" style={{ color: "#6B7280" }}>Đang tự lấy ảnh sản phẩm của nhóm (nếu có giá).</span>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="text-xs" style={{ color: "#6B7280" }}>Thay đổi tự lưu. Ô nào chưa chỉnh thì web giữ nguyên bản mặc định.</p>
    </div>
  );
}
