/**
 * GET /san-pham/:slug và /danh-muc (rewrite từ vercel.json) -> trả shop.html đã gắn sẵn SEO riêng
 * của trang. Giao diện vẫn do React dựng như cũ, hàm này chỉ đổi phần <head>.
 * Sản phẩm không tồn tại trả mã 404 thật để Google không lập chỉ mục trang rỗng.
 */
import { readWebCached, findDetail } from "./_catalog.js";
import { applyHead, productHead, catalogHead, plainText, SITE_URL } from "./_seo.js";

// Mỗi bản deploy có function mới, nên shop.html nhớ tạm ở đây luôn khớp tên file JS của bản đó.
let shell = "";
async function loadShell(req) {
  if (shell) return shell;
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  // Cloudflare Worker: đọc thẳng file tĩnh (worker/index.js gắn __hiliAsset).
  const r = globalThis.__hiliAsset ? await globalThis.__hiliAsset("/shop.html") : await fetch(`https://${host}/shop.html`);
  if (!r.ok) throw new Error("Không đọc được shop.html: " + r.status);
  shell = await r.text();
  return shell;
}

function send(res, status, html, cache) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", cache);
  res.status(status).send(html);
}

// Tiêu đề + mô tả cho các trang thông tin (khớp nội dung PAGES trên web khách).
const INFO = {
  "/lien-he": ["Liên hệ và bản đồ cửa hàng", "Địa chỉ cửa hàng Hilitek tại Phường Phú Thọ, TP.HCM, hotline, Zalo và giờ làm việc. Ghé xem hàng trực tiếp hoặc nhắn để được tư vấn."],
  "/bao-hanh": ["Tra cứu bảo hành theo số serial", "Nhập số serial hoặc số điện thoại để tra thời hạn bảo hành sản phẩm mua tại Hilitek, không cần hoá đơn giấy."],
  "/xay-dung-cau-hinh": ["Xây dựng cấu hình PC", "Tự chọn CPU, mainboard, RAM, VGA, nguồn, vỏ máy; web tự cộng tổng tiền và gửi cấu hình cho Hilitek báo giá."],
  "/huong-dan-thanh-toan": ["Hướng dẫn thanh toán và trả góp", "Các cách thanh toán tại Hilitek: tiền mặt khi nhận hàng, chuyển khoản, quẹt thẻ tại cửa hàng và trả góp."],
  "/chinh-sach-bao-hanh": ["Chính sách bảo hành", "Điều kiện, thời hạn và cách gửi bảo hành sản phẩm mua tại Hilitek, bảo hành theo số serial."],
  "/chinh-sach-giao-hang": ["Chính sách giao hàng và kiểm hàng", "Phí và thời gian giao hàng, giao nội thành TP.HCM trong ngày, kiểm hàng trước khi thanh toán."],
  "/chinh-sach-bao-mat": ["Chính sách bảo mật thông tin", "Cách Hilitek thu thập, sử dụng và bảo vệ thông tin cá nhân của khách hàng."],
  "/chinh-sach-doi-tra": ["Chính sách đổi trả và hoàn tiền", "Điều kiện đổi mới, đổi trả và hoàn tiền khi mua hàng tại Hilitek."],
  "/quyen-nghia-vu": ["Quyền và nghĩa vụ của người mua và người bán", "Quyền lợi và trách nhiệm của khách hàng và Hilitek khi mua bán trên hilipc.vn."],
  "/dieu-khoan-website": ["Điều khoản và điều kiện sử dụng website", "Điều khoản sử dụng website hilipc.vn của Hilitek."],
  "/chinh-sach-kiem-hang": ["Chính sách kiểm hàng", "Khách được mở hộp, kiểm tra hàng trước khi thanh toán khi mua tại Hilitek."],
  "/chinh-sach-van-chuyen": ["Chính sách vận chuyển và giao nhận", "Phạm vi, phí và thời gian vận chuyển, giao nhận hàng của Hilitek."],
};

export default async function handler(req, res) {
  let html;
  try {
    html = await loadShell(req);
  } catch (e) {
    res.setHeader("Retry-After", "30");
    return send(res, 503, "<!doctype html><title>Hilitek</title><p>Trang đang tải lại, bạn thử lại sau ít giây.</p>", "no-store");
  }
  const cache = "public, max-age=0, s-maxage=600, stale-while-revalidate=86400";
  const q = req.query || {};
  try {
    if (q.slug) {
      const found = findDetail((await readWebCached()).details, String(q.slug).toLowerCase());
      if (!found) {
        return send(res, 404, applyHead(html, {
          title: "Không tìm thấy sản phẩm | Hilitek", desc: "Sản phẩm này không còn trên Hilitek.",
          url: `${SITE_URL}/danh-muc`, robots: "noindex,follow",
        }), "public, max-age=0, s-maxage=60");
      }
      return send(res, 200, applyHead(html, productHead(found)), cache);
    }
    if (q.landing === "handheld") {
      return send(res, 200, applyHead(html, {
        title: "Máy chơi game cầm tay chính hãng | Hilitek",
        desc: "Máy chơi game cầm tay Retro, Android và PC cầm tay tại Hilitek. So sánh theo ngân sách, tư vấn trước khi mua, đủ hoá đơn VAT, bảo hành theo serial.",
        url: `${SITE_URL}/may-choi-game-cam-tay`,
        image: "/og-handheld.jpg",
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
    if (q.info && INFO[q.info]) {
      const [t, d] = INFO[q.info];
      return send(res, 200, applyHead(html, { title: `${t} | Hilitek`, desc: d, url: `${SITE_URL}${q.info}`, noscript: `<h1>${t}</h1><p>${d}</p>` }), cache);
    }
    if (q.trang) {
      const { landings } = await readWebCached();
      const page = landings.find((l) => l.slug === String(q.trang));
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
