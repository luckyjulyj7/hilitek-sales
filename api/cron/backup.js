/**
 * Sao lưu tự động blob `app_state` → bảng `app_state_backups` trên Supabase.
 *
 * Chạy bởi Vercel Cron (khai báo trong vercel.json, mặc định 00:00 giờ VN mỗi ngày).
 * Cũng gọi tay được để test: GET /api/cron/backup?key=<CRON_SECRET>
 *
 * Yêu cầu Environment Variables (Vercel):
 *   SUPABASE_SERVICE_ROLE_KEY   bắt buộc — bảng backup khoá anon
 *   CRON_SECRET                 nên đặt — Vercel tự gửi "Authorization: Bearer <CRON_SECRET>"
 *                               cho cron; request thiếu/không khớp sẽ bị từ chối.
 *   BACKUP_KEEP                 (tuỳ chọn) số bản giữ lại, mặc định 60.
 */
import { json, client, snapshotBackup, pruneBackups, STORAGE_KEY } from "../web/_supa.js";

// Dữ liệu chưa đổi kể từ bản sao lưu gần nhất -> bỏ qua (mỗi bản là đọc cả bộ ~1,6 MB egress Supabase).
async function unchangedSinceLastBackup() {
  try {
    const [{ data: main }, { data: last }] = await Promise.all([
      client().from("app_state").select("updated_at").eq("key", STORAGE_KEY).maybeSingle(),
      client().from("app_state_backups").select("taken_at").order("taken_at", { ascending: false }).limit(1).maybeSingle(),
    ]);
    return Boolean(main && last && new Date(main.updated_at).getTime() <= new Date(last.taken_at).getTime());
  } catch { return false; }
}

export default async function handler(req, res) {
  const SECRET = process.env.CRON_SECRET || "";
  if (SECRET) {
    const bearer = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    const key = bearer || (req.query && req.query.key) || "";
    if (key !== SECRET) return json(res, 401, { error: "unauthorized" });
  }
  try {
    const force = req.query && req.query.force === "1";
    if (!force && (await unchangedSinceLastBackup())) return json(res, 200, { ok: true, skipped: "Dữ liệu chưa đổi kể từ bản sao lưu gần nhất." });
    const snap = await snapshotBackup(req.query && req.query.reason ? String(req.query.reason) : "cron");
    const keep = Number(process.env.BACKUP_KEEP) > 0 ? Number(process.env.BACKUP_KEEP) : 60;
    const prune = await pruneBackups(keep);
    json(res, 200, { ok: true, at: new Date().toISOString(), ...snap, ...prune, secretConfigured: Boolean(SECRET) });
  } catch (e) {
    json(res, e.code === "NO_CONFIG" ? 503 : 500, { ok: false, error: String(e.message || e) });
  }
}
