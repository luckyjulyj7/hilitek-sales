/**
 * Helper dùng chung cho các Vercel Serverless Function proxy sang GHN.
 *
 * Vì sao cần proxy: app là web tĩnh chạy ở trình duyệt — không gọi thẳng API GHN được
 * (CORS chặn) và không được để lộ Token GHN trong bundle JS. Các function trong thư mục
 * này chạy phía server của Vercel, đọc Token/ShopId từ Environment Variables (không bao
 * giờ gửi xuống trình duyệt), rồi chuyển tiếp request sang GHN.
 *
 * Environment Variables cần đặt trong Vercel (Project Settings -> Environment Variables):
 *   GHN_TOKEN         Token API lấy trong dashboard GHN (bắt buộc)
 *   GHN_SHOP_ID       ShopId GHN cấp kèm token (bắt buộc để tạo đơn / tính phí)
 *   GHN_BASE_URL      (tuỳ chọn) mặc định https://online-gateway.ghn.vn
 *                     môi trường thử: https://dev-online-gateway.ghn.vn
 *   GHN_PROXY_SECRET  chuỗi bí mật tự đặt; app phải gửi kèm header x-proxy-key trùng giá trị này
 *                     (đặt cùng giá trị vào biến VITE_GHN_PROXY_SECRET cho phía web)
 */

const GHN_BASE = process.env.GHN_BASE_URL || "https://online-gateway.ghn.vn";
const TOKEN = process.env.GHN_TOKEN || "";
const SHOP_ID = process.env.GHN_SHOP_ID || "";
const PROXY_SECRET = process.env.GHN_PROXY_SECRET || "";

/** Kiểm tra request đến từ app của mình (chống ai đó tình cờ gọi API burn token). */
export function checkAuth(req) {
  if (!PROXY_SECRET) return true; // chưa đặt secret -> tạm cho qua (chỉ nên vậy lúc mới test)
  const key = req.headers["x-proxy-key"] || req.headers["X-Proxy-Key"];
  return typeof key === "string" && key.length > 0 && key === PROXY_SECRET;
}

export function configState() {
  return { hasToken: Boolean(TOKEN), hasShopId: Boolean(SHOP_ID), base: GHN_BASE, secretRequired: Boolean(PROXY_SECRET) };
}

/** Gọi 1 endpoint GHN. Trả về { status, json }. */
export async function ghnFetch(path, { method = "POST", body, query } = {}) {
  if (!TOKEN) {
    const err = new Error("Chưa đặt GHN_TOKEN trong Environment Variables của Vercel.");
    err.code = "NO_TOKEN";
    throw err;
  }
  let url = `${GHN_BASE}${path}`;
  if (query && typeof query === "object") {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (Array.isArray(v)) v.forEach((x) => qs.append(k, String(x)));
      else if (v != null) qs.append(k, String(v));
    }
    const s = qs.toString();
    if (s) url += `?${s}`;
  }
  const headers = { "Content-Type": "application/json", Token: TOKEN };
  if (SHOP_ID) headers.ShopId = SHOP_ID;

  const res = await fetch(url, {
    method,
    headers,
    body: method === "GET" || body == null ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  return { status: res.status, json };
}

export function send(res, status, payload) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.status(status).json(payload);
}

/** Bọc 1 handler: check method POST + check auth + bắt lỗi chung. */
export function handlerPOST(fn) {
  return async (req, res) => {
    if (req.method !== "POST") return send(res, 405, { error: "Chỉ hỗ trợ POST." });
    if (!checkAuth(req)) return send(res, 401, { error: "unauthorized — sai hoặc thiếu x-proxy-key." });
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      await fn(req, res, body);
    } catch (e) {
      send(res, e.code === "NO_TOKEN" ? 503 : 500, { error: String(e.message || e) });
    }
  };
}
