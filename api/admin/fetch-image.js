/**
 * GET /api/admin/fetch-image?url=<link ảnh ngoài>
 * Tải ảnh từ trang khác (server không bị CORS), lưu vào Supabase Storage
 * bucket "product-media", trả { url: "/media/desc/xxx.png" }.
 *
 * Dùng khi dán cả bài viết có ảnh vào ô "Mô tả sản phẩm" ở app quản lý.
 * Chặn lạm dụng: header x-media-key phải khớp VITE_SUPABASE_ANON_KEY.
 */
import { createClient } from "@supabase/supabase-js";

const SB_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const GATE = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
const BUCKET = "product-media";
const MAX = 8 * 1024 * 1024;

function send(res, code, payload) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.status(code).json(payload);
}

export default async function handler(req, res) {
  try {
    if (GATE && req.headers["x-media-key"] !== GATE)
      return send(res, 401, { error: "Không có quyền." });
    if (!SB_URL || !SB_KEY)
      return send(res, 503, { error: "Thiếu cấu hình Supabase trên máy chủ." });

    const src = req.query && req.query.url;
    if (!src || !/^https?:\/\//i.test(src))
      return send(res, 400, { error: "URL ảnh không hợp lệ." });

    let origin = "";
    try { origin = new URL(src).origin; } catch { /* noop */ }

    const up = await fetch(src, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; HilitekBot/1.0)", Referer: origin || src },
      redirect: "follow",
    });
    if (!up.ok) return send(res, 502, { error: `Trang nguồn trả mã ${up.status}.` });

    const ct = (up.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    if (!ct.startsWith("image/")) return send(res, 415, { error: "Link không phải ảnh." });

    const buf = Buffer.from(await up.arrayBuffer());
    if (buf.length > MAX) return send(res, 413, { error: "Ảnh lớn hơn 8MB." });

    const ext = (ct.split("/")[1] || "png").replace("jpeg", "jpg").split("+")[0].toLowerCase();
    const path = `desc/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const sb = createClient(SB_URL, SB_KEY, { auth: { persistSession: false } });
    const { error } = await sb.storage.from(BUCKET).upload(path, buf, {
      contentType: ct, upsert: false, cacheControl: "31536000",
    });
    if (error) return send(res, 500, { error: "Lưu vào kho lỗi: " + error.message });

    send(res, 200, { url: "/media/" + path });
  } catch (e) {
    send(res, 500, { error: String((e && e.message) || e) });
  }
}
