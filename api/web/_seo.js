/**
 * Dựng phần <head> riêng cho từng trang từ shop.html, để Google, Zalo và Facebook đọc được tiêu đề,
 * mô tả, ảnh và giá ngay trong HTML mà không cần chạy JavaScript.
 * File chỉ gồm hàm thuần (không đọc dữ liệu) nên kiểm thử được độc lập.
 */

export const SITE_URL = "https://hilipc.vn";
const BRAND = "Hilitek";

const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Dấu < trong JSON-LD phải thoát, nếu không tên sản phẩm chứa "</script>" sẽ phá trang.
const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`;

const absUrl = (u) => (!u ? "" : /^https?:\/\//i.test(u) ? u : `${SITE_URL}${u.startsWith("/") ? "" : "/"}${u}`);

/** Bỏ dấu Markdown và thẻ HTML, cắt theo từ để mô tả không đứt giữa chữ. */
export function plainText(s, max = 160) {
  const t = String(s || "").replace(/<[^>]+>/g, " ").replace(/[*_#`]+/g, "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 30)).trim() + "…";
}

/** Thay title, mô tả, canonical, thẻ chia sẻ trong shop.html; thêm JSON-LD và nội dung noscript. */
export function applyHead(html, { title, desc, url, image, type = "website", robots = "", extra = "", noscript = "" }) {
  const t = esc(title), d = esc(desc), u = esc(url);
  let out = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${t}</title>`)
    .replace(/<meta\s+name="description"[\s\S]*?\/>/, `<meta name="description" content="${d}" />`)
    .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${u}" />`)
    .replace(/<meta property="og:type"[^>]*>/, `<meta property="og:type" content="${esc(type)}" />`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${t}" />`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${d}" />`)
    .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${u}" />`)
    .replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${t}" />`)
    .replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${d}" />`);
  if (image) {
    const i = esc(absUrl(image));
    out = out
      .replace(/<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${i}" />`)
      .replace(/<meta property="og:image:secure_url"[^>]*>/, `<meta property="og:image:secure_url" content="${i}" />`)
      .replace(/<meta property="og:image:(type|width|height)"[^>]*>\s*/g, "")
      .replace(/<meta property="og:image:alt"[^>]*>/, `<meta property="og:image:alt" content="${t}" />`)
      .replace(/<meta name="twitter:image"[^>]*>/, `<meta name="twitter:image" content="${i}" />`);
  }
  const head = (robots ? `<meta name="robots" content="${esc(robots)}" />\n` : "") + extra;
  if (head) out = out.replace("</head>", `${head}\n</head>`);
  if (noscript) out = out.replace('<div id="root"></div>', `<div id="root"></div>\n<noscript>${noscript}</noscript>`);
  return out;
}

/** Đầu trang của một sản phẩm. `p` là kết quả publicProduct(..., { detail: true }). */
export function productHead(p) {
  const url = `${SITE_URL}/san-pham/${p.slug}`;
  // Một số sản phẩm đã lưu tên cũ "HiliPC" trong ô SEO, tên hiển thị thống nhất là Hilitek.
  const title = ((p.seoTitle && p.seoTitle.trim()) || `${p.name} | ${BRAND}`).replace(/HiliPC/g, BRAND);
  const desc = plainText(p.seoDesc || p.shortDesc || `${p.name} chính hãng tại ${BRAND}.`, 200).replace(/HiliPC/g, BRAND);
  const images = (p.images || []).map(absUrl).filter(Boolean);
  const inStock = Number(p.stock) > 0;
  const product = {
    "@context": "https://schema.org", "@type": "Product",
    name: p.name, url, description: desc,
    ...(images.length ? { image: images } : {}),
    ...(p.sku ? { sku: p.sku } : {}),
    ...(p.brand ? { brand: { "@type": "Brand", name: p.brand } } : {}),
    ...(p.category ? { category: p.category } : {}),
    // Giá 0 nghĩa là chưa niêm yết, khai báo giá 0 sẽ bị Google báo lỗi.
    ...(Number(p.price) > 0 ? { offers: {
      "@type": "Offer", url, price: Number(p.price), priceCurrency: "VND", itemCondition: "https://schema.org/NewCondition",
      availability: `https://schema.org/${inStock ? "InStock" : "OutOfStock"}`,
      seller: { "@type": "Organization", name: BRAND },
    } } : {}),
  };
  const crumbs = [["Trang chủ", `${SITE_URL}/`]];
  if (p.category) crumbs.push([p.category, catalogUrl({ cat: p.category })]);
  crumbs.push([p.name, url]);
  const breadcrumb = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: crumbs.map(([name, item], i) => ({ "@type": "ListItem", position: i + 1, name, item })),
  };
  const priceTags = Number(p.price) > 0
    ? `<meta property="product:price:amount" content="${Number(p.price)}" />\n<meta property="product:price:currency" content="VND" />\n`
    : "";
  return {
    title, desc, url, image: images[0] || "", type: "product",
    extra: `${priceTags}${ld(product)}\n${ld(breadcrumb)}`,
    noscript: `<h1>${esc(p.name)}</h1><p>${esc(desc)}</p>${Number(p.price) > 0 ? `<p>Giá: ${Number(p.price).toLocaleString("vi-VN")}đ</p>` : ""}`,
  };
}

/** Canonical trang danh mục: giữ danh mục và hãng, bỏ sắp xếp và bộ lọc khác. Khớp App.jsx. */
export function catalogUrl({ group, cat, brand } = {}) {
  const q = new URLSearchParams();
  if (cat) q.set("cat", cat); else if (group) q.set("group", group);
  if (brand) q.set("brand", brand);
  const s = q.toString().replace(/\+/g, "%20");
  return `${SITE_URL}/danh-muc${s ? `?${s}` : ""}`;
}

/** Đầu trang danh mục. Trang tìm kiếm không cho lập chỉ mục để tránh hàng loạt trang rác. */
export function catalogHead({ group, cat, brand, q } = {}) {
  const name = cat || group || "";
  const full = name ? (brand ? `${name} ${brand}` : name) : (brand || "");
  return {
    title: full ? `${full} chính hãng, giá tốt | ${BRAND}` : `Tất cả sản phẩm | ${BRAND}`,
    desc: full
      ? `Mua ${full} chính hãng tại ${BRAND}. Đủ hoá đơn VAT, giao nhanh toàn quốc, bảo hành theo serial.`
      : `Linh kiện PC, gaming gear, màn hình và phần mềm bản quyền chính hãng tại ${BRAND}.`,
    url: catalogUrl({ group, cat, brand }),
    robots: q ? "noindex,follow" : "",
    noscript: `<h1>${esc(full || "Tất cả sản phẩm")}</h1>`,
  };
}
