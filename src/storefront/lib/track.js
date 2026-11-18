/**
 * Đếm lượt truy cập (xem worker/track.js). Nhẹ và riêng tư:
 *  - Gộp nhiều trang đã xem vào 1 lần gửi (sendBeacon): khi rời trang / ẩn tab, hoặc 30 giây sau trang đầu,
 *    hoặc khi có >= 10 sự kiện; bấm sang sàn thì gửi ngay. Trung bình ~1 lượt Worker cho mỗi lượt truy cập.
 *  - Không cookie, không mã định danh. Chỉ lưu thời điểm hoạt động cuối trong localStorage để biết khi nào
 *    là lượt truy cập mới (cách quãng hơn 30 phút).
 *  - Bỏ qua trình duyệt tự động (navigator.webdriver) và máy của chủ shop: bật bằng
 *    localStorage.setItem("hili_notrack","1") trên trình duyệt đó.
 */
const URL_TRACK = "/api/web/track";
const GAP_MS = 30 * 60 * 1000;
const LS_LAST = "hili_ls";
const LS_OFF = "hili_notrack";

let queue = [];
let timer = null;
let pending = null; // trang vừa mở, đang đợi tiêu đề (trang tự đặt document.title sau khi dựng)
let pendingTimer = null;
let started = false;

const MARKETS = [
  [/(^|\.)(shopee\.vn|shp\.ee|s\.shopee\.vn)$/, "shopee"],
  [/(^|\.)(lazada\.vn|lazada\.com)$/, "lazada"],
  [/(^|\.)(tiktok\.com)$/, "tiktok"],
  [/(^|\.)(tiki\.vn)$/, "tiki"],
];

function off() {
  try {
    if (navigator.webdriver) return true;
    return localStorage.getItem(LS_OFF) === "1";
  } catch { return false; }
}

function isNewVisit() {
  try {
    const last = Number(localStorage.getItem(LS_LAST) || 0);
    return !last || Date.now() - last > GAP_MS;
  } catch { return false; }
}
function touch() { try { localStorage.setItem(LS_LAST, String(Date.now())); } catch { /* bỏ qua */ } }

function flush() {
  clearTimeout(timer); timer = null;
  commitPending();
  if (!queue.length) return;
  const body = { e: queue };
  if (isNewVisit()) {
    body.n = 1;
    body.r = document.referrer || "";
    try { body.u = new URLSearchParams(location.search).get("utm_source") || ""; } catch { /* bỏ qua */ }
  }
  queue = [];
  touch();
  const text = JSON.stringify(body);
  try {
    if (navigator.sendBeacon && navigator.sendBeacon(URL_TRACK, new Blob([text], { type: "text/plain" }))) return;
  } catch { /* thử fetch */ }
  try { fetch(URL_TRACK, { method: "POST", body: text, keepalive: true, headers: { "content-type": "text/plain" } }).catch(() => {}); } catch { /* bỏ qua */ }
}

function schedule() {
  if (queue.length >= 10) return flush();
  if (!timer) timer = setTimeout(flush, 30000);
}

function commitPending() {
  if (!pending) return;
  clearTimeout(pendingTimer); pendingTimer = null;
  queue.push({ t: "p", p: pending, h: (document.title || "").slice(0, 140) });
  pending = null;
}

/** Gọi mỗi khi đổi trang (path + query đã lọc, xem App.jsx). */
export function trackPage(path) {
  if (off()) return;
  if (!started) init();
  commitPending();
  pending = path;
  pendingTimer = setTimeout(() => { commitPending(); schedule(); }, 1500); // đợi trang đặt xong tiêu đề
}

function init() {
  started = true;
  const leave = () => flush();
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") leave(); });
  window.addEventListener("pagehide", leave);
  // Bấm link sang sàn (Shopee, Lazada, TikTok Shop, Tiki): tính 1 lượt bấm, gửi ngay vì khách sắp rời web.
  document.addEventListener("click", (ev) => {
    const a = ev.target && ev.target.closest ? ev.target.closest("a[href]") : null;
    if (!a) return;
    let host = "";
    try { host = new URL(a.href, location.href).hostname.toLowerCase(); } catch { return; }
    if (!host || host === location.hostname) return;
    for (const [re, k] of MARKETS) {
      if (re.test(host)) { queue.push({ t: "c", k }); flush(); return; }
    }
  }, true);
}

/** Đường dẫn gửi đi: bỏ query, riêng trang danh mục giữ cat/group/brand (mỗi danh mục tính riêng). */
export function trackPath(path, query) {
  let p = path || "/";
  if (p.length > 1) p = p.replace(/\/+$/, "");
  if (p === "/danh-muc" && query) {
    const q = new URLSearchParams();
    for (const k of ["cat", "group", "brand"]) if (query[k]) q.set(k, String(query[k]).slice(0, 60));
    const s = q.toString();
    if (s) p += "?" + s;
  }
  return p;
}
