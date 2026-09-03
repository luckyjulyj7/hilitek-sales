import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Check, Search } from "lucide-react";

/** Bỏ dấu tiếng Việt để so khớp khi gõ tìm. */
function noAccent(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

/**
 * Ô chọn có tìm kiếm — gõ vài ký tự lọc ra địa danh, bảng kết quả SỔ XUỐNG.
 * Thay cho <select> gốc (không tìm được, trình duyệt tự quyết hướng mở).
 */
export default function SearchSelect({
  value, onChange, options = [], placeholder = "Chọn…", disabled = false, error = false, id,
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hi, setHi] = useState(0);
  const boxRef = useRef(null);
  const listRef = useRef(null);

  const filtered = useMemo(() => {
    const kw = noAccent(q.trim());
    if (!kw) return options;
    return options.filter((o) => noAccent(o).includes(kw));
  }, [q, options]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => setHi(0), [q, open]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.children[hi];
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [hi, open]);

  const pick = (o) => { onChange(o); setOpen(false); setQ(""); };

  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (filtered[hi]) pick(filtered[hi]); }
    else if (e.key === "Escape") { e.preventDefault(); setOpen(false); }
  };

  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button" id={id} disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={
          "w-full flex items-center justify-between gap-2 border rounded-md px-3 py-2 text-[14px] text-left " +
          (disabled ? "bg-paper text-mute cursor-not-allowed " : "bg-white ") +
          (error ? "border-sale" : "border-line")
        }
      >
        <span className={value ? "text-ink truncate" : "text-mute truncate"}>{value || placeholder}</span>
        <ChevronDown size={16} className={"text-mute shrink-0 transition-transform " + (open ? "rotate-180" : "")} />
      </button>

      {open && !disabled && (
        <div className="absolute z-40 left-0 right-0 top-full mt-1 bg-white border border-line rounded-md shadow-menu overflow-hidden">
          <div className="flex items-center gap-2 px-2.5 py-2 border-b border-line">
            <Search size={14} className="text-mute shrink-0" />
            <input
              autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey}
              placeholder="Gõ để tìm…"
              className="flex-1 text-[13.5px] outline-none bg-transparent text-ink"
            />
          </div>
          <ul ref={listRef} className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-[13px] text-mute">Không tìm thấy “{q}”</li>
            )}
            {filtered.map((o, i) => (
              <li key={o}>
                <button
                  type="button"
                  onClick={() => pick(o)}
                  onMouseEnter={() => setHi(i)}
                  className={
                    "w-full text-left px-3 py-2 text-[13.5px] flex items-center gap-2 " +
                    (i === hi ? "bg-navy-050 text-navy" : "text-ink hover:bg-navy-050")
                  }
                >
                  {value === o ? <Check size={14} className="text-navy shrink-0" /> : <span className="w-[14px] shrink-0" />}
                  <span className="truncate">{o}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
