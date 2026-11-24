import { useEffect } from "react";

/** Nạp bộ chữ của các trang dịch vụ và bài viết (một lần). Đủ dấu tiếng Việt. */
export function useEdPage(title) {
  useEffect(() => {
    if (!document.getElementById("ed-font")) {
      const l = document.createElement("link");
      l.id = "ed-font"; l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500&family=Be+Vietnam+Pro:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap";
      document.head.appendChild(l);
    }
    if (!title) return undefined;
    const prev = document.title;
    document.title = title;
    return () => { document.title = prev; };
  }, [title]);
}
