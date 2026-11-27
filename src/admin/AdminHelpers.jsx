// Các khối giao diện nhỏ dùng chung cho trang quản lý, tách khỏi SalesManager.jsx (file quá lớn).
// Không gọi máy chủ: chỉ hiển thị dữ liệu đã tải sẵn và lưu vài lựa chọn hiển thị vào localStorage.
import React, { useState } from "react";
import { DocList, Pill } from "./DocList.jsx";
import { ArrowDownToLine, ArrowUpFromLine, Pencil, Globe, ImageOff, AlertTriangle, ChevronDown, X, Lightbulb, LayoutList, Table2, Info } from "lucide-react";

// Cùng bảng màu với SalesManager.jsx
const INK = "#1E2A8A";
const TEXT = "#111827";
const PAPER = "#F6F7FB";
const FOREST = "#15803D";
const RUST = "#C62828";
const BLUE = "#1D4ED8";
const LINE = "#E5E7EB";
const MUTE = "#4B5563"; // chữ phụ, đạt tương phản AA trên nền trắng

const vnd = (n) => (Math.round(Number(n)) || 0).toLocaleString("vi-VN") + "đ";

// Đọc/ghi localStorage an toàn (chế độ riêng tư có thể chặn).
export function usePref(key, initial) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem("hili_pref_" + key); return s == null ? initial : JSON.parse(s); } catch { return initial; }
  });
  const set = (nv) => {
    setV(nv);
    try { localStorage.setItem("hili_pref_" + key, JSON.stringify(nv)); } catch { /* bỏ qua */ }
  };
  return [v, set];
}

/* ---------- Nút có chữ (thay cho nút chỉ có biểu tượng) ---------- */
export function RowAction({ icon: Icon, label, title, onClick, color = TEXT, solid }) {
  return (
    <button
      type="button" onClick={onClick} title={title || label} aria-label={title || label}
      className="inline-flex items-center justify-center gap-1 min-h-[32px] px-2 rounded-md text-xs font-medium whitespace-nowrap transition hover:brightness-95"
      style={solid ? { background: color, color: "#fff" } : { color, border: `1px solid ${color}40`, background: "#fff" }}
    >
      <Icon size={13} /> <span>{label}</span>
    </button>
  );
}

/* ---------- Hướng dẫn "Bắt đầu từ đâu" (đóng được, nhớ theo máy) ---------- */
export function StartGuide({ id, title, steps, actions }) {
  const [hidden, setHidden] = usePref("guide2_" + id, true); // mặc định thu gọn thành 1 nút nhỏ cho đỡ rối
  if (hidden) {
    return (
      <button type="button" onClick={() => setHidden(false)} className="mb-3 inline-flex items-center gap-1.5 min-h-[32px] px-2.5 rounded-md text-xs font-medium" style={{ color: INK, background: `${INK}0D` }}>
        <Lightbulb size={13} /> Xem hướng dẫn: {title}
      </button>
    );
  }
  return (
    <section className="mb-4 rounded-lg p-4" style={{ background: "#fff", border: `1px solid ${INK}33`, boxShadow: "0 1px 2px rgba(17,24,39,.04)" }} aria-label={"Hướng dẫn " + title}>
      <div className="flex items-start gap-3">
        <span className="grid place-items-center w-8 h-8 rounded-md shrink-0" style={{ background: `${INK}12`, color: INK }}><Lightbulb size={16} /></span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold" style={{ color: INK }}>Bắt đầu từ đâu: {title}</h3>
          <ol className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] leading-snug" style={{ color: TEXT }}>
                <span className="grid place-items-center w-5 h-5 rounded-full text-[12px] font-bold shrink-0 text-white" style={{ background: INK }}>{i + 1}</span>
                <span><b className="font-semibold">{s[0]}</b>{s[1] ? <span style={{ color: MUTE }}> {s[1]}</span> : null}</span>
              </li>
            ))}
          </ol>
          {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
        </div>
        <button type="button" onClick={() => setHidden(true)} title="Ẩn hướng dẫn" aria-label="Ẩn hướng dẫn" className="grid place-items-center w-8 h-8 rounded-md shrink-0 hover:bg-black/5" style={{ color: MUTE }}><X size={16} /></button>
      </div>
    </section>
  );
}

/* ---------- Ghi chú quan hệ 2 màn hình sản phẩm ---------- */
export function ProductScreensNote({ where }) {
  const [hidden, setHidden] = usePref("note2_products_" + where, true); // mặc định ẩn
  if (hidden) return null;
  const inv = where === "inventory";
  return (
    <div className="mb-3 flex items-start gap-2.5 rounded-md p-3 text-[13px] leading-snug" style={{ background: `${BLUE}0A`, border: `1px solid ${BLUE}33`, color: TEXT }}>
      <Info size={16} className="mt-0.5 shrink-0" style={{ color: BLUE }} />
      <div className="flex-1">
        <b style={{ color: BLUE }}>{inv ? "Đây là kho: mọi mã hàng của shop." : "Đây là phần đăng bán trên hilipc.vn."}</b>{" "}
        Cùng một sản phẩm, hai việc khác nhau:
        <span className="block mt-1"><b>Sản phẩm & Tồn kho</b>: tên, mã, giá nhập/giá bán, tồn kho, nhập/xuất.</span>
        <span className="block"><b>Website → Sản phẩm</b>: ảnh, mô tả, danh mục web, bật/tắt hiện trên web.</span>
        <span className="block mt-1" style={{ color: MUTE }}>{inv ? "Bấm nút \"Web\" ở mỗi sản phẩm để sang sửa phần website của đúng sản phẩm đó." : "Bấm \"Sửa trong kho\" để đổi giá, tồn của đúng sản phẩm đó."}</span>
      </div>
      <button type="button" onClick={() => setHidden(true)} title="Đã hiểu, ẩn ghi chú" aria-label="Ẩn ghi chú" className="grid place-items-center w-7 h-7 rounded-md shrink-0 hover:bg-black/5" style={{ color: MUTE }}><X size={14} /></button>
    </div>
  );
}

/* ---------- Dải công nợ rút gọn: "Xem N khoản sắp đến hạn" ---------- */
// items: [{ key, code, who, text, overdue, onOpen }]
export function DueNotice({ items, label = "công nợ nhà cung cấp" }) {
  const [open, setOpen] = useState(false);
  if (!items || !items.length) return null;
  const overdue = items.filter((x) => x.overdue).length;
  return (
    <div className="mb-4 rounded-md" style={{ background: `${RUST}0D`, border: `1px solid ${RUST}44` }}>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="w-full flex items-center gap-2 min-h-[40px] px-3 text-left text-sm">
        <AlertTriangle size={16} style={{ color: RUST }} className="shrink-0" />
        <span style={{ color: TEXT }}>
          <b style={{ color: RUST }}>{items.length} khoản {label}</b> sắp/đã đến hạn{overdue ? <> · <b style={{ color: RUST }}>{overdue} quá hạn</b></> : null}
        </span>
        <span className="ml-auto inline-flex items-center gap-1 text-xs font-medium" style={{ color: RUST }}>
          {open ? "Thu gọn" : "Xem"} <ChevronDown size={14} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
        </span>
      </button>
      {open && (
        <ul className="px-3 pb-3 grid gap-1">
          {items.map((x) => (
            <li key={x.key} className="flex items-center gap-2 text-[13px] rounded-md px-2 py-1.5" style={{ background: "#fff", border: `1px solid ${LINE}` }}>
              <button type="button" onClick={x.onOpen} className="font-medium hover:underline" style={{ color: BLUE, fontFamily: "'Inter', sans-serif" }}>{x.code}</button>
              <span className="truncate" style={{ color: MUTE }}>{x.who}</span>
              <span className="ml-auto whitespace-nowrap font-medium" style={{ color: x.overdue ? RUST : TEXT }}>{x.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------- Mục thu gọn "Thông tin thêm" trong form ---------- */
export function MoreFields({ id = "more", title = "Thông tin thêm", note, children }) {
  const [open, setOpen] = usePref("more_" + id, false);
  return (
    <div className="my-3 rounded-md" style={{ border: `1px solid ${LINE}`, background: "#fff" }}>
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="w-full flex items-center gap-2 min-h-[44px] px-3 text-left text-sm">
        <ChevronDown size={16} style={{ color: MUTE, transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
        <b className="font-semibold whitespace-nowrap shrink-0" style={{ color: TEXT }}>{title}</b>
        {note && <span className="min-w-0 text-xs truncate" style={{ color: MUTE }}>{note}</span>}
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

/* ---------- Thanh "Sẵn sàng đăng web" ở đầu form sản phẩm ---------- */
// items: [{ label, ok, target }] — target là id phần tử để cuộn tới khi bấm vào mục còn thiếu.
export function ReadyChecklist({ items, published, onTogglePublish }) {
  const done = items.filter((x) => x.ok).length;
  const all = done === items.length;
  const go = (id) => { const el = id && document.getElementById(id); if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); const f = el.querySelector?.("input,select,textarea") || el; f.focus?.({ preventScroll: true }); } };
  return (
    <div className="mb-4 rounded-lg p-3" style={{ background: all ? `${FOREST}0D` : `${INK}08`, border: `1px solid ${all ? FOREST + "55" : INK + "26"}` }}>
      <div className="flex items-center gap-2 flex-wrap">
        <b className="text-sm" style={{ color: all ? FOREST : INK }}>{all ? "Đủ thông tin để bán" : `Còn thiếu ${items.length - done} mục`}</b>
        <span className="text-xs" style={{ color: MUTE }}>{done}/{items.length}</span>
        {onTogglePublish && (
          <label className="ml-auto inline-flex items-center gap-2 min-h-[32px] px-2.5 rounded-md text-xs font-semibold cursor-pointer" style={{ background: published ? FOREST : "#fff", color: published ? "#fff" : TEXT, border: `1px solid ${published ? FOREST : LINE}` }}>
            <input type="checkbox" checked={!!published} onChange={(e) => onTogglePublish(e.target.checked)} className="w-4 h-4" />
            {published ? "Đang đăng lên web" : "Đăng lên web"}
          </label>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map((x) => (
          <button key={x.label} type="button" onClick={() => !x.ok && go(x.target)}
            className="inline-flex items-center gap-1 min-h-[28px] px-2 rounded-full text-xs font-medium"
            style={x.ok ? { background: `${FOREST}14`, color: FOREST, cursor: "default" } : { background: "#fff", color: RUST, border: `1px solid ${RUST}55` }}>
            {x.ok ? "✓" : "+"} {x.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Nút chuyển chế độ xem kho ---------- */
export function ViewModeToggle({ value, onChange }) {
  const opt = (id, Icon, label, title) => (
    <button type="button" onClick={() => onChange(id)} aria-pressed={value === id} title={title}
      className="inline-flex items-center gap-1 min-h-[30px] px-2.5 rounded text-xs font-medium transition"
      style={value === id ? { background: INK, color: "#fff" } : { color: TEXT }}>
      <Icon size={13} /> {label}
    </button>
  );
  return (
    <div className="inline-flex items-center p-0.5 rounded-md shrink-0" style={{ border: `1px solid ${LINE}`, background: "#fff" }} role="group" aria-label="Chế độ xem">
      {opt("simple", LayoutList, "Đơn giản", "Ảnh, tên, giá bán, tồn kho")}
      {opt("full", Table2, "Đầy đủ", "Đủ cột kế toán: Mã VT, Tồn ĐK, Nhập, Xuất, Tồn CK")}
    </div>
  );
}

/* ---------- Danh sách kho dạng đơn giản: ảnh, tên, giá, tồn ---------- */
export function SimpleStockList({ groups, productStats, displayImage, isAdmin, isCtv, onOpen, onIO, onEdit, onWeb, selectedIds, toggleSelect, onToggleAll, allSelected }) {
  // Mỗi phiên bản là 1 dòng riêng cho dễ đọc (tên phiên bản đã có trong tên sản phẩm).
  const rows = groups.flatMap((g) => (g.type === "single" ? [g.p] : g.members));
  const stockOf = (p) => {
    const qty = productStats(p).closingQty, low = p.minStockLevel || 0;
    if (p.isService) return { t: "Dịch vụ", tone: "blue", n: "—" };
    if (qty < 0) return { t: "Âm kho", tone: "red", n: qty };
    if (qty === 0) return { t: "Hết hàng", tone: "gray", n: 0 };
    if (low && qty <= low) return { t: "Sắp hết", tone: "amber", n: qty };
    return { t: "Còn hàng", tone: "green", n: qty };
  };
  const Pic = ({ p }) => { const img = displayImage(p); return img ? <img src={img} alt="" loading="lazy" className="sk-img" /> : <span className="sk-img grid place-items-center"><ImageOff size={16} style={{ color: MUTE }} /></span>; };
  const acts = (p) => (
    <span className="sk-acts">
      {isAdmin && !p.isService && <RowAction icon={ArrowDownToLine} label="Nhập" title="Nhập kho" color={FOREST} onClick={() => onIO(p, "in")} />}
      {!isCtv && !p.isService && <RowAction icon={ArrowUpFromLine} label="Xuất" title="Xuất kho" color={RUST} onClick={() => onIO(p, "out")} />}
      {isAdmin && <RowAction icon={Pencil} label="Sửa" title="Sửa thông tin trong kho" color={TEXT} onClick={() => onEdit(p)} />}
      {isAdmin && onWeb && <RowAction icon={Globe} label="Web" title="Sửa ảnh, mô tả trên website" color={BLUE} onClick={() => onWeb(p.id)} />}
    </span>
  );
  return (
    <DocList rows={rows} rowKey={(p) => p.id} onOpen={(p) => onOpen(p.id)} selected={selectedIds} onToggle={toggleSelect || undefined} onToggleAll={onToggleAll} allSelected={allSelected}
      empty="Không có sản phẩm nào."
      cols={[
        { key: "prod", label: "Sản phẩm", w: "minmax(0,2.4fr)", cell: (p) => <span className="flex items-center gap-3 min-w-0"><Pic p={p} /><span className="min-w-0"><span className="nm" title={p.name}>{p.name}</span><small>{p.code}{p.sku ? ` · ${p.sku}` : ""}{p.category ? ` · ${p.category}` : ""}</small></span></span> },
        { key: "price", label: "Giá bán", w: "120px", align: "right", cell: (p) => <><span className="money">{p.retailPrice ? vnd(p.retailPrice) : "—"}</span>{isAdmin && p.costPrice ? <small>Nhập {vnd(p.costPrice)}</small> : null}</> },
        { key: "stock", label: "Tồn kho", w: "96px", align: "right", cell: (p) => { const s = stockOf(p); return <><span className="sk-n">{s.n}</span><small><Pill tone={s.tone}>{s.t}</Pill></small></>; } },
        { key: "web", label: "Web", w: "88px", cell: (p) => p.web?.published ? <span className="dl-pill soft p-green">Đang bán</span> : <span className="dl-pill soft p-gray">Chưa đăng</span> },
        { key: "act", label: "", w: "auto", align: "right", cell: acts },
      ]}
      card={(p) => { const s = stockOf(p); return {
        title: <span className="flex items-center gap-2.5 min-w-0"><Pic p={p} /><span className="min-w-0 whitespace-normal leading-snug" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.name}</span></span>,
        side: <>{p.retailPrice ? vnd(p.retailPrice) : "—"}</>,
        sub: <>{p.code}{p.sku ? ` · ${p.sku}` : ""}</>,
        meta: <><Pill tone={s.tone}>{s.t}{p.isService ? "" : ` · ${s.n}`}</Pill>{p.web?.published ? <span className="dl-pill soft p-green">Đang bán web</span> : <span className="dl-pill soft p-gray">Chưa đăng web</span>}</>,
      }; }} />
  );
}
