import React, { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { MENU, PRICE_BUCKETS, priceBucketQuery } from "../config.js";
import { href } from "../router.js";
import { useCatalog } from "../catalogContext.js";
import { formatVND } from "../lib/format.js";
import { groupIcon } from "./groupIcons.js";
import { groupStats } from "./menuData.js";
import "./mega-menu.css";

/** Menu danh mục trên điện thoại: lưới nhóm -> bấm vào xem danh mục con có ảnh, thương hiệu, khoảng giá. */
export default function MobileMenu({ go }) {
  const { products } = useCatalog();
  const [slug, setSlug] = useState(null);
  const group = MENU.find((g) => g.slug === slug);
  const st = useMemo(() => (group ? groupStats(products, group) : null), [products, group]);

  if (!group) {
    return (
      <div className="mx-groups">
        {MENU.map((g) => {
          const Icon = groupIcon(g.icon);
          const s = groupStats(products, g);
          return (
            <button key={g.slug} type="button" className="mx-gt" onClick={() => ((g.subs || []).length && !s?.game ? setSlug(g.slug) : go(href("/danh-muc", { group: g.group })))}>
              <i><Icon size={18} /></i>
              <b>{g.group}</b>
              {s?.count > 0 && <small>{s.count} {s.unit || "sản phẩm"}</small>}
            </button>
          );
        })}
      </div>
    );
  }

  const GIcon = groupIcon(group.icon);
  return (
    <div>
      <div className="flex items-center gap-2 px-3 py-3 sticky top-0 bg-white z-10 border-b border-line">
        <button type="button" onClick={() => setSlug(null)} aria-label="Quay lại các nhóm" className="grid place-items-center w-10 h-10 rounded-lg bg-navy-050 text-navy"><ArrowLeft size={18} /></button>
        <div className="min-w-0 flex-1">
          <div className="font-display font-bold text-[17px] text-ink leading-tight truncate">{group.group}</div>
          {st?.count > 0 && <div className="text-[12px] text-mute">{st.count} {st.unit || "sản phẩm"}{st.minPrice ? ` · từ ${formatVND(st.minPrice)}` : ""}</div>}
        </div>
      </div>
      <div className="px-3.5 pt-3 pb-3">
        <button type="button" onClick={() => go(href("/danh-muc", { group: group.group }))} className="hx-key y w-full min-h-[44px] text-[14px]">
          Xem tất cả {group.group} <ArrowRight size={15} />
        </button>
      </div>
      <div className="mx-subs">
        {st?.subs.map(({ node, count, image, cover }) => (
          <button key={node.slug || node.name} type="button" className={"mx-sub" + (count > 0 ? "" : " mm-card empty")} onClick={() => go(href("/danh-muc", { group: group.group, cat: node.name }))}>
            <span className={"mm-thumb" + (cover ? " cover" : "")}>{image ? <img src={image} alt="" loading="lazy" decoding="async" width="64" height="64" /> : <GIcon size={22} />}</span>
            <span className="mm-card-t">{node.name}</span>
            <span className="mm-card-n">{count > 0 ? `${count} ${st.unit || "sản phẩm"}` : "Sắp có hàng"}</span>
          </button>
        ))}
      </div>
      {st?.brands.length > 0 && (
        <div className="mx-sec">
          <h4>Thương hiệu</h4>
          <div className="mm-chips">
            {st.brands.map((b) => <a key={b} href={href("/danh-muc", { group: group.group, brand: b })} onClick={(e) => { e.preventDefault(); go(href("/danh-muc", { group: group.group, brand: b })); }}>{b}</a>)}
          </div>
        </div>
      )}
      <div className="mx-sec">
        <h4>Khoảng giá</h4>
        <div className="mm-chips">
          {PRICE_BUCKETS.map((b) => { const to = href("/danh-muc", priceBucketQuery(b, group.group)); return <a key={b.label} href={to} onClick={(e) => { e.preventDefault(); go(to); }}>{b.label}</a>; })}
        </div>
      </div>
    </div>
  );
}
