/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./admin.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // "Cứng cáp, công nghệ": Chakra Petch cho tiêu đề/nút, Be Vietnam Pro cho nội dung.
        display: ["'Chakra Petch'", "system-ui", "sans-serif"],
        sans: ["'Be Vietnam Pro'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
        // Font giá bán — theo mẫu website Mai Anh PC.
        price: ["'Bai Jamjuree'", "Roboto", "system-ui", "sans-serif"],
      },
      colors: {
        // Nhận diện Hilitek — vàng + xanh (theo logo).
        ink: "#0B1230", // gần đen navy — thanh trên cùng, chân trang
        navy: "#1E2A8A", // xanh thương hiệu — header, nút chính, tiêu đề
        "navy-600": "#2A3AAE",
        "navy-050": "#EEF0FB",
        yellow: "#F7C600", // vàng thương hiệu — nhãn giảm giá, điểm nhấn
        "yellow-300": "#FFD84D",
        sale: "#ED1C24", // đỏ — chữ giá bán (theo mẫu Mai Anh PC)
        paper: "#F4F6FB", // nền trang
        line: "#E1E5F0",
        mute: "#5A6484", // chữ phụ
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,18,48,.06), 0 8px 24px rgba(11,18,48,.06)",
        menu: "0 16px 40px rgba(11,18,48,.16)",
      },
      keyframes: {
        // Nút "Chat Zalo" — vòng sáng nhấp nháy thu hút chú ý.
        zalo: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(0,104,255,0.55)", transform: "scale(1)" },
          "50%": { boxShadow: "0 0 0 10px rgba(0,104,255,0)", transform: "scale(1.02)" },
        },
      },
      animation: {
        zalo: "zalo 1.3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
