import React, { useState } from "react";
import { Home, Search, LayoutGrid, Phone, ShoppingCart } from "lucide-react";
import { SITE } from "../config.js";
import { href } from "../router.js";
import { useCart } from "../cart.jsx";

/**
 * Thanh điều hướng cố định ở đáy — CHỈ hiện trên điện thoại (lg:hidden).
 * Trang chủ · Tìm kiếm · Danh mục (mở drawer trái) · Tư vấn (gọi) · Giỏ hàng.
 */
export default function BottomNav({ route, navigate, onOpenCategories }) {
  const { count } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const path = route.path;

  const submit = (e) => {
    e.preventDefault();
    setSearchOpen(false);
    navigate(href("/danh-muc", term.trim() ? { q: term.trim() } : null).slice(1));
  };

  const Item = ({ icon: Icon, label, active, onClick, badge }) => (
    <button
      type="button" onClick={onClick}
      className="relative flex flex-col items-center justify-center gap-0.5 py-1.5"
      style={{ color: active ? "#1E2A8A" : "#5A6484" }}
    >
      <span className="relative">
        <Icon size={21} strokeWidth={active ? 2.4 : 2} />
        {badge > 0 && (
          <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-0.5 rounded-full bg-sale text-white text-[10px] font-bold grid place-items-center">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </span>
      <span className="text-[10.5px] leading-none">{label}</span>
    </button>
  );

  return (
    <>
      {searchOpen && (
        <div className="lg:hidden fixed inset-0 z-[70]" onClick={() => setSearchOpen(false)}>
          <div
            className="absolute left-0 right-0 bg-white border-t border-line p-3"
            style={{ bottom: "calc(env(safe-area-inset-bottom) + 56px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={submit} className="flex items-center gap-2 bg-paper rounded-md px-3 py-2 border border-line">
              <Search size={18} className="text-mute shrink-0" />
              <input
                autoFocus value={term} onChange={(e) => setTerm(e.target.value)}
                placeholder="Tìm sản phẩm, mã SKU…"
                className="flex-1 bg-transparent outline-none text-sm text-ink"
              />
              <button className="bg-navy text-white text-[13px] font-semibold rounded px-3 py-1.5 shrink-0">Tìm</button>
            </form>
          </div>
        </div>
      )}

      <nav
        className="lg:hidden fixed left-0 right-0 bottom-0 z-[60] bg-white border-t border-line grid grid-cols-5 font-sans shadow-[0_-2px_10px_rgba(11,18,48,0.06)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <Item icon={Home} label="Trang chủ" active={path === "/"} onClick={() => navigate("/")} />
        <Item icon={Search} label="Tìm kiếm" active={searchOpen} onClick={() => setSearchOpen((v) => !v)} />
        <Item icon={LayoutGrid} label="Danh mục" onClick={onOpenCategories} />
        <a
          href={"tel:" + (SITE.phoneRaw || "")}
          className="flex flex-col items-center justify-center gap-0.5 py-1.5"
          style={{ color: "#5A6484" }}
        >
          <Phone size={21} />
          <span className="text-[10.5px] leading-none">Tư vấn</span>
        </a>
        <Item icon={ShoppingCart} label="Giỏ hàng" active={path === "/gio-hang"} onClick={() => navigate("/gio-hang")} badge={count} />
      </nav>
    </>
  );
}
