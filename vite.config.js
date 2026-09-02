import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// https://vitejs.dev/config/
// App đa trang:
//   index.html  -> website bán hàng cho khách (src/storefront/main.jsx)
//   admin.html  -> app quản lý bán hàng nội bộ (src/main.jsx) — phục vụ tại /admin
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
      },
    },
  },
});
