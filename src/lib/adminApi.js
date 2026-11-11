/**
 * Gọi API quản trị /api/admin (xem api/admin.js). Phiên đăng nhập là cookie HttpOnly do máy chủ cấp,
 * trình duyệt tự gửi kèm — JS ở đây không đọc/giữ mật khẩu hay khoá Supabase nào.
 * Khi máy chủ báo hết phiên (401) -> phát sự kiện "hili-auth-lost" để app đăng xuất.
 */
export class AdminApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function adminApi(op, { method = "GET", body, query, retries = 3 } = {}) {
  const qs = new URLSearchParams({ op, ...(query || {}) }).toString();
  const init = { method, credentials: "same-origin", headers: { Accept: "application/json" } };
  if (method !== "GET") {
    init.headers["Content-Type"] = "application/json";
    init.headers["x-hili"] = "1";
    init.body = JSON.stringify(body || {});
  }
  let res;
  for (let attempt = 0; ; attempt++) {
    try {
      res = await fetch(`/api/admin?${qs}`, init);
      if (res.status >= 500 && res.status !== 503 && attempt < retries) throw new Error("HTTP " + res.status);
      break;
    } catch (e) {
      if (attempt >= retries) throw new AdminApiError("Không kết nối được máy chủ: " + (e.message || e), 0);
      await new Promise((r) => setTimeout(r, 400 * 2 ** attempt));
    }
  }
  let data = null;
  try { data = await res.json(); } catch { data = null; }
  if (!res.ok) {
    if (res.status === 401 && data && data.auth === false && op !== "me") {
      try { window.dispatchEvent(new CustomEvent("hili-auth-lost", { detail: data.error })); } catch { /* bỏ qua */ }
    }
    throw new AdminApiError((data && data.error) || "Lỗi máy chủ (" + res.status + ")", res.status, data);
  }
  return data;
}
