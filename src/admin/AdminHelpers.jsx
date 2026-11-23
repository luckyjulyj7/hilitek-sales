// Các khối giao diện nhỏ dùng chung cho trang quản lý, tách khỏi SalesManager.jsx (file quá lớn).
// Không gọi máy chủ: chỉ hiển thị dữ liệu đã tải sẵn và lưu vài lựa chọn hiển thị vào localStorage.
import React, { useState } from "react";
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
  const [hidden, setHidden] = usePref("guide_" + id, false);
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
  const [hidden, setHidden] = usePref("note_products_" + where, false);
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
export function SimpleStockList({ groups, productStats, displayImage, isAdmin, isCtv, onOpen, onIO, onEdit, onWeb, selectedIds, toggleSelect }) {
  // Mỗi phiên bản là 1 dòng riêng cho dễ đọc (tên phiên bản đã có trong tên sản phẩm).
  const rows = groups.flatMap((g) => (g.type === "single" ? [g.p] : g.members));
  if (!rows.length) return <div className="text-center py-10 text-sm" style={{ color: MUTE, border: `1px solid ${LINE}`, background: "#fff", borderRadius: 6 }}>Không có sản phẩm nào.</div>;
  return (
    <ul className="grid gap-2" aria-label="Danh sách sản phẩm">
      {rows.map((p) => {
        const st = productStats(p);
        const img = displayImage(p);
        const qty = st.closingQty;
        const stock = p.isService
          ? { t: "Dịch vụ", bg: `${BLUE}14`, c: BLUE }
          : qty < 0 ? { t: `Âm ${qty}`, bg: RUST, c: "#fff" }
          : qty === 0 ? { t: "Hết hàng", bg: "#F3F4F6", c: MUTE }
          : { t: `Còn ${qty}`, bg: `${FOREST}14`, c: FOREST };
        return (
          <li key={p.id} className="flex items-center gap-3 rounded-lg p-2.5 sm:p-3" style={{ background: "#fff", border: `1px solid ${LINE}` }}>
            {toggleSelect && <input type="checkbox" aria-label={"Chọn " + p.name} checked={selectedIds?.has(p.id)} onChange={() => toggleSelect(p.id)} className="shrink-0 w-4 h-4" />}
            <button type="button" onClick={() => onOpen(p.id)} className="shrink-0" aria-label={"Xem " + p.name}>
              {img
                ? <img src={img} alt="" loading="lazy" className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-md bg-white" style={{ border: `1px solid ${LINE}` }} />
                : <span className="w-14 h-14 sm:w-16 sm:h-16 rounded-md grid place-items-center" style={{ background: PAPER, border: `1px dashed ${LINE}` }}><ImageOff size={16} style={{ color: MUTE }} /></span>}
            </button>
            <div className="min-w-0 flex-1">
              <button type="button" onClick={() => onOpen(p.id)} className="block text-left text-sm font-medium leading-snug hover:underline line-clamp-2" style={{ color: TEXT }}>{p.name}</button>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" style={{ color: MUTE }}>
                <span className="sm:hidden text-[13px] font-semibold" style={{ color: INK }}>{p.retailPrice ? vnd(p.retailPrice) : "Chưa có giá"}</span>
                <span style={{ fontFamily: "'Inter', sans-serif" }}>{p.code}{p.sku ? ` · ${p.sku}` : ""}</span>
                {p.web?.published ? <span className="inline-flex items-center gap-1" style={{ color: FOREST }}><Globe size={11} /> Đang bán trên web</span> : <span>Chưa lên web</span>}
              </div>
            </div>
            <div className="hidden sm:block text-right shrink-0 w-28">
              <div className="text-sm font-semibold" style={{ color: INK, fontFamily: "'Inter', sans-serif" }}>{p.retailPrice ? vnd(p.retailPrice) : "—"}</div>
              <div className="text-[11px]" style={{ color: MUTE }}>giá bán</div>
            </div>
            <span className="shrink-0 text-xs font-semibold px-2 py-1 rounded-md whitespace-nowrap" style={{ background: stock.bg, color: stock.c }}>{stock.t}</span>
            <div className="shrink-0 hidden md:flex items-center gap-1">
              {isAdmin && !p.isService && <RowAction icon={ArrowDownToLine} label="Nhập" title="Nhập kho" color={FOREST} onClick={() => onIO(p, "in")} />}
              {!isCtv && !p.isService && <RowAction icon={ArrowUpFromLine} label="Xuất" title="Xuất kho" color={RUST} onClick={() => onIO(p, "out")} />}
              {isAdmin && <RowAction icon={Pencil} label="Sửa" title="Sửa thông tin trong kho" color={TEXT} onClick={() => onEdit(p)} />}
              {isAdmin && onWeb && <RowAction icon={Globe} label="Web" title="Sửa ảnh, mô tả trên website" color={BLUE} onClick={() => onWeb(p.id)} />}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
