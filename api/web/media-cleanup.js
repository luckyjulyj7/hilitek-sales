/**
 * GET  /api/web/media-cleanup  — quét kho ảnh (bucket "product-media"), so với ảnh đang
 *      thực sự được sản phẩm nào đó dùng (web.images[] + link ảnh nhúng trong web.description),
 *      trả danh sách "ảnh rác" (không còn sản phẩm nào tham chiếu) + tổng dung lượng có thể dọn.
 * POST /api/web/media-cleanup  — xoá NGAY các ảnh rác vừa quét được (tính lại tại thời điểm
 *      xoá, không tin danh sách từ client, tránh xoá nhầm ảnh vừa được gán thêm).
 * Chặn lạm dụng: header x-media-key phải khớp VITE_SUPABASE_ANON_KEY (giống các API khác).
 */
import { createClient } from "@supabase/supabase-js";
import { handler, json, readState } from "./_supa.js";

const SB_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const GATE = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
const BUCKET = "product-media";
// Mọi ảnh do uploadProductImage()/fetch-image.js tạo đều nằm trong "desc/" (xem mediaUpload.js).
const FOLDER = "desc";

// Tìm mọi đường dẫn "desc/xxx.ext" xuất hiện trong 1 chuỗi (link trực tiếp trong web.images[],
// hoặc nhúng kiểu markdown ![](/media/desc/xxx.webp) trong web.description).
function scanReferencedPaths(str, into) {
  if (typeof str !== "string" || !str) return;
  const re = /\/media\/(desc\/[A-Za-z0-9._-]+)/g;
  let m;
  while ((m = re.exec(str))) into.add(m[1]);
}

function collectReferencedPaths(state) {
  const referenced = new Set();
  const products = Array.isArray(state.products) ? state.products : [];
  for (const p of products) {
    const web = p && p.web;
    if (!web) continue;
    (Array.isArray(web.images) ? web.images : []).forEach((u) => scanReferencedPaths(u, referenced));
    scanReferencedPaths(web.description, referenced);
  }
  return referenced;
}

async function listAllFiles(sb) {
  const out = [];
  const limit = 1000;
  let offset = 0;
  for (;;) {
    const { data, error } = await sb.storage
      .from(BUCKET)
      .list(FOLDER, { limit, offset, sortBy: { column: "name", order: "asc" } });
    if (error) throw new Error(error.message);
    if (!data || !data.length) break;
    // Mục không có id = "thư mục giả" do Supabase Storage tự sinh khi trống, bỏ qua.
    for (const f of data) if (f.id) out.push(f);
    if (data.length < limit) break;
    offset += limit;
  }
  return out;
}

async function computeOrphans(sb) {
  const [state, files] = await Promise.all([readState(), listAllFiles(sb)]);
  const referenced = collectReferencedPaths(state);
  const all = files.map((f) => ({ path: `${FOLDER}/${f.name}`, size: (f.metadata && f.metadata.size) || 0 }));
  const orphans = all.filter((f) => !referenced.has(f.path));
  return { totalFiles: all.length, referencedCount: referenced.size, orphans };
}

export default handler(async (req, res) => {
  if (GATE && req.headers["x-media-key"] !== GATE) return json(res, 401, { error: "Không có quyền." });
  if (!SB_URL || !SB_KEY) return json(res, 503, { error: "Thiếu cấu hình Supabase trên máy chủ." });
  const sb = createClient(SB_URL, SB_KEY, { auth: { persistSession: false } });

  if (req.method === "GET") {
    const { totalFiles, referencedCount, orphans } = await computeOrphans(sb);
    return json(res, 200, {
      totalFiles,
      referencedCount,
      orphanCount: orphans.length,
      orphanBytes: orphans.reduce((s, f) => s + f.size, 0),
    });
  }

  if (req.method === "POST") {
    const { orphans } = await computeOrphans(sb);
    if (!orphans.length) return json(res, 200, { deleted: 0, freedBytes: 0 });
    const paths = orphans.map((f) => f.path);
    const freedBytes = orphans.reduce((s, f) => s + f.size, 0);
    const CHUNK = 200;
    let deleted = 0;
    for (let i = 0; i < paths.length; i += CHUNK) {
      const chunk = paths.slice(i, i + CHUNK);
      const { error } = await sb.storage.from(BUCKET).remove(chunk);
      if (error) return json(res, 500, { error: "Xoá lỗi: " + error.message, deleted });
      deleted += chunk.length;
    }
    return json(res, 200, { deleted, freedBytes });
  }

  return json(res, 405, { error: "Chỉ hỗ trợ GET/POST." });
});
