/**
 * Tải ảnh mô tả sản phẩm lên Supabase Storage (bucket "product-media").
 * Trả link dạng "/media/..." — được vercel.json rewrite về storage công khai,
 * KHÔNG lộ trang nguồn. Chỉ dùng ở app quản lý (không nhúng vào web khách).
 *
 * Cần chạy 1 lần: supabase/storage.sql  (tạo bucket + policy cho phép upload).
 */
import { getClient, isSupabaseConfigured, SUPABASE_ANON_KEY } from "./supabaseStorage.js";

const BUCKET = "product-media";

function extFromType(type) {
  return (String(type || "image/png").split("/")[1] || "png")
    .replace("jpeg", "jpg")
    .split("+")[0]
    .split(";")[0]
    .toLowerCase();
}

function randPath(ext) {
  return `desc/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
}

/** Upload 1 File/Blob ảnh. Trả { path, url } với url = "/media/desc/xxx.png". */
export async function uploadProductImage(fileOrBlob) {
  if (!isSupabaseConfigured())
    throw new Error("Chưa cấu hình Supabase (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).");
  const type = fileOrBlob.type || "image/png";
  const path = randPath(extFromType(type));
  const { error } = await getClient()
    .storage.from(BUCKET)
    .upload(path, fileOrBlob, { contentType: type, upsert: false, cacheControl: "31536000" });
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
 * Đưa 1 ảnh từ URL ngoài về kho Hilitek. Trả link "/media/..." mới.
 * Thử tải trực tiếp ở trình duyệt trước (CDN cho phép CORS), không được thì
 * nhờ serverless /api/admin/fetch-image tải hộ.
 */
export async function rehostExternalImage(src) {
  try {
    const r = await fetch(src, { mode: "cors" });
    if (r.ok) {
      const b = await r.blob();
      if (b.type && b.type.startsWith("image/")) return (await uploadProductImage(b)).url;
    }
  } catch {
    /* CORS chặn -> thử proxy */
  }
  const r = await fetch(`/api/admin/fetch-image?url=${encodeURIComponent(src)}`, {
    headers: { "x-media-key": SUPABASE_ANON_KEY },
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.url) throw new Error(j.error || `Không tải được ảnh (mã ${r.status})`);
  return j.url;
}
