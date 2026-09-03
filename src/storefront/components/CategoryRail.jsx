import React, { useState, useRef } from "react";
import { ChevronRight, LayoutGrid } from "lucide-react";
import { MENU } from "../config.js";
import { href } from "../router.js";
import { groupIcon } from "./groupIcons.js";
import GroupPanel from "./GroupPanel.jsx";

/**
 * Cột danh mục — kiểu maianhpc.vn. Rê vào 1 nhóm → xổ ngang bảng: danh mục phụ +
 * cột "Thương hiệu" (tự sinh) + "Khoảng giá".
 * Dùng ở: cột trái trang chủ, VÀ menu sổ xuống nút "DANH MỤC SẢN PHẨM" (hideHeading).
 */
export default function CategoryRail({ navigate, className = "", hideHeading = false }) {
  const [open, setOpen] = useState(null);
  const timer = useRef(null);

  const enter = (slug) => { clearTimeout(timer.current); setOpen(slug); };
  const leave = () => { clearTimeout(timer.current); timer.current = setTimeout(() => setOpen(null), 120); };
  const go = (to) => { navigate(to); setOpen(null); };

  return (
    <nav className={"relative bg-white border border-line rounded-lg " + className}>
      {!hideHeading && (
        <div className="flex items-center gap-2 px-4 h-11 bg-navy text-white rounded-t-lg font-semibold text-[14px] uppercase tracking-wide">
          <LayoutGrid size={16} /> Danh mục sản phẩm
        </div>
      )}
      <ul className="py-1">
        {MENU.map((g) => {
          const Icon = groupIcon(g.icon);
          const active = open === g.slug;
          const nSubs = (g.subs || []).length;
          return (
            <li key={g.slug} onMouseEnter={() => enter(g.slug)} onMouseLeave={leave}>
              <button
                onClick={() => go(href("/danh-muc", { group: g.group }).slice(1))}
                className={
                  "w-full flex items-center gap-2.5 px-4 py-2.5 text-[14px] text-left transition-colors " +
                  (active ? "bg-navy-050 text-navy font-medium" : "text-ink/85 hover:bg-navy-050 hover:text-navy")
                }
              >
                <Icon size={17} className="text-navy shrink-0" />
                <span className="flex-1">{g.group}</span>
                {nSubs > 0 && <ChevronRight size={14} className="text-mute" />}
              </button>

              {active && nSubs > 0 && (
                <div
                  onMouseEnter={() => enter(g.slug)}
                  onMouseLeave={leave}
                  className="absolute left-full top-0 z-30 ml-1 min-h-full w-[560px] max-w-[70vw] bg-white border border-line rounded-lg shadow-menu p-5"
                >
                  <button
                    onClick={() => go(href("/danh-muc", { group: g.group }).slice(1))}
                    className="font-display font-bold text-navy text-[15px] hover:underline mb-3 block"
                  >
                    {g.group} →
                  </button>
                  <GroupPanel group={g} go={go} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
