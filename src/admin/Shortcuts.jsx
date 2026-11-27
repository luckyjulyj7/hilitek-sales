// Phím tắt toàn trang quản lý. Chỉ chạy khi KHÔNG đang gõ trong ô nhập và không có cửa sổ (popup) nào mở.
// B: Bán nhanh · N: Tạo đơn · /: Tìm nhanh · 1–6: chuyển mục · ?: xem danh sách phím tắt.
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const TYPING = /^(INPUT|TEXTAREA|SELECT)$/;
const typing = (el) => !!el && (TYPING.test(el.tagName) || el.isContentEditable);
const modalOpen = () => !!document.querySelector(".fixed.inset-0.z-50, .qs, [role=dialog][aria-modal=true]");
export const SHORTCUT_TABS = [["1", "dashboard", "Tổng quan"], ["2", "orders", "Bán hàng"], ["3", "products", "Sản phẩm, tồn kho"], ["4", "purchase", "Nhập hàng"], ["5", "customers", "Khách hàng"], ["6", "website", "Website"]];

export function useShortcuts({ setTab, allowedTabs }) {
  const [help, setHelp] = useState(false);
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || typing(e.target)) return;
      if (e.key === "?") { e.preventDefault(); setHelp((v) => !v); return; }
      if (modalOpen()) return;
      const k = e.key.toLowerCase();
      if (k === "/") { e.preventDefault(); window.dispatchEvent(new Event("hili:search")); }
      else if (k === "b" && allowedTabs.includes("orders")) { e.preventDefault(); setTab("orders"); setTimeout(() => window.dispatchEvent(new Event("hili:quick-sale")), 60); }
      else if (k === "n" && allowedTabs.includes("orders")) { e.preventDefault(); setTab("orders"); setTimeout(() => window.dispatchEvent(new Event("hili:new-order")), 60); }
      else { const t = SHORTCUT_TABS.find(([key, id]) => key === k && allowedTabs.includes(id)); if (t) { e.preventDefault(); setTab(t[1]); } }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setTab, allowedTabs.join(",")]);
  return [help, setHelp];
}

export function ShortcutHelp({ onClose }) {
  const rows = [["B", "Bán nhanh tại quầy"], ["N", "Tạo đơn và giao hàng"], ["/ hoặc Ctrl K", "Tìm nhanh đơn, khách, sản phẩm"], ...SHORTCUT_TABS.map(([k, , l]) => [k, "Mở " + l]), ["Ctrl + bấm mã đơn", "Mở đơn ở tab mới"], ["F9 (trong Bán nhanh)", "Thanh toán và in"], ["Esc", "Đóng cửa sổ"], ["?", "Bật/tắt bảng này"]];
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" style={{ background: "rgba(15,23,70,.45)" }} onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Phím tắt" className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3"><h3 className="text-lg font-bold" style={{ color: "#111827" }}>Phím tắt</h3><button type="button" onClick={onClose} aria-label="Đóng"><X size={18} /></button></div>
        <dl className="m-0">
          {rows.map(([k, l]) => (
            <div key={k} className="flex items-center justify-between gap-4 py-2" style={{ borderTop: "1px solid #F0F1F4" }}>
              <dt className="text-sm" style={{ color: "#374151" }}>{l}</dt>
              <dd className="m-0"><kbd className="px-2 py-1 rounded-md text-xs font-semibold" style={{ background: "#F1F2F6", border: "1px solid #D7DBE5", color: "#1E2A8A" }}>{k}</kbd></dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
