import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// https://vitejs.dev/config/
// App đa trang (route công khai định nghĩa ở vercel.json, không phải ở đây):
//   index.html  -> APP QUẢN LÝ BÁN HÀNG (src/main.jsx)         → chỉ dùng khi chạy "npm run dev" tại "/" (KHÔNG build ra production)
//   admin.html  -> app quản lý (bản build thật)                 → phục vụ tại "/quanlybanhang" (production)
//   shop.html   -> WEBSITE BÁN HÀNG CHO KHÁCH (src/storefront)  → phục vụ tại "/" và "/shop" (production)
//
// LƯU Ý: không đưa index.html vào rollupOptions.input — nếu build ra dist/index.html,
// Vercel sẽ tự ưu tiên phục vụ file tĩnh này ở "/" TRƯỚC KHI áp dụng rewrite trong
// vercel.json, khiến domain gốc luôn ra trang quản lý dù rewrite đã trỏ sang shop.html.
// DEV: web khách dùng router theo đường dẫn thật (không có #). Cần trả shop.html cho mọi
// path "sạch" (không có đuôi file) — giống rewrite catch-all của vercel.json trên production.
const shopSpaFallbackDev = {
  name: "shop-spa-fallback-dev",
  apply: "serve",
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      const url = (req.url || "/").split("?")[0];
      const skip =
        url === "/" || url === "/index.html" || url === "/admin.html" || url === "/shop.html" ||
        url.startsWith("/@") ||
        url.startsWith("/src/") ||
        url.startsWith("/node_modules/") ||
        url.startsWith("/api") ||
        url.startsWith("/media/") ||
        url.startsWith("/quanlybanhang") ||
        url.startsWith("/admin") ||
        /\.\w+$/.test(url); // có đuôi file (.js .css .png .jsx ...)
      if (!skip) req.url = "/shop.html";
      next();
    });
  },
};

export default defineConfig({
  plugins: [react(), shopSpaFallbackDev],
  server: {
    port: 5173,
    open: false,
  },
  build: {
    rollupOptions: {
      input: {
        admin: resolve(__dirname, "admin.html"),
        shop: resolve(__dirname, "shop.html"),
      },
    },
  },
});
