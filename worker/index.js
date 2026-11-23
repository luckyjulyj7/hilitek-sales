/**
 * Cloudflare Worker của hilipc.vn — thay cho Vercel (vercel.json) + Supabase.
 *
 * - File tĩnh trong dist/ (ảnh, JS, CSS) do Cloudflare trả thẳng, KHÔNG chạy Worker, không tính lượt.
 * - Worker chỉ chạy cho các đường dẫn trong assets.run_worker_first (wrangler.jsonc): /api/*, /media/*,
 *   trang SEO (/san-pham/...), /quanlybanhang. Các trang khác của web khách (/, /shop...) Cloudflare tự trả
 *   index.html (= shop.html, chép lúc build) mà không chạy Worker -> không tốn lượt.
 * - Dữ liệu: D1 (binding DB), ảnh: R2 (binding MEDIA). Code api/ dùng lại nguyên, qua worker/supa-d1.js.
 */
import process from "node:process";
import { runNode } from "./node-adapter.js";
import { bindEnv } from "./supa-d1.js";
import admin from "../api/admin.js";
import products from "../api/web/products.js";
import product from "../api/web/product.js";
import config from "../api/web/config.js";
import orders from "../api/web/orders.js";
import lookup from "../api/web/lookup.js";
import page from "../api/web/page.js";
import sitemap from "../api/web/sitemap.js";
import aiProductInfo from "../api/web/ai-product-info.js";
import backup from "../api/cron/backup.js";
import { handleTrack, pruneStats } from "./track.js";

const API = {
  "/api/admin": admin,
  "/api/web/products": products,
  "/api/web/product": product,
  "/api/web/config": config,
  "/api/web/orders": orders,
  "/api/web/lookup": lookup,
  "/api/web/page": page,
  "/api/web/sitemap": sitemap,
  "/api/web/ai-product-info": aiProductInfo,
  "/api/cron/backup": backup,
};
// API đọc công khai: cache tại máy chủ Cloudflare theo Cache-Control s-maxage mà handler đặt.
const CACHEABLE = new Set(["/api/web/products", "/api/web/product", "/api/web/config", "/api/web/sitemap", "/api/web/page"]);

function setup(env, origin) {
  bindEnv(env);
  for (const [k, v] of Object.entries(env)) if (typeof v === "string") process.env[k] = v;
  globalThis.__hiliAsset = (p) => env.ASSETS.fetch(new Request(origin + p));
}

/**
 * Ảnh của web khách lấy thẳng từ tên miền công khai của R2 (env.MEDIA_HOST, VD media.hilipc.vn):
 * Cloudflare trả ảnh từ cache, KHÔNG chạy Worker -> không tốn lượt 100.000/ngày của gói Free
 * (1 lần xem danh mục có thể tải cả trăm ảnh). Đổi "/media/..." trong JSON/HTML trả cho web khách.
 * Trang quản lý vẫn dùng /media/ qua Worker (ít người, trình duyệt cache 1 năm).
 */
function mediaHostRewriter(env) {
  const host = env.MEDIA_HOST;
  if (!host) return null;
  const base = `https://${host}/`;
  const abs = env.CANONICAL_HOST ? new RegExp(`https?://(?:www\\.)?${env.CANONICAL_HOST.replace(/\./g, "\\.")}/media/`, "g") : null;
  return async (res) => {
    const ct = res.headers.get("content-type") || "";
    if (res.status !== 200 || !/json|html|xml/.test(ct)) return res;
    let text = await res.text();
    if (abs) text = text.replace(abs, base);
    text = text.replace(/(^|[^\w.\-/])\/media\//g, `$1${base}`);
    const h = new Headers(res.headers);
    h.delete("content-length");
    return new Response(text, { status: res.status, headers: h });
  };
}

// Khoá cache chỉ giữ tham số handler thật sự dùng: link có thêm "&x=123", "?utm_..." hay "?fbclid=..."
// vẫn trúng cache, không chạy lại handler + đọc D1 (khách chia sẻ link Facebook luôn có fbclid).
// Tham số được giữ trong khoá cache. /danh-muc PHẢI giữ cat/group/brand/q, nếu không mọi trang danh mục
// dùng chung 1 bản HTML (tiêu đề + canonical sai, lỗi SEO 23/11/2026).
const CACHE_PARAMS = { "/api/web/product": ["slug"], "/api/web/config": ["landing"], "/danh-muc": ["cat", "group", "brand", "q"] };
const INFO_PATHS = new Set(["/lien-he", "/bao-hanh", "/xay-dung-cau-hinh", "/huong-dan-thanh-toan", "/chinh-sach-bao-hanh", "/chinh-sach-giao-hang", "/chinh-sach-bao-mat", "/chinh-sach-doi-tra", "/quyen-nghia-vu", "/dieu-khoan-website", "/chinh-sach-kiem-hang", "/chinh-sach-van-chuyen"]);
function edgeCacheKey(request) {
  const u = new URL(request.url);
  const keepList = CACHE_PARAMS[u.pathname] || [];
  const keep = new URLSearchParams();
  for (const k of keepList) if (u.searchParams.has(k)) keep.set(k, u.searchParams.get(k));
  u.search = keep.toString();
  u.hash = "";
  return new Request(u.toString(), { method: "GET" });
}

async function withEdgeCache(request, ctx, make, env) {
  if (request.method !== "GET") return make();
  const cache = caches.default;
  const key = edgeCacheKey(request);
  const hit = await cache.match(key);
  if (hit) return hit;
  let res = await make();
  const rw = env && mediaHostRewriter(env);
  if (rw) res = await rw(res);
  const cc = res.headers.get("cache-control") || "";
  const m = /s-maxage=(\d+)/.exec(cc);
  if (m && Number(m[1]) > 0 && (res.status === 200 || res.status === 404) && !res.headers.has("set-cookie")) {
    const copy = new Response(res.clone().body, res);
    copy.headers.set("cache-control", `public, max-age=${m[1]}`); // bản trong cache: giữ đúng s-maxage
    ctx.waitUntil(cache.put(key, copy));
  }
  return res;
}

/* ---------------- /media/<đường dẫn> : ảnh trong R2 ---------------- */
const LONG = "public, max-age=31536000, immutable";
async function media(request, env, ctx, path) {
  if (!path || path.includes("..") || !/^[\w\-./]+$/.test(path)) return new Response("Đường dẫn ảnh không hợp lệ.", { status: 400 });
  const cache = caches.default;
  const hit = await cache.match(request);
  if (hit) return hit;
  let res;
  const obj = await env.MEDIA.get(path);
  if (obj) {
    const h = new Headers();
    h.set("content-type", (obj.httpMetadata && obj.httpMetadata.contentType) || "application/octet-stream");
    h.set("cache-control", LONG);
    h.set("etag", obj.httpEtag);
    res = new Response(obj.body, { headers: h });
  } else if (env.OLD_SUPABASE_URL) {
    // Ảnh cũ chưa chép sang R2: lấy từ Supabase Storage 1 lần, lưu vào R2 cho các lần sau.
    const src = `${env.OLD_SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/product-media/${path}`;
    const up = await fetch(src).catch(() => null);
    if (!up || !up.ok) return new Response("Không tìm thấy ảnh.", { status: 404, headers: { "cache-control": "public, max-age=60" } });
    const buf = await up.arrayBuffer();
    const ct = up.headers.get("content-type") || "application/octet-stream";
    ctx.waitUntil(env.MEDIA.put(path, buf, { httpMetadata: { contentType: ct, cacheControl: LONG } }));
    res = new Response(buf, { headers: { "content-type": ct, "cache-control": LONG } });
  } else {
    return new Response("Không tìm thấy ảnh.", { status: 404, headers: { "cache-control": "public, max-age=60" } });
  }
  ctx.waitUntil(cache.put(request, res.clone()));
  return res;
}

function asset(env, origin, file, request) {
  return env.ASSETS.fetch(new Request(origin + file, { headers: request.headers }));
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = url.origin;
    const p = url.pathname;
    // Đếm lượt truy cập: đường nhẹ riêng, không qua setup/node-adapter (tiết kiệm CPU gói Free).
    if (p === "/api/web/track") return handleTrack(request, env, ctx);
    setup(env, origin);

    // Tên miền phụ www -> tên miền chính.
    if (env.CANONICAL_HOST && url.hostname === "www." + env.CANONICAL_HOST) {
      url.hostname = env.CANONICAL_HOST;
      return Response.redirect(url.toString(), 301);
    }

    const run = (h, q) => runNode(h, request, q);
    try {
      if (API[p]) {
        const go = () => run(API[p]);
        return CACHEABLE.has(p) ? withEdgeCache(request, ctx, go, env) : go();
      }
      if (p.startsWith("/api/")) return Response.json({ error: "Không có API này." }, { status: 404 });
      if (p.startsWith("/media/")) return media(request, env, ctx, decodeURIComponent(p.slice(7)));
      if (p === "/sitemap.xml") return withEdgeCache(request, ctx, () => run(sitemap), env);
      let m;
      if ((m = /^\/san-pham\/([^/]+)\/?$/.exec(p))) return withEdgeCache(request, ctx, () => run(page, { slug: decodeURIComponent(m[1]) }), env);
      if (p === "/danh-muc") return withEdgeCache(request, ctx, () => run(page), env);
      if (p === "/may-choi-game-cam-tay") return withEdgeCache(request, ctx, () => run(page, { landing: "handheld" }), env);
      if (p === "/tin-tuc") return withEdgeCache(request, ctx, () => run(page, { landing: "news" }), env);
      if ((m = /^\/trang\/([^/]+)\/?$/.exec(p))) return withEdgeCache(request, ctx, () => run(page, { trang: decodeURIComponent(m[1]) }), env);
      // Trang thông tin (chính sách, liên hệ...): gắn tiêu đề + canonical riêng, không để trùng trang chủ.
      if (INFO_PATHS.has(p)) return withEdgeCache(request, ctx, () => run(page, { info: p }), env);
      if (p === "/quanlybanhang" || p.startsWith("/quanlybanhang/")) return asset(env, origin, "/admin.html", request);
      // Còn lại (/, /shop, đường dẫn của web khách): shop.html — React tự dựng trang.
      return asset(env, origin, "/shop.html", request);
    } catch (e) {
      return Response.json({ error: String((e && e.message) || e) }, { status: 500 });
    }
  },

  // Sao lưu hằng ngày (triggers.crons trong wrangler.jsonc).
  async scheduled(event, env, ctx) {
    setup(env, "https://localhost");
    const headers = env.CRON_SECRET ? { authorization: "Bearer " + env.CRON_SECRET } : {};
    const res = await runNode(backup, new Request("https://localhost/api/cron/backup?reason=cron", { headers }));
    console.log("[backup]", res.status, await res.text());
    try { await pruneStats(env.DB); } catch (e) { console.log("[stats-prune]", String((e && e.message) || e)); }
    // Chat nội bộ: xoá tin quá 90 ngày.
    try { await env.DB.prepare("delete from chat_msgs where at < ?").bind(new Date(Date.now() - 90 * 86400000).toISOString()).run(); }
    catch (e) { if (!/no such table/i.test(String(e && e.message))) console.log("[chat-prune]", String((e && e.message) || e)); }
  },
};
