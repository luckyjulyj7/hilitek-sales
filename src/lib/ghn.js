/**
 * Client gọi các Vercel Function proxy sang GHN (thư mục `api/ghn/`).
 * KHÔNG chứa token GHN — token nằm ở server (Environment Variables của Vercel).
 *
 * `VITE_GHN_PROXY_SECRET` (tuỳ chọn) phải trùng `GHN_PROXY_SECRET` bên server;
 * bỏ trống ở cả hai thì proxy không yêu cầu secret (chỉ nên vậy lúc mới test).
 */

const SECRET = import.meta.env.VITE_GHN_PROXY_SECRET || "";

// Ở dev thuần Vite (npm run dev) KHÔNG chạy thư mục api/ -> để test proxy cần `npx vercel dev`
// hoặc deploy lên Vercel. Ở production các đường dẫn /api/ghn/* hoạt động bình thường.
async function call(action, body) {
  let res;
  try {
    res = await fetch(`/api/ghn/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(SECRET ? { "x-proxy-key": SECRET } : {}),
      },
      body: JSON.stringify(body || {}),
    });
  } catch (e) {
    throw new Error("Không gọi được proxy GHN (/api). Ở local cần `npx vercel dev`; trên Vercel thì kiểm tra deploy.");
  }
  let json = null;
  try { json = await res.json(); } catch { /* không phải JSON */ }
  if (json == null) {
    if (res.status === 404) {
      throw new Error("Proxy GHN chưa chạy (404 tại /api/ghn). Ở local dùng `npx vercel dev`; trên Vercel thì kiểm tra deploy có thư mục api/.");
    }
    throw new Error(`Proxy GHN trả về không phải JSON (HTTP ${res.status}).`);
  }
  if (!res.ok) throw new Error(json.error || json.message || `Lỗi ${res.status}`);
  return json;
}

export const ghn = {
  ping: () => call("ping"),
  masterData: (payload) => call("master-data", payload), // {type:'province'|'district'|'ward', ...}
  availableServices: (payload) => call("available-services", payload), // {from_district,to_district}
  fee: (payload) => call("fee", payload),
  create: (payload) => call("create", payload),
  detail: (order_code) => call("detail", { order_code }),
  printToken: (order_codes) => call("print-token", { order_codes: [].concat(order_codes) }),
  cancel: (order_codes) => call("cancel", { order_codes: [].concat(order_codes) }),
};

// Map trạng thái GHN -> trạng thái phiếu vận chuyển trong app (SHIPPING_STATUSES).
export function ghnStatusToTicket(ghnStatus) {
  switch (ghnStatus) {
    case "ready_to_pick":
    case "picking":
    case "money_collect_picking":
      return "picked";
    case "picked":
    case "storing":
    case "transporting":
    case "sorting":
    case "delivering":
    case "money_collect_delivering":
      return "shipping";
    case "delivered":
      return "delivered";
    case "delivery_fail":
    case "waiting_to_return":
      return "failed";
    case "return":
    case "returning":
    case "return_transporting":
    case "return_sorting":
    case "returned":
      return "returned";
    case "cancel":
    case "exception":
    case "lost":
    case "damage":
      return "failed";
    default:
      return null;
  }
}
