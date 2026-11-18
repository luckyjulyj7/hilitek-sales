/**
 * Đếm lượt truy cập web khách — POST /api/web/track (web khách gửi theo lô, xem src/storefront/lib/track.js).
 *
 * Nhẹ có chủ đích (gói Free: 100.000 lượt Worker/ngày, ~10 ms CPU/lượt):
 *  - KHÔNG qua node-adapter/supa-d1: parse JSON nhỏ + 1 lần D1.batch (các câu upsert cộng dồn).
 *  - Trả 204 ngay, ghi D1 trong ctx.waitUntil.
 *  - Mỗi lượt gửi gộp nhiều trang đã xem; bot (theo User-Agent) bỏ qua, không ghi.
 *  - Riêng tư: không lưu IP, không cookie, không mã người dùng. Chỉ cộng số theo ngày/đường dẫn.
 */
const MAX_BYTES = 4096;
const MAX_EVENTS = 12;
const BOT = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|pagespeed|gtmetrix|curl|wget|python|axios|node-fetch|go-http|java\/|monitor|uptime|scan|check_http|ahrefs|semrush|mj12|dataforseo|bytespider/i;
const MOBILE = /Mobi|Android|iPhone|iPad|iPod/i;
const PATH_OK = /^\/[\w\-./%~]*(\?[\w\-.=&%~+]*)?$/;
const TARGETS = new Set(["shopee", "lazada", "tiktok", "tiki", "other"]);

/** Ngày theo giờ Việt Nam (UTC+7) dạng YYYY-MM-DD. */
export function vnDay(ms = Date.now()) {
  return new Date(ms + 7 * 3600 * 1000).toISOString().slice(0, 10);
}

function kindOf(path) {
  const p = path.split("?")[0];
  if (p.startsWith("/san-pham/")) return "product";
  if (p === "/danh-muc") return "category";
  if (p === "/tin-tuc" || p.startsWith("/trang/")) return "article";
  return "other";
}

/** Nguồn truy cập từ tên miền trang giới thiệu (chỉ giữ tên miền, bỏ đường dẫn và query). */
export function sourceOf(ref, utm, selfHost) {
  const u = String(utm || "").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 20);
  let host = "";
  try { host = new URL(ref).hostname.toLowerCase().replace(/^www\./, ""); } catch { /* không có */ }
  if (host && selfHost && (host === selfHost || host.endsWith("." + selfHost))) host = "";
  const h = host + " " + u;
  if (/google\./.test(h) || u === "google") return "google";
  if (/facebook\.|fb\.com|fb\.me|l\.messenger|messenger\.com/.test(h) || u === "facebook" || u === "fb") return "facebook";
  if (/zalo\./.test(h) || u === "zalo") return "zalo";
  if (/tiktok\./.test(h) || u === "tiktok") return "tiktok";
  if (/youtube\.|youtu\.be/.test(h) || u === "youtube") return "youtube";
  if (/bing\.|coccoc\.|duckduckgo\./.test(h)) return "search";
  if (host) return ("other:" + host).slice(0, 60);
  return u ? ("other:" + u) : "direct";
}

/** Chuẩn hoá thân gửi lên thành các phép cộng; trả null nếu không hợp lệ. Tách riêng để dễ thử. */
export function parseBeacon(raw, ua, selfHost) {
  let b;
  try { b = JSON.parse(raw); } catch { return null; }
  if (!b || typeof b !== "object" || !Array.isArray(b.e)) return null;
  const out = { pages: new Map(), clicks: new Map(), views: 0, clicksN: 0, newVisit: b.n === 1 };
  for (const ev of b.e.slice(0, MAX_EVENTS)) {
    if (!ev || typeof ev !== "object") continue;
    if (ev.t === "p" && typeof ev.p === "string") {
      const path = ev.p.slice(0, 160);
      if (!PATH_OK.test(path)) continue;
      const cur = out.pages.get(path) || { views: 0, title: "" };
      cur.views += 1;
      if (typeof ev.h === "string" && ev.h) cur.title = ev.h.replace(/[\u0000-\u001f]/g, " ").slice(0, 140);
      out.pages.set(path, cur);
      out.views += 1;
    } else if (ev.t === "c" && typeof ev.k === "string") {
      const k = TARGETS.has(ev.k) ? ev.k : "other";
      out.clicks.set(k, (out.clicks.get(k) || 0) + 1);
      out.clicksN += 1;
    }
  }
  if (!out.views && !out.clicksN) return null;
  out.mobile = out.newVisit && MOBILE.test(ua || "");
  out.src = out.newVisit ? sourceOf(b.r, b.u, selfHost) : "";
  return out;
}

export function buildStatements(db, day, d) {
  const up = (sql, ...a) => db.prepare(sql).bind(...a);
  const st = [
    up(`insert into stats_day(day,views,visits,mobile,clicks) values(?,?,?,?,?)
        on conflict(day) do update set views=views+excluded.views, visits=visits+excluded.visits, mobile=mobile+excluded.mobile, clicks=clicks+excluded.clicks`,
      day, d.views, d.newVisit ? 1 : 0, d.mobile ? 1 : 0, d.clicksN),
  ];
  for (const [path, v] of d.pages) {
    st.push(up(`insert into stats_page(day,path,kind,title,views) values(?,?,?,?,?)
        on conflict(day,path) do update set views=views+excluded.views, title=case when excluded.title<>'' then excluded.title else title end`,
      day, path, kindOf(path), v.title, v.views));
  }
  if (d.src) st.push(up(`insert into stats_ref(day,src,n) values(?,?,1) on conflict(day,src) do update set n=n+1`, day, d.src));
  for (const [k, n] of d.clicks) st.push(up(`insert into stats_click(day,target,n) values(?,?,?) on conflict(day,target) do update set n=n+excluded.n`, day, k, n));
  return st;
}

export async function handleTrack(request, env, ctx) {
  const none = () => new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
  if (request.method !== "POST") return new Response("Chỉ hỗ trợ POST.", { status: 405 });
  const ua = request.headers.get("user-agent") || "";
  if (!ua || BOT.test(ua)) return none();
  // Chỉ nhận từ chính web mình (chặn trang lạ bơm số): Origin phải là tên miền chính, www hoặc máy thử.
  const origin = request.headers.get("origin");
  if (origin) {
    let h = "";
    try { h = new URL(origin).hostname; } catch { /* sai */ }
    const self = String(env.CANONICAL_HOST || "");
    const ok = !self || h === self || h === "www." + self || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(h);
    if (!ok) return none();
  }
  const len = Number(request.headers.get("content-length") || 0);
  if (len > MAX_BYTES) return none();
  const raw = await request.text();
  if (raw.length > MAX_BYTES) return none();
  const d = parseBeacon(raw, ua, String(env.CANONICAL_HOST || ""));
  if (!d || !env.DB) return none();
  const day = vnDay();
  ctx.waitUntil(
    env.DB.batch(buildStatements(env.DB, day, d)).catch((e) => console.log("[track]", String((e && e.message) || e)))
  );
  return none();
}

/** Xoá số liệu quá 400 ngày (gọi trong cron sao lưu hằng ngày). */
export async function pruneStats(db) {
  const cut = vnDay(Date.now() - 400 * 86400000);
  await db.batch(["stats_day", "stats_page", "stats_ref", "stats_click"].map((t) => db.prepare(`delete from ${t} where day < ?`).bind(cut)));
}
