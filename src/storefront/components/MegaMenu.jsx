import React, { useState, useRef, useMemo } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { MENU, PRICE_BUCKETS, priceBucketQuery } from "../config.js";
import { href } from "../router.js";
import { useCatalog } from "../catalogContext.js";
import { formatVND } from "../lib/format.js";
import { groupIcon } from "./groupIcons.js";
import { groupStats, imgOf } from "./menuData.js";
import "./mega-menu.css";

/**
 * Menu "Danh mục sản phẩm" (máy tính): một bảng liền khối.
 * Trái: các nhóm (nền xanh đêm). Phải: danh mục con dạng thẻ có ảnh + số sản phẩm,
 * cột phụ gồm thương hiệu, khoảng giá và sản phẩm nổi bật. Dữ liệu menu lấy từ trang quản lý
 * (Website → Menu danh mục), sản phẩm lấy từ danh sách đã tải.
 */
export default function MegaMenu({ navigate, onClose }) {
  const { products } = useCatalog();
  const [cur, setCur] = useState(MENU[0]?.slug);
  const t = useRef(null);
  const group = MENU.find((g) => g.slug === cur) || MENU[0];
  const st = useMemo(() => groupStats(products, group), [products, group]);
  const go = (to) => { navigate(to.replace(/^\//, "")); onClose && onClose(); };
  const link = (to, extra = {}) => ({ href: to, onClick: (e) => { e.preventDefault(); go(to); }, ...extra });
  // Rê chuột: đổi nhóm sau 60ms để lướt chéo xuống bảng bên phải không bị nhảy nhóm.
  const hover = (slug) => { clearTimeout(t.current); t.current = setTimeout(() => setCur(slug), 60); };

  if (!group) return null;
  const GIcon = groupIcon(group.icon);
  const all = href("/danh-muc", { group: group.group });

  return (
    <div className="mm" role="menu" aria-label="Danh mục sản phẩm">
      <ul className="mm-rail">
        {MENU.map((g) => {
          const Icon = groupIcon(g.icon);
          const on = g.slug === group.slug;
          return (
            <li key={g.slug}>
              <a {...link(href("/danh-muc", { group: g.group }))} role="menuitem"
                className={"mm-g" + (on ? " on" : "")} onMouseEnter={() => hover(g.slug)} onFocus={() => setCur(g.slug)}>
                <i><Icon size={17} /></i>
                <span>{g.group}</span>
                <ChevronRight size={15} className="mm-chev" />
              </a>
            </li>
          );
        })}
      </ul>

      <div className="mm-body" onMouseEnter={() => clearTimeout(t.current)}>
        <header className="mm-head">
          <span className="mm-ic"><GIcon size={22} /></span>
          <div className="min-w-0">
            <h3>{group.group}</h3>
            {st && st.count > 0 && <p>{st.count} {st.unit || "sản phẩm"}{st.minPrice ? <> · giá từ <b>{formatVND(st.minPrice)}</b></> : null}</p>}
          </div>
          <a {...link(all)} className="hx-key y mm-all">Xem tất cả <ArrowRight size={15} /></a>
        </header>

        <div className="mm-grid">
          <div className="mm-cards">
            {(st?.subs.length ? st.subs : []).map(({ node, count, image, cover }) => {
              const to = href("/danh-muc", { group: group.group, cat: node.name });
              const kids = node.subs || [];
              return (
                <div key={node.slug || node.name} className={"mm-card" + (count > 0 ? "" : " empty")}>
                  <a {...link(to)} className="mm-card-main">
                    <span className={"mm-thumb" + (cover ? " cover" : "")}>{image ? <img src={image} alt="" loading="lazy" decoding="async" width="96" height="96" /> : <GIcon size={26} />}</span>
                    <span className="mm-card-t">{node.name}</span>
                    <span className="mm-card-n">{count > 0 ? `${count} ${st.unit || "sản phẩm"}` : "Sắp có hàng"}</span>
                  </a>
                  {kids.length > 0 && (
                    <div className="mm-kids">
                      {kids.slice(0, 4).map((k) => (
                        <a key={k.slug || k.name} {...link(href("/danh-muc", { group: group.group, cat: k.name }))}>{k.name}</a>
                      ))}
                      {kids.length > 4 && <a {...link(to)}>+{kids.length - 4}</a>}
                    </div>
                  )}
                </div>
              );
            })}
            {/* Nhóm không có danh mục con: hiện luôn vài sản phẩm của nhóm */}
            {st && !st.subs.length && st.sample.map((p) => (
              <a key={p.id || p.slug} {...link("/san-pham/" + p.slug)} className="mm-card mm-card-main">
                <span className="mm-thumb">{imgOf(p) ? <img src={imgOf(p)} alt="" loading="lazy" decoding="async" width="96" height="96" /> : <GIcon size={26} />}</span>
                <span className="mm-card-t line-clamp-2">{p.name}</span>
                <span className="mm-card-n text-sale font-semibold">{formatVND(p.price)}</span>
              </a>
            ))}
          </div>

          <aside className="mm-side">
            {st?.brands.length > 0 && (
              <section>
                <h4>Thương hiệu</h4>
                <div className="mm-chips">
                  {st.brands.map((b) => <a key={b} {...link(href("/danh-muc", { group: group.group, brand: b }))}>{b}</a>)}
                </div>
              </section>
            )}
            {!st?.game && <section>
              <h4>Khoảng giá</h4>
              <div className="mm-chips">
                {PRICE_BUCKETS.map((b) => <a key={b.label} {...link(href("/danh-muc", priceBucketQuery(b, group.group)))}>{b.label}</a>)}
              </div>
            </section>}
            {st?.featured.length > 0 && (
              <section>
                <h4>Nổi bật</h4>
                {st.featured.map((p) => (
                  <a key={p.id || p.slug} {...link("/san-pham/" + p.slug)} className="mm-feat">
                    <img src={imgOf(p)} alt="" loading="lazy" decoding="async" width="64" height="64" />
                    <span className="min-w-0">
                      <span className="mm-feat-t">{p.name}</span>
                      <span className="mm-feat-p">{formatVND(p.price)}{st.off(p) > 0 && <em>−{st.off(p)}%</em>}</span>
                    </span>
                  </a>
                ))}
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
