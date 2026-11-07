import React, { useState } from "react";
import { ChevronDown, ImageOff, Plus, Trash2, Upload, Wand2, X } from "lucide-react";
import { uploadProductImage } from "./lib/mediaUpload.js";
import { ProductPicker } from "./HomePanels.jsx";
import { THOR_SAMPLE, THOR_SPECS } from "./storefront/data/thorSample.js";

const INK = "#1E2A8A";
const TEXT = "#111827";
const MUTE = "#6B7280";
const LINE = "#E5E7EB";
const PAPER = "#F6F7FB";
const RUST = "#C62828";
const FOREST = "#15803D";
const field = "w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200";

function In({ label, value, onChange, placeholder, rows }) {
  return (
    <label className="block min-w-0">
      {label && <span className="mb-1 block text-[13px] font-semibold" style={{ color: TEXT }}>{label}</span>}
      {rows
        ? <textarea rows={rows} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={field} style={{ borderColor: LINE }} />
        : <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={field} style={{ borderColor: LINE }} />}
    </label>
  );
}

/** Ô ảnh bấm để tải lên. */
function Shot({ src, onChange, notify, ratio = "16/10", dark }) {
  const [busy, setBusy] = useState(false);
  const up = async (f) => {
    if (!f) return;
    setBusy(true);
    try { onChange((await uploadProductImage(f)).url); }
    catch (e) { notify?.(`Chưa tải được ảnh: ${e.message || e}`); }
    finally { setBusy(false); }
  };
  return (
    <div className="relative">
      <label className="grid cursor-pointer place-items-center overflow-hidden rounded-lg" style={{ aspectRatio: ratio, background: dark ? "#0C1026" : PAPER, border: `1px dashed ${src ? LINE : "#9CA3AF"}` }}>
        {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : busy ? <span className="text-xs">Đang tải…</span> : <span className="flex flex-col items-center gap-1 text-xs" style={{ color: MUTE }}><Upload size={16} />Tải ảnh</span>}
        <input type="file" accept="image/png,image/webp,image/jpeg" className="hidden" onChange={(e) => { up(e.target.files?.[0]); e.target.value = ""; }} />
      </label>
      {src && <button type="button" onClick={() => onChange("")} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white" style={{ border: `1px solid ${LINE}`, color: RUST }} title="Bỏ ảnh"><X size={13} /></button>}
    </div>
  );
}

function Block({ title, filled, open, onToggle, children }) {
  return (
    <div className="rounded-xl bg-white" style={{ border: `1px solid ${LINE}` }}>
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-2 p-3.5 text-left">
        <span className="text-[15px] font-semibold" style={{ color: TEXT }}>{title}</span>
        <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: filled ? FOREST : MUTE }}>{filled ? "Đã có" : "Trống, tự ẩn"}<ChevronDown size={16} style={{ transform: open ? "rotate(180deg)" : "none" }} /></span>
      </button>
      {open && <div className="space-y-3 px-3.5 pb-3.5" style={{ borderTop: `1px solid ${LINE}`, paddingTop: 12 }}>{children}</div>}
    </div>
  );
}

/** Danh sách có thêm, xoá dùng chung cho các mục lặp lại. */
function Rows({ items, onChange, max = 12, blank, addLabel, render }) {
  const set = (i, patch) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  return (
    <div className="space-y-2.5">
      {items.map((x, i) => (
        <div key={i} className="relative rounded-lg p-2.5 pr-9" style={{ background: PAPER }}>
          {render(x, (patch) => set(i, patch))}
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-md bg-white" style={{ border: `1px solid ${LINE}`, color: RUST }} title="Xoá"><Trash2 size={14} /></button>
        </div>
      ))}
      {items.length < max && <button type="button" onClick={() => onChange([...items, blank])} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed px-3 py-2 text-sm font-medium" style={{ borderColor: "#9CA3AF", color: INK }}><Plus size={15} /> {addLabel}</button>}
    </div>
  );
}

/** Nội dung trang bán máy game của một sản phẩm. Mục nào trống thì web tự ẩn. */
export default function GameProductEditor({ value, onChange, product, products, displayImage, askConfirm, notify, onSpecs }) {
  const g = value || {};
  const set = (patch) => onChange({ ...g, ...patch });
  const sub = (k, patch) => set({ [k]: { ...(g[k] || {}), ...patch } });
  const [open, setOpen] = useState("head");
  const tog = (k) => () => setOpen((v) => (v === k ? "" : k));
  const siblings = product.variantGroupId ? products.filter((x) => x.variantGroupId === product.variantGroupId) : [];
  const colorKey = Object.keys(product.variantAttrs || {}).find((k) => /màu/i.test(k));
  const colorNames = colorKey ? [...new Set(siblings.map((x) => x.variantAttrs?.[colorKey]).filter(Boolean))] : [];
  const colors = g.colors || [];
  const extra = colorNames.filter((n) => !colors.some((c) => c.name.toLowerCase() === n.toLowerCase()));
  const addons = (g.addons || []).map((id) => products.find((x) => x.id === id || x.variantGroupId === id)).filter(Boolean);
  const sample = async () => {
    if (Object.keys(g).length && !await askConfirm("Nạp mẫu AYN Thor sẽ thay nội dung trang bán đang có của sản phẩm này. Tiếp tục?")) return;
    onChange(THOR_SAMPLE);
    if (!(product.web?.specsText || "").trim()) onSpecs?.(THOR_SPECS);
  };

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg px-3.5 py-2.5" style={{ background: "#EEF1FB" }}>
        <p className="text-sm" style={{ color: TEXT }}>Sản phẩm này mở trang tối riêng. Mục nào để trống, web tự ẩn.</p>
        {/thor/i.test(product.name) && <button type="button" onClick={sample} className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-white" style={{ background: INK }}><Wand2 size={14} /> Nạp mẫu AYN Thor</button>}
      </div>

      <Block title="Giới thiệu đầu trang" filled={!!(g.tagline || g.word)} open={open === "head"} onToggle={tog("head")}>
        <In label="Dòng giới thiệu" rows={2} value={g.tagline} onChange={(v) => set({ tagline: v })} placeholder="Để trống thì dùng mô tả ngắn" />
        <div className="grid gap-3 sm:grid-cols-3">
          <In label="Loại máy" value={g.kicker} onChange={(v) => set({ kicker: v })} placeholder="Máy Android hai màn hình" />
          <In label="Chữ chạy nền" value={g.word} onChange={(v) => set({ word: v })} placeholder="THOR" />
          <label className="block"><span className="mb-1 block text-[13px] font-semibold" style={{ color: TEXT }}>Màu điểm nhấn</span><input type="color" value={g.accent || "#FF7A2E"} onChange={(e) => set({ accent: e.target.value })} className="h-[38px] w-full rounded-md border bg-white p-1" style={{ borderColor: LINE }} /></label>
        </div>
        <In label="Dải chữ vàng chạy ngang" value={(g.tape || []).join(", ")} onChange={(v) => set({ tape: v.split(",").map((x) => x.trimStart()) })} placeholder="Hai màn OLED, Pin 6000mAh, Wi-Fi 7" />
      </Block>

      <Block title="Màu sắc" filled={colors.length > 0} open={open === "colors"} onToggle={tog("colors")}>
        {extra.length > 0 && <p className="text-xs" style={{ color: MUTE }}>Phiên bản có màu chưa khai: {extra.join(", ")}. Đặt đúng tên màu để web tự khớp ảnh.</p>}
        <Rows items={colors} onChange={(v) => set({ colors: v })} max={8} blank={{ name: extra[0] || "", dot: "#333333", accent: "#FF7A2E", image: "" }} addLabel="Thêm màu" render={(c, p) => (
          <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-2.5">
            <Shot src={c.image} onChange={(v) => p({ image: v })} notify={notify} dark />
            <div className="space-y-2">
              <In value={c.name} onChange={(v) => p({ name: v })} placeholder="Tên màu, trùng tên ở phiên bản" />
              <div className="flex flex-wrap gap-3 text-xs" style={{ color: MUTE }}>
                <label className="flex items-center gap-1.5">Màu nút <input type="color" value={c.dot || "#333333"} onChange={(e) => p({ dot: e.target.value })} className="h-7 w-9 rounded border" style={{ borderColor: LINE }} /></label>
                <label className="flex items-center gap-1.5">Màu sáng nền <input type="color" value={c.accent || "#FF7A2E"} onChange={(e) => p({ accent: e.target.value })} className="h-7 w-9 rounded border" style={{ borderColor: LINE }} /></label>
              </div>
            </div>
          </div>
        )} />
      </Block>

      <Block title="Ảnh thêm ở khu mua hàng" filled={(g.gallery || []).length > 0} open={open === "gal"} onToggle={tog("gal")}>
        <Rows items={g.gallery || []} onChange={(v) => set({ gallery: v })} max={6} blank={{ image: "", title: "" }} addLabel="Thêm ảnh" render={(x, p) => (
          <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-2.5 items-center"><Shot src={x.image} onChange={(v) => p({ image: v })} notify={notify} dark /><In value={x.title} onChange={(v) => p({ title: v })} placeholder="Chú thích ngắn" /></div>
        )} />
      </Block>

      <Block title="Đoạn cuộn điện ảnh" filled={!!g.film?.image} open={open === "film"} onToggle={tog("film")}>
        <div className="grid gap-3 sm:grid-cols-[200px_minmax(0,1fr)]">
          <Shot src={g.film?.image} onChange={(v) => sub("film", { image: v })} notify={notify} dark />
          <In label="Chữ hiện lần lượt, mỗi dòng một câu" rows={3} value={(g.film?.lines || []).join("\n")} onChange={(v) => sub("film", { lines: v.split("\n") })} placeholder={"Mở ra là chơi.\nGập lại là đi."} />
        </div>
      </Block>

      <Block title="Tính năng nổi bật" filled={(g.scenes || []).length > 0} open={open === "scenes"} onToggle={tog("scenes")}>
        <In label="Tiêu đề mục" value={g.sceneTitle} onChange={(v) => set({ sceneTitle: v })} placeholder="Hai màn hình, hai việc cùng lúc" />
        <Rows items={g.scenes || []} onChange={(v) => set({ scenes: v })} max={4} blank={{ image: "", title: "", text: "" }} addLabel="Thêm tính năng" render={(x, p) => (
          <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-2.5"><Shot src={x.image} onChange={(v) => p({ image: v })} notify={notify} dark /><div className="space-y-2"><In value={x.title} onChange={(v) => p({ title: v })} placeholder="Tên tính năng" /><In value={x.text} onChange={(v) => p({ text: v })} placeholder="Một câu mô tả" /></div></div>
        )} />
        <p className="pt-1 text-[13px] font-semibold" style={{ color: TEXT }}>Thẻ thông số dưới ảnh</p>
        <Rows items={g.screens || []} onChange={(v) => set({ screens: v })} max={3} blank={{ title: "", value: "", tags: "" }} addLabel="Thêm thẻ" render={(x, p) => (
          <div className="grid gap-2 sm:grid-cols-3"><In value={x.title} onChange={(v) => p({ title: v })} placeholder="Màn trên" /><In value={x.value} onChange={(v) => p({ value: v })} placeholder="6 inch AMOLED" /><In value={x.tags} onChange={(v) => p({ tags: v })} placeholder="120Hz, 650 nit" /></div>
        )} />
      </Block>

      <Block title="Biểu đồ hiệu năng" filled={(g.power?.rows || []).length > 0} open={open === "power"} onToggle={tog("power")}>
        <div className="grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)]">
          <Shot src={g.power?.image} onChange={(v) => sub("power", { image: v })} notify={notify} ratio="1/1" dark />
          <div className="space-y-2">
            <In label="Tiêu đề" value={g.power?.title} onChange={(v) => sub("power", { title: v })} />
            <In label="Mô tả" rows={2} value={g.power?.text} onChange={(v) => sub("power", { text: v })} />
            <div className="grid grid-cols-2 gap-2"><In label="Tên cột mạnh" value={g.power?.nameA} onChange={(v) => sub("power", { nameA: v })} placeholder="8 Gen 2" /><In label="Tên cột so sánh" value={g.power?.nameB} onChange={(v) => sub("power", { nameB: v })} placeholder="865" /></div>
          </div>
        </div>
        <Rows items={g.power?.rows || []} onChange={(v) => sub("power", { rows: v })} max={5} blank={{ label: "", a: "", b: "" }} addLabel="Thêm dòng điểm" render={(x, p) => (
          <div className="grid grid-cols-3 gap-2"><In value={x.label} onChange={(v) => p({ label: v })} placeholder="Đa nhân" /><In value={x.a} onChange={(v) => p({ a: v.replace(/\D/g, "") })} placeholder="Điểm" /><In value={x.b} onChange={(v) => p({ b: v.replace(/\D/g, "") })} placeholder="Điểm so sánh" /></div>
        )} />
        <In label="Ghi chú nguồn số liệu" value={g.power?.note} onChange={(v) => sub("power", { note: v })} placeholder="Điểm do hãng công bố." />
      </Block>

      <Block title="Gợi ý chọn bản" filled={(g.advisor || []).length > 0} open={open === "adv"} onToggle={tog("adv")}>
        <In label="Câu hỏi" value={g.advisorTitle} onChange={(v) => set({ advisorTitle: v })} placeholder="Bạn hay chơi gì?" />
        <Rows items={g.advisor || []} onChange={(v) => set({ advisor: v })} max={6} blank={{ q: "", pick: "", why: "" }} addLabel="Thêm lựa chọn" render={(x, p) => (
          <div className="grid gap-2 sm:grid-cols-3"><In value={x.q} onChange={(v) => p({ q: v })} placeholder="Khách chọn" /><In value={x.pick} onChange={(v) => p({ pick: v })} placeholder="Tên phiên bản, VD Pro" /><In value={x.why} onChange={(v) => p({ why: v })} placeholder="Vì sao hợp" /></div>
        )} />
      </Block>

      <Block title="Từng chi tiết" filled={(g.details || []).length > 0} open={open === "det"} onToggle={tog("det")}>
        <In label="Tiêu đề mục" value={g.detailTitle} onChange={(v) => set({ detailTitle: v })} placeholder="Từng chi tiết đều cho người chơi" />
        <Rows items={g.details || []} onChange={(v) => set({ details: v })} max={7} blank={{ image: "", title: "", text: "" }} addLabel="Thêm chi tiết" render={(x, p) => (
          <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-2.5"><Shot src={x.image} onChange={(v) => p({ image: v })} notify={notify} dark /><div className="space-y-2"><In value={x.title} onChange={(v) => p({ title: v })} placeholder="Tên chi tiết" /><In value={x.text} onChange={(v) => p({ text: v })} placeholder="Một câu ngắn" /></div></div>
        )} />
      </Block>

      <Block title="Kích thước" filled={!!g.size?.image || (g.size?.stats || []).length > 0} open={open === "size"} onToggle={tog("size")}>
        <In label="Tiêu đề" value={g.size?.title} onChange={(v) => sub("size", { title: v })} placeholder="Bỏ túi áo khoác, mang đi mỗi ngày" />
        <div className="grid grid-cols-2 gap-3">
          <div><p className="mb-1 text-[13px] font-semibold" style={{ color: TEXT }}>Ảnh cầm tay</p><Shot src={g.size?.image} onChange={(v) => sub("size", { image: v })} notify={notify} dark /></div>
          <div><p className="mb-1 text-[13px] font-semibold" style={{ color: TEXT }}>Ảnh kích thước</p><Shot src={g.size?.drawing} onChange={(v) => sub("size", { drawing: v })} notify={notify} dark /></div>
        </div>
        <Rows items={g.size?.stats || []} onChange={(v) => sub("size", { stats: v })} max={3} blank={{ label: "", value: "", unit: "" }} addLabel="Thêm số đo" render={(x, p) => (
          <div className="grid grid-cols-3 gap-2"><In value={x.label} onChange={(v) => p({ label: v })} placeholder="Nặng" /><In value={x.value} onChange={(v) => p({ value: v })} placeholder="380" /><In value={x.unit} onChange={(v) => p({ unit: v })} placeholder="gram" /></div>
        )} />
      </Block>

      <Block title="Bảng so sánh phiên bản" filled={!!(g.compareText || "").trim()} open={open === "cmp"} onToggle={tog("cmp")}>
        <p className="text-xs" style={{ color: MUTE }}>Dòng đầu là tên các phiên bản, các dòng sau là <b>Nhãn | giá trị từng bản</b>. Giá và nút Chọn tự thêm.</p>
        <In rows={6} value={g.compareText} onChange={(v) => set({ compareText: v })} placeholder={"| Lite | Base | Pro\nChip | 865 | 8 Gen 2 | 8 Gen 2\nBộ nhớ | 128GB | 128GB | 256GB"} />
      </Block>

      <Block title="Mua kèm" filled={addons.length > 0} open={open === "add"} onToggle={tog("add")}>
        {addons.map((a) => (
          <div key={a.id} className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm" style={{ background: PAPER }}>
            <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded bg-white">{displayImage(a) ? <img src={displayImage(a)} alt="" className="h-full w-full object-contain" /> : <ImageOff size={13} />}</span>
            <span className="min-w-0 flex-1 truncate">{a.name}</span>
            <button type="button" onClick={() => set({ addons: (g.addons || []).filter((id) => id !== a.id && id !== a.variantGroupId) })} style={{ color: RUST }} title="Bỏ"><X size={15} /></button>
          </div>
        ))}
        <ProductPicker products={products.filter((x) => x.web?.published && x.id !== product.id)} displayImage={displayImage} onPick={(x) => set({ addons: [...new Set([...(g.addons || []), x.variantGroupId || x.id])] })} placeholder="Tìm phụ kiện để bán kèm" />
      </Block>

      <Block title="Hỏi đáp" filled={(g.faq || []).length > 0} open={open === "faq"} onToggle={tog("faq")}>
        <Rows items={g.faq || []} onChange={(v) => set({ faq: v })} max={8} blank={{ q: "", a: "" }} addLabel="Thêm câu hỏi" render={(x, p) => (
          <div className="space-y-2"><In value={x.q} onChange={(v) => p({ q: v })} placeholder="Câu hỏi" /><In rows={2} value={x.a} onChange={(v) => p({ a: v })} placeholder="Câu trả lời" /></div>
        )} />
      </Block>
    </div>
  );
}
