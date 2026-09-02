export function formatVND(n) {
  const v = Number(n) || 0;
  return v.toLocaleString("vi-VN") + " đ";
}

export function discountPercent(price, listPrice) {
  if (!listPrice || !price || listPrice <= price) return 0;
  return Math.round((1 - price / listPrice) * 100);
}

export function warrantyLabel(months) {
  const m = Number(months) || 0;
  if (m >= 1200) return "Bảo hành vĩnh viễn";
  if (m > 0) return `Bảo hành ${m} tháng`;
  return "Không bảo hành";
}

/** Bỏ dấu tiếng Việt + tạo slug an toàn cho URL. */
export function slugify(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, (c) => (c === "đ" ? "d" : "D"))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Ảnh placeholder dạng data-URI (không gọi mạng ngoài) — tên nhãn hiệu + nhãn nhỏ
 * trên nền xanh nhạt, tông giống thẻ sản phẩm SUNTECH.
 */
export function placeholderImage(brand, sub) {
  const label = String(brand || "Hilitek");
  const small = String(sub || "").slice(0, 22);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='560' height='560'>
    <rect width='100%' height='100%' fill='#EEF1FB'/>
    <rect x='0' y='0' width='100%' height='6' fill='#F7C600'/>
    <text x='50%' y='47%' text-anchor='middle' font-family='Chakra Petch, system-ui, sans-serif'
      font-size='58' font-weight='700' fill='#1E2A8A'>${escapeXml(label)}</text>
    <text x='50%' y='57%' text-anchor='middle' font-family='IBM Plex Mono, monospace'
      font-size='24' fill='#5A6484'>${escapeXml(small)}</text>
  </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg.replace(/\s+/g, " ").trim());
}

function escapeXml(s) {
  return s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
}
