import { useEffect, useState, useCallback } from "react";

/**
 * Router hash gọn nhẹ (không cần thư viện, không cần cấu hình rewrite cho web tĩnh).
 * URL dạng:  https://hilitek.vn/#/san-pham/tai-nghe-h500?x=1
 */

function parse() {
  const hash = window.location.hash.replace(/^#/, "") || "/";
  const [pathPart, queryPart = ""] = hash.split("?");
  const path = pathPart || "/";
  const query = Object.fromEntries(new URLSearchParams(queryPart));
  return { path, query };
}

export function useRoute() {
  const [route, setRoute] = useState(parse);

  useEffect(() => {
    const onChange = () => setRoute(parse());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const navigate = useCallback((to) => {
    if (!to.startsWith("#")) to = "#" + (to.startsWith("/") ? to : "/" + to);
    if (window.location.hash === to) {
      setRoute(parse());
      return;
    }
    window.location.hash = to;
  }, []);

  return { ...route, navigate };
}

/** Ghép path + query thành href hash. */
export function href(path, query) {
  const qs = query ? new URLSearchParams(query).toString() : "";
  return "#" + path + (qs ? "?" + qs : "");
}

/** So khớp `/san-pham/:slug` -> { slug }. Trả null nếu không khớp. */
export function match(pattern, path) {
  const pp = pattern.split("/").filter(Boolean);
  const ap = path.split("/").filter(Boolean);
  if (pp.length !== ap.length) return null;
  const params = {};
  for (let i = 0; i < pp.length; i++) {
    if (pp[i].startsWith(":")) params[pp[i].slice(1)] = decodeURIComponent(ap[i]);
    else if (pp[i] !== ap[i]) return null;
  }
  return params;
}
