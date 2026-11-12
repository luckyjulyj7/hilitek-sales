// Font chữ dùng được trong "Mô tả sản phẩm (web)". Tất cả là Google Fonts có hỗ trợ tiếng Việt.
// Trình soạn thảo ghi thẳng `font-family: <tên>` vào HTML; web khách đọc mô tả thấy font nào thì
// mới tải font đó (không tải thừa).
export const DESC_FONTS = [
  { family: "Be Vietnam Pro", q: "Be+Vietnam+Pro:wght@400;600;700" },
  { family: "Inter", q: "Inter:wght@400;600;700" },
  { family: "Roboto", q: "Roboto:wght@400;500;700" },
  { family: "Montserrat", q: "Montserrat:wght@400;600;700" },
  { family: "Oswald", q: "Oswald:wght@400;600" },
  { family: "Chakra Petch", q: "Chakra+Petch:wght@400;600;700" },
  { family: "Playfair Display", q: "Playfair+Display:wght@400;700" },
  { family: "Lora", q: "Lora:wght@400;600;700" },
  { family: "Dancing Script", q: "Dancing+Script:wght@500;700" },
  { family: "Roboto Mono", q: "Roboto+Mono:wght@400;600" },
];

const loaded = new Set();
/** Tải các font (Google Fonts) theo tên — gọi nhiều lần không sao, font nào tải rồi thì bỏ qua. */
export function loadDescFonts(families) {
  if (typeof document === "undefined") return;
  const want = DESC_FONTS.filter((f) => families.includes(f.family) && !loaded.has(f.family));
  if (!want.length) return;
  want.forEach((f) => loaded.add(f.family));
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?" + want.map((f) => "family=" + f.q).join("&") + "&display=swap";
  document.head.appendChild(l);
}

/** Tìm các font trong danh sách đang được dùng trong 1 đoạn HTML mô tả. */
export function fontsInHtml(html) {
  const s = String(html || "");
  return DESC_FONTS.map((f) => f.family).filter((name) => s.includes(name));
}

// Bảng màu: hàng xám, hàng màu thương hiệu Hilitek, rồi 6 sắc độ (nhạt -> đậm) của 10 màu.
export const DESC_COLORS = [
  "#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#cccccc", "#d9d9d9", "#efefef", "#f3f3f3", "#ffffff",
  "#0b1230", "#1e2a8a", "#2a3aae", "#f7c600", "#ffd84d", "#ed1c24", "#e8730c", "#17643a", "#0068ff", "#7c3aed",
  "#e6b8af", "#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#c9daf8", "#cfe2f3", "#d9d2e9", "#ead1dc",
  "#dd7e6b", "#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#a4c2f4", "#9fc5e8", "#b4a7d6", "#d5a6bd",
  "#cc4125", "#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6d9eeb", "#6fa8dc", "#8e7cc3", "#c27ba0",
  "#a61c00", "#cc0000", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3c78d8", "#3d85c6", "#674ea7", "#a64d79",
  "#85200c", "#990000", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#1155cc", "#0b5394", "#351c75", "#741b47",
  "#5b0f00", "#660000", "#783f04", "#7f6000", "#274e13", "#0c343d", "#1c4587", "#073763", "#20124d", "#4c1130",
];
