/**
 * Đọc/ghi kho dữ liệu theo TỪNG DÒNG (bảng app_records, xem supabase/records.sql và src/lib/records.js).
 *
 * Chưa chạy records.sql (bảng chưa có) -> "missing": mọi thứ chạy như cũ bằng khối app_state.
 * Bảng có nhưng chưa có dấu ("_sys","migrated") -> "empty": lần đầu trang quản lý mở sẽ tự chép từ
 * khối cũ; dấu chỉ ghi SAU KHI chép đủ, nên chép dở (lỗi giữa chừng) thì lần sau chép tiếp.
 */
import { client, readState as readBlobState, STORAGE_KEY } from "./_supa.js";
import { splitState, assembleState, keyOf, ORDER, DOC, canon } from "../../src/lib/records.js";

export const NS = STORAGE_KEY;
const T = "app_records";
const PAGE = 1000;
const SYS = "_sys"; // dòng hệ thống (dấu đã chuyển dữ liệu) — không thuộc dữ liệu app

function isMissingTable(error) {
  const m = String((error && (error.message || error.code)) || "");
  return /PGRST205|42P01|does not exist|Could not find the table/i.test(m);
}

let _status = { v: null, at: 0 };
/** "ready" | "empty" | "missing" — nhớ "ready" mãi (không quay lại), còn lại kiểm lại sau 30 giây. */
export async function recordsStatus() {
  if (_status.v === "ready" || (_status.v && Date.now() - _status.at < 30000)) return _status.v;
  const { data, error } = await client().from(T).select("id").eq("ns", NS).eq("coll", SYS).eq("id", "migrated").limit(1);
  let v;
  if (error) {
    if (!isMissingTable(error)) throw new Error("Supabase đọc lỗi: " + error.message);
    v = "missing";
  } else v = data && data.length ? "ready" : "empty";
  _status = { v, at: Date.now() };
  return v;
}

/** Ghi các dòng (upsert). rows: [{ coll, id, value, deleted }]. Không trả dữ liệu về (không tốn egress). */
export async function upsertRows(rows, writer, { ignoreDuplicates = false, ns = NS } = {}) {
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500).map((r) => ({
      ns, coll: r.coll, id: r.id, value: r.deleted ? null : r.value, deleted: !!r.deleted, writer: writer || "",
    }));
    const { error } = await client().from(T).upsert(chunk, { onConflict: "ns,coll,id", ignoreDuplicates });
    if (error) throw new Error("Supabase ghi lỗi: " + error.message);
  }
}

/** Chép khối cũ sang bảng dòng (chỉ thêm dòng chưa có, không ghi đè). */
export async function migrateFromBlob() {
  const state = await readBlobState();
  if (!state || !Array.isArray(state.products)) throw new Error("Không đọc được khối dữ liệu cũ để chuyển.");
  const { map } = splitState(state);
  const rows = [...map].map(([k, s]) => { const i = k.indexOf("\u0001"); return { coll: k.slice(0, i), id: k.slice(i + 1), value: JSON.parse(s) }; });
  await upsertRows(rows, "migrate", { ignoreDuplicates: true });
  await upsertRows([{ coll: SYS, id: "migrated", value: { at: new Date().toISOString(), rows: rows.length } }], "migrate");
  _status = { v: "ready", at: Date.now() };
  return rows.length;
}

const q = (s) => '"' + String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';

/**
 * 1 trang dòng (không gồm dòng đã xoá), sắp theo (coll, id), sau khoá (afterColl, afterId).
 * colls: chỉ lấy các danh sách này (tuỳ chọn).
 */
export async function pageRows({ afterColl, afterId, limit = PAGE, colls, ns = NS, raw = false } = {}) {
  // raw: Cloudflare D1 trả value dạng chuỗi (value_raw), không parse (Supabase bỏ qua tuỳ chọn này).
  let qb = client().from(T).select("coll,id,value,updated_at", raw ? { hiliRaw: true } : undefined).eq("ns", ns).eq("deleted", false);
  if (colls) qb = qb.in("coll", colls);
  if (afterColl != null) qb = qb.or(`coll.gt.${q(afterColl)},and(coll.eq.${q(afterColl)},id.gt.${q(afterId)})`);
  const { data, error } = await qb.order("coll").order("id").limit(limit);
  if (error) throw new Error("Supabase đọc lỗi: " + error.message);
  return data || [];
}

/** Chỉ khoá (coll, id) các dòng còn sống của 1 kho — nhẹ, không kèm giá trị. */
export async function listKeys(ns = NS) {
  const out = [];
  let after = null;
  for (;;) {
    let qb = client().from(T).select("coll,id").eq("ns", ns).eq("deleted", false);
    if (after) qb = qb.or(`coll.gt.${q(after[0])},and(coll.eq.${q(after[0])},id.gt.${q(after[1])})`);
    const { data, error } = await qb.order("coll").order("id").limit(PAGE);
    if (error) throw new Error("Supabase đọc lỗi: " + error.message);
    (data || []).forEach((r) => out.push([r.coll, r.id]));
    if (!data || data.length < PAGE) break;
    after = [data[data.length - 1].coll, data[data.length - 1].id];
  }
  return out;
}

/** Các dòng NGƯỜI KHÁC (writer khác tab) đổi sau mốc `since` (lùi 5 giây: dòng của lần ghi khác đang dở có thể mang mốc sớm hơn). */
export async function rowsSince(since, tab, { after, limit = 500, raw = false } = {}) {
  const from = after || new Date(Date.parse(since) - 5000).toISOString();
  let qb = client().from(T).select("coll,id,value,deleted,updated_at", raw ? { hiliRaw: true } : undefined).eq("ns", NS).gt("updated_at", from);
  if (tab) qb = qb.neq("writer", tab);
  const { data, error } = await qb.order("updated_at").limit(limit);
  if (error) throw new Error("Supabase đọc lỗi: " + error.message);
  return data || [];
}

/** Có dòng nào người khác ghi sau mốc `since` không (chỉ trả 1 mốc thời gian, vài byte). */
export async function changedSince(since, tab) {
  let qb = client().from(T).select("updated_at").eq("ns", NS).gt("updated_at", since);
  if (tab) qb = qb.neq("writer", tab);
  const { data, error } = await qb.limit(1);
  if (error) throw new Error("Supabase đọc lỗi: " + error.message);
  return !!(data && data.length);
}

/** Đọc toàn bộ dòng (hoặc chỉ vài danh sách + thứ tự của chúng + vài mục) rồi ghép thành state. */
async function readMap({ colls, docs } = {}) {
  const map = new Map();
  let after = null;
  for (;;) {
    const rows = await pageRows({ afterColl: after && after[0], afterId: after && after[1], colls });
    for (const r of rows) map.set(keyOf(r.coll, r.id), r.value);
    if (rows.length < PAGE) break;
    after = [rows[rows.length - 1].coll, rows[rows.length - 1].id];
  }
  if (colls) {
    const small = async (coll, ids) => {
      if (!ids.length) return;
      const { data, error } = await client().from(T).select("coll,id,value").eq("ns", NS).eq("deleted", false).eq("coll", coll).in("id", ids);
      if (error) throw new Error("Supabase đọc lỗi: " + error.message);
      (data || []).forEach((r) => map.set(keyOf(r.coll, r.id), r.value));
    };
    await Promise.all([small(ORDER, colls), small(DOC, docs || [])]);
  }
  return map;
}

/** State đầy đủ: từ bảng dòng nếu đã chuyển, không thì từ khối cũ. Tốn egress cỡ cả kho: hạn chế dùng. */
export async function readFullState() {
  if ((await recordsStatus()) === "ready") return assembleState(await readMap(), { parsed: true });
  return readBlobState();
}

/**
 * State CHỈ gồm vài danh sách + vài mục (VD tra cứu đơn chỉ cần orders, shippingTickets).
 * Danh sách không được yêu cầu sẽ là mảng rỗng — KHÔNG dùng kết quả này để ghi đè cả kho.
 */
export async function readPartialState(colls, docs = []) {
  if ((await recordsStatus()) !== "ready") return readBlobState();
  const st = assembleState(await readMap({ colls, docs }), { parsed: true });
  st.__partial = true;
  return st;
}

/** Đọc vài sản phẩm theo id hoặc SKU (đặt hàng web chỉ cần đúng các món trong giỏ). */
export async function readProductsByIdOrSku(ids = [], skus = []) {
  const out = new Map();
  const add = (rows) => (rows || []).forEach((r) => { if (r.value) out.set(r.id, r.value); });
  const base = () => client().from(T).select("id,value").eq("ns", NS).eq("coll", "products").eq("deleted", false);
  const idList = [...new Set(ids.filter(Boolean).map(String))];
  const skuList = [...new Set(skus.filter(Boolean).map(String))];
  if (idList.length) { const { data, error } = await base().in("id", idList); if (error) throw new Error(error.message); add(data); }
  if (skuList.length) { const { data, error } = await base().in("value->>sku", skuList); if (error) throw new Error(error.message); add(data); }
  return [...out.values()];
}

/**
 * Ghi lại phần state đã đọc bằng readPartialState sau khi sửa: so từng dòng với bản lúc đọc.
 * Không xoá gì. Dòng mới được thêm vào thứ tự: `front` (đầu danh sách, VD đơn hàng) hoặc cuối.
 */
export async function commitPartial(before, after, colls, { front = [] } = {}) {
  const rows = [];
  for (const c of colls) {
    const prev = new Map((before[c] || []).map((x) => [String(x.id), canon(x)]));
    const added = [];
    for (const it of after[c] || []) {
      if (!it || it.id == null) continue;
      const id = String(it.id);
      const s = canon(it);
      if (!prev.has(id)) added.push(id);
      if (prev.get(id) !== s) rows.push({ coll: c, id, value: it });
    }
    if (added.length) {
      const { data, error } = await client().from(T).select("value").eq("ns", NS).eq("coll", ORDER).eq("id", c).maybeSingle();
      if (error) throw new Error("Supabase đọc lỗi: " + error.message);
      const cur = (data && Array.isArray(data.value) ? data.value : []).filter((x) => !added.includes(x));
      rows.push({ coll: ORDER, id: c, value: front.includes(c) ? [...added, ...cur] : [...cur, ...added] });
    }
  }
  if (rows.length) await upsertRows(rows, "server");
  return rows.length;
}
