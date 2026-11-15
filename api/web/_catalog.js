/**
 * "Bản danh mục web" mà mọi API công khai (products/product/config/page/sitemap) đọc — KHÔNG đọc kho.
 *
 * Kho theo dòng (bảng app_records đã có): bản danh mục cũng chia dòng, ns = "<STORAGE_KEY>:web":
 *   ("d", id sản phẩm) = chi tiết sản phẩm đã đăng · ("m", order|config|landings|v).
 *   Trang quản lý tự dựng các dòng này (src/lib/webCatalog.js buildWebParts) và chỉ gửi dòng đổi khi
 *   lưu (admin.js op=rput, trường webChanges). Sửa 1 sản phẩm = gửi 1 dòng vài KB.
 * Chưa chuyển (bảng chưa có): như trước, 1 hàng `<STORAGE_KEY>:web` trong app_state, máy chủ dựng.
 * Thiếu dữ liệu hoặc khác SNAPSHOT_VERSION -> tự dựng lại từ kho đầy đủ 1 lần.
 */
import { client, STORAGE_KEY } from "./_supa.js";
import { readFullState, recordsStatus, pageRows, upsertRows, listKeys } from "./_records.js";
import { buildWebSnapshot, buildWebParts, webPartsToMap, snapshotFromParts, SNAPSHOT_VERSION } from "../../src/lib/webCatalog.js";
import { keyOf, parseKey } from "../../src/lib/records.js";

export { buildWebSnapshot };

const TABLE = "app_state";
export const WEB_KEY = STORAGE_KEY + ":web"; // hàng app_state (cách cũ) và cũng là ns của các dòng web
const WEB_NS = WEB_KEY;

let _cache = { at: 0, snap: null, pending: null };
const CACHE_MS = 120000;

/* ---------------- cách cũ: 1 hàng app_state ---------------- */
let _lastWritten = "";
/** Cách cũ: dựng + ghi cả bản danh mục. Lỗi chỉ ghi log, không làm hỏng thao tác chính. */
export async function writeWebSnapshot(state) {
  try {
    if ((await recordsStatus()) === "ready") return; // kho theo dòng: trang quản lý tự gửi phần đổi
    const snap = buildWebSnapshot(state);
    const { builtAt, ...rest } = snap;
    const sig = JSON.stringify(rest);
    if (sig === _lastWritten) return;
    const { error } = await client().from(TABLE)
      .upsert({ key: WEB_KEY, value: JSON.stringify(snap), updated_at: builtAt }, { onConflict: "key" });
    if (error) throw new Error(error.message);
    _lastWritten = sig;
    _cache = { at: Date.now(), snap, pending: null };
  } catch (e) {
    console.error("[web-snapshot] ghi lỗi:", e && e.message);
  }
}

async function loadLegacy() {
  const { data, error } = await client().from(TABLE).select("value").eq("key", WEB_KEY).maybeSingle();
  if (error) throw new Error("Supabase đọc lỗi: " + error.message);
  if (data && data.value) {
    try {
      const snap = JSON.parse(data.value);
      if (snap && snap.v === SNAPSHOT_VERSION && Array.isArray(snap.details)) return snap;
    } catch { /* hỏng -> dựng lại */ }
  }
  const state = await readFullState();
  await writeWebSnapshot(state);
  return buildWebSnapshot(state);
}

/* ---------------- kho theo dòng ---------------- */
const okWebKey = (c, i) => (c === "d" && typeof i === "string" && i.length > 0 && i.length <= 200) || (c === "m" && ["order", "config", "landings", "v"].includes(i));

/**
 * Ghi các dòng danh mục web do trang quản lý gửi: [{c,i,v}|{c,i,d:1}] (v là chuỗi JSON).
 * replace=true: đây là bản đầy đủ -> dòng sản phẩm nào không có trong lần gửi thì đánh dấu xoá.
 */
export async function applyWebChanges(changes, { replace = false } = {}) {
  if (!Array.isArray(changes) || !changes.length) return 0;
  const rows = [];
  for (const ch of changes) {
    if (!ch || !okWebKey(ch.c, ch.i)) continue;
    if (ch.d) { if (ch.c === "d") rows.push({ coll: "d", id: ch.i, deleted: true }); continue; }
    if (typeof ch.v !== "string" || ch.v.length > 1024 * 1024) continue;
    try { rows.push({ coll: ch.c, id: ch.i, value: JSON.parse(ch.v.replace(/\\u0000/g, "")) }); } catch { /* bỏ dòng hỏng */ }
  }
  if (replace) {
    const keep = new Set(rows.filter((r) => !r.deleted).map((r) => keyOf(r.coll, r.id)));
    for (const [c, i] of await listKeys(WEB_NS)) if (c === "d" && !keep.has(keyOf(c, i))) rows.push({ coll: c, id: i, deleted: true });
  }
  if (rows.length) await upsertRows(rows, "web", { ns: WEB_NS });
  _cache = { at: 0, snap: null, pending: null };
  return rows.length;
}

async function writeParts(parts) {
  const changes = [...webPartsToMap(parts)].map(([k, v]) => { const [c, i] = parseKey(k); return { c, i, v: JSON.stringify(v) }; });
  await applyWebChanges(changes, { replace: true });
}

async function loadFromRows() {
  const parts = { v: null, details: [], order: [], config: {}, landings: [] };
  let after = null;
  for (;;) {
    const rows = await pageRows({ ns: WEB_NS, afterColl: after && after[0], afterId: after && after[1] });
    for (const r of rows) {
      if (r.coll === "d") parts.details.push(r.value);
      else if (r.coll === "m") parts[r.id] = r.value;
    }
    if (rows.length < 1000) break;
    after = [rows[rows.length - 1].coll, rows[rows.length - 1].id];
  }
  if (parts.v !== SNAPSHOT_VERSION) {
    // Chưa có hoặc code đổi cách dựng: dựng lại từ kho đầy đủ 1 lần (tốn cỡ cả kho, hiếm khi xảy ra).
    const fresh = buildWebParts(await readFullState());
    await writeParts(fresh);
    return snapshotFromParts(fresh);
  }
  return snapshotFromParts(parts);
}

async function loadSnapshot() {
  return (await recordsStatus()) === "ready" ? loadFromRows() : loadLegacy();
}

/** Đọc bản danh mục (nhớ tạm 2 phút; CDN Vercel còn cache thêm). Nơi gọi KHÔNG được sửa object trả về. */
export async function readWebCached() {
  if (_cache.snap && Date.now() - _cache.at < CACHE_MS) return _cache.snap;
  if (_cache.pending) return _cache.pending;
  const pending = loadSnapshot()
    .then((snap) => { _cache = { at: Date.now(), snap, pending: null }; return snap; })
    .catch((e) => {
      _cache.pending = null;
      if (_cache.snap) return _cache.snap; // lỗi thoáng qua — dùng tạm bản cũ
      throw e;
    });
  _cache.pending = pending;
  return pending;
}

/** Tìm chi tiết theo slug / SKU / id; nhận cả link cũ có gắn "-<sku>" ở đuôi (như findPublished). */
export function findDetail(details, slug) {
  return details.find((d) => {
    const sku = String(d.sku || "").toLowerCase();
    const slugNoSku = sku && slug.endsWith("-" + sku) ? slug.slice(0, -(sku.length + 1)) : slug;
    return d.slug === slug || d.slug === slugNoSku || sku === slug || String(d.id || "").toLowerCase() === slug;
  });
}
