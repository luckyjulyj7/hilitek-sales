/**
 * GET /api/web/fetch-product-info?url=<link trang sản phẩm NCC>
 * Cố gắng trích tự động: tiêu đề, mô tả, thông số kỹ thuật, ảnh sản phẩm từ 1 trang bất kỳ
 * (dùng "Link tham khảo" ở Sản phẩm web). Chỉ mang tính THAM KHẢO — mỗi trang cấu trúc khác
 * nhau nên kết quả không phải lúc nào cũng đúng 100%, chủ shop luôn xem lại trước khi Lưu.
 * Chặn lạm dụng: header x-media-key phải khớp VITE_SUPABASE_ANON_KEY (giống fetch-image.js).
 *
 * Cách tìm mô tả / thông số (ưu tiên từ trên xuống):
 *   1. Khối có id/class gợi ý rõ ràng (VD "product-description", "tab-specification"...).
 *   2. Khối theo sau 1 tiêu đề có chữ "Mô tả/Giới thiệu.../Description" hoặc
 *      "Thông số kỹ thuật/Specification..." — 2 cụm từ này hầu như trang nào cũng dùng.
 *   3. (cũ, ít chính xác hơn) đoán theo cấu trúc: danh sách/đoạn văn nhiều nhất trên trang,
 *      bảng 2 cột bất kỳ.
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
// id/class hay gặp cho khối mô tả / thông số (Shopify, WooCommerce, Haravan, Sapo... đều theo mẫu này).
const DESC_HINT_RE = /description|mo-?ta|gioi-?thieu|overview|tong-?quan|product-?detail|noi-?dung-?san-?pham/i;
const SPEC_HINT_RE = /specification|technical|thong-?so|additional-?information|attribute|characteristic|model/i;
// Chữ tiêu đề hay gặp ngay phía trên khối mô tả / thông số.
const DESC_HEADING_RE = /^(giới thiệu|mô tả|tổng quan|chi tiết sản phẩm|thông tin sản phẩm|description|overview|product detail|product overview)\b/i;
const SPEC_HEADING_RE = /^(thông số|specification|technical spec|spec|model)\b/i;
const HEADING_TAGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

// Các nhãn "lõi" hầu như trang sản phẩm nào cũng có (mã sản phẩm/model/thương hiệu/tên sản phẩm) —
// quét RIÊNG trên toàn trang (không chỉ trong khối thông số) vì nhiều trang đặt mấy dòng này
// ngay dưới tên sản phẩm, tách khỏi bảng thông số chính. Luôn đưa lên ĐẦU danh sách thông số.
const KEY_SPEC_FIELDS = [
  { label: "Mã sản phẩm", re: /^(mã sản phẩm|mã sp|product code|item no\.?|sku)$/i },
  { label: "Tên sản phẩm", re: /^(tên sản phẩm|product name)$/i },
  { label: "Thương hiệu", re: /^(thương hiệu|hãng sản xuất|hãng|nhà sản xuất|brand|manufacturer)$/i },
  { label: "Model", re: /^(model|mẫu mã|mã model)$/i },
];
// Quét toàn trang tìm dòng ngắn "Nhãn: Giá trị" khớp 1 trong các nhãn lõi ở trên.
function scanKeySpecs($) {
  const found = {};
  $("li,p,dt,dd,span,div,td,th").each((_, el) => {
    const $el = $(el);
    if ($el.children().length > 2) return; // chỉ quét dòng ngắn, tránh nuốt cả khối lớn
    const t = $el.text().replace(/\s+/g, " ").trim();
    if (!t || t.length > 150) return;
    const m = t.match(/^([^:：]{2,30})[:：]\s*(.+)$/);
    if (!m) return;
    const value = m[2].trim();
    if (!value) return;
    const field = KEY_SPEC_FIELDS.find((f) => f.re.test(m[1].trim()));
    if (field && !found[field.label]) found[field.label] = value;
  });
  return found;
}
// Đọc JSON-LD Schema.org "Product" (rất phổ biến, nhiều nền tảng tự chèn cho SEO) — nguồn
// đáng tin cậy nhất khi có, vì dữ liệu có cấu trúc rõ ràng thay vì phải đoán qua HTML.
function readProductJsonLd($) {
  let prod = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    if (prod) return;
    let data;
    try { data = JSON.parse($(el).contents().text()); } catch { return; }
    const list = Array.isArray(data) ? data : (Array.isArray(data["@graph"]) ? data["@graph"] : [data]);
    const isProduct = (d) => d && (d["@type"] === "Product" || (Array.isArray(d["@type"]) && d["@type"].includes("Product")));
    prod = list.find(isProduct) || null;
  });
  return prod;
}

// Tìm phần tử có id/class khớp `re` (bỏ qua nếu cũng khớp `avoidRe`) — ưu tiên khối text DÀI nhất
// (thường là khối bao ngoài cùng của cả mục, không phải 1 dòng con bên trong).
function findByHint($, re, avoidRe) {
  let best = null;
  $("[id],[class]").each((_, el) => {
    const idcls = `${$(el).attr("id") || ""} ${$(el).attr("class") || ""}`;
    if (!re.test(idcls)) return;
    if (avoidRe && avoidRe.test(idcls)) return;
    const len = $(el).text().trim().length;
    if (len < 30) return;
    if (!best || len > best.len) best = { el, len };
  });
  return best ? best.el : null;
}

// Tìm 1 tiêu đề (h1-h6/strong/b/dt/summary, ngắn) khớp `re`, rồi gom các phần tử anh em ngay
// sau nó cho tới tiêu đề tiếp theo làm nội dung. Không có gì đáng kể thì lấy cả khối cha.
function findByHeading($, re) {
  let heading = null;
  $("h1,h2,h3,h4,h5,h6,strong,b,dt,summary").each((_, el) => {
    if (heading) return;
    const t = $(el).text().trim();
    if (!t || t.length > 60) return;
    if (re.test(t)) heading = el;
  });
  if (!heading) return null;

  const wrap = $("<div></div>");
  let node = heading.nextSibling;
  while (node) {
    if (node.type === "tag" && HEADING_TAGS.has(node.name)) break;
    wrap.append($(node).clone());
    node = node.nextSibling;
  }
  if (wrap.text().trim().length > 20) return wrap.get(0);
  return $(heading).parent().get(0) || null; // heading + nội dung dùng chung 1 khối cha (kiểu tab)
}

// Lấy nội dung văn bản "giàu" từ 1 khối: ưu tiên <ul>/<ol> (chuyển bullet + giữ đậm),
// rồi tới <p>, cuối cùng mới lấy nguyên text thô.
function contentFromBlock($, block) {
  if (!block) return "";
  const $b = $(block);
  let list = null;
  $b.find("ul,ol").each((_, el) => {
    const items = $(el).children("li");
    if (items.length >= 2 && (!list || items.length > $(list).children("li").length)) list = el;
  });
  if (list) {
    const text = $(list).children("li").map((_, li) => "- " + htmlToInlineMd($, li)).get().filter(Boolean).join("\n");
    if (text) return text;
  }
  const ps = $b.find("p").filter((_, p) => $(p).text().trim().length > 0);
  if (ps.length) {
    const text = ps.map((_, p) => htmlToInlineMd($, p)).get().filter(Boolean).join("\n\n");
    if (text) return text;
  }
  return $b.text().replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

// Lấy bảng thông số (mảng [nhãn, giá trị]) trong PHẠM VI 1 khối cụ thể.
function specsFromBlock($, block) {
  if (!block) return [];
  const $b = $(block);
  const specs = [];
  $b.find("table").each((_, table) => {
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
    $b.find("dl").each((_, dl) => {
      const dts = $(dl).find("dt"), dds = $(dl).find("dd");
      dts.each((i, dt) => {
        const k = $(dt).text().replace(/\s+/g, " ").trim();
        const v = $(dds.get(i)).length ? $(dds[i]).text().replace(/\s+/g, " ").trim() : "";
        if (k && v) specs.push([k, v]);
      });
    });
  }
  if (!specs.length) {
    $b.find("li,p,tr").each((_, el) => {
      const t = $(el).text().replace(/\s+/g, " ").trim();
      const m = t.match(/^([^:：]{2,50})[:：]\s*(.+)$/);
      if (m) specs.push([m[1].trim(), m[2].trim()]);
    });
  }
  return specs;
}

function extract(html, src) {
  const $ = cheerio.load(html);
  const abs = (u) => { try { return new URL(u, src).href; } catch { return u; } };

  // Đọc JSON-LD Product TRƯỚC khi gỡ bỏ <script> (script chứa JSON-LD cũng bị gỡ nếu gỡ sau).
  const ld = readProductJsonLd($);

  $("script,style,nav,header,footer,noscript,form").remove();

  const title =
    $("h1").first().text().trim() ||
    (ld && ld.name) ||
    $('meta[property="og:title"]').attr("content") ||
    $("title").text().trim() ||
    "";

  // ----- Mô tả -----
  let description = "";
  const descBlock = findByHint($, DESC_HINT_RE, SPEC_HINT_RE) || findByHeading($, DESC_HEADING_RE);
  if (descBlock) description = contentFromBlock($, descBlock);

  if (!description) {
    // Phương án cũ: đoán theo cấu trúc (danh sách nhiều mục / khối nhiều đoạn văn nhất trên trang).
    let bestList = null;
    $("ul,ol").each((_, el) => {
      if ($(el).parents("aside").length) return;
      const cls = `${$(el).attr("class") || ""} ${$(el).attr("id") || ""}`;
      if (JUNK_BLOCK_RE.test(cls)) return;
      const items = $(el).children("li");
      if (items.length < 2) return;
      const avgLen = items.toArray().reduce((s, li) => s + $(li).text().trim().length, 0) / items.length;
      if (avgLen < 40) return;
      if (!bestList || items.length > bestList.count) bestList = { el, count: items.length };
    });
    if (bestList) {
      description = $(bestList.el).children("li").map((_, li) => "- " + htmlToInlineMd($, li)).get().filter(Boolean).join("\n");
    }
  }
  if (!description) {
    let best = null;
    $("div,section,article").each((_, el) => {
      const cls = `${$(el).attr("class") || ""} ${$(el).attr("id") || ""}`;
      if (JUNK_BLOCK_RE.test(cls)) return;
      const pCount = $(el).children("p").length;
      if (pCount >= 2 && (!best || pCount > best.pCount)) best = { el, pCount };
    });
    if (best) description = $(best.el).children("p").map((_, p) => htmlToInlineMd($, p)).get().filter(Boolean).join("\n\n");
  }
  // Loại kết quả rõ ràng sai (dính "giỏ hàng trống", "đăng nhập"... hoặc quá ngắn để có ý nghĩa).
  if (description && (description.length < 60 || JUNK_TEXT_RE.test(description))) description = "";
  if (!description) {
    description = $('meta[property="og:description"]').attr("content") || $('meta[name="description"]').attr("content") || "";
  }

  // ----- Thông số kỹ thuật -----
  const specBlock = findByHint($, SPEC_HINT_RE, DESC_HINT_RE) || findByHeading($, SPEC_HEADING_RE);
  let specs = specBlock ? specsFromBlock($, specBlock) : [];
  if (!specs.length) {
    // Phương án cũ: quét mọi bảng/dl trên trang (không phân biệt khu vực).
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
  }
  if (!specs.length) {
    $("dl").each((_, dl) => {
      const dts = $(dl).find("dt"), dds = $(dl).find("dd");
      dts.each((i, dt) => {
        const k = $(dt).text().replace(/\s+/g, " ").trim();
        const v = $(dds.get(i)).length ? $(dds[i]).text().replace(/\s+/g, " ").trim() : "";
        if (k && v) specs.push([k, v]);
      });
    });
  }

  // ----- Ảnh: gom <img> + <img data-src> (lazy-load), quy về link tuyệt đối, loại icon/logo/ảnh nhỏ. -----
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
