/**
 * Đăng nhập trang quản lý PHÍA MÁY CHỦ.
 *
 * - Mật khẩu (mã băm) KHÔNG còn nằm trong blob dữ liệu gửi về trình duyệt. Nó nằm ở hàng riêng
 *   `<STORAGE_KEY>:auth` trong bảng app_state, chỉ máy chủ (khoá service_role) đọc được.
 * - Đăng nhập xong máy chủ cấp cookie `hili_admin` (HttpOnly — JS trên trang không đọc được),
 *   ký HMAC-SHA256 bằng ADMIN_SESSION_SECRET. Quản trị viên hết hạn sau 30 ngày
 *   không dùng, nhân viên/CTV sau 120 phút.
 * - Sai mật khẩu 5 lần / tên đăng nhập -> khoá 5 phút (đếm ở máy chủ, xoá trình duyệt không lách được).
 *
 * Environment Variables (Vercel): ADMIN_SESSION_SECRET (bắt buộc, chuỗi ngẫu nhiên dài),
 * SUPABASE_SERVICE_ROLE_KEY (bắt buộc sau khi đã khoá quyền anon).
 */
import crypto from "node:crypto";
import { client, json } from "./_supa.js";

const TABLE = "app_state";
// HILI_STORAGE_KEY chỉ dùng khi thử ở máy (trỏ sang bản sao dữ liệu), production để trống.
export const MAIN_KEY = process.env.HILI_STORAGE_KEY || "solbh-data-v2";
export const AUTH_KEY = MAIN_KEY + ":auth";
export const FAILS_KEY = MAIN_KEY + ":login-fails";
export const KICK_KEY = MAIN_KEY + ":kicked-accounts";
// Tên logic trình duyệt được phép đọc/ghi -> hàng thật. Hàng auth/login-fails KHÔNG có ở đây.
export const CLIENT_KEYS = {
  main: MAIN_KEY,
  locks: MAIN_KEY + ":edit-locks",
  kicks: KICK_KEY,
  marker: MAIN_KEY + ":shared-migrated",
};

const COOKIE = "hili_admin";
// Quản trị viên: không tự đăng xuất (phiên sống 30 ngày kể từ lần dùng gần nhất). Nhân viên / CTV: hết
// phiên sau 120 phút không gọi API. Muốn cắt phiên ngay: chủ "đá" tài khoản ra, khoá hoặc xoá tài khoản.
const ADMIN_IDLE_MS = 30 * 24 * 60 * 60 * 1000;
const STAFF_IDLE_MS = 120 * 60 * 1000;
const idleOf = (role) => (role === "admin" ? ADMIN_IDLE_MS : STAFF_IDLE_MS);
const REFRESH_MS = 60 * 1000;
const MAX_FAILS = 5;
const LOCK_MS = 5 * 60 * 1000;
const PBKDF2_ITERATIONS = 210000;
const SECRET_FIELDS = ["passwordHash", "passwordSalt", "passwordAlgo", "passwordIter", "password", "_legacyPassword"];

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET || "";
  if (s.length < 32) {
    const e = new Error("Thiếu ADMIN_SESSION_SECRET (ít nhất 32 ký tự) trong Environment Variables của Vercel.");
    e.code = "NO_CONFIG";
    throw e;
  }
  return s;
}

/* ---------------- hàng nhỏ trong app_state ---------------- */
export async function readRow(key) {
  const { data, error } = await client().from(TABLE).select("value, updated_at").eq("key", key).maybeSingle();
  if (error) throw new Error("Supabase đọc lỗi: " + error.message);
  return data || null;
}
export async function readJsonRow(key, fallback = {}) {
  const row = await readRow(key);
  if (!row || !row.value) return fallback;
  try { const v = JSON.parse(row.value); return v && typeof v === "object" ? v : fallback; } catch { return fallback; }
}
export async function writeRow(key, value) {
  const { data, error } = await client().from(TABLE)
    .upsert({ key, value: typeof value === "string" ? value : JSON.stringify(value) }, { onConflict: "key" })
    .select("updated_at");
  if (error) throw new Error("Supabase ghi lỗi: " + error.message);
  return (data && data[0] && data[0].updated_at) || null;
}

/* ---------------- mật khẩu ---------------- */
function safeEqHex(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length || !a.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
function pbkdf2Hex(password, saltHex, iter) {
  return crypto.pbkdf2Sync(String(password), Buffer.from(String(saltHex), "hex"), iter, 32, "sha256").toString("hex");
}
export function verifyHash(entry, password) {
  if (!entry || !entry.hash || !entry.salt) return false;
  const h = entry.algo === "pbkdf2"
    ? pbkdf2Hex(password, entry.salt, Number(entry.iter) || PBKDF2_ITERATIONS)
    : crypto.createHash("sha256").update(`${entry.salt}:${password}`).digest("hex");
  return safeEqHex(h, entry.hash);
}
function makeHash(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  return { hash: pbkdf2Hex(password, salt, PBKDF2_ITERATIONS), salt, algo: "pbkdf2", iter: PBKDF2_ITERATIONS };
}

/* ---------------- hàng auth: { accounts: { id: {username, active, hash, salt, algo, iter} } } ---------------- */
function entryFromAccount(a, prev = {}) {
  const e = {
    username: String(a.username || "").trim().toLowerCase(),
    active: a.active !== false,
    role: a.role === "admin" ? "admin" : String(a.role || "staff"),
    hash: prev.hash || "", salt: prev.salt || "", algo: prev.algo || "sha256", iter: prev.iter || PBKDF2_ITERATIONS,
  };
  if (a.passwordHash && a.passwordSalt) {
    e.hash = a.passwordHash; e.salt = a.passwordSalt;
    e.algo = a.passwordAlgo === "pbkdf2" ? "pbkdf2" : "sha256";
    e.iter = Number(a.passwordIter) > 0 ? Number(a.passwordIter) : PBKDF2_ITERATIONS;
  }
  return e;
}

/** Bỏ mọi trường mật khẩu khỏi danh sách tài khoản (trước khi gửi về trình duyệt / lưu blob). */
export function stripAccounts(state) {
  if (state && Array.isArray(state.accounts)) {
    state.accounts = state.accounts.map((a) => {
      const c = { ...a };
      SECRET_FIELDS.forEach((k) => delete c[k]);
      return c;
    });
  }
  return state;
}

/**
 * Đọc hàng auth. Khi chưa chuyển xong (blob chính còn chứa mã băm — app cũ vẫn đang ghi) thì dựng lại
 * từ blob chính để không lệch với mật khẩu ai vừa đổi bằng app cũ.
 */
export async function loadAuth() {
  const auth = await readJsonRow(AUTH_KEY, null);
  if (auth && auth.migratedAt && auth.accounts) return auth;
  const main = await readRow(MAIN_KEY);
  let state = {};
  try { state = main && main.value ? JSON.parse(main.value) : {}; } catch { state = {}; }
  const prev = (auth && auth.accounts) || {};
  const accounts = {};
  for (const a of Array.isArray(state.accounts) ? state.accounts : []) {
    if (!a || !a.id) continue;
    accounts[a.id] = entryFromAccount(a, prev[a.id]);
  }
  const next = { accounts, migratedAt: null };
  if (Object.keys(accounts).length) await writeRow(AUTH_KEY, next);
  return next;
}

/**
 * Trình duyệt ghi blob chính: tách mật khẩu mới (tạo/đổi mật khẩu) sang hàng auth, đồng bộ tên/trạng
 * thái, gỡ tài khoản đã xoá, rồi trả về blob đã bỏ sạch mật khẩu để lưu.
 * Trả { state, value } — value là chuỗi JSON sẽ ghi vào hàng chính.
 */
export async function splitSecrets(rawValue, auth) {
  let state;
  try { state = JSON.parse(rawValue); } catch { const e = new Error("Dữ liệu gửi lên không hợp lệ."); e.status = 400; throw e; }
  if (!state || typeof state !== "object") { const e = new Error("Dữ liệu gửi lên không hợp lệ."); e.status = 400; throw e; }
  const incoming = Array.isArray(state.accounts) ? state.accounts.filter((a) => a && a.id) : [];
  if (!incoming.length) {
    // Chặn lỗi cũ từng xoá sạch tài khoản: blob không có tài khoản nào thì không cho ghi.
    const e = new Error("Dữ liệu gửi lên không có tài khoản nào — đã chặn để tránh mất tài khoản.");
    e.status = 409; throw e;
  }
  auth = auth || (await loadAuth());
  const before = JSON.stringify(auth.accounts);
  const next = {};
  for (const a of incoming) next[a.id] = entryFromAccount(a, auth.accounts[a.id]);
  auth.accounts = next;
  const wasMigrated = Boolean(auth.migratedAt);
  if (!wasMigrated) auth.migratedAt = new Date().toISOString();
  if (!wasMigrated || JSON.stringify(next) !== before) await writeRow(AUTH_KEY, auth);
  stripAccounts(state);
  return { state, value: JSON.stringify(state), auth };
}

/* ---------------- cookie phiên ---------------- */
function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const mac = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  return body + "." + mac;
}
function unsign(token) {
  const [body, mac] = String(token || "").split(".");
  if (!body || !mac) return null;
  const want = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  if (want.length !== mac.length || !crypto.timingSafeEqual(Buffer.from(want), Buffer.from(mac))) return null;
  try { return JSON.parse(Buffer.from(body, "base64url").toString("utf8")); } catch { return null; }
}
function readCookie(req) {
  const raw = req.headers.cookie || "";
  for (const part of raw.split(/;\s*/)) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i) === COOKIE) return decodeURIComponent(part.slice(i + 1));
  }
  return "";
}
function isLocal(req) {
  return /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(String(req.headers.host || ""));
}
function setCookie(req, res, value, maxAgeSec) {
  const parts = [`${COOKIE}=${encodeURIComponent(value)}`, "Path=/api", "HttpOnly", "SameSite=Strict", `Max-Age=${maxAgeSec}`];
  if (!isLocal(req)) parts.push("Secure");
  res.setHeader("Set-Cookie", parts.join("; "));
}
export function startSession(req, res, userId, role) {
  const now = Date.now();
  setCookie(req, res, sign({ u: userId, r: role || "staff", iat: now, last: now }), Math.floor(idleOf(role) / 1000));
}
export function endSession(req, res) {
  setCookie(req, res, "", 0);
}

/**
 * Lấy phiên hiện tại (đã kiểm chữ ký + thời hạn). Không có/hết hạn -> trả 401 và null.
 * Có phiên -> gia hạn thêm (tối đa 1 lần/phút để đỡ ghi cookie).
 */
export function requireSession(req, res) {
  const s = unsign(readCookie(req));
  const now = Date.now();
  if (!s || !s.u || !s.iat || now - (s.last || 0) > idleOf(s.r)) {
    if (s) endSession(req, res);
    json(res, 401, { error: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.", auth: false });
    return null;
  }
  if (now - s.last > REFRESH_MS) {
    setCookie(req, res, sign({ ...s, last: now }), Math.floor(idleOf(s.r) / 1000));
  }
  return s;
}

/** Phiên bị chủ "đá" ra sau thời điểm đăng nhập? */
export function kickedAfter(kicks, s) {
  const at = kicks && kicks[s.u];
  return Boolean(at && new Date(at).getTime() > s.iat);
}

/* ---------------- khoá khi sai nhiều lần ---------------- */
export async function checkLock(name) {
  const fails = await readJsonRow(FAILS_KEY, {});
  const f = fails[name];
  if (f && f.until > Date.now()) return Math.ceil((f.until - Date.now()) / 60000);
  return 0;
}
export async function recordFail(name) {
  const fails = await readJsonRow(FAILS_KEY, {});
  const now = Date.now();
  for (const k of Object.keys(fails)) if (fails[k].until && fails[k].until < now - LOCK_MS) delete fails[k];
  const f = fails[name] || { n: 0, until: 0 };
  const n = (f.until && f.until <= now ? 0 : f.n) + 1;
  fails[name] = n >= MAX_FAILS ? { n: 0, until: now + LOCK_MS } : { n, until: 0 };
  await writeRow(FAILS_KEY, fails);
  return n >= MAX_FAILS ? { locked: Math.round(LOCK_MS / 60000) } : { left: MAX_FAILS - n };
}
export async function clearFails(name) {
  const fails = await readJsonRow(FAILS_KEY, {});
  if (fails[name]) { delete fails[name]; await writeRow(FAILS_KEY, fails); }
}

/** Nâng cấp mã băm SHA-256 cũ -> PBKDF2 ngay khi đăng nhập đúng. */
export async function upgradeIfLegacy(auth, id, password) {
  const e = auth.accounts[id];
  if (!e || e.algo === "pbkdf2") return;
  auth.accounts[id] = { ...e, ...makeHash(password) };
  await writeRow(AUTH_KEY, auth);
}
