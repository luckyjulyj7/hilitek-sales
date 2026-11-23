import React from "react";
import { Pencil } from "lucide-react";
import { useCatalog } from "../catalogContext.js";

/**
 * Nút "Sửa trang này" — CHỈ hiện trên máy đã đăng nhập quản trị ở /quanlybanhang
 * (trang quản lý ghi cờ hili_staff vào localStorage cùng tên miền). Khách không thấy.
 * Bấm mở trang quản lý ở tab mới, vào thẳng đúng chỗ sửa. Không gọi máy chủ.
 */
function staff() {
  try { return localStorage.getItem("hili_staff") === "1"; } catch { return false; }
}

function target(path, products) {
  const m = path.match(/^\/san-pham\/([^/?#]+)/);
  if (m) {
    const slug = decodeURIComponent(m[1]);
    const p = (products || []).find((x) => x.slug === slug);
    return p?.id ? { to: "?webproduct=" + encodeURIComponent(p.id), label: "Sửa sản phẩm này" } : { to: "?web=products", label: "Sửa sản phẩm" };
  }
  if (path === "/" || path === "/danh-muc") return { to: "?web=home", label: path === "/" ? "Sửa trang chủ" : "Sửa menu, danh mục" };
  if (/^\/(trang|chinh-sach|huong-dan|tin-tuc|lien-he)/.test(path)) return { to: "?web=content", label: "Sửa nội dung trang" };
  return { to: "", label: "Mở trang quản lý" };
}

export default function AdminEditBar({ path }) {
  const { products } = useCatalog();
  if (!staff()) return null;
  const t = target(path, products);
  return (
    <a href={"/quanlybanhang" + t.to} target="_blank" rel="noreferrer"
      className="fixed left-3 z-[55] inline-flex items-center gap-2 min-h-[40px] px-3.5 rounded-full bg-ink text-white text-[13px] font-semibold shadow-card ring-2 ring-yellow bottom-[calc(env(safe-area-inset-bottom)+120px)] lg:bottom-5"
      title="Chỉ máy đã đăng nhập trang quản lý mới thấy nút này">
      <Pencil size={15} className="text-yellow" /> {t.label}
    </a>
  );
}
