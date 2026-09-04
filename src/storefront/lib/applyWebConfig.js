import { SITE, FLASH_SALE, HOME_POSTERS, HOME_SECTIONS, PRODUCT_SIDEBAR, CHECKOUT, PAGES, MENU, rebuildCatToGroup } from "../config.js";

/**
 * Ghi đè cấu hình mặc định (config.js) bằng giá trị chủ shop chỉnh từ app quản lý
 * (`/api/web/config`). Chỉ override phần được gửi lên — phần còn lại giữ mặc định.
 *
 * Object nhận được (tuỳ chọn từng khoá):
 *   { SITE, FLASH_SALE, HOME_POSTERS, PRODUCT_SIDEBAR, CHECKOUT, PAGES, MENU }
 */
function deepMerge(target, src) {
  if (!src || typeof src !== "object") return;
  for (const k of Object.keys(src)) {
    const v = src[k];
    const cur = target[k];
    if (v && typeof v === "object" && !Array.isArray(v) && cur && typeof cur === "object" && !Array.isArray(cur)) {
      deepMerge(cur, v);
    } else if (v !== undefined) {
      target[k] = v; // mảng & giá trị đơn: thay thế
    }
  }
}

export function applyWebConfig(cfg) {
  if (!cfg || typeof cfg !== "object") return;

  const map = { SITE, FLASH_SALE, HOME_POSTERS, PRODUCT_SIDEBAR, CHECKOUT, PAGES };
  for (const key of Object.keys(map)) {
    if (cfg[key] && typeof cfg[key] === "object") deepMerge(map[key], cfg[key]);
  }

  // MENU (cây danh mục web) — thay nguyên mảng + tính lại bảng tra category→nhóm.
  if (Array.isArray(cfg.MENU) && cfg.MENU.length) {
    MENU.length = 0;
    cfg.MENU.forEach((g) => MENU.push(g));
    rebuildCatToGroup();
  }

  // HOME_SECTIONS (khối sản phẩm trang chủ) — thay nguyên mảng. Mảng rỗng = ẩn hết khối.
  if (Array.isArray(cfg.HOME_SECTIONS)) {
    HOME_SECTIONS.length = 0;
    cfg.HOME_SECTIONS.forEach((s) => HOME_SECTIONS.push(s));
  }
}
