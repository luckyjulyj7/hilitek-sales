/**
 * Tải ảnh mô tả sản phẩm lên Supabase Storage (bucket "product-media").
 * Trả link dạng "/media/..." — được vercel.json rewrite về storage công khai,
 * KHÔNG lộ trang nguồn. Chỉ dùng ở app quản lý (không nhúng vào web khách).
 *
 * Tải lên bằng link dùng 1 lần do /api/admin?op=upload cấp (chỉ người đã đăng nhập mới xin được),
 * khoá anon không có quyền ghi vào kho ảnh.
 */
import { getClient, isSupabaseConfigured } from "./supabaseStorage.js";
import { adminApi } from "./adminApi.js";

const BUCKET = "product-media";

function extFromType(type) {
  return (String(type || "image/png").split("/")[1] || "png")
    .replace("jpeg", "jpg")
    .split("+")[0]
    .split(";")[0]
    .toLowerCase();
}

// Giới hạn cạnh dài nhất + chất lượng nén khi upload trực tiếp từ trình duyệt (chọn file / kéo-thả /
// dán ảnh) — cùng chuẩn với /api/web/fetch-image ở server, tránh ảnh gốc máy tính (vài MB/tấm,
// máy ảnh/điện thoại hiện đại chụp 4000px+) ngốn dung lượng kho không cần thiết cho hiển thị web.
const MAX_DIM = 1600;
const QUALITY = 0.82;

/** Nén lại 1 ảnh bằng canvas: giới hạn kích thước, WebP (giữ trong suốt) hoặc JPEG. Không hỗ trợ/lỗi thì trả bản gốc. */
async function compressImage(fileOrBlob) {
  // GIF ảnh động: canvas chỉ vẽ được khung hình đầu -> mất hiệu ứng động nếu nén lại.
  // Ảnh sản phẩm hầu như không phải GIF nên bỏ qua cho an toàn thay vì đoán.
  if (/gif/i.test(fileOrBlob.type || "")) return fileOrBlob;
  try {
    if (!("createImageBitmap" in window)) return fileOrBlob;
    const bitmap = await createImageBitmap(fileOrBlob);
    const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close && bitmap.close();
    // PNG/WebP có thể có nền trong suốt -> giữ bằng WebP; còn lại nén JPEG cho nhẹ.
    const outType = /png|webp/i.test(fileOrBlob.type || "") ? "image/webp" : "image/jpeg";
    const out = await new Promise((resolve) => canvas.toBlob(resolve, outType, QUALITY));
    if (out && out.size > 0 && out.size < fileOrBlob.size) return out;
  } catch {
    /* trình duyệt không hỗ trợ / ảnh lỗi -> giữ bản gốc, không chặn upload */
  }
  return fileOrBlob;
}

/** Upload 1 File/Blob ảnh (tự nén trước). Trả { path, url } với url = "/media/desc/xxx.webp". */
export async function uploadProductImage(fileOrBlob) {
  if (!isSupabaseConfigured())
    throw new Error("Chưa cấu hình Supabase (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).");
  const compressed = await compressImage(fileOrBlob);
  const type = compressed.type || fileOrBlob.type || "image/png";
  const { path, token } = await adminApi("upload", { method: "POST", body: { ext: extFromType(type) } });
  const { error } = await getClient()
    .storage.from(BUCKET)
    .uploadToSignedUrl(path, token, compressed, { contentType: type, upsert: false, cacheControl: "31536000" });
  if (error) {
    const m = error.message || String(error);
    const hint = /bucket|not found|row-level|policy|unauthorized/i.test(m)
      ? " — kiểm tra bucket 'product-media' đã tạo + đã chạy supabase/storage.sql."
      : "";
    throw new Error("Tải ảnh lên thất bại: " + m + hint);
  }
  return { path, url: "/media/" + path };
}

/**
 * Cắt phần trong suốt thừa quanh logo để logo hiện đúng cỡ, và thu về tối đa 800px.
 * SVG hoặc ảnh không đọc được thì giữ nguyên file gốc.
 */
export async function trimLogo(file) {
  if (!file || file.type === "image/svg+xml") return file;
  let bmp;
  try { bmp = await createImageBitmap(file); } catch { return file; }
  const { width: w, height: h } = bmp;
  const src = document.createElement("canvas");
  src.width = w; src.height = h;
  const ctx = src.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(bmp, 0, 0);
  const px = ctx.getImageData(0, 0, w, h).data;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (px[(y * w + x) * 4 + 3] > 24) {
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  if (x1 < 0) return file;
  const cw = x1 - x0 + 1, ch = y1 - y0 + 1, k = Math.min(1, 800 / Math.max(cw, ch));
  const out = document.createElement("canvas");
  out.width = Math.round(cw * k); out.height = Math.round(ch * k);
  out.getContext("2d").drawImage(src, x0, y0, cw, ch, 0, 0, out.width, out.height);
  const blob = await new Promise((ok) => out.toBlob(ok, "image/webp", 0.95));
  return blob ? new File([blob], "logo.webp", { type: "image/webp" }) : file;
}

/**
 * Chuẩn hoá 1 link để nhúng thẳng vào <img> (KHÔNG tải về kho Hilitek).
 *  • Google Drive (link chia sẻ "Bất kỳ ai có đường liên kết"):
 *      .../file/d/<ID>/view   ·   ...?id=<ID>   ·   .../open?id=<ID>
 *      → https://drive.google.com/thumbnail?id=<ID>&sz=w2000  (cho phép hotlink, ổn định)
 *  • Link ảnh khác: giữ nguyên.
 * Trả "" nếu không phải http(s).
 */
export function toDirectImageUrl(raw) {
  const s = String(raw || "").trim();
  if (!/^https?:\/\//i.test(s)) return "";
  if (/(?:drive|docs)\.google\.com/i.test(s)) {
    const m = s.match(/\/d\/([-\w]{20,})/) || s.match(/[?&]id=([-\w]{20,})/);
    if (m) return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w2000`;
  }
  return s;
}

// fetch có giới hạn thời gian — tránh treo vô hạn khi trang nguồn chậm / không phản hồi.
function fetchWithTimeout(url, opts = {}, ms = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(t));
}

/**
 * Đưa 1 ảnh từ URL ngoài về kho Hilitek. Trả link "/media/..." mới.
 * Thử tải trực tiếp ở trình duyệt trước (CDN cho phép CORS), không được thì
 * nhờ máy chủ (/api/admin?op=fetch-image) tải hộ. Có timeout ở cả 2 bước để KHÔNG bị treo.
 */
export async function rehostExternalImage(src) {
  try {
    const r = await fetchWithTimeout(src, { mode: "cors" }, 12000);
    if (r.ok) {
      const b = await r.blob();
      if (b.type && b.type.startsWith("image/")) return (await uploadProductImage(b)).url;
    }
  } catch {
    /* CORS chặn / quá lâu -> thử proxy */
  }
  const r = await fetchWithTimeout(
    `/api/admin?op=fetch-image&url=${encodeURIComponent(src)}`,
    { credentials: "same-origin" },
    30000
  );
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.url) throw new Error(j.error || `Không tải được ảnh (mã ${r.status})`);
  return j.url;
}
