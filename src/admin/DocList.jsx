import React from "react";
import "./docList.css";

/**
 * Danh sách chứng từ dùng chung (đơn hàng, phiếu nhập): máy tính là bảng gọn vừa 1 màn hình,
 * điện thoại tự thành thẻ. cols: [{ key, label, w (grid track), align, cell(row) }].
 * Thẻ điện thoại dùng 4 ô: title, sub, side (tiền), meta (trạng thái).
 */
export function DocList({ rows, cols, rowKey, onOpen, selected, onToggle, onToggleAll, allSelected, empty, card }) {
  const tracks = (onToggle ? "34px " : "") + cols.map((c) => c.w || "minmax(0,1fr)").join(" ");
  return (
    <div className="dl" role="table">
      <div className="dl-head" role="row" style={{ gridTemplateColumns: tracks }}>
        {onToggle && <span role="columnheader"><input type="checkbox" aria-label="Chọn tất cả trong trang" checked={!!allSelected} onChange={onToggleAll} /></span>}
        {cols.map((c) => <span key={c.key} role="columnheader" className={c.align === "right" ? "r" : ""}>{c.label}</span>)}
      </div>
      {rows.map((r) => {
        const k = rowKey(r), on = selected && selected.has(k), cd = card(r);
        return (
          <div key={k} role="row" className={"dl-row" + (on ? " on" : "") + (cd.muted ? " muted" : "")} style={{ gridTemplateColumns: tracks }}
            onClick={(e) => { if (!e.target.closest("button,a,input,label,select")) onOpen(r); }}>
            {onToggle && <span className="dl-ck" role="cell"><input type="checkbox" aria-label="Chọn" checked={!!on} onChange={() => onToggle(k)} /></span>}
            {cols.map((c) => <span key={c.key} role="cell" className={"dl-c dl-" + c.key + (c.align === "right" ? " r" : "")}>{c.cell(r)}</span>)}
            <span className="dl-card" aria-hidden="true">
              <span className="t">{cd.title}</span><span className="s">{cd.side}</span>
              <span className="u">{cd.sub}</span><span className="m">{cd.meta}</span>
            </span>
          </div>
        );
      })}
      {rows.length === 0 && <div className="dl-empty">{empty}</div>}
    </div>
  );
}

/**
 * Mã chứng từ là link thật: bấm thường mở ngăn chi tiết ngay tại trang; Ctrl/⌘ + bấm, bấm chuột giữa
 * hoặc chuột phải "Mở trong tab mới" thì mở tab mới (link "?don=<id>" / "?po=<id>").
 */
export function DocLink({ href, onOpen, children }) {
  return (
    <a href={href} className="code" onClick={(e) => { if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); onOpen(); }}>{children}</a>
  );
}

/** Nút nhỏ mở chứng từ ở tab mới (cho người không quen Ctrl + bấm). */
export function NewTabLink({ href }) {
  return (
    <a href={href} target="_blank" rel="noopener" className="dl-nt" title="Mở ở tab mới" aria-label="Mở ở tab mới">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
    </a>
  );
}

/** Dải số liệu nhanh đầu trang, bấm để lọc. items: [{ key, label, value, sub, tone, on, onClick }] */
export function SumStrip({ items }) {
  return (
    <div className="dl-sum">
      {items.map((x) => {
        const body = <><span className="l">{x.label}</span><span className="v">{x.value}</span>{x.sub && <span className="u">{x.sub}</span>}</>;
        return x.onClick
          ? <button key={x.key} type="button" onClick={x.onClick} aria-pressed={!!x.on} title="Bấm để lọc" className={"t-" + (x.tone || "ink")}>{body}</button>
          : <div key={x.key} className={"t-" + (x.tone || "ink")}>{body}</div>;
      })}
    </div>
  );
}

/** Nhãn trạng thái. tone: ink | blue | green | amber | red | gray */
export function Pill({ tone = "gray", children, title }) {
  return <span className={"dl-pill p-" + tone} title={title}>{children}</span>;
}
