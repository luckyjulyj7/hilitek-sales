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

  const navigate = useCallback((to) => {
    const next = normalize(to);
    if (window.location.pathname + window.location.search === next) {
      setRoute(parse());
      return;
    }
    window.history.pushState(null, "", next);
    setRoute(parse());
  }, []);

  return { ...route, navigate };
}

/** Ghép path + query thành href sạch (không dấu #). */
export function href(path, query) {
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
