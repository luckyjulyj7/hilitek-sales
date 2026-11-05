/**
 * GET /san-pham/:slug và /danh-muc (rewrite từ vercel.json) -> trả shop.html đã gắn sẵn SEO riêng
 * của trang. Giao diện vẫn do React dựng như cũ, hàm này chỉ đổi phần <head>.
 * Sản phẩm không tồn tại trả mã 404 thật để Google không lập chỉ mục trang rỗng.
 */
import { readStateCached, publishedProducts, publicProduct, findPublished } from "./_supa.js";
import { applyHead, productHead, catalogHead, plainText, SITE_URL } from "./_seo.js";

// Mỗi bản deploy có function mới, nên shop.html nhớ tạm ở đây luôn khớp tên file JS của bản đó.
let shell = "";
async function loadShell(req) {
  if (shell) return shell;
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const r = await fetch(`https://${host}/shop.html`);
  if (!r.ok) throw new Error("Không đọc được shop.html: " + r.status);
  shell = await r.text();
  return shell;
}

function send(res, status, html, cache) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", cache);
  res.status(status).send(html);
}

export default async function handler(req, res) {
  let html;
  try {
    html = await loadShell(req);
  } catch (e) {
    res.setHeader("Retry-After", "30");
    return send(res, 503, "<!doctype html><title>Hilitek</title><p>Trang đang tải lại, bạn thử lại sau ít giây.</p>", "no-store");
  }
  const cache = "public, max-age=0, s-maxage=300, stale-while-revalidate=3600";
  const q = req.query || {};
  try {
    if (q.slug) {
      const found = findPublished(publishedProducts(await readStateCached()), String(q.slug).toLowerCase());
      if (!found) {
        return send(res, 404, applyHead(html, {
          title: "Không tìm thấy sản phẩm | Hilitek", desc: "Sản phẩm này không còn trên Hilitek.",
          url: `${SITE_URL}/danh-muc`, robots: "noindex,follow",
        }), "public, max-age=0, s-maxage=60");
      }
      return send(res, 200, applyHead(html, productHead(publicProduct(found, { detail: true }))), cache);
    }
    if (q.landing === "handheld") {
      return send(res, 200, applyHead(html, {
        title: "Máy chơi game cầm tay chính hãng | Hilitek",
        desc: "Máy chơi game cầm tay Retro, Android và PC cầm tay tại Hilitek. So sánh theo ngân sách, tư vấn trước khi mua, đủ hoá đơn VAT, bảo hành theo serial.",
        url: `${SITE_URL}/may-choi-game-cam-tay`,
        noscript: "<h1>Máy chơi game cầm tay</h1>",
      }), cache);
    }
    if (q.landing === "news") {
      return send(res, 200, applyHead(html, {
        title: "Tin tức và video công nghệ | Hilitek",
        desc: "Tin mới, video và hướng dẫn chọn bàn phím, chuột, màn hình, linh kiện PC và máy chơi game cầm tay từ Hilitek.",
        url: `${SITE_URL}/tin-tuc`,
        noscript: "<h1>Tin tức và video</h1>",
      }), cache);
    }
    if (q.trang) {
      const state = await readStateCached();
      const list = Array.isArray(state?.webConfig?.LANDINGS) ? state.webConfig.LANDINGS : [];
      const page = list.find((l) => l && l.slug === String(q.trang) && l.published !== false);
      if (!page) return send(res, 200, html, cache);
      // Bỏ ảnh nhúng trong nội dung trước khi lấy mô tả, ảnh có thể là chuỗi base64 rất dài.
      const body = String(page.body || "").replace(/!\[[^\]]*\]\([^)]*\)/g, " ").replace(/https?:\/\/\S+/g, " ");
      return send(res, 200, applyHead(html, {
        title: `${page.title} | Hilitek`,
        desc: plainText(page.summary || body || page.title, 200),
        url: `${SITE_URL}/trang/${page.slug}`,
        image: page.cover || undefined,
        type: page.news ? "article" : "website",
      }), cache);
    }
    return send(res, 200, applyHead(html, catalogHead(q)), cache);
  } catch (e) {
    // Lỗi đọc dữ liệu: vẫn trả trang để khách mua được, chỉ thiếu SEO riêng trong lượt này.
    return send(res, 200, html, "no-store");
  }
}
