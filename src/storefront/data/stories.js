/**
 * Kiểu trình bày riêng cho từng bài có sẵn (pages/Stories.jsx). Bài không có ở đây dùng kiểu chọn mua
 * (picks) hoặc kiểu đọc thường. Chữ SEO phía máy chủ vẫn lấy từ data/articles.js.
 * kind: news (tin tức) | steps (hướng dẫn từng bước) | gifts (gợi ý quà) | build (dựng máy) | decide (giải thích, chọn loại) | panels (cột màu)
 */
const T = "/handheld/thor/";
export const STORIES = {
  "ayn-thor-may-hai-man-hinh": {
    kind: "news", hero: T + "hands.webp", kicker: "Máy chơi game",
    lead: "Máy gập của AYN có một màn hình ở nắp và một màn hình ở thân. Chơi ở trên, xem bản đồ hoặc hướng dẫn ở dưới.",
    facts: [["2", "màn hình AMOLED"], ["6 inch", "màn chính, 120Hz"], ["6.000 mAh", "pin"]],
    parts: [
      { t: "Hai màn hình, hai việc", d: "Màn chính 6 inch nằm ở nắp trên, màn phụ 3,92 inch nằm ở thân máy. Hợp với game vốn làm cho hai màn hình, hoặc khi muốn vừa chơi vừa mở ứng dụng khác.", img: T + "front.webp" },
      { t: "Chip mạnh, có quạt", d: "Snapdragon 8 Gen 2, riêng bản Lite dùng Snapdragon 865. Quạt chủ động giữ máy mát khi chơi lâu.", img: T + "cooling.webp" },
      { t: "Pin 6.000 mAh", d: "Sạc nhanh 27W.", img: T + "battery.webp" },
    ],
    colors: [["Đen", T + "c-black.webp", "#1B1B1D"], ["Trắng", T + "c-white.webp", "#E9E9EC"], ["Cầu vồng", T + "c-rainbow.webp", "linear-gradient(135deg,#E0483B,#F7C600,#22A35A,#2C3FD0)"], ["Tím trong", T + "c-purple.webp", "#B79AD8"]],
    think: "Máy có nhiều bản cấu hình. Nhắn Hili để chọn bản hợp ngân sách trước khi đặt.",
    slug: "ayn-thor-pro-den",
  },
  "may-gap-may-doc-may-ngang": {
    kind: "panels", cta: ["/may-choi-game-cam-tay", "Xem các máy"],
    items: [
      { t: "Máy gập", d: "Gập lại che màn hình, bỏ túi rất tiện. Hợp người hay mang máy đi làm, đi học.", img: "/handheld/anbernic-rg-34xxsp.webp", bg: "#F49C8C" },
      { t: "Máy dọc", d: "Nhỏ gọn, dễ dùng một tay, hợp game cổ.", img: "/landing/bai/rg40xxv.webp", bg: "#F7C600" },
      { t: "Máy ngang", d: "Rộng tay, màn hình lớn hơn, hợp game 3D và chơi lâu.", img: "/handheld/ayn-odin-3.webp", bg: "#8FB4FF" },
    ],
  },
  "thong-so-can-xem-khi-chon-may-cam-tay": {
    kind: "panels", cta: ["/may-choi-game-cam-tay", "Xem các máy"],
    items: [
      { t: "Màn hình", d: "OLED cho màu đen sâu, 120Hz cho chuyển động mượt. 4:3 hợp game cổ, 16:9 hợp game mới.", img: "/handheld/thor/front.webp", bg: "#E5533D", ph: 1 },
      { t: "Chip", d: "Game cổ chỉ cần chip nhẹ. Game nặng cần chip đời cao.", img: "/handheld/thor/cooling.webp", bg: "#25252B", ph: 1 },
      { t: "Kiểu dáng", d: "Máy dọc và máy gập bỏ túi được. Máy ngang cầm chắc hơn.", img: "/handheld/thor/pocket.webp", bg: "#E5533D", ph: 1 },
      { t: "Cần analog", d: "Cần Hall bền hơn cần thường. Nên ưu tiên nếu chơi nhiều game 3D.", img: "/handheld/thor/stick.webp", bg: "#25252B", ph: 1 },
    ],
  },
  "cach-tra-bao-hanh-bang-so-serial": { kind: "steps" },
  "qua-tet-noel-cho-game-thu-duoi-2-trieu": {
    kind: "gifts",
    items: [
      { id: "v15", n: "Tai nghe Xiberia V15", d: "Trùm tai, cho người mới", img: "/landing/bai/q-v15.webp", slug: "tai-nghe-xiberia-v15-deep-iron-grey" },
      { id: "k5", n: "Bàn phím Machenike K500B", d: "Phím cơ có dây, hotswap", img: "/landing/bai/k500b.webp", slug: "ban-phim-machenike-k500b-b87-wired-red-switch-led-backlit-black" },
      { id: "l9", n: "Chuột Machenike L9", d: "Không dây, gọn bàn", img: "/landing/bai/q-l9.webp", slug: "chuot-khong-day-machenike-l9-x1-3311-black" },
      { id: "s1", n: "Chuột VOICSKY CLOUD S1 PRO", d: "Chỉ 49g, cảm biến PAW3395", img: "/landing/bai/q-s1.webp", slug: "chuot-gaming-khong-day-voicsky-cloud-s1-pro-dark" },
      { id: "k9", n: "Tai nghe Xiberia K9 Pro", d: "Trùm tai, đèn RGB", img: "/landing/bai/q-k9.webp", slug: "tai-nghe-xiberia-k9-pro-black" },
      { id: "p75", n: "Bàn phím VOICSKY PULSE 75", d: "Không dây 3 chế độ, gõ êm", img: "/home/cut-pulse-glacier.webp", slug: "ban-phim-co-khong-day-voicsky-pulse-75-glacier" },
    ],
    combos: [["Nhẹ tay, nghe rõ", ["s1", "v15"]], ["Góc máy không dây", ["p75", "l9"]]],
  },
  "build-pc-choi-game-15-trieu-thang-12-2026": {
    kind: "build", budget: 15000000,
    parts: [
      { k: "Mainboard", n: "ASRock B760M-HDV/M.2 D4", d: "Chân LGA1700, RAM DDR4", img: "/landing/bai/b-main.webp", find: "mainboard-asrock-b760m-hdv-m-2-d4" },
      { k: "SSD", n: "SSTC E130 512GB NVMe", d: "Khởi động và vào game nhanh", img: "/landing/bai/b-ssd.webp", find: "o-cung-ssd-sstc-oceanic-whitetip-e130-512gb" },
      { k: "Nguồn", n: "VSP VGP650BRU PRO 650W", d: "80 Plus Bronze, dư để nâng card", img: "/landing/bai/b-psu.webp", find: "nguon-may-tinh-vsp-vgp650bru-pro" },
      { k: "Vỏ máy", n: "Xigmatek Cloud M DGT", d: "Kính cường lực, màn hình nhiệt độ", img: "/landing/bai/b-case.webp", find: "case-xigmatek-cloud-m-dgt" },
    ],
    daily: [["CPU", "Core i5-12400F", "6 nhân 12 luồng"], ["RAM", "16GB DDR4", "2 thanh 8GB, chạy kênh đôi"], ["Card", "RTX 3050", "Dư tiền thì lên RTX 5060 8GB"]],
    tips: ["Đừng tiết kiệm ở nguồn", "Chừa khe RAM trống để lên 32GB", "Ghép màn Full HD 144Hz là vừa"],
  },
  "windows-11-pro-ban-quyen-oem-retail-fqc": { kind: "decide", slug: "phan-mem-windows-11-pro-64bit-eng-intl-fqc-10528" },
};
