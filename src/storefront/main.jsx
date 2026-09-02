import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { CartProvider } from "./cart.jsx";
import { fetchWebConfig } from "./lib/api.js";
import { applyWebConfig } from "./lib/applyWebConfig.js";
import "../index.css";

const rootEl = document.getElementById("root");
const root = (window.__hilitekStoreRoot ||= ReactDOM.createRoot(rootEl));

const render = () =>
  root.render(
    <CartProvider>
      <App />
    </CartProvider>
  );

// Nạp cấu hình hiển thị (chủ shop chỉnh từ app quản lý) rồi mới render.
// Lỗi / chưa cấu hình -> render với giá trị mặc định trong config.js.
fetchWebConfig()
  .then(applyWebConfig)
  .catch(() => {})
  .finally(render);
