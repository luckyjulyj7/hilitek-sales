import React, { useMemo } from "react";
import { SlidersHorizontal, X, ChevronRight } from "lucide-react";
import ProductCard from "../components/ProductCard.jsx";
import { discountPercent } from "../lib/format.js";
import { href } from "../router.js";
import { MENU, CATEGORY_TO_GROUP } from "../config.js";
import { groupIcon } from "../components/groupIcons.js";

const groupOf = (p) => p.group || CATEGORY_TO_GROUP[p.category] || "";

const SORTS = [
  { id: "popular", label: "Phổ biến" },
  { id: "discount", label: "Giảm giá nhiều" },
  { id: "price-asc", label: "Giá thấp → cao" },
  { id: "price-desc", label: "Giá cao → thấp" },
  { id: "name", label: "Tên A → Z" },
];

export default function Catalog({ catalog, route, navigate }) {
  const { products, brands } = catalog;
  const q = (route.query.q || "").trim().toLowerCase();
  const group = route.query.group || "";
  const cat = route.query.cat || "";
  const brand = route.query.brand || "";
  const sort = route.query.sort || "popular";
  const inStock = route.query.stock === "1";

  const setParam = (patch) => {
    const next = { ...route.query, ...patch };
    Object.keys(next).forEach((k) => {
      if (next[k] === "" || next[k] == null) delete next[k];
    });
    navigate(href("/danh-muc", next).slice(1));
  };

  const list = useMemo(() => {
    let r = products.filter((p) => {
      if (group && groupOf(p) !== group) return false;
      if (cat && p.category !== cat) return false;
      if (brand && p.brand !== brand) return false;
      if (inStock && !p.stock) return false;
      if (q) {
        const hay = `${p.name} ${p.sku} ${p.brand} ${p.category} ${p.group}`.toLowerCase();
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
  }, [products, group, cat, brand, q, sort, inStock]);

  const brandsHere = useMemo(() => {
    const set = new Set(
      products.filter((p) => (!group || groupOf(p) === group) && (!cat || p.category === cat)).map((p) => p.brand)
    );
    return [...set].sort((a, b) => a.localeCompare(b, "vi"));
  }, [products, group, cat]);

  const title = q ? `Kết quả: “${route.query.q}”` : cat || group || "Tất cả sản phẩm";
  const hasFilter = group || cat || brand || q || inStock || sort !== "popular";

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6 font-sans">
      {/* breadcrumb */}
      <nav className="flex items-center gap-1 text-[12.5px] text-mute mb-4">
        <a href="#/" onClick={(e) => { e.preventDefault(); navigate("/"); }} className="hover:text-navy">Trang chủ</a>
        <ChevronRight size={12} />
        {group && !cat && <span className="text-ink/70">{group}</span>}
        {cat && (
          <>
            <a
              href={href("/danh-muc", { group: MENU.find((g) => g.columns.some((c) => c.items.includes(cat)))?.group })}
              onClick={(e) => {
                e.preventDefault();
                const gg = MENU.find((g) => g.columns.some((c) => c.items.includes(cat)))?.group;
                navigate(href("/danh-muc", gg ? { group: gg } : null).slice(1));
              }}
              className="hover:text-navy"
            >
              {MENU.find((g) => g.columns.some((c) => c.items.includes(cat)))?.group || "Danh mục"}
            </a>
            <ChevronRight size={12} />
            <span className="text-ink/70">{cat}</span>
          </>
        )}
        {!group && !cat && <span className="text-ink/70">Sản phẩm</span>}
      </nav>

      <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-5">{title}</h1>

      <div className="grid lg:grid-cols-[240px_1fr] gap-8">
        {/* Bộ lọc */}
        <aside className="space-y-6">
          <div className="flex items-center gap-2 text-ink font-display font-semibold text-[14px]">
            <SlidersHorizontal size={16} /> Bộ lọc
            {hasFilter && (
              <button onClick={() => navigate("/danh-muc")} className="ml-auto text-[12px] text-navy inline-flex items-center gap-0.5 font-sans font-normal">
                <X size={12} /> Xoá lọc
              </button>
            )}
          </div>

          <div>
            <div className="text-[12px] uppercase tracking-wide text-mute mb-2">Danh mục</div>
            <ul className="space-y-1 text-[13.5px]">
              <li>
                <button onClick={() => setParam({ group: "", cat: "" })} className={!group && !cat ? "text-navy font-semibold" : "text-ink/75 hover:text-navy"}>
                  Tất cả
                </button>
              </li>
              {MENU.map((g) => {
                const GIcon = groupIcon(g.icon);
                return (
                <li key={g.slug}>
                  <button
                    onClick={() => setParam({ group: g.group === group && !cat ? "" : g.group, cat: "" })}
                    className={"flex items-center gap-1.5 " + (g.group === group && !cat ? "text-navy font-semibold" : "text-ink/75 hover:text-navy")}
                  >
                    <GIcon size={15} className="text-navy/70" /> {g.group}
                  </button>
                  {(group === g.group || g.columns.some((c) => c.items.includes(cat))) && (
                    <ul className="mt-1 ml-3 space-y-1 border-l border-line pl-3">
                      {g.columns.flatMap((c) => c.items).map((c) => (
                        <li key={c}>
                          <button
                            onClick={() => setParam({ cat: c === cat ? "" : c, group: "" })}
                            className={c === cat ? "text-navy font-semibold" : "text-ink/70 hover:text-navy"}
                          >
                            {c}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
                );
              })}
            </ul>
          </div>

          {brandsHere.length > 1 && (
            <div>
              <div className="text-[12px] uppercase tracking-wide text-mute mb-2">Nhãn hiệu</div>
              <ul className="space-y-1 text-[13.5px]">
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

          <label className="flex items-center gap-2 text-[13.5px] text-ink/80">
            <input type="checkbox" checked={inStock} onChange={(e) => setParam({ stock: e.target.checked ? "1" : "" })} />
            Chỉ hàng còn sẵn
          </label>
        </aside>

        {/* Kết quả */}
        <div>
          <div className="flex items-center justify-between mb-4 text-[13px]">
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
    </div>
  );
}
