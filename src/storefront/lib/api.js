/**
 * Nguồn dữ liệu cho website bán hàng — gọi các Serverless Function trong api/web/.
 *
 *   GET  /api/web/products          -> sản phẩm đã bật "Đăng web" (đã lọc giá vốn...)
 *   GET  /api/web/product/:slug     -> chi tiết 1 sản phẩm
 *   POST /api/web/orders            -> gửi đơn đặt hàng về app quản lý
 *   GET  /api/web/config            -> thông tin hiển thị chủ shop chỉnh từ app quản lý
 *
 * Client KHÔNG giữ bất kỳ khoá Supabase nào — mọi thứ đi qua server.
 *
 * `USE_MOCK = true`  -> luôn dùng dữ liệu mẫu (test giao diện).
 * Ở localhost, nếu API chưa chạy (chưa `vercel dev` / chưa deploy) sẽ TỰ dùng mẫu;
 * trên web thật thì báo lỗi thật (không âm thầm hiện hàng giả).
 */

import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_BRANDS } from "../data/mockCatalog.js";

const USE_MOCK = false;
const IS_LOCAL =
  typeof location !== "undefined" && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

function delay(v, ms = 120) {
  return new Promise((r) => setTimeout(() => r(v), ms));
}

function mockCatalog() {
  return { products: MOCK_PRODUCTS, categories: MOCK_CATEGORIES, brands: MOCK_BRANDS };
}

function isJson(res) {
  return (res.headers.get("content-type") || "").includes("application/json");
}

async function getJson(url) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  // Dev server (Vite) trả index.html cho /api/* -> coi như API chưa chạy.
  if (!isJson(res)) throw new Error("API chưa sẵn sàng");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Lỗi ${res.status}`);
  return data;
}

export async function fetchCatalog() {
  if (USE_MOCK) return delay(mockCatalog());
  try {
    const data = await getJson("/api/web/products");
    const products = Array.isArray(data.products) ? data.products : [];
    return {
      products,
      categories: [...new Set(products.map((p) => p.category))].filter(Boolean),
      brands: [...new Set(products.map((p) => p.brand))].filter(Boolean).sort((a, b) => a.localeCompare(b, "vi")),
    };
  } catch (e) {
    if (IS_LOCAL) {
      console.warn("[api] /api/web/products chưa sẵn sàng — dùng dữ liệu mẫu:", e.message);
      return delay(mockCatalog());
    }
    throw e;
  }
}

export async function fetchProduct(slug) {
  if (USE_MOCK) return delay(MOCK_PRODUCTS.find((x) => x.slug === slug) || null);
  try {
    const res = await fetch(`/api/web/product?slug=${encodeURIComponent(slug)}`, { headers: { Accept: "application/json" } });
    if (!isJson(res)) throw new Error("API chưa sẵn sàng");
    if (res.status === 404) return null;
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Lỗi ${res.status}`);
    return data;
  } catch (e) {
    if (IS_LOCAL) {
      console.warn("[api] /api/web/product chưa sẵn sàng — dùng dữ liệu mẫu:", e.message);
      return MOCK_PRODUCTS.find((x) => x.slug === slug) || null;
    }
    throw e;
  }
}

/** Gửi đơn hàng. Trả { ok:true, code } hoặc ném lỗi (kèm message tiếng Việt). */
export async function placeOrder(order) {
  if (USE_MOCK || IS_LOCAL) {
    // Local / demo: không có API -> giả lập thành công để test luồng.
    return delay({ ok: true, code: order.code || "WEBDEMO", demo: true }, 300);
  }
  const res = await fetch("/api/web/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
  if (!isJson(res)) throw new Error("Hệ thống đặt hàng chưa sẵn sàng");
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) throw new Error(data.error || `Không gửi được đơn (lỗi ${res.status})`);
  return data;
}

export async function fetchWebConfig() {
  if (USE_MOCK) return {};
  try {
    return await getJson("/api/web/config");
  } catch {
    return {}; // lỗi -> dùng cấu hình mặc định trong config.js
  }
}

export async function lookupWarranty(serial) {
  return delay({
    found: false,
    message:
      "Tra cứu bảo hành trực tuyến đang được hoàn thiện. Vui lòng gọi hotline kèm số serial để được kiểm tra.",
  });
  // TODO: khi có api/web/warranty.js -> fetch(`/api/web/warranty?serial=${serial}`)
}
