import React, { useMemo, useState } from "react";
import { SlidersHorizontal, X, ChevronRight } from "lucide-react";
import ProductCard from "../components/ProductCard.jsx";
import { discountPercent, formatVND } from "../lib/format.js";
import { href } from "../router.js";
import {
  MENU, CATEGORY_TO_GROUP, categoryBreadcrumb, PRICE_BUCKETS, priceInRange, productInGroup, productInCategory,
} from "../config.js";
import { groupIcon } from "../components/groupIcons.js";
import CategoryTree from "../components/CategoryTree.jsx";

const SORTS = [
  { id: "popular", label: "Phổ biến" },
  { id: "discount", label: "Giảm giá nhiều" },
  { id: "price-asc", label: "Giá thấp → cao" },
  { id: "price-desc", label: "Giá cao → thấp" },
  { id: "name", label: "Tên A → Z" },
];

export default function Catalog({ catalog, route, navigate }) {
  const { products } = catalog;
  const q = (route.query.q || "").trim().toLowerCase();
  const group = route.query.group || "";
  const cat = route.query.cat || ""; // tên danh mục phụ
  const brand = route.query.brand || "";
  const pmin = route.query.pmin ? Number(route.query.pmin) : null;
  const pmax = route.query.pmax ? Number(route.query.pmax) : null;
  const sort = route.query.sort || "popular";
  const inStock = route.query.stock === "1";
  const onSale = route.query.sale === "1";
  const [sheetOpen, setSheetOpen] = useState(false);

  const setParam = (patch) => {
    const next = { ...route.query, ...patch };
    Object.keys(next).forEach((k) => {
      if (next[k] === "" || next[k] == null) delete next[k];
    });
    navigate(href("/danh-muc", next).slice(1));
  };
  const hasPrice = pmin != null || pmax != null;

  const list = useMemo(() => {
    const r = products.filter((p) => {
      if (group && !productInGroup(p, group)) return false;
      if (cat && !productInCategory(p, cat)) return false;
      if (brand && (p.brand || "") !== brand) return false;
      if (hasPrice && !priceInRange(p.price, pmin, pmax)) return false;
      if (inStock && !p.stock) return false;
      if (onSale && !(Number(p.listPrice) > Number(p.price))) return false;
      if (q) {
        const hay = `${p.name} ${p.sku} ${p.brand} ${(p.categories || [p.category]).join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const by = {
      discount: (a, b) => discountPercent(b.price, b.listPrice) - discountPercent(a.price, a.listPrice),
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      name: (a, b) => a.name.localeCompare(b.name, "vi"),
      popular: () => 0,
    };
    return [...r].sort(by[sort] || by.popular);
  }, [products, group, cat, brand, pmin, pmax, q, sort, inStock, onSale]);

  const catGroup = cat ? CATEGORY_TO_GROUP[cat] : "";
  const activeGroup = group || catGroup;

  // Nhãn hiệu có trong phạm vi đang xem (nhóm / danh mục phụ) — cột lọc tự sinh.
  const brandsHere = useMemo(() => {
    const set = new Set(
      products
        .filter((p) => (!activeGroup || productInGroup(p, activeGroup)) && (!cat || productInCategory(p, cat)))
        .map((p) => p.brand)
        .filter(Boolean)
    );
    return [...set].sort((a, b) => a.localeCompare(b, "vi"));
  }, [products, activeGroup, cat]);

  const title = q ? `Kết quả: “${route.query.q}”` : cat || group || (onSale ? "Đang khuyến mãi" : "Tất cả sản phẩm");
  const hasFilter = group || cat || brand || hasPrice || q || inStock || onSale || sort !== "popular";

  const filterChips = [];
  if (brand) filterChips.push({ k: "Nhãn hiệu", v: brand, clear: { brand: "" } });
  if (onSale) filterChips.push({ k: "Ưu đãi", v: "Đang khuyến mãi", clear: { sale: "" } });
  if (hasPrice) {
    const label =
      pmin != null && pmax != null ? `${formatVND(pmin)} – ${formatVND(pmax)}`
      : pmax != null ? `Dưới ${formatVND(pmax)}`
      : `Trên ${formatVND(pmin)}`;
    filterChips.push({ k: "Giá", v: label, clear: { pmin: "", pmax: "" } });
  }

  const priceActive = (b) => (b.min ?? null) === pmin && (b.max ?? null) === pmax;

  // Số bộ lọc đang bật (không tính sắp xếp) — hiện trên nút "Bộ lọc" ở mobile.
  const activeCount =
    (group || cat ? 1 : 0) + (brand ? 1 : 0) + (hasPrice ? 1 : 0) + (inStock ? 1 : 0) + (onSale ? 1 : 0);

  // Nội dung bộ lọc — dùng chung cho cột trái (desktop) và tấm trượt dưới (mobile).
  const filterBody = (
    <>
      <div className={"items-center gap-2 text-ink font-display font-semibold text-[15px] " + (hasFilter ? "flex" : "hidden lg:flex")}>
        <span className="hidden lg:inline-flex items-center gap-2"><SlidersHorizontal size={16} /> Bộ lọc</span>
        {hasFilter && (
          <button onClick={() => { navigate("/danh-muc"); setSheetOpen(false); }} className="ml-auto text-[13px] text-navy inline-flex items-center gap-0.5 font-sans font-normal">
            <X size={12} /> Xoá lọc
          </button>
        )}
      </div>

      {/* Nhóm chính + danh mục phụ */}
      <div>
        <div className="text-[13px] uppercase tracking-wide text-mute mb-2">Danh mục</div>
        <ul className="space-y-1 text-[14px]">
          <li>
            <button onClick={() => navigate("/danh-muc")} className={!group && !cat ? "text-navy font-semibold" : "text-ink/75 hover:text-navy"}>
              Tất cả
            </button>
          </li>
          {MENU.map((g) => {
            const GIcon = groupIcon(g.icon);
            const gActive = g.group === activeGroup;
            return (
              <li key={g.slug}>
                <button
                  onClick={() => setParam({ group: g.group, cat: "", brand: "", pmin: "", pmax: "" })}
                  className={"flex items-center gap-1.5 " + (g.group === group && !cat ? "text-navy font-semibold" : "text-ink/75 hover:text-navy")}
                >
                  <GIcon size={15} className="text-navy/70" /> {g.group}
                </button>
                {gActive && (g.subs || []).length > 0 && (
                  <CategoryTree
                    nodes={g.subs}
                    activeCat={cat}
                    activePath={cat ? categoryBreadcrumb(cat) : []}
                    onSelect={(name) => setParam({ group: "", cat: name === cat ? "" : name, brand: "", pmin: "", pmax: "" })}
                    depth={1}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Khoảng giá (tự sinh) */}
      <div>
        <div className="text-[13px] uppercase tracking-wide text-mute mb-2">Khoảng giá</div>
        <ul className="space-y-1 text-[14px]">
          {PRICE_BUCKETS.map((b, i) => (
            <li key={i}>
              <button
                onClick={() => setParam(priceActive(b) ? { pmin: "", pmax: "" } : { pmin: b.min ?? "", pmax: b.max ?? "" })}
                className={priceActive(b) ? "text-navy font-semibold" : "text-ink/75 hover:text-navy"}
              >
                {b.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Thương hiệu (tự sinh) */}
      {brandsHere.length > 1 && (
        <div>
          <div className="text-[13px] uppercase tracking-wide text-mute mb-2">Thương hiệu</div>
          <ul className="space-y-1 text-[14px]">
            <li>
              <button onClick={() => setParam({ brand: "" })} className={!brand ? "text-navy font-semibold" : "text-ink/75 hover:text-navy"}>Tất cả</button>
            </li>
            {brandsHere.map((b) => (
              <li key={b}>
                <button onClick={() => setParam({ brand: b === brand ? "" : b })} className={b === brand ? "text-navy font-semibold" : "text-ink/75 hover:text-navy"}>
                  {b}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <label className="flex items-center gap-2 text-[14px] text-ink/80">
        <input type="checkbox" checked={inStock} onChange={(e) => setParam({ stock: e.target.checked ? "1" : "" })} />
        Chỉ hàng còn sẵn
      </label>
      <label className="flex items-center gap-2 text-[14px] text-ink/80">
        <input type="checkbox" checked={onSale} onChange={(e) => setParam({ sale: e.target.checked ? "1" : "" })} />
        Đang khuyến mãi
      </label>
    </>
  );

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6 font-sans">
      <nav className="flex items-center gap-1 text-[13px] text-mute mb-4 flex-wrap">
        <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }} className="hover:text-navy">Trang chủ</a>
        <ChevronRight size={12} />
        {group && !cat && <span className="text-ink/70">{group}</span>}
        {cat && (
          <>
            {catGroup && (
              <>
                <a
                  href={href("/danh-muc", { group: catGroup })}
                  onClick={(e) => { e.preventDefault(); navigate(href("/danh-muc", { group: catGroup }).slice(1)); }}
                  className="hover:text-navy"
                >
                  {catGroup}
                </a>
                <ChevronRight size={12} />
              </>
            )}
            <span className="text-ink/70">{cat}</span>
          </>
        )}
        {!group && !cat && <span className="text-ink/70">Sản phẩm</span>}
      </nav>

      <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-2">{title}</h1>

      {filterChips.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filterChips.map((c, i) => (
            <button
              key={i}
              onClick={() => setParam(c.clear)}
              className="inline-flex items-center gap-1.5 text-[13px] bg-navy-050 text-navy rounded-full pl-2.5 pr-2 py-1"
            >
              {c.k}: <b>{c.v}</b> <X size={12} />
            </button>
          ))}
        </div>
      )}

      {/* Nút mở bộ lọc — chỉ hiện trên điện thoại */}
      <button
        onClick={() => setSheetOpen(true)}
        className="lg:hidden mb-4 inline-flex items-center gap-2 border border-line rounded-md px-3 py-2 text-[14px] font-medium text-ink"
      >
        <SlidersHorizontal size={16} /> Bộ lọc
        {activeCount > 0 && (
          <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-navy text-white text-[11px] font-bold grid place-items-center">{activeCount}</span>
        )}
      </button>

      <div className="grid lg:grid-cols-[240px_1fr] gap-8">
        {/* Bộ lọc — cột trái (desktop), ẩn trên điện thoại */}
        <aside className="hidden lg:block space-y-6">{filterBody}</aside>

        {/* Kết quả */}
        <div>
          <div className="flex items-center justify-between mb-4 text-[14px]">
            <span className="text-mute">{list.length} sản phẩm</span>
            <label className="flex items-center gap-2">
              <span className="text-mute">Sắp xếp</span>
              <select value={sort} onChange={(e) => setParam({ sort: e.target.value })} className="border border-line bg-white rounded-md px-2 py-1.5">
                {SORTS.map((s) => (<option key={s.id} value={s.id}>{s.label}</option>))}
              </select>
            </label>
          </div>

          {list.length === 0 ? (
            <div className="border border-dashed border-line rounded-lg p-12 text-center text-mute">
              Không tìm thấy sản phẩm phù hợp.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {list.map((p) => (
                <ProductCard key={p.id} product={p} onOpen={(slug) => navigate(`/san-pham/${slug}`)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tấm trượt bộ lọc — điện thoại */}
      {sheetOpen && (
        <div className="lg:hidden fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setSheetOpen(false)} />
          <div className="absolute left-0 right-0 bottom-0 max-h-[82vh] flex flex-col bg-white rounded-t-2xl">
            <div className="flex items-center justify-between px-4 h-12 border-b border-line shrink-0">
              <span className="font-display font-semibold text-[15px]">Bộ lọc</span>
              <button onClick={() => setSheetOpen(false)} aria-label="Đóng"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">{filterBody}</div>
            <div
              className="p-3 border-t border-line shrink-0"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
            >
              <button onClick={() => setSheetOpen(false)} className="w-full bg-navy text-white font-semibold rounded-md py-2.5 text-[14px]">
                Xem {list.length} sản phẩm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
