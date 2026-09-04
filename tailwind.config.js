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
        // Nút giỏ hàng rung + phát sáng vàng khi vừa thêm sản phẩm.
        cartbump: {
          "0%":   { transform: "scale(1) rotate(0)",        boxShadow: "0 0 0 0 rgba(247,198,0,.9)" },
          "15%":  { transform: "scale(1.18) rotate(-10deg)" },
          "30%":  { transform: "scale(1.18) rotate(9deg)" },
          "45%":  { transform: "scale(1.12) rotate(-7deg)" },
          "60%":  { transform: "scale(1.1) rotate(5deg)" },
          "75%":  { transform: "scale(1.05) rotate(-2deg)" },
          "100%": { transform: "scale(1) rotate(0)",        boxShadow: "0 0 0 14px rgba(247,198,0,0)" },
        },
        // Khối sản phẩm trang chủ kiểu "tự chạy" — trượt liên tục phải → trái.
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        // Tia sét Flash Sale — rung lắc + nảy nhẹ thu hút chú ý.
        flashbolt: {
          "0%, 100%": { transform: "rotate(12deg) scale(1)" },
          "8%":  { transform: "rotate(-10deg) scale(1.12)" },
          "16%": { transform: "rotate(16deg) scale(1.14)" },
          "24%": { transform: "rotate(-6deg) scale(1.06)" },
          "32%": { transform: "rotate(12deg) scale(1)" },
        },
        // Logo "FLASH SALE" — nhấp nháy + rung theo nhịp + hào quang đỏ.
        flashpulse: {
          "0%, 100%": { transform: "scale(1) rotate(0deg)", filter: "drop-shadow(0 0 0 rgba(237,28,36,0))" },
          "12%": { transform: "scale(1.07) rotate(-2.5deg)", filter: "drop-shadow(0 0 10px rgba(237,28,36,0.85))" },
          "24%": { transform: "scale(1.05) rotate(2.5deg)", filter: "drop-shadow(0 0 16px rgba(255,90,40,0.9))" },
          "36%": { transform: "scale(1.07) rotate(-1.5deg)", filter: "drop-shadow(0 0 10px rgba(237,28,36,0.85))" },
          "48%": { transform: "scale(1) rotate(0deg)", filter: "drop-shadow(0 0 0 rgba(237,28,36,0))" },
        },
        // Nhãn giảm giá Flash Sale — "đỏ rực như cháy", nhấp nháy mạnh.
        emberglow: {
          "0%":   { boxShadow: "0 0 6px 1px rgba(237,28,36,0.6)", filter: "brightness(1)" },
          "25%":  { boxShadow: "0 0 16px 5px rgba(255,95,40,0.95)", filter: "brightness(1.25)" },
          "45%":  { boxShadow: "0 0 8px 2px rgba(237,28,36,0.7)", filter: "brightness(1.05)" },
          "70%":  { boxShadow: "0 0 22px 8px rgba(255,120,50,1)", filter: "brightness(1.32)" },
          "100%": { boxShadow: "0 0 6px 1px rgba(237,28,36,0.6)", filter: "brightness(1)" },
        },
      },
      animation: {
        zalo: "zalo 1.3s ease-in-out infinite",
        cartbump: "cartbump 0.7s ease-in-out",
        marquee: "marquee var(--marquee-duration, 40s) linear infinite",
        flashbolt: "flashbolt 1.5s ease-in-out infinite",
        flashpulse: "flashpulse 1.15s ease-in-out infinite",
        emberglow: "emberglow 1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
