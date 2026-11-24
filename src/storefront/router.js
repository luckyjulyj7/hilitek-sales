import { useEffect, useState, useCallback } from "react";

/**
 * Router theo đường dẫn thật (History API) — URL sạch, KHÔNG có dấu #.
 *   https://hilipc.vn/san-pham/tai-nghe-h500?x=1
 *
 * Server phải trả shop.html cho mọi path "sạch" (không phải file / api):
 *   - Production: rewrite catch-all trong vercel.json.
 *   - Dev: middleware `shop-spa-fallback-dev` trong vite.config.js.
 */

function parse() {
  let path = window.location.pathname || "/";
  // Dev: shop.html phục vụ tại "/shop.html" · path cũ "/shop" -> coi như gốc "/"
  if (path === "/shop.html" || path === "/shop" || path === "/shop/") path = "/";
  const query = Object.fromEntries(new URLSearchParams(window.location.search));
  return { path, query };
}

// Chuẩn hoá "to" về "/path?query" — chấp nhận cả "#/path", "path", "/path" (tương thích link cũ).
function normalize(to) {
  let s = String(to == null ? "/" : to).replace(/^#/, "");
  if (!s.startsWith("/")) s = "/" + s;
  return s;
}

export function useRoute() {
  const [route, setRoute] = useState(parse);

  useEffect(() => {
    const onChange = () => setRoute(parse());
    window.addEventListener("popstate", onChange);
    return () => window.removeEventListener("popstate", onChange);
  }, []);

  // replace=true: THAY THẾ trang hiện tại trong lịch sử thay vì thêm mới — dùng khi đổi PHIÊN BẢN
  // của cùng 1 sản phẩm (màu/dung lượng...), để bấm Back của trình duyệt thoát thẳng về trang TRƯỚC
  // KHI vào sản phẩm (VD trang danh mục), không phải lùi qua từng phiên bản đã xem trước đó.
  const navigate = useCallback((to, { replace = false } = {}) => {
    const next = normalize(to);
    if (window.location.pathname + window.location.search === next) {
      setRoute(parse());
      return;
    }
    if (replace) window.history.replaceState(null, "", next);
    else window.history.pushState(null, "", next);
    setRoute(parse());
  }, []);

  return { ...route, navigate };
}

/**
 * Chuẩn hoá link admin dán vào poster/banner: chấp nhận đường dẫn nội bộ ("/danh-muc?...",
 * "#/danh-muc?...") lẫn link ngoài ("https://facebook.com/..."). Admin cũng hay dán CẢ ĐƯỜNG DẪN
 * ĐẦY ĐỦ vào trang trong chính web mình (VD "https://hilipc.vn/danh-muc?cat=...") — nếu link đó
 * cùng domain với web đang chạy thì coi là link NỘI BỘ (điều hướng nhanh trong SPA, không mở tab
 * mới); domain khác mới thật sự là link ngoài (mở tab mới).
 * Trả về { internalPath, external, cleanLink }.
 */
// Domain chính thức của web — so khớp thêm domain này (không chỉ window.location) để link nội bộ
// vẫn nhận đúng dù đang xem qua domain phụ/preview (Vercel) khác với domain khách hay gõ.
const KNOWN_HOSTS = ["hilipc.vn"];
const stripWww = (h) => String(h || "").replace(/^www\./i, "").toLowerCase();

export function resolveLink(link) {
  let internalPath = null;
  if (link) {
    if (link.startsWith("#") || link.startsWith("/")) {
      internalPath = link.replace(/^#/, "");
    } else if (/^https?:\/\//i.test(link)) {
      try {
        const u = new URL(link);
        const host = stripWww(u.hostname);
        const sameAsCurrent = host === stripWww(window.location.hostname);
        if (sameAsCurrent || KNOWN_HOSTS.includes(host)) internalPath = u.pathname + u.search + u.hash;
      } catch { /* link không hợp lệ — coi như link ngoài, để trình duyệt tự báo lỗi */ }
    }
  }
  const external = !!link && internalPath == null && /^https?:\/\//i.test(link);
  const cleanLink = internalPath != null ? internalPath : (link || "");
  return { internalPath, external, cleanLink };
}

// Nhóm máy chơi game có trang riêng: mọi link danh mục của nhóm này đi thẳng sang đó (K yêu cầu 25/11/2026).
const GAME_PAGE = "/may-choi-game-cam-tay", GAME_NAME = "Máy chơi game cầm tay";
/** Dòng máy theo tên danh mục con; "" nếu không phải danh mục máy game. */
export function gameTier(cat) {
  const c = String(cat || "").normalize("NFC").toLowerCase();
  if (c === "máy retro") return "retro";
  if (c === "máy android") return "android";
  if (c === "mini pc cầm tay") return "mini";
  if (c === "pc chơi game cầm tay" || c === "pc cầm tay") return "pc";
  return "";
}
/** Link trang máy game ứng với bộ lọc danh mục, null nếu không thuộc nhóm máy game. */
export function gamePageFor(q) {
  if (!q || q.q) return null;
  const tier = gameTier(q.cat);
  if (!tier && q.cat !== GAME_NAME && !(q.group === GAME_NAME && !q.cat)) return null;
  const p = {};
  if (tier) p.dong = tier;
  if (q.brand) p.hang = q.brand;
  const qs = new URLSearchParams(p).toString();
  return GAME_PAGE + (qs ? "?" + qs : "");
}

/** Ghép path + query thành href sạch (không dấu #). */
export function href(path, query) {
  const game = path === "/danh-muc" ? gamePageFor(query) : null;
  if (game) return game;
  const qs = query ? new URLSearchParams(query).toString() : "";
  return path + (qs ? "?" + qs : "");
}

/** So khớp `/san-pham/:slug` -> { slug }. Trả null nếu không khớp. */
export function match(pattern, path) {
  const pp = pattern.split("/").filter(Boolean);
  const ap = String(path || "").split("/").filter(Boolean);
  if (pp.length !== ap.length) return null;
  const params = {};
  for (let i = 0; i < pp.length; i++) {
    if (pp[i].startsWith(":")) params[pp[i].slice(1)] = decodeURIComponent(ap[i]);
    else if (pp[i] !== ap[i]) return null;
  }
  return params;
}
