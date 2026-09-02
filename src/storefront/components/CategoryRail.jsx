import React, { useState, useRef } from "react";
import { ChevronRight, LayoutGrid } from "lucide-react";
import { MENU } from "../config.js";
import { href } from "../router.js";
import { groupIcon } from "./groupIcons.js";

/** Cột danh mục bên trái trang chủ — kiểu maianhpc.vn, có flyout danh mục con. */
export default function CategoryRail({ navigate, className = "" }) {
  const [open, setOpen] = useState(null);
  const timer = useRef(null);

  const enter = (slug) => {
    clearTimeout(timer.current);
    setOpen(slug);
  };
  const leave = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(null), 120);
  };
  const go = (to) => {
    navigate(to);
    setOpen(null);
  };

  return (
    <nav className={"relative bg-white border border-line rounded-lg " + className}>
      <div className="flex items-center gap-2 px-4 h-11 bg-navy text-white rounded-t-lg font-semibold text-[13.5px] uppercase tracking-wide">
        <LayoutGrid size={16} /> Danh mục sản phẩm
      </div>
      <ul className="py-1">
        {MENU.map((g) => {
          const Icon = groupIcon(g.icon);
          const active = open === g.slug;
          return (
            <li key={g.slug} onMouseEnter={() => enter(g.slug)} onMouseLeave={leave}>
              <button
                onClick={() => go(href("/danh-muc", { group: g.group }).slice(1))}
                className={
                  "w-full flex items-center gap-2.5 px-4 py-2.5 text-[13.5px] text-left transition-colors " +
                  (active ? "bg-navy-050 text-navy font-medium" : "text-ink/85 hover:bg-navy-050 hover:text-navy")
                }
              >
                <Icon size={17} className="text-navy shrink-0" />
                <span className="flex-1">{g.group}</span>
                <ChevronRight size={14} className="text-mute" />
              </button>

              {active && (
                <div
                  onMouseEnter={() => enter(g.slug)}
                  onMouseLeave={leave}
                  className="absolute left-full top-0 z-30 ml-1 w-[520px] min-h-full bg-white border border-line rounded-lg shadow-menu p-5"
                >
                  <button
                    onClick={() => go(href("/danh-muc", { group: g.group }).slice(1))}
                    className="font-display font-bold text-navy text-[15px] hover:underline"
                  >
                    {g.group} →
                  </button>
                  <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4">
                    {g.columns.map((col) => (
                      <div key={col.heading}>
                        <div className="text-[11.5px] font-semibold uppercase tracking-wide text-mute mb-1.5">
                          {col.heading}
                        </div>
                        <ul className="space-y-1.5">
                          {col.items.map((c) => (
                            <li key={c}>
                              <button
                                onClick={() => go(href("/danh-muc", { cat: c }).slice(1))}
                                className="text-[13.5px] text-ink/75 hover:text-navy text-left"
                              >
                                {c}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
