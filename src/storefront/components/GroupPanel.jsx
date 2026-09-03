import React from "react";
import { href } from "../router.js";
import { PRICE_BUCKETS, priceBucketQuery, brandsInGroup } from "../config.js";
import { useCatalog } from "../catalogContext.js";

/**
 * Bảng của 1 nhóm (group) khi xổ menu: các cột
 *   [Danh mục phụ tự đặt]  ·  [Thương hiệu — tự sinh]  ·  [Khoảng giá]
 * `go(path)` — điều hướng (path không có dấu #).
 */
export default function GroupPanel({ group, go, className = "" }) {
  const { products } = useCatalog();
  const subs = group.subs || [];
  const brands = brandsInGroup(products, group.group).slice(0, 12);

  const Col = ({ title, titleHref, items }) => (
    <div>
      {titleHref ? (
        <a
          href={titleHref}
          onClick={(e) => { e.preventDefault(); go(titleHref.slice(1)); }}
          className="font-display font-bold text-[14px] text-navy hover:underline block mb-1.5"
        >
          {title}
        </a>
      ) : (
        <div className="font-display font-bold text-[14px] text-navy mb-1.5">{title}</div>
      )}
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i}>
            <a
              href={it.href}
              onClick={(e) => { e.preventDefault(); go(it.href.slice(1)); }}
              className="text-[14px] text-ink/70 hover:text-navy"
            >
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );

  const nCols = 1 + (brands.length ? 1 : 0) + 1;

  return (
    <div className={"grid gap-x-8 gap-y-5 " + className} style={{ gridTemplateColumns: `repeat(${nCols}, minmax(0,1fr))` }}>
      <Col
        title="Danh mục"
        titleHref={href("/danh-muc", { group: group.group })}
        items={subs.map((s) => ({ label: s.name, href: href("/danh-muc", { group: group.group, cat: s.name }) }))}
      />
      {brands.length > 0 && (
        <Col
          title="Thương hiệu"
          items={brands.map((b) => ({ label: b, href: href("/danh-muc", { group: group.group, brand: b }) }))}
        />
      )}
      <Col
        title="Khoảng giá"
        items={PRICE_BUCKETS.map((b) => ({ label: b.label, href: href("/danh-muc", priceBucketQuery(b, group.group)) }))}
      />
    </div>
  );
}
