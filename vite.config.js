import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// https://vitejs.dev/config/
// App đa trang (route công khai định nghĩa ở vercel.json, không phải ở đây):
//   index.html  -> APP QUẢN LÝ BÁN HÀNG (src/main.jsx)         → chỉ dùng khi chạy "npm run dev" tại "/"
//   admin.html  -> app quản lý (bản sao)                        → phục vụ tại "/quanlybanhang" (production)
//   shop.html   -> WEBSITE BÁN HÀNG CHO KHÁCH (src/storefront)  → phục vụ tại "/" và "/shop" (production)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        admin: resolve(__dirname, "admin.html"),
        shop: resolve(__dirname, "shop.html"),
      },
    },
  },
});
