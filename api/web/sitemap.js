/**
 * GET /sitemap.xml (rewrite từ vercel.json) → hàm này — liệt kê trang chủ, trang danh mục và
 * TỪNG sản phẩm đang "Đăng web" (đọc bản danh mục `:web`, cập nhật mỗi lần lưu) để Google
 * crawl nhanh và đầy đủ hơn thay vì tự mò từng link. Nộp link này vào Google Search Console.
 */
import { readWebCached } from "./_catalog.js";
import { catalogUrl } from "./_seo.js";
import { ARTICLES } from "../../src/storefront/data/articles.js";

const SITE_URL = "https://hilipc.vn";

function escapeXml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default async function handler(req, res) {
  const urls = [
    { loc: `${SITE_URL}/`, priority: "1.0" },
    { loc: `${SITE_URL}/danh-muc`, priority: "0.8" },
    { loc: `${SITE_URL}/may-choi-game-cam-tay`, priority: "0.8" },
    { loc: `${SITE_URL}/tin-tuc`, priority: "0.7" },
    { loc: `${SITE_URL}/phan-mem-ban-quyen`, priority: "0.8" },
    { loc: `${SITE_URL}/lien-he`, priority: "0.4" },
    { loc: `${SITE_URL}/chinh-sach-bao-hanh`, priority: "0.4" },
    { loc: `${SITE_URL}/chinh-sach-giao-hang`, priority: "0.4" },
    ...["/chinh-sach-doi-tra", "/huong-dan-thanh-toan", "/chinh-sach-bao-mat", "/chinh-sach-kiem-hang", "/chinh-sach-van-chuyen", "/quyen-nghia-vu", "/dieu-khoan-website", "/bao-hanh", "/xay-dung-cau-hinh"]
      .map((x) => ({ loc: `${SITE_URL}${x}`, priority: "0.3" })),
  ];
  try {
    const { details: products, landings } = await readWebCached();
    for (const l of landings) urls.push({ loc: `${SITE_URL}/trang/${l.slug}`, priority: "0.6" });
    for (const a of ARTICLES) if (!landings.some((l) => l.slug === a.slug)) urls.push({ loc: `${SITE_URL}/trang/${a.slug}`, priority: "0.6" });
    const cats = new Set(products.map((p) => p.category).filter((c) => c && c !== "Flash Sale"));
    for (const cat of cats) urls.push({ loc: catalogUrl({ cat }), priority: "0.8" });
    const seen = new Set();
    for (const p of products) {
      const slug = p.slug || "";
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      // Ảnh sản phẩm (tối đa 3) để lên Google Hình ảnh — nguồn khách miễn phí.
      const imgs = (p.images || []).map((i) => (i && (i.src || i)) || "").filter(Boolean).slice(0, 3)
        .map((u) => (/^https?:/i.test(u) ? u : `${SITE_URL}${u.startsWith("/") ? "" : "/"}${u}`).replace(`${SITE_URL}/media/`, "https://media.hilipc.vn/"));
      urls.push({ loc: `${SITE_URL}/san-pham/${slug}`, priority: "0.7", images: imgs });
    }
  } catch (e) {
    // Đọc dữ liệu lỗi (VD chưa cấu hình Supabase) vẫn trả sitemap tối thiểu thay vì lỗi trắng trang.
  }

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
    urls.map((u) => `  <url><loc>${escapeXml(u.loc)}</loc><priority>${u.priority}</priority>` +
      (u.images || []).map((i) => `<image:image><image:loc>${escapeXml(i)}</image:loc></image:image>`).join("") +
      `</url>`).join("\n") +
    `\n</urlset>\n`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
  res.status(200).send(body);
}
