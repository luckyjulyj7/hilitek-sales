/**
 * GET /san-pham/:slug và /danh-muc (rewrite từ vercel.json) -> trả shop.html đã gắn sẵn SEO riêng
 * của trang. Giao diện vẫn do React dựng như cũ, hàm này chỉ đổi phần <head>.
 * Sản phẩm không tồn tại trả mã 404 thật để Google không lập chỉ mục trang rỗng.
 */
import { readWebCached, findDetail } from "./_catalog.js";
import { applyHead, productHead, catalogHead, plainText, SITE_URL } from "./_seo.js";
import { ARTICLES } from "../../src/storefront/data/articles.js";

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
    if (q.landing === "software") {
      // Hỏi đáp khớp SW_FAQ trong src/storefront/pages/SoftwareLanding.jsx (sửa 1 chỗ thì sửa cả 2).
      const faq = [
        ["Bản OEM, Retail, FQC, ESD khác nhau thế nào?", "OEM gắn với máy cài đầu tiên. Retail (FPP) chuyển được sang máy khác. FQC là mã của bản Windows OEM đóng hộp DSP. ESD là bản quyền điện tử, nhận key qua email, không có hộp."],
        ["Hilitek có xuất hoá đơn VAT cho công ty không?", "Có. Mọi đơn phần mềm đều xuất hoá đơn VAT theo thông tin công ty, kèm chứng từ để kế toán ghi nhận chi phí."],
        ["Làm sao kiểm tra máy đang dùng bản quyền thật?", "Windows: Cài đặt, Hệ thống, Kích hoạt, trạng thái phải là Đã kích hoạt. Office: mở Word, Tài khoản, Thông tin sản phẩm."],
        ["Mua cho nhiều máy có giá riêng không?", "Có. Từ 5 máy trở lên Hilitek báo giá theo số lượng và gộp cài đặt một lần."],
        ["Đang dùng bản crack thì chuyển sang bản quyền thế nào?", "Thường chỉ cần nhập key bản quyền vào Windows, Office là kích hoạt. Nếu bản lậu đã sửa hệ thống, Hilitek sao lưu dữ liệu rồi cài sạch."],
      ];
      const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`;
      const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q2, a]) => ({ "@type": "Question", name: q2, acceptedAnswer: { "@type": "Answer", text: a } })) };
      return send(res, 200, applyHead(html, {
        title: "Phần mềm bản quyền cho doanh nghiệp: Windows, Office, Server | Hilitek",
        desc: "Windows, Office, Microsoft 365, Windows Server, SQL Server chính hãng cho công ty. Hoá đơn VAT, báo giá theo số máy, cài đặt kích hoạt. Tránh phạt đến 500 triệu đồng theo Nghị định 341/2025.",
        url: `${SITE_URL}/phan-mem-ban-quyen`,
        image: "/home/sw-windows.webp",
        extra: ld(faqLd),
        noscript: "<h1>Phần mềm bản quyền cho doanh nghiệp</h1><p>Windows, Office, Microsoft 365, Windows Server, SQL Server chính hãng, hoá đơn VAT, cài đặt kích hoạt.</p>",
      }), cache);
    }
    if (q.landing === "helpdesk") {
      const ld = { "@context": "https://schema.org", "@type": "Service", serviceType: "IT Helpdesk", name: "Dịch vụ IT Helpdesk cho doanh nghiệp",
        provider: { "@id": `${SITE_URL}/#store` }, areaServed: { "@type": "City", name: "TP Hồ Chí Minh" },
        description: "Hỗ trợ kỹ thuật từ xa và tận nơi, bảo trì định kỳ, mạng, máy chủ, email, sao lưu, bảo mật cho văn phòng." };
      return send(res, 200, applyHead(html, {
        title: "Dịch vụ IT Helpdesk cho doanh nghiệp tại TP.HCM | Hilitek",
        desc: "IT thuê ngoài cho văn phòng: hỗ trợ từ xa, kỹ thuật tới tận nơi tại TP.HCM, bảo trì định kỳ, mạng, máy chủ, email, sao lưu và bảo mật. Khảo sát miễn phí, báo giá theo số máy.",
        url: `${SITE_URL}/dich-vu-it-helpdesk`,
        image: "/home/it-helpdesk.webp",
        extra: `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`,
        noscript: "<h1>Dịch vụ IT Helpdesk cho doanh nghiệp</h1><p>Hỗ trợ từ xa và tận nơi tại TP.HCM, bảo trì định kỳ, mạng, máy chủ, email, sao lưu, bảo mật.</p>",
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
      const art = !page && ARTICLES.find((a) => a.slug === String(q.trang));
      if (art) {
        const url = `${SITE_URL}/trang/${art.slug}`;
        const img = /^https?:/.test(art.cover || "") ? art.cover : `${SITE_URL}${art.cover || "/og-hilitek.jpg"}`;
        const ld = { "@context": "https://schema.org", "@type": "Article", headline: art.title, description: art.summary, image: [img], datePublished: art.date, dateModified: art.date,
          author: { "@type": "Organization", name: "Hilitek" }, publisher: { "@type": "Organization", name: "Hilitek", logo: { "@type": "ImageObject", url: `${SITE_URL}/Logo2.png` } }, mainEntityOfPage: url };
        return send(res, 200, applyHead(html, {
          title: `${art.title} | Hilitek`, desc: plainText(art.summary, 200), url, image: art.cover, type: "article",
          extra: `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`,
          noscript: `<h1>${art.title.replace(/</g, "&lt;")}</h1><p>${plainText(art.summary, 300)}</p>`,
        }), cache);
      }
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
    // Số liệu thật cho mô tả danh mục (chỉ trang theo danh mục, không phải trang tìm kiếm).
    let stats = null;
    if (q.cat && !q.q) {
      try {
        const cat = String(q.cat), brand = q.brand ? String(q.brand) : "";
        const list = ((await readWebCached()).details || []).filter((p) => (p.category === cat || (p.categories || []).includes(cat)) && (!brand || p.brand === brand));
        const prices = list.map((p) => Number(p.price)).filter((x) => x > 0);
        const top = list.filter((p) => Number(p.stock) > 0 && (p.images || []).length).sort((a, b) => Number(b.price) - Number(a.price))[0];
        const img = top ? (top.images[0].src || top.images[0]) : "";
        // Đếm theo MẪU (gộp các màu/phiên bản cùng nhóm), khớp số mẫu khách thấy trên trang.
        const models = new Set(list.map((p) => p.variantGroupId || p.slug || p.id)).size;
        stats = { count: models, brands: [...new Set(list.map((p) => p.brand).filter(Boolean))].sort(), min: prices.length ? Math.min(...prices) : 0, image: img };
      } catch { stats = null; }
    }
    return send(res, 200, applyHead(html, catalogHead(q, stats)), cache);
  } catch (e) {
    // Lỗi đọc dữ liệu: vẫn trả trang để khách mua được, chỉ thiếu SEO riêng trong lượt này.
    return send(res, 200, html, "no-store");
  }
}
