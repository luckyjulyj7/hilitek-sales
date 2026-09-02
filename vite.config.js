import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// https://vitejs.dev/config/
// App đa trang:
//   index.html  -> APP QUẢN LÝ BÁN HÀNG (src/main.jsx)         → phục vụ tại "/"
//   admin.html  -> app quản lý (bản sao)                        → phục vụ tại "/admin"
//   shop.html   -> WEBSITE BÁN HÀNG CHO KHÁCH (src/storefront)  → phục vụ tại "/shop"
//                  (đổi index.html <-> shop.html khi muốn web khách lên "/")
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
