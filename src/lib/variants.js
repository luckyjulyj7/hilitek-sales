/**
 * Phiên bản sản phẩm (màu sắc/kích cỡ...) — dùng chung giữa app quản lý (SalesManager.jsx) và
 * API web (api/web/_supa.js) nên phải là module thuần JS, không phụ thuộc React/DOM.
 */

/**
 * Tên gốc của 1 phiên bản, bỏ hậu tố "- Đen"/"- Trắng, M"... mà admin tự sinh khi tạo hàng loạt
 * phiên bản (name = `${tên gốc} - ${label}`, label = giá trị các thuộc tính nối bằng ", ").
 * Dùng để hiện 1 tên chung cho cả nhóm phiên bản (danh sách sản phẩm, web, trang chi tiết web).
 */
export function baseVariantName(p) {
  const attrs = p && p.variantAttrs;
  const name = (p && p.name) || "";
  if (!attrs || typeof attrs !== "object") return name;
  const suffix = " - " + Object.values(attrs).join(", ");
  return name.endsWith(suffix) ? name.slice(0, -suffix.length) : name;
}
