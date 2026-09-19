/**
 * POST /api/web/ai-product-info  { url }
 * Đọc 1 trang sản phẩm của NCC/hãng, dùng Gemini VIẾT LẠI (không chỉ cào nguyên văn) mô tả đã làm
 * đẹp, bảng thông số kỹ thuật, và các trường SEO (slug, tiêu đề, mô tả) cho đúng sản phẩm — thay
 * cho "Link tham khảo" cũ. Ảnh vẫn lấy trực tiếp từ trang bằng heuristic (không qua AI, đỡ tốn phí
 * và ảnh thật không cần "viết lại").
 * Cần biến môi trường GEMINI_API_KEY (tạo tại aistudio.google.com/apikey, cấu hình trong Vercel →
 * Settings → Environment Variables). Chặn lạm dụng: header x-media-key phải khớp
 * VITE_SUPABASE_ANON_KEY (giống fetch-image.js).
 */
import * as cheerio from "cheerio";
import { handler, json, slugify } from "./_supa.js";

const GATE = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const SKIP_IMG_RE = /logo|icon|favicon|sprite|avatar|payment|thanh-toan|zalo\.(png|svg)|facebook\.(png|svg)|qr-?code|dmca|banner|\/advs?\//i;

export default handler(async (req, res) => {
  if (req.method !== "POST") return json(res, 405, { error: "Chỉ hỗ trợ POST." });
  if (GATE && req.headers["x-media-key"] !== GATE) return json(res, 401, { error: "Không có quyền." });
  if (!GEMINI_KEY) return json(res, 503, { error: "Server chưa cấu hình GEMINI_API_KEY." });

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const src = body.url;
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

  const { title, text, images } = extractPage(html, src);
  if (!text || text.length < 60) return json(res, 422, { error: "Không đọc được nội dung nào từ trang này." });

  let ai;
  try {
    ai = await askGemini(title, text);
  } catch (e) {
    return json(res, 502, { error: "Lỗi gọi AI: " + (e.message || e) });
  }

  json(res, 200, {
    sourceUrl: src,
    title,
    description: ai.description || "",
    specs: Array.isArray(ai.specs)
      ? ai.specs.map((s) => [String(s.label || "").trim(), String(s.value || "").trim()]).filter((s) => s[0] && s[1])
      : [],
    slug: slugify(ai.slug || title),
    seoTitle: (ai.seoTitle || "").slice(0, 70),
    seoDesc: (ai.seoDesc || "").slice(0, 320),
    images: images.slice(0, 12),
  });
});

// Lấy tiêu đề + văn bản thô (cắt bớt cho đỡ tốn phí AI) + danh sách ảnh từ 1 trang sản phẩm.
function extractPage(html, src) {
  const $ = cheerio.load(html);
  const abs = (u) => { try { return new URL(u, src).href; } catch { return u; } };
  const title =
    $('meta[property="og:title"]').attr("content") ||
    $("h1").first().text().trim() ||
    $("title").text().trim() ||
    "";

  const seen = new Set();
  const images = [];
  const addImage = (raw) => {
    if (!raw || /^data:/i.test(raw)) return;
    let u;
    try { u = abs(raw); } catch { return; }
    if (seen.has(u) || SKIP_IMG_RE.test(u)) return;
    seen.add(u);
    images.push(u);
  };
  $("img").each((_, img) => {
    const raw = $(img).attr("src") || $(img).attr("data-src") || $(img).attr("data-original") || "";
    if (!raw) return;
    const wAttr = $(img).attr("width") || "", hAttr = $(img).attr("height") || "";
    const w = /^\d+$/.test(wAttr) ? parseInt(wAttr, 10) : 0;
    const h = /^\d+$/.test(hAttr) ? parseInt(hAttr, 10) : 0;
    if ((w && w < 120) || (h && h < 120)) return;
    addImage(raw);
  });

  $("script,style,nav,header,footer,noscript,form,iframe,svg").remove();
  const text = $("body").text().replace(/[ \t]+/g, " ").replace(/\n{2,}/g, "\n").trim().slice(0, 12000);
  return { title, text, images };
}

// Gọi Gemini, ép trả về đúng JSON schema (responseSchema) để khỏi phải tự dò/parse chuỗi thô.
async function askGemini(title, pageText) {
  const prompt = `Bạn là biên tập viên nội dung cho website bán linh kiện máy tính Hilitek (hilipc.vn). Dưới đây là nội dung thô lấy từ trang sản phẩm của nhà cung cấp/hãng. Dựa vào đó, hãy viết lại bằng tiếng Việt, chuẩn SEO, KHÔNG bịa thêm thông tin không có trong nội dung gốc:

1. "description": Mô tả sản phẩm hấp dẫn, mạch lạc, định dạng Markdown đơn giản (đoạn văn ngắn + gạch đầu dòng "- " cho các ý chính, có thể **in đậm** từ khoá quan trọng). Không chèn ảnh.
2. "specs": Bảng thông số kỹ thuật dạng danh sách {label, value} — lấy đúng thông số có trong nội dung gốc, KHÔNG bịa số liệu.
3. "slug": Đường dẫn URL thân thiện SEO cho sản phẩm (không dấu, chữ thường, cách nhau bằng dấu gạch ngang), dựa theo tên sản phẩm.
4. "seoTitle": Tiêu đề SEO (thẻ title), khoảng 55-65 ký tự, chứa tên sản phẩm.
5. "seoDesc": Mô tả SEO (meta description), khoảng 300 ký tự, hấp dẫn, chứa từ khoá chính.

Tên sản phẩm (nếu nhận diện được từ trang): ${title || "(không rõ, tự suy ra từ nội dung)"}

Nội dung thô từ trang:
"""
${pageText}
"""`;

  const reqBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          description: { type: "STRING" },
          specs: {
            type: "ARRAY",
            items: { type: "OBJECT", properties: { label: { type: "STRING" }, value: { type: "STRING" } }, required: ["label", "value"] },
          },
          slug: { type: "STRING" },
          seoTitle: { type: "STRING" },
          seoDesc: { type: "STRING" },
        },
        required: ["description", "specs", "slug", "seoTitle", "seoDesc"],
      },
    },
  };

  // Gemini thỉnh thoảng báo "quá tải/high demand" (503/429) — lỗi TẠM THỜI, thử lại sau vài giây
  // thường sẽ qua ngay — nên tự thử lại tối đa 2 lần trước khi báo lỗi thật cho người dùng.
  const isOverloaded = (status, msg) => status === 429 || status === 503 || /overload|high demand|quá tải/i.test(msg || "");
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise((res) => setTimeout(res, 2000 * attempt));
    let r, j;
    try {
      r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
        signal: AbortSignal.timeout(45000),
      });
      j = await r.json().catch(() => ({}));
    } catch (e) {
      lastErr = new Error(e.message || String(e));
      continue;
    }
    if (r.ok) {
      const raw = j.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!raw) throw new Error("AI không trả về nội dung — thử lại hoặc đổi trang khác.");
      return JSON.parse(raw);
    }
    lastErr = new Error(j.error?.message || `Gemini lỗi ${r.status}`);
    if (!isOverloaded(r.status, j.error?.message)) throw lastErr;
  }
  throw new Error((lastErr && lastErr.message) + " — AI đang quá tải, vui lòng thử lại sau ít phút.");
}
