/**
 * GET /api/web/fetch-image?url=<link ảnh ngoài>
 * Tải ảnh từ trang khác (server không bị CORS), lưu vào Supabase Storage
 * bucket "product-media", trả { url: "/media/desc/xxx.png" }.
 * Chặn lạm dụng: header x-media-key phải khớp VITE_SUPABASE_ANON_KEY.
 */
import { createClient } from "@supabase/supabase-js";
import { handler, json } from "./_supa.js";

const SB_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const GATE = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
const BUCKET = "product-media";
const MAX = 8 * 1024 * 1024;

export default handler(async (req, res) => {
  if (req.method !== "GET") return json(res, 405, { error: "Chỉ hỗ trợ GET." });
  if (GATE && req.headers["x-media-key"] !== GATE) return json(res, 401, { error: "Không có quyền." });
  if (!SB_URL || !SB_KEY) return json(res, 503, { error: "Thiếu cấu hình Supabase trên máy chủ." });

  const src = req.query && req.query.url;
  if (!src || !/^https?:\/\//i.test(src)) return json(res, 400, { error: "URL ảnh không hợp lệ." });

  let origin = "";
  try { origin = new URL(src).origin; } catch { /* noop */ }

  const up = await fetch(src, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; HilitekBot/1.0)", Referer: origin || src },
    redirect: "follow",
  });
  if (!up.ok) return json(res, 502, { error: `Trang nguồn trả mã ${up.status}.` });

  const ct = (up.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  if (!ct.startsWith("image/")) return json(res, 415, { error: "Link không phải ảnh." });

  const buf = Buffer.from(await up.arrayBuffer());
  if (buf.length > MAX) return json(res, 413, { error: "Ảnh lớn hơn 8MB." });

  const ext = (ct.split("/")[1] || "png").replace("jpeg", "jpg").split("+")[0].toLowerCase();
  const path = `desc/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const sb = createClient(SB_URL, SB_KEY, { auth: { persistSession: false } });
  const { error } = await sb.storage.from(BUCKET).upload(path, buf, { contentType: ct, upsert: false, cacheControl: "31536000" });
  if (error) return json(res, 500, { error: "Lưu vào kho lỗi: " + error.message });

  json(res, 200, { url: "/media/" + path });
});
