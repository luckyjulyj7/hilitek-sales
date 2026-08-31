import React from "react";
import ReactDOM from "react-dom/client";
import SalesManager from "./SalesManager.jsx";
import { initStorage } from "./lib/storage.js";
import "./index.css";

const rootEl = document.getElementById("root");

function ErrorScreen({ message }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "#F1F0EA",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#1F2A44",
      }}
    >
      <div
        style={{
          maxWidth: 560,
          background: "#fff",
          border: "1px solid #D8D3C4",
          borderRadius: 4,
          padding: 28,
        }}
      >
        <h1 style={{ fontFamily: "Fraunces, serif", fontSize: 20, margin: "0 0 12px" }}>
          Lỗi khởi tạo lưu trữ
        </h1>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 13,
            color: "#B0462F",
            margin: 0,
          }}
        >
          {message}
        </pre>
      </div>
    </div>
  );
}

// Cài lớp lưu trữ (và health-check Supabase nếu có cấu hình) TRƯỚC khi mount app.
initStorage()
  .then((res) => {
    if (res.error) {
      ReactDOM.createRoot(rootEl).render(<ErrorScreen message={res.error} />);
      return;
    }
    if (res.backend === "supabase") console.info("[storage] Supabase");
    ReactDOM.createRoot(rootEl).render(<SalesManager />);
  })
  .catch((e) => {
    ReactDOM.createRoot(rootEl).render(<ErrorScreen message={String(e?.message || e)} />);
  });
