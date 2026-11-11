import { defineConfig, loadEnv } from "vite";
import crypto from "node:crypto";
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


// DEV: HILI_API=1 chạy API quản trị (api/admin.js, api/web/ai-product-info.js) ngay trong Vite, mô
// phỏng Vercel Functions. Mặc định trỏ sang BẢN SAO dữ liệu (HILI_STORAGE_KEY=solbh-data-v2-devtest)
// để thử đăng nhập/lưu không đụng dữ liệu thật.
const adminApiDev = {
  name: "admin-api-dev",
  apply: "serve",
  configureServer(server) {
    if (!process.env.HILI_API) return;
    Object.assign(process.env, { ...loadEnv("development", process.cwd(), ""), ...process.env });
    process.env.HILI_STORAGE_KEY ||= "solbh-data-v2-devtest";
    process.env.ADMIN_SESSION_SECRET ||= crypto.randomBytes(32).toString("hex");
    const routes = { "/api/admin": "/api/admin.js", "/api/web/ai-product-info": "/api/web/ai-product-info.js" };
    server.middlewares.use(async (req, res, next) => {
      const [path, qs = ""] = (req.url || "").split("?");
      if (!routes[path]) return next();
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const raw = Buffer.concat(chunks).toString("utf8");
      req.query = Object.fromEntries(new URLSearchParams(qs));
      try { req.body = raw && /json/.test(req.headers["content-type"] || "") ? JSON.parse(raw) : raw; } catch { req.body = raw; }
      res.status = (c) => { res.statusCode = c; return res; };
      res.json = (o) => { if (!res.getHeader("Content-Type")) res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(o)); return res; };
      res.send = (b) => { res.end(typeof b === "string" || Buffer.isBuffer(b) ? b : JSON.stringify(b)); return res; };
      res.redirect = (c, u) => { res.statusCode = c; res.setHeader("Location", u); res.end(); return res; };
      try {
        const mod = await server.ssrLoadModule(routes[path]);
        await mod.default(req, res);
      } catch (e) {
        res.statusCode = 500; res.end(JSON.stringify({ error: String(e && e.message || e) }));
      }
    });
  },
};

export default defineConfig({
  plugins: [react(), shopSpaFallbackDev, adminApiDev],
  server: {
    port: 5173,
    open: false,
    // HILI_LIVE=1: xem thử bằng dữ liệu thật (chỉ đọc), web chạy ở máy không gửi đơn thật.
    proxy: process.env.HILI_LIVE ? {
      "/api/web": { target: "https://hilipc.vn", changeOrigin: true },
      "/media": { target: "https://hilipc.vn", changeOrigin: true },
    } : undefined,
  },
  build: {
    rollupOptions: {
      input: {
        admin: resolve(__dirname, "admin.html"),
        shop: resolve(__dirname, "shop.html"),
      },
      output: {
        // Tách thư viện lớn ra file riêng: trình duyệt tải song song và LƯU CACHE được — mỗi lần
        // deploy chỉ phải tải lại code app (thay đổi), không tải lại cả ~2MB thư viện không đổi.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (/[\\/]node_modules[\\/](recharts|d3-[^\\/]+|victory-vendor|recharts-scale|decimal\.js-light|internmap)[\\/]/.test(id)) return "vendor-charts";
          if (/[\\/]node_modules[\\/](quill|parchment|quill-delta|fast-diff|lodash-es|lodash\.[^\\/]+|eventemitter3)[\\/]/.test(id)) return "vendor-editor";
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return "vendor-react";
        },
      },
    },
  },
});
