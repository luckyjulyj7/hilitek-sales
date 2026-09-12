/**
 * GET /api/web/fetch-product-info?url=<link trang sản phẩm NCC>
 * Cố gắng trích tự động: tiêu đề, mô tả, thông số kỹ thuật, ảnh sản phẩm từ 1 trang bất kỳ
 * (dùng "Link tham khảo" ở Sản phẩm web). Chỉ mang tính THAM KHẢO — mỗi trang cấu trúc khác
 * nhau nên kết quả không phải lúc nào cũng đúng 100%, chủ shop luôn xem lại trước khi Lưu.
 * Chặn lạm dụng: header x-media-key phải khớp VITE_SUPABASE_ANON_KEY (giống fetch-image.js).
 */
import * as cheerio from "cheerio";
import { handler, json } from "./_supa.js";

const GATE = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
const SKIP_IMG_RE = /logo|icon|favicon|sprite|avatar|payment|thanh-toan|zalo\.(png|svg)|facebook\.(png|svg)|qr-?code/i;

export default handler(async (req, res) => {
  if (req.method !== "GET") return json(res, 405, { error: "Chỉ hỗ trợ GET." });
  if (GATE && req.headers["x-media-key"] !== GATE) return json(res, 401, { error: "Không có quyền." });

  const src = req.query && req.query.url;
  if (!src || !/^https?:\/\//i.test(src)) return json(res, 400, { error: "Nhập link sản phẩm hợp lệ (bắt đầu https://)." });

  let html;
  try {
    const r = await fetch(src, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) return json(res, 502, { error: `Trang nguồn trả mã ${r.status}.` });
    html = await r.text();
  } catch {
    return json(res, 504, { error: "Không tải được trang nguồn (quá lâu hoặc bị chặn truy cập)." });
  }

  let out;
  try {
    out = extract(html, src);
  } catch (e) {
    return json(res, 500, { error: "Không đọc được nội dung trang này: " + (e.message || e) });
  }
  json(res, 200, out);
});

// Chuyển 1 phần tử HTML (thẻ <li>/<p>...) thành text thô, giữ **in đậm** / *in nghiêng* nếu có.
function htmlToInlineMd($, el) {
  let out = "";
  $(el).contents().each((_, node) => {
    if (node.type === "text") out += node.data;
    else if (node.type === "tag") {
      const inner = htmlToInlineMd($, node);
      if (/^(strong|b)$/i.test(node.name)) out += `**${inner}**`;
      else if (/^(em|i)$/i.test(node.name)) out += `*${inner}*`;
      else if (node.name === "br") out += " ";
      else out += inner;
    }
  });
  return out.replace(/\s+/g, " ").trim();
}
const JUNK_BLOCK_RE = /search|tim-kiem|viewed|history|xem-gan-day|related|lien-quan|menu|sidebar|compare|so-sanh|cart|gio-hang|cookie|breadcrumb|filter|facet|category|danh-muc|bo-loc|widget|collection/i;
const JUNK_TEXT_RE = /giỏ hàng trống|hãy thêm sản phẩm|đăng nhập|đăng ký tài khoản|quên mật khẩu|no products found|empty cart|404|không tìm thấy trang/i;

function extract(html, src) {
  const $ = cheerio.load(html);
  const abs = (u) => { try { return new URL(u, src).href; } catch { return u; } };

  $("script,style,nav,header,footer,noscript,form").remove();

  const title =
    $("h1").first().text().trim() ||
    $('meta[property="og:title"]').attr("content") ||
    $("title").text().trim() ||
    "";

  // Mô tả — ưu tiên 1: danh sách <ul>/<ol> nhiều mục kiểu "Ý chính: nội dung" (rất phổ biến ở
  // trang sản phẩm), giữ nguyên in đậm gốc nếu có. Ưu tiên 2: khối chứa nhiều <p> nhất.
  let description = "";
  let bestList = null;
  $("ul,ol").each((_, el) => {
    if ($(el).parents("aside").length) return; // sidebar (bộ lọc/danh mục liên quan) — không phải mô tả
    const cls = `${$(el).attr("class") || ""} ${$(el).attr("id") || ""}`;
    if (JUNK_BLOCK_RE.test(cls)) return;
    const items = $(el).children("li");
    if (items.length < 2) return;
    const avgLen = items.toArray().reduce((s, li) => s + $(li).text().trim().length, 0) / items.length;
    // Ngưỡng cao (câu đầy đủ) để tránh nhầm danh sách bộ lọc/danh mục (nhãn ngắn) thành mô tả sản phẩm.
    if (avgLen < 40) return;
    if (!bestList || items.length > bestList.count) bestList = { el, count: items.length };
  });
  if (bestList) {
    description = $(bestList.el).children("li")
      .map((_, li) => "- " + htmlToInlineMd($, li)).get().filter(Boolean).join("\n");
  }
  if (!description) {
    let best = null;
    $("div,section,article").each((_, el) => {
      const cls = `${$(el).attr("class") || ""} ${$(el).attr("id") || ""}`;
      if (JUNK_BLOCK_RE.test(cls)) return;
      const pCount = $(el).children("p").length;
      if (pCount >= 2 && (!best || pCount > best.pCount)) best = { el, pCount };
    });
    if (best) {
      description = $(best.el).children("p").map((_, p) => htmlToInlineMd($, p)).get().filter(Boolean).join("\n\n");
    }
  }
  // Loại kết quả rõ ràng sai (dính phải khối "giỏ hàng trống", "đăng nhập"... hoặc quá ngắn để có ý nghĩa).
  if (description && (description.length < 60 || JUNK_TEXT_RE.test(description))) description = "";
  if (!description) {
    description = $('meta[property="og:description"]').attr("content") || $('meta[name="description"]').attr("content") || "";
  }

  // Thông số kỹ thuật: mọi bảng 2 cột (<table>), hoặc <dl><dt><dd>.
  const specs = [];
  $("table").each((_, table) => {
    $(table).find("tr").each((_, tr) => {
      const cells = $(tr).find("td,th");
      if (cells.length >= 2) {
        const k = $(cells[0]).text().replace(/\s+/g, " ").trim();
        const v = $(cells[1]).text().replace(/\s+/g, " ").trim();
        if (k && v && k.length <= 60) specs.push([k, v]);
      }
    });
  });
  if (!specs.length) {
    $("dl").each((_, dl) => {
      const dts = $(dl).find("dt"), dds = $(dl).find("dd");
      dts.each((i, dt) => {
        const k = $(dt).text().replace(/\s+/g, " ").trim();
        const v = $(dds[i]).text().replace(/\s+/g, " ").trim();
        if (k && v) specs.push([k, v]);
      });
    });
  }

  // Ảnh: gom <img> + <img data-src> (lazy-load), quy về link tuyệt đối, loại icon/logo/ảnh quá nhỏ.
  const seen = new Set();
  const images = [];
  $("img").each((_, img) => {
    const raw = $(img).attr("src") || $(img).attr("data-src") || $(img).attr("data-original") || "";
    if (!raw || /^data:/i.test(raw)) return;
    let u;
    try { u = abs(raw); } catch { return; }
    if (seen.has(u) || SKIP_IMG_RE.test(u)) return;
    const w = parseInt($(img).attr("width") || "0", 10);
    const h = parseInt($(img).attr("height") || "0", 10);
    if ((w && w < 120) || (h && h < 120)) return;
    seen.add(u);
    images.push(u);
  });

  return {
    sourceUrl: src,
    title: title.slice(0, 200),
    description: description.slice(0, 5000),
    specs: specs.slice(0, 40),
    images: images.slice(0, 12),
  };
}
