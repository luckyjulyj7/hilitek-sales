/**
 * Chia kho dữ liệu thành TỪNG DÒNG NHỎ (dùng chung cho trình duyệt và máy chủ).
 *
 * Vì sao (15/11/2026): trước đây cả kho (1.800 sản phẩm, đơn, khách, nhật ký...) là 1 khối ~4 MB.
 * Sửa 1 ô giá = gửi lại 4 MB lên Vercel; có người lưu = các máy khác tải lại 4 MB từ Supabase. Cả
 * Vercel (Fast Origin Transfer) lẫn Supabase (egress) gói Free đều vượt hạn mức.
 *
 * Giờ mỗi phần tử của các danh sách trong RECORD_COLLS là 1 dòng (coll, id) trong bảng app_records;
 * các mục còn lại (webConfig, printSettings, categories, accounts...) mỗi mục là 1 dòng ("_doc", tên).
 * Thứ tự của từng danh sách lưu ở dòng ("_order", tên danh sách) = mảng id.
 * Lưu chỉ gửi các dòng đổi; đồng bộ chỉ tải các dòng người khác vừa đổi.
 */

export const RECORD_COLLS = [
  "products", "orders", "customers", "purchaseOrders", "suppliers", "brands", "stocktakes",
  "warrantyTickets", "repairTickets", "helpdeskTickets", "shippingTickets", "parcelLabels", "plans",
  "activityLog", "notifications", "quotations", "pointAdjustments",
];
export const DOC = "_doc";
export const ORDER = "_order";
// Không bao giờ lưu: phiên đăng nhập theo máy, cờ tạm khi lưu.
const SKIP_KEYS = new Set(["session", "__restore", "__updatedAt"]);

/**
 * JSON với khoá sắp xếp cố định. Bắt buộc dùng khi so sánh: Postgres (jsonb) trả khoá theo thứ tự
 * riêng, app lại hay thêm/đổi thứ tự khoá khi chuẩn hoá — so JSON thường sẽ tưởng mọi dòng đều đổi.
 * Bỏ khoá có giá trị undefined/hàm như JSON.stringify.
 */
export function canon(v) {
  if (v === null || typeof v !== "object") {
    const s = JSON.stringify(v);
    return s === undefined ? "null" : s;
  }
  if (typeof v.toJSON === "function") return canon(v.toJSON());
  if (Array.isArray(v)) return "[" + v.map((x) => (x === undefined || typeof x === "function" ? "null" : canon(x))).join(",") + "]";
  const ks = Object.keys(v).filter((k) => v[k] !== undefined && typeof v[k] !== "function").sort();
  return "{" + ks.map((k) => JSON.stringify(k) + ":" + canon(v[k])).join(",") + "}";
}

const SEP = "\u0001";
export const keyOf = (coll, id) => coll + SEP + id;
export function parseKey(k) {
  const i = k.indexOf(SEP);
  return [k.slice(0, i), k.slice(i + 1)];
}

/** Khoá dòng của 1 phần tử: id (chuỗi); thiếu id hoặc trùng id thì tạo khoá phụ để không mất phần tử. */
function itemKeys(arr) {
  const seen = new Set();
  return arr.map((it, i) => {
    let id = it && typeof it === "object" && it.id != null && it.id !== "" ? String(it.id) : "#i" + i;
    if (seen.has(id)) { let n = 2; while (seen.has(id + "#" + n)) n++; id = id + "#" + n; }
    seen.add(id);
    return id;
  });
}

/**
 * State -> Map<key, chuỗi JSON chuẩn (canon)>. Chỉ chứa các mục CÓ trong state: mục không có thì coi như không đổi
 * (diff không xoá), tránh vô tình xoá cả danh sách khi state thiếu 1 trường.
 * `present` = các danh sách/mục có mặt (để biết được phép xoá dòng thuộc danh sách nào).
 */
export function splitState(state) {
  const map = new Map();
  const present = new Set();
  for (const k of Object.keys(state || {})) {
    if (SKIP_KEYS.has(k)) continue;
    const v = state[k];
    if (v === undefined) continue;
    if (RECORD_COLLS.includes(k)) {
      if (!Array.isArray(v)) continue;
      present.add(k);
      const ids = itemKeys(v);
      v.forEach((it, i) => map.set(keyOf(k, ids[i]), canon(it)));
      map.set(keyOf(ORDER, k), canon(ids));
    } else {
      map.set(keyOf(DOC, k), canon(v));
    }
  }
  return { map, present };
}

/** Map<key, chuỗi JSON> (hoặc giá trị đã parse nếu parsed=true) -> state đầy đủ cho app. */
export function assembleState(map, { parsed = false } = {}) {
  const val = (s) => (parsed ? s : JSON.parse(s));
  const state = {};
  const groups = new Map();
  const orders = new Map();
  for (const [k, s] of map) {
    const [coll, id] = parseKey(k);
    if (coll === "_sys") continue; // dòng hệ thống của máy chủ
    if (coll === DOC) state[id] = val(s);
    else if (coll === ORDER) orders.set(id, val(s));
    else {
      if (!groups.has(coll)) groups.set(coll, new Map());
      groups.get(coll).set(id, s);
    }
  }
  for (const coll of RECORD_COLLS) {
    const items = groups.get(coll) || new Map();
    const order = Array.isArray(orders.get(coll)) ? orders.get(coll) : [];
    const out = [];
    const used = new Set();
    for (const id of order) {
      if (items.has(id) && !used.has(id)) { out.push(val(items.get(id))); used.add(id); }
    }
    // Dòng chưa có trong thứ tự (VD đơn web vừa thêm lúc trang quản lý đang lưu thứ tự cũ): để cuối.
    for (const [id, s] of items) if (!used.has(id)) out.push(val(s));
    state[coll] = out;
  }
  // Danh sách lạ (không thuộc RECORD_COLLS) nhưng có dòng: vẫn trả về, không bỏ mất.
  for (const [coll, items] of groups) if (!(coll in state)) state[coll] = [...items.values()].map(val);
  return state;
}

/**
 * So bản mới với bản đã đồng bộ (base). Trả về danh sách thay đổi { c, i, v } (ghi) hoặc { c, i, d: 1 } (xoá).
 * Chỉ xoá dòng thuộc danh sách CÓ trong state mới. `v` là chuỗi JSON.
 */
export function diffMaps(base, next, present) {
  const changes = [];
  for (const [k, s] of next) {
    if (base.get(k) !== s) { const [c, i] = parseKey(k); changes.push({ c, i, v: s }); }
  }
  for (const k of base.keys()) {
    if (next.has(k)) continue;
    const [c, i] = parseKey(k);
    if (RECORD_COLLS.includes(c) && present.has(c)) changes.push({ c, i, d: 1 });
  }
  return changes;
}

/** Đếm số dòng xoá theo danh sách, so với số dòng đang có — để chặn lỡ xoá hàng loạt. */
export function massDeleteProblem(base, changes) {
  const del = {};
  changes.forEach((ch) => { if (ch.d) del[ch.c] = (del[ch.c] || 0) + 1; });
  const total = {};
  for (const k of base.keys()) { const [c] = parseKey(k); total[c] = (total[c] || 0) + 1; }
  for (const c of Object.keys(del)) {
    const n = del[c], t = total[c] || 0;
    // Nhật ký/thông báo tự cắt bớt nên được xoá nhiều; các danh sách khác: >20 dòng và >30% là bất thường.
    if (c === "activityLog" || c === "notifications") continue;
    if (n > 20 && n > t * 0.3) return `${c}: xoá ${n}/${t}`;
  }
  return "";
}
