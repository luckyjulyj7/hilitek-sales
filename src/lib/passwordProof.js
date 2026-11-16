/**
 * Trình duyệt tự băm mật khẩu trước khi gửi đăng nhập (xem api/web/_auth.js verifyProof).
 * Máy chủ Cloudflare Worker gói Free không chạy nổi PBKDF2 210.000 vòng (giới hạn ~10 ms CPU/lượt),
 * nên phần nặng làm ở trình duyệt; máy chủ chỉ so 1 lần SHA-256. Mật khẩu gốc không rời trình duyệt.
 */
function hexToBytes(hex) {
  const s = String(hex || "");
  const out = new Uint8Array(Math.floor(s.length / 2));
  for (let i = 0; i < out.length; i++) out[i] = parseInt(s.substr(i * 2, 2), 16);
  return out;
}
const toHex = (buf) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");

async function derive(password, { algo, salt, iter }) {
  const enc = new TextEncoder();
  if (algo !== "pbkdf2") return toHex(await crypto.subtle.digest("SHA-256", enc.encode(`${salt}:${password}`)));
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: hexToBytes(salt), iterations: Number(iter) || 210000, hash: "SHA-256" }, key, 256);
  return toHex(bits);
}

/** Hỏi máy chủ thông số băm của tài khoản rồi tính "proof". adminApi: hàm gọi /api/admin. */
export async function passwordProof(adminApi, username, password) {
  const params = await adminApi("pwsalt", { method: "POST", body: { username } });
  return derive(String(password), params || {});
}
