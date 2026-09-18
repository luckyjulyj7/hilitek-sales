/**
 * GET /sitemap.xml (rewrite từ vercel.json) → hàm này — liệt kê trang chủ, trang danh mục và
 * TỪNG sản phẩm đang "Đăng web" (đọc trực tiếp từ Supabase, luôn khớp dữ liệu thật) để Google
 * crawl nhanh và đầy đủ hơn thay vì tự mò từng link. Nộp link này vào Google Search Console.
 */
import { readState, publishedProducts, productSlug, slugify } from "./_supa.js";

const SITE_URL = "https://hilipc.vn";

function escapeXml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default async function handler(req, res) {
  const urls = [
    { loc: `${SITE_URL}/`, priority: "1.0" },
    { loc: `${SITE_URL}/danh-muc`, priority: "0.8" },
  ];
  try {
    const state = await readState();
    const products = publishedProducts(state);
    const seen = new Set();
    for (const p of products) {
      const slug = (p.web && p.web.slug ? slugify(p.web.slug) : productSlug(p)) || "";
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      urls.push({ loc: `${SITE_URL}/san-pham/${slug}`, priority: "0.7" });
    }
  } catch (e) {
    // Đọc dữ liệu lỗi (VD chưa cấu hình Supabase) vẫn trả sitemap tối thiểu thay vì lỗi trắng trang.
  }

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${escapeXml(u.loc)}</loc><priority>${u.priority}</priority></url>`).join("\n") +
    `\n</urlset>\n`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
  res.status(200).send(body);
}
