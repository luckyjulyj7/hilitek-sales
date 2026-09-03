/**
 * Router gộp cho toàn bộ API website — 1 Serverless Function duy nhất
 * (gói Vercel Hobby giới hạn 12 function/deploy).
 *
 *   GET  /api/web/products            -> danh sách sản phẩm đã đăng web
 *   GET  /api/web/product/<slug>      -> chi tiết 1 sản phẩm
 *   POST /api/web/orders              -> nhận đơn từ web -> ghi vào blob
 *   GET  /api/web/config             -> state.webConfig (chủ shop chỉnh)
 *   GET  /api/web/fetch-image?url=   -> tải ảnh ngoài, lưu vào Supabase Storage (cho app quản lý)
 */
import { createClient } from "@supabase/supabase-js";
import {
  handler, json, readState, writeState,
  publishedProducts, publicProduct, productSlug, slugify, stockOf,
} from "./_supa.js";

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

/* ─────────────────────────── products ─────────────────────────── */
async function listProducts(req, res) {
  const state = await readState();
  const products = publishedProducts(state).map((p) => publicProduct(p));
  json(res, 200, { products, count: products.length });
}

async function oneProduct(req, res, slug) {
  slug = String(slug || "").toLowerCase();
  if (!slug) return json(res, 400, { error: "Thiếu slug." });
  const list = publishedProducts(await readState());
  const found = list.find((p) => {
    const s = p.web && p.web.slug ? slugify(p.web.slug) : productSlug(p);
    return s === slug || p.sku === slug || p.id === slug;
  });
  if (!found) return json(res, 404, { error: "Không tìm thấy sản phẩm." });
  json(res, 200, publicProduct(found, { detail: true }));
}

/* ─────────────────────────── config ──────────────────────────── */
async function getConfig(req, res) {
  const state = await readState();
  json(res, 200, state && typeof state.webConfig === "object" && state.webConfig ? state.webConfig : {});
}

/* ─────────────────────────── orders ──────────────────────────── */
async function createOrder(req, res) {
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const cust = body.customer || {};
  const sh = body.shipping || {};
  const phone = String(cust.phone || "").replace(/\s/g, "");

  const rawItems = Array.isArray(body.items) ? body.items : [];
  const items = rawItems.filter((it) => it && (it.productId || it.sku) && Number(it.qty) > 0);
  if (!items.length) return json(res, 400, { error: "Đơn hàng không có sản phẩm hợp lệ." });
  if (!cust.name || !/^0\d{8,10}$/.test(phone)) return json(res, 400, { error: "Thiếu họ tên hoặc số điện thoại hợp lệ." });

  const state = await readState();
  state.orders = Array.isArray(state.orders) ? state.orders : [];
  const products = Array.isArray(state.products) ? state.products : [];

  const preorderNames = [];
  const mapped = items.map((it) => {
    const p = products.find((x) => x.id === it.productId || x.sku === it.productId || x.sku === it.sku);
    const qty = Math.max(1, Math.floor(Number(it.qty) || 1));
    const avail = p ? stockOf(p) : 0;
    const isPre = !!it.preorder || (p && !p.isService && avail < qty);
    if (isPre) preorderNames.push((p ? p.name : it.name || it.sku) + (avail > 0 ? ` (còn ${avail}/${qty})` : ""));
    return {
      productId: p ? p.id : it.productId || it.sku,
      qty,
      price: Number(it.price) || (p ? Number(p.retailPrice) || 0 : 0),
      series: [],
      fulfilled: false,
      preorder: !!isPre,
    };
  });
  const hasPreorder = preorderNames.length > 0;

  const source = body.source || "Đặt hàng website";
  const code = body.code || "WEB" + Date.now().toString(36).toUpperCase().slice(-8);
  const now = new Date().toISOString();

  const order = {
    id: uid(),
    code,
    createdAt: now,
    date: now.slice(0, 10),
    channel: "online",
    status: "pending",
    approvalStatus: "approved",
    createdByRole: "web",
    customerId: "",
    branch: "",
    seller: "",
    tags: hasPreorder ? [source, "Đặt trước"] : [source],
    notes: [
      "🌐 " + source,
      hasPreorder ? "⚠ ĐƠN ĐẶT TRƯỚC (chưa đủ tồn): " + preorderNames.join("; ") : "",
      `Khách: ${cust.name} · ${phone}` + (cust.email ? ` · ${cust.email}` : ""),
      sh.fullAddress ? `Giao tới: ${sh.fullAddress}` : "",
      sh.note ? `Ghi chú KH: ${sh.note}` : "",
      `Thanh toán: ${body.payment === "bank" ? "Chuyển khoản trước" : "COD (thu khi giao)"}`,
    ].filter(Boolean).join("\n"),
    shippingAddress: {
      recipientName: cust.name || "",
      recipientPhone: phone,
      province: sh.province || "",
      ward: sh.ward || "",
      addressDetail: sh.address || sh.fullAddress || "",
    },
    items: mapped,
    vat: "VAT10",
    orderDiscount: 0,
    discountType: "amount",
    shippingFee: 0,
    paidAmount: 0,
    payments: [],
    invoiceStatus: "pending",
    invoiceNo: "",
    returns: [],
  };

  state.orders.unshift(order);
  await writeState(state);
  json(res, 200, { ok: true, code });
}

/* ───────────────────── fetch-image (app quản lý) ─────────────── */
const SB_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const GATE = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
const MEDIA_BUCKET = "product-media";
const MEDIA_MAX = 8 * 1024 * 1024;

async function fetchImage(req, res) {
  if (GATE && req.headers["x-media-key"] !== GATE) return json(res, 401, { error: "Không có quyền." });
  if (!SB_URL || !SB_KEY) return json(res, 503, { error: "Thiếu cấu hình Supabase trên máy chủ." });

  const src = req.query && req.query.url;
  if (!src || !/^https?:\/\//i.test(src)) return json(res, 400, { error: "URL ảnh không hợp lệ." });

  let origin = "";
  try { origin = new URL(src).origin; } catch { /* noop */ }

  const up = await fetch(src, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; HilitekBot/1.0)", Referer: origin || src },
    redirect: "follow",
  });
  if (!up.ok) return json(res, 502, { error: `Trang nguồn trả mã ${up.status}.` });

  const ct = (up.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  if (!ct.startsWith("image/")) return json(res, 415, { error: "Link không phải ảnh." });

  const buf = Buffer.from(await up.arrayBuffer());
  if (buf.length > MEDIA_MAX) return json(res, 413, { error: "Ảnh lớn hơn 8MB." });

  const ext = (ct.split("/")[1] || "png").replace("jpeg", "jpg").split("+")[0].toLowerCase();
  const path = `desc/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const sb = createClient(SB_URL, SB_KEY, { auth: { persistSession: false } });
  const { error } = await sb.storage.from(MEDIA_BUCKET).upload(path, buf, { contentType: ct, upsert: false, cacheControl: "31536000" });
  if (error) return json(res, 500, { error: "Lưu vào kho lỗi: " + error.message });

  json(res, 200, { url: "/media/" + path });
}

/* ─────────────────────────── router ─────────────────────────── */
function segmentsOf(req) {
  // Ưu tiên phân tích từ req.url (chắc chắn) — không phụ thuộc cách Vercel đặt tên param.
  let raw = "";
  try {
    const u = String(req.url || "").split("?")[0];
    raw = u.replace(/^\/+/, "").replace(/^api\/web\/?/i, "").replace(/\/+$/, "");
  } catch { raw = ""; }
  let seg = raw ? raw.split("/").filter(Boolean) : [];
  if (!seg.length && req.query && req.query.path) seg = [].concat(req.query.path).filter(Boolean);
  return seg.map((s) => { try { return decodeURIComponent(s); } catch { return s; } });
}

export default handler(async (req, res) => {
  const seg = segmentsOf(req);
  const head = (seg[0] || "").toLowerCase();
  const m = req.method;

  if (head === "products" && m === "GET") return listProducts(req, res);
  if (head === "product" && m === "GET") return oneProduct(req, res, (req.query && req.query.slug) || seg[1]);
  if (head === "config" && m === "GET") return getConfig(req, res);
  if (head === "orders" && m === "POST") return createOrder(req, res);
  if (head === "fetch-image" && m === "GET") return fetchImage(req, res);

  json(res, 404, { error: `Không có endpoint /api/web/${seg.join("/")} (${m}).` });
});
