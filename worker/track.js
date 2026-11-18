/**
 * Đếm lượt truy cập web khách — POST /api/web/track (web khách gửi theo lô, xem src/storefront/lib/track.js).
 *
 * Nhẹ có chủ đích (gói Free: 100.000 lượt Worker/ngày, ~10 ms CPU/lượt):
 *  - KHÔNG qua node-adapter/supa-d1: parse JSON nhỏ + 1 lần D1.batch (các câu upsert cộng dồn).
 *  - Trả 204 ngay, ghi D1 trong ctx.waitUntil.
 *  - Mỗi lượt gửi gộp nhiều sự kiện; bot (theo User-Agent) bỏ qua, không ghi.
 *  - Riêng tư: không lưu IP, không cookie, không mã người dùng. Chỉ cộng số theo ngày/đường dẫn.
 *
 * Sự kiện trong "e": {t:"p",p,h} xem trang · {t:"c",k,p} bấm sang sàn · {t:"x",k,p} hành động (giỏ, Zalo, gọi...)
 *                    {t:"s",q,r} khách tìm kiếm (r = số kết quả).
 */
const MAX_BYTES = 4096;
const MAX_EVENTS = 20;
const BOT = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|pagespeed|gtmetrix|curl|wget|python|axios|node-fetch|go-http|java\/|monitor|uptime|scan|check_http|ahrefs|semrush|mj12|dataforseo|bytespider/i;
const MOBILE = /Mobi|Android|iPhone|iPod/i;
const PATH_OK = /^\/[\w\-./%~]*(\?[\w\-.=&%~+]*)?$/;
const MARKETS = new Set(["shopee", "lazada", "tiktok", "tiki", "other"]);
const ACTS = new Set(["cart", "zalo", "phone", "messenger"]);

/** Ngày theo giờ Việt Nam (UTC+7) dạng YYYY-MM-DD. */
export function vnDay(ms = Date.now()) {
  return new Date(ms + 7 * 3600 * 1000).toISOString().slice(0, 10);
}
const vnHour = (ms = Date.now()) => new Date(ms + 7 * 3600 * 1000).getUTCHours();

function kindOf(path) {
  const p = path.split("?")[0];
  if (p.startsWith("/san-pham/")) return "product";
  if (p === "/danh-muc") return "category";
  if (p === "/tin-tuc" || p.startsWith("/trang/")) return "article";
  return "other";
}

/**
 * Nguồn truy cập: theo trang giới thiệu (chỉ giữ tên miền), rồi utm_source, rồi trình duyệt trong ứng dụng
 * (Facebook, Zalo, Instagram, TikTok thường không gửi trang giới thiệu nhưng User-Agent có tên ứng dụng).
 */
export function sourceOf(ref, utm, selfHost, ua = "") {
  const u = String(utm || "").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 20);
  let host = "";
  try { host = new URL(ref).hostname.toLowerCase().replace(/^www\./, ""); } catch { /* không có */ }
  let internal = false;
  if (host && selfHost && (host === selfHost || host.endsWith("." + selfHost))) { host = ""; internal = true; }
  const h = host + " " + u;
  if (/google\./.test(h) || u === "google") return "google";
  if (/facebook\.|fb\.com|fb\.me|l\.messenger|messenger\.com/.test(h) || u === "facebook" || u === "fb") return "facebook";
  if (/zalo\./.test(h) || u === "zalo") return "zalo";
  if (/tiktok\./.test(h) || u === "tiktok") return "tiktok";
  if (/youtube\.|youtu\.be/.test(h) || u === "youtube") return "youtube";
  if (/instagram\./.test(h) || u === "instagram") return "instagram";
  if (/bing\.|coccoc\.|duckduckgo\./.test(h)) return "search";
  if (host) return ("other:" + host).slice(0, 60);
  if (u) return "other:" + u;
  if (internal) return "internal";
  // Không có nguồn: đoán theo ứng dụng đang mở link.
  if (/FBAN|FBAV|FB_IAB/.test(ua)) return "facebook";
  if (/Zalo/i.test(ua)) return "zalo";
  if (/Instagram/i.test(ua)) return "instagram";
  if (/musical_ly|BytedanceWebview|TikTok/i.test(ua)) return "tiktok";
  return "direct";
}

const okPath = (p) => typeof p === "string" && p.length <= 160 && PATH_OK.test(p);

/** Chuẩn hoá thân gửi lên thành các phép cộng; trả null nếu không hợp lệ. Tách riêng để dễ thử. */
export function parseBeacon(raw, ua, selfHost) {
  let b;
  try { b = JSON.parse(raw); } catch { return null; }
  if (!b || typeof b !== "object" || !Array.isArray(b.e)) return null;
  const out = { pages: new Map(), events: new Map(), search: new Map(), views: 0, clicksN: 0, newVisit: b.n === 1, land: "" };
  const addEv = (ev, path) => { const k = ev + "\u0001" + path; out.events.set(k, (out.events.get(k) || 0) + 1); };
  for (const ev of b.e.slice(0, MAX_EVENTS)) {
    if (!ev || typeof ev !== "object") continue;
    if (ev.t === "p" && okPath(ev.p)) {
      const cur = out.pages.get(ev.p) || { views: 0, title: "" };
      cur.views += 1;
      if (typeof ev.h === "string" && ev.h) cur.title = ev.h.replace(/[\u0000-\u001f]/g, " ").slice(0, 140);
      out.pages.set(ev.p, cur);
      out.views += 1;
      if (!out.land) out.land = ev.p; // trang đầu tiên của lô; chỉ tính khi là lượt truy cập mới
    } else if (ev.t === "c" && typeof ev.k === "string") {
      addEv("click:" + (MARKETS.has(ev.k) ? ev.k : "other"), okPath(ev.p) ? ev.p : "/");
      out.clicksN += 1;
    } else if (ev.t === "x" && ACTS.has(ev.k)) {
      addEv("act:" + ev.k, okPath(ev.p) ? ev.p : "/");
    } else if (ev.t === "s" && typeof ev.q === "string") {
      const q = ev.q.toLowerCase().replace(/\s+/g, " ").trim().slice(0, 60);
      if (!q || /\d{7,}/.test(q) || /@/.test(q)) continue; // có thể là số điện thoại/email: không lưu
      const cur = out.search.get(q) || { n: 0, zero: 0 };
      cur.n += 1;
      if (ev.r === 0) cur.zero += 1;
      out.search.set(q, cur);
    }
  }
  if (!out.views && !out.clicksN && !out.events.size && !out.search.size) return null;
  out.mobile = out.newVisit && MOBILE.test(ua || "");
  out.src = out.newVisit ? sourceOf(b.r, b.u, selfHost, ua) : "";
  return out;
}

export function buildStatements(db, day, d, hour = vnHour()) {
  const up = (sql, ...a) => db.prepare(sql).bind(...a);
  const st = [
    up(`insert into stats_day(day,views,visits,mobile,clicks) values(?,?,?,?,?)
        on conflict(day) do update set views=views+excluded.views, visits=visits+excluded.visits, mobile=mobile+excluded.mobile, clicks=clicks+excluded.clicks`,
      day, d.views, d.newVisit ? 1 : 0, d.mobile ? 1 : 0, d.clicksN),
  ];
  if (d.views) st.push(up(`insert into stats_hour(day,h,n) values(?,?,?) on conflict(day,h) do update set n=n+excluded.n`, day, hour, d.views));
  for (const [path, v] of d.pages) {
    st.push(up(`insert into stats_page(day,path,kind,title,views) values(?,?,?,?,?)
        on conflict(day,path) do update set views=views+excluded.views, title=case when excluded.title<>'' then excluded.title else title end`,
      day, path, kindOf(path), v.title, v.views));
  }
  if (d.src) st.push(up(`insert into stats_ref(day,src,n) values(?,?,1) on conflict(day,src) do update set n=n+1`, day, d.src));
  if (d.newVisit && d.land) st.push(up(`insert into stats_land(day,path,n) values(?,?,1) on conflict(day,path) do update set n=n+1`, day, d.land));
  for (const [k, n] of d.events) {
    const [ev, path] = k.split("\u0001");
    st.push(up(`insert into stats_event(day,ev,path,n) values(?,?,?,?) on conflict(day,ev,path) do update set n=n+excluded.n`, day, ev, path, n));
  }
  for (const [q, v] of d.search) {
    st.push(up(`insert into stats_search(day,q,n,zero) values(?,?,?,?) on conflict(day,q) do update set n=n+excluded.n, zero=zero+excluded.zero`, day, q, v.n, v.zero));
  }
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

const TABLES = ["stats_day", "stats_page", "stats_ref", "stats_hour", "stats_land", "stats_event", "stats_search"];
/** Xoá số liệu quá 400 ngày (gọi trong cron sao lưu hằng ngày). */
export async function pruneStats(db) {
  const cut = vnDay(Date.now() - 400 * 86400000);
  await db.batch(TABLES.map((t) => db.prepare(`delete from ${t} where day < ?`).bind(cut)));
}
