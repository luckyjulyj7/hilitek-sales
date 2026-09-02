import React from "react";
import { href } from "../router.js";
import { childQuery } from "../config.js";

/**
 * Bảng danh mục của 1 nhóm (group): các "danh mục phụ" (sub) là cột,
 * mỗi cột liệt kê "danh mục chi tiết" (children).
 * `go(path)` — điều hướng (path không có dấu #).
 */
export default function GroupPanel({ group, go, className = "" }) {
  const subs = group.subs || [];
  return (
    <div className={"grid gap-x-8 gap-y-5 " + className} style={{ gridTemplateColumns: `repeat(${Math.min(subs.length || 1, 4)}, minmax(0,1fr))` }}>
      {subs.map((s) => {
        const subHref = href("/danh-muc", { group: group.group, ...(s.cat ? { cat: s.cat } : {}) });
        return (
          <div key={s.slug || s.name}>
            <a
              href={subHref}
              onClick={(e) => { e.preventDefault(); go(subHref.slice(1)); }}
              className="font-display font-bold text-[13.5px] text-navy hover:underline block mb-1.5"
            >
              {s.name}
            </a>
            <ul className="space-y-1">
              {(s.children || []).map((c, i) => {
                const q = childQuery(c, s, group.group);
                const h = href("/danh-muc", q);
                return (
                  <li key={i}>
                    <a
                      href={h}
                      onClick={(e) => { e.preventDefault(); go(h.slice(1)); }}
                      className="text-[13px] text-ink/70 hover:text-navy"
                    >
                      {c.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
