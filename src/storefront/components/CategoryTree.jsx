import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * 1 dòng trong cây danh mục — tự thu gọn/xổ ra, tự mở sẵn nếu nằm trên đường đi tới
 * danh mục đang được chọn (`activePath`).
 */
function CategoryTreeNode({ node, activeCat, activePath, onSelect, depth }) {
  const kids = node.subs || [];
  const hasChildren = kids.length > 0;
  const isActive = node.name === activeCat;
  const onPath = activePath.includes(node.name);
  const [open, setOpen] = useState(onPath);

  // Chọn danh mục khác (vd bấm từ nơi khác) mà nhánh này nằm trên đường đi mới -> tự mở ra.
  useEffect(() => { if (onPath) setOpen(true); }, [onPath]);

  return (
    <li>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onSelect(node.name)}
          className={"flex-1 text-left py-1 text-[14px] " + (isActive ? "text-navy font-semibold" : "text-ink/75 hover:text-navy")}
        >
          {node.name}
        </button>
        {hasChildren && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Thu gọn" : "Mở rộng"}
            className="p-1 -m-1 text-mute hover:text-navy shrink-0"
          >
            <ChevronDown size={14} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
          </button>
        )}
      </div>
      {hasChildren && open && (
        <CategoryTree nodes={kids} activeCat={activeCat} activePath={activePath} onSelect={onSelect} depth={depth + 1} />
      )}
    </li>
  );
}

/**
 * Cây danh mục thu gọn/xổ ra nhiều cấp (Danh mục phụ > Con > Nhỏ...) — dùng cho bộ lọc
 * trang danh mục và drawer danh mục trên điện thoại.
 *   nodes      : mảng node cấp hiện tại [{ name, slug, subs? }]
 *   activeCat  : tên danh mục đang được chọn (bôi đậm)
 *   activePath : mảng tên tổ tiên của activeCat (từ categoryBreadcrumb) — để tự mở đúng nhánh
 *   onSelect   : (name) => void — bấm vào 1 tên
 */
export default function CategoryTree({ nodes, activeCat, activePath = [], onSelect, depth = 0 }) {
  return (
    <ul className={depth > 0 ? "mt-1 ml-3 space-y-1 border-l border-line pl-3" : "space-y-1"}>
      {(nodes || []).map((n) => (
        <CategoryTreeNode key={n.slug || n.name} node={n} activeCat={activeCat} activePath={activePath} onSelect={onSelect} depth={depth} />
      ))}
    </ul>
  );
}
