import React from "react";
import { href } from "../router.js";
import { PRICE_BUCKETS, priceBucketQuery, brandsInGroup } from "../config.js";
import { useCatalog } from "../catalogContext.js";

// 1 dòng danh mục con/nhỏ bên trong 1 cột — đệ quy xuống hết các cấp còn lại, luôn xổ sẵn
// (không thu gọn, vì đây là menu xem nhanh chứ không phải bộ lọc).
function TreeItem({ node, go, group }) {
  const to = href("/danh-muc", { group: group.group, cat: node.name });
  const kids = node.subs || [];
  return (
    <li>
      <a
        href={to}
        onClick={(e) => { e.preventDefault(); go(to.slice(1)); }}
        className="block py-0.5 text-[13px] text-ink/70 hover:text-navy"
      >
        {node.name}
      </a>
      {kids.length > 0 && (
        <ul className="mt-0.5 ml-2.5 space-y-0.5 border-l border-line pl-2.5">
          {kids.map((n) => (
            <TreeItem key={n.slug || n.name} node={n} go={go} group={group} />
          ))}
        </ul>
      )}
    </li>
  );
}

// 1 cột = 1 "danh mục phụ" trực thuộc nhóm đang xổ ra: tiêu đề đậm là chính nó, bên dưới là
// toàn bộ cây con (danh mục con, danh mục nhỏ...) nếu có.
function SubCol({ sub, go, group }) {
  const to = href("/danh-muc", { group: group.group, cat: sub.name });
  const kids = sub.subs || [];
  return (
    <div>
      <a
        href={to}
        onClick={(e) => { e.preventDefault(); go(to.slice(1)); }}
        className="block mb-1.5 font-display font-bold text-[14px] text-navy hover:underline"
      >
        {sub.name}
      </a>
      {kids.length > 0 && (
        <ul className="space-y-1">
          {kids.map((n) => (
            <TreeItem key={n.slug || n.name} node={n} go={go} group={group} />
          ))}
        </ul>
      )}
    </div>
  );
}

function Col({ title, titleHref, go, items }) {
  return (
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
}

/**
 * Bảng của 1 nhóm (group) khi xổ menu — kiểu mega-menu nhiều cột:
 *   mỗi "danh mục phụ" là 1 cột riêng, hiện đủ cây con bên dưới (danh mục con, danh mục nhỏ...),
 *   sau cùng vẫn giữ 2 cột [Thương hiệu — tự sinh] · [Khoảng giá].
 * `go(path)` — điều hướng (path không có dấu #).
 */
export default function GroupPanel({ group, go, className = "" }) {
  const { products } = useCatalog();
  const subs = group.subs || [];
  const brands = brandsInGroup(products, group.group).slice(0, 12);

  return (
    <div
      className={"grid gap-x-6 gap-y-5 " + className}
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}
    >
      {subs.map((s) => (
        <SubCol key={s.slug || s.name} sub={s} go={go} group={group} />
      ))}
      {brands.length > 0 && (
        <Col
          title="Thương hiệu"
          go={go}
          items={brands.map((b) => ({ label: b, href: href("/danh-muc", { group: group.group, brand: b }) }))}
        />
      )}
      <Col
        title="Khoảng giá"
        go={go}
        items={PRICE_BUCKETS.map((b) => ({ label: b.label, href: href("/danh-muc", priceBucketQuery(b, group.group)) }))}
      />
    </div>
  );
}
