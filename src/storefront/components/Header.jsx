import React, { useState, useRef, useEffect } from "react";
import {
  MapPin, Search, Phone, ShoppingCart, ChevronDown, Menu, X, Truck, PackageSearch,
  ShieldCheck, CreditCard, Wallet, Wrench, LayoutGrid, Gift,
} from "lucide-react";
import { SITE, MENU, FEATURES, LOYALTY, SUPPORT_LINKS, categoryBreadcrumb } from "../config.js";
import { href } from "../router.js";
import { useCart } from "../cart.jsx";
import { LabLogo } from "./Logo.jsx";
import CategoryRail from "./CategoryRail.jsx";
import CategoryTree from "./CategoryTree.jsx";
import { groupIcon } from "./groupIcons.js";
import "./chrome.css";

const ICONS = { CreditCard, Wallet, Truck, ShieldCheck, Wrench };

export default function Header({ route, navigate, drawer, setDrawer }) {
  const { count, bump } = useCart();
  const [term, setTerm] = useState(route.query.q || "");
  const [catOpen, setCatOpen] = useState(false);
  const [mobileGroup, setMobileGroup] = useState(null);
  const [cartBump, setCartBump] = useState(false);
  const closeTimer = useRef(null);
  const searchRef = useRef(null);

  // Phím "/" để nhảy vào ô tìm kiếm (như các trang công nghệ lớn).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "/" || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.target.isContentEditable) return;
      e.preventDefault(); searchRef.current?.focus();
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setCatOpen(false);
    setDrawer(false);
  }, [route.path]);

  // Rung nút giỏ hàng mỗi khi khách thêm sản phẩm.
  useEffect(() => {
    if (!bump) return;
    setCartBump(true);
    const t = setTimeout(() => setCartBump(false), 750);
    return () => clearTimeout(t);
  }, [bump]);

  const go = (to) => {
    navigate(to);
    setDrawer(false);
    setCatOpen(false);
  };
  const submitSearch = (e) => {
    e.preventDefault();
    go(href("/danh-muc", term.trim() ? { q: term.trim() } : null).slice(1));
  };

  const openCat = () => {
    clearTimeout(closeTimer.current);
    setCatOpen(true);
  };
  const closeCat = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setCatOpen(false), 130);
  };

  const mainPhone = SITE.phone || SITE.phoneRaw || "";
  const hotlines = SITE.hotlines?.length
    ? SITE.hotlines
    : [
        ...(mainPhone ? [{ label: "HOTLINE", number: mainPhone, raw: SITE.phoneRaw || String(mainPhone).replace(/\D/g, "") }] : []),
        ...(SITE.techPhone
          ? [{ label: "HỖ TRỢ KỸ THUẬT", number: SITE.techPhone, raw: SITE.techPhoneRaw || String(SITE.techPhone).replace(/\D/g, "") }]
          : []),
      ];

  return (
    <header className="lg:sticky lg:top-0 z-50 font-sans">
      {/* Thanh trên cùng */}
      <div className="bg-ink text-white/75 text-[13px]">
        <div className="mx-auto max-w-[1500px] px-4 h-9 flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-1.5 truncate">
            <MapPin size={13} className="shrink-0 text-yellow" /> {SITE.address}
          </span>
          <span className="hidden md:flex items-center gap-4 shrink-0">
            {FEATURES.warrantyLookup && (
              <TopLink onClick={() => go("/bao-hanh")} icon={ShieldCheck}>Tra cứu bảo hành</TopLink>
            )}
            {LOYALTY.enabled && (
              <TopLink onClick={() => go("/diem-tich-luy")} icon={Gift}>Điểm tích luỹ</TopLink>
            )}
            <TopLink onClick={() => go("/tra-cuu-don-hang")} icon={PackageSearch}>Tra cứu đơn hàng</TopLink>
            <TopLink onClick={() => go("/chinh-sach-giao-hang")} icon={Truck}>Vận chuyển</TopLink>
          </span>
        </div>
      </div>

      {/* Hàng chính: [LOGO góc trái + tên] [tìm kiếm] ... [hotline] [giỏ] */}
      <div className="hx-main">
        <div className="mx-auto max-w-[1500px] px-4 min-h-[76px] flex items-center gap-3 sm:gap-5 py-2">
          <button className="lg:hidden -ml-1 p-1 shrink-0" onClick={() => setDrawer(true)} aria-label="Menu">
            <Menu size={26} />
          </button>

          {/* LOGO — góc trên bên trái, kèm tên Hilitek */}
          <a href="/" onClick={(e) => { e.preventDefault(); go("/"); }} className="shrink-0">
            <LabLogo size={46} textClass="text-xl sm:text-[23px] text-white" />
          </a>

          <form onSubmit={submitSearch} className="hidden md:flex flex-1 max-w-[640px]">
            <div className="hx-search">
              <Search size={18} className="text-yellow shrink-0" />
              <input
                ref={searchRef}
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Tìm sản phẩm: ssd 1tb, main b760, ram ddr5…"
                aria-label="Tìm sản phẩm"
              />
              <kbd className="hidden lg:inline-block" title="Bấm / để tìm nhanh">/</kbd>
              <button className="hx-key y shrink-0">Tìm kiếm</button>
            </div>
          </form>

          {/* Hotline */}
          {hotlines.length === 1 ? (
            <a href={"tel:" + hotlines[0].raw} className="hx-hot hidden lg:flex ml-auto shrink-0">
              <i><Phone size={17} /></i>
              <span><small>{hotlines[0].label} · {SITE.workingHours}</small><b>{hotlines[0].number}</b></span>
            </a>
          ) : (
            <div className="hidden lg:flex items-center gap-2 ml-auto shrink-0">
              {hotlines.slice(0, 2).map((h, i) => (
                <a key={i} href={"tel:" + h.raw} className="hx-hot">
                  {i === 0 && <i><Phone size={17} /></i>}
                  <span><small>{h.label}</small><b>{h.number}</b></span>
                </a>
              ))}
            </div>
          )}

          <button
            onClick={() => go("/gio-hang")}
            className={
              "hx-key y hx-cart shrink-0 " + (cartBump ? "animate-cartbump" : "")
            }
          >
            <span className="relative">
              <ShoppingCart size={20} />
              {count > 0 && (
                <span className={
                  "absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full text-[12px] font-bold font-mono grid place-items-center " +
                  "bg-navy text-white ring-2 ring-yellow"
                }>
                  {count}
                </span>
              )}
            </span>
            <span className="hidden sm:inline text-[14px]">Giỏ hàng</span>
          </button>
        </div>

        {/* Tìm kiếm mobile */}
        <form onSubmit={submitSearch} className="md:hidden px-4 pb-3">
          <div className="hx-search sm">
            <Search size={18} className="text-yellow shrink-0" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Tìm sản phẩm, mã SKU…"
              aria-label="Tìm sản phẩm"
            />
          </div>
        </form>

        {/* Thanh nav: [Danh mục sản phẩm] + link hỗ trợ (desktop) */}
      </div>
      <div>
        <nav className="hx-nav hidden lg:block relative">
          <div className="mx-auto max-w-[1500px] px-4 flex items-stretch">
            <div onMouseEnter={openCat} onMouseLeave={closeCat} className="relative">
              <button
                onClick={() => setCatOpen((v) => !v)}
                className={"hx-key hx-cat " + (catOpen ? "y" : "")}
              >
                <LayoutGrid size={17} /> Danh mục sản phẩm
                <ChevronDown size={15} className={catOpen ? "rotate-180 transition" : "transition"} />
              </button>

              {/* Menu sổ xuống — danh sách dọc, rê vào từng nhóm sẽ xổ ngang ra danh mục con */}
              {catOpen && (
                <div className="absolute left-0 top-full z-50 w-[264px] pt-1">
                  <CategoryRail navigate={go} hideHeading className="shadow-menu" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 pl-3">
              {SUPPORT_LINKS.map((l) => {
                const Icon = ICONS[l.icon] || Wrench;
                return (
                  <button
                    key={l.label}
                    onClick={() => go(l.to)}
                    className="hx-link"
                  >
                    <Icon size={15} /> {l.label}
                  </button>
                );
              })}
            </div>
          </div>

        </nav>
      </div>

      {/* Drawer mobile */}
      {drawer && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setDrawer(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-[340px] bg-white text-ink overflow-y-auto">
            <div className="flex items-center justify-between px-4 h-14 bg-navy text-white">
              <span className="font-display font-bold tracking-wide">DANH MỤC SẢN PHẨM</span>
              <button onClick={() => setDrawer(false)} aria-label="Đóng"><X size={22} /></button>
            </div>
            <ul className="py-2">
              {MENU.map((g) => {
                const GIcon = groupIcon(g.icon);
                return (
                <li key={g.slug} className="border-b border-line">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 text-[15px] font-medium"
                    onClick={() => setMobileGroup(mobileGroup === g.slug ? null : g.slug)}
                  >
                    <span className="flex items-center gap-2"><GIcon size={17} className="text-navy" /> {g.group}</span>
                    <ChevronDown size={16} className={mobileGroup === g.slug ? "rotate-180" : ""} />
                  </button>
                  {mobileGroup === g.slug && (
                    <div className="pb-2 px-6">
                      <button
                        onClick={() => go(href("/danh-muc", { group: g.group }).slice(1))}
                        className="block py-1.5 text-[15px] text-navy font-medium"
                      >
                        Tất cả {g.group}
                      </button>
                      {(g.subs || []).length > 0 && (
                        <CategoryTree
                          nodes={g.subs}
                          activeCat={route.query.cat || ""}
                          activePath={route.query.cat ? categoryBreadcrumb(route.query.cat) : []}
                          onSelect={(name) => go(href("/danh-muc", { group: g.group, cat: name }).slice(1))}
                        />
                      )}
                    </div>
                  )}
                </li>
                );
              })}
              {SUPPORT_LINKS.map((l) => (
                <li key={l.label} className="border-b border-line">
                  <button onClick={() => go(l.to)} className="w-full text-left px-4 py-3 text-[15px]">{l.label}</button>
                </li>
              ))}
              <li className="border-b border-line">
                <button onClick={() => go("/tra-cuu-don-hang")} className="w-full text-left px-4 py-3 text-[15px]">Tra cứu đơn hàng</button>
              </li>
              <li>
                <button onClick={() => go("/lien-he")} className="w-full text-left px-4 py-3 text-[15px]">Liên hệ</button>
              </li>
            </ul>
            <div className="px-4 py-3 space-y-1.5">
              {hotlines.slice(0, 4).map((h, i) => (
                <a key={i} href={"tel:" + h.raw} className="flex items-center gap-2 text-navy text-[15px]">
                  <Phone size={15} className="text-yellow" /> {h.label}: <span className="font-mono font-semibold">{h.number}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function TopLink({ onClick, icon: Icon, children }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1.5 hover:text-white">
      <Icon size={13} /> {children}
    </button>
  );
}
