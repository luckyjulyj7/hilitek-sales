/**
 * GET /media/<đường dẫn>  (vercel.json rewrite → /api/web/media?path=<đường dẫn>)
 *
 * Vì sao có file này: trước đây /media được rewrite thẳng sang Supabase Storage. Supabase trả
 * "Cache-Control: private, no-cache" nên Vercel KHÔNG cache, trình duyệt cũng không giữ ảnh → mỗi
 * lượt khách xem 1 ảnh sản phẩm là 1 lần tải từ Supabase (tốn egress gói Free 5GB/tháng).
 *
 * Tên file ảnh luôn là mã ngẫu nhiên mới mỗi lần tải lên (không bao giờ ghi đè cùng tên), nên an
 * toàn để cache 1 năm "immutable": Vercel CDN chỉ lấy từ Supabase 1 lần cho mỗi ảnh, các lượt sau
 * trả thẳng từ CDN; trình duyệt khách cũng tự giữ ảnh, xem lại không tải lại.
 */
const SB_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const BUCKET = "product-media";
// Hàm Vercel trả tối đa ~4.5MB. Ảnh lớn hơn thì chuyển hướng sang link Supabase (hiếm gặp).
const MAX_INLINE = 4 * 1024 * 1024;
const LONG = "public, max-age=31536000, s-maxage=31536000, immutable";

export default async function handler(req, res) {
  const path = String(req.query.path || "").replace(/^\/+/, "");
  if (!path || path.includes("..") || !/^[\w\-./]+$/.test(path)) {
    res.setHeader("Cache-Control", "public, max-age=60");
    return res.status(400).send("Đường dẫn ảnh không hợp lệ.");
  }
  const src = `${SB_URL}/storage/v1/object/public/${BUCKET}/${path}`;
  let up;
  try {
    up = await fetch(src);
  } catch {
    res.setHeader("Cache-Control", "no-store");
    return res.status(502).send("Không tải được ảnh.");
  }
  if (!up.ok) {
    // Ảnh không tồn tại: cache ngắn để không gọi Supabase liên tục nhưng vẫn kịp hiện khi vừa tải lên.
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");
    return res.status(up.status === 400 ? 404 : up.status).send("Không tìm thấy ảnh.");
  }
  const len = Number(up.headers.get("content-length") || 0);
  if (len > MAX_INLINE) {
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");
    return res.redirect(302, src);
  }
  const buf = Buffer.from(await up.arrayBuffer());
  if (buf.length > MAX_INLINE) {
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");
    return res.redirect(302, src);
  }
  res.setHeader("Content-Type", up.headers.get("content-type") || "application/octet-stream");
  res.setHeader("Cache-Control", LONG);
  res.setHeader("Content-Length", String(buf.length));
  res.status(200).send(buf);
}
