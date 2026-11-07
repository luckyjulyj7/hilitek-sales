// Mẫu nội dung AYN Thor cho nút "Nạp mẫu AYN Thor" ở trang đăng sản phẩm. Thông số theo trang AYN.
const I = "/handheld/thor/";
export const THOR_SAMPLE = {
  kicker: "Máy Android hai màn hình",
  tagline: "Máy gập có hai màn OLED. Màn trên chơi game, màn dưới mở bản đồ, hướng dẫn hay YouTube.",
  word: "THOR",
  accent: "#FF7A2E",
  tape: ["Hai màn OLED", "Snapdragon 8 Gen 2", "Pin 6000mAh", "Wi-Fi 7", "Cần Hall có đèn", "Xuất hình 4K60", "Nặng 380g"],
  colors: [
    { name: "Đen", dot: "#1b1c20", accent: "#FF7A2E", image: I + "c-black.webp" },
    { name: "Trắng", dot: "#eceef0", accent: "#8FE3F2", image: I + "c-white.webp" },
    { name: "Nút màu", dot: "#F7C600", accent: "#F7C600", image: I + "c-rainbow.webp" },
    { name: "Tím trong", dot: "#7c5cc4", accent: "#B795FF", image: I + "c-purple.webp" },
  ],
  gallery: [
    { image: I + "front.webp", title: "Màn chính 6 inch" },
    { image: I + "multi.webp", title: "Chơi và xem cùng lúc" },
    { image: I + "hands.webp", title: "Bảng điều khiển ở màn dưới" },
    { image: I + "pair.webp", title: "Đóng và mở" },
  ],
  film: { image: I + "hero-open.webp", lines: ["Mở ra là chơi.", "Gập lại là đi.", "Hai màn hình, một máy."] },
  sceneTitle: "Hai màn hình, hai việc cùng lúc",
  scenes: [
    { title: "Chơi game, xem YouTube", text: "Trận đấu ở màn dưới, video ở màn trên.", image: I + "multi.webp" },
    { title: "Chỉnh máy khi đang chơi", text: "Xem FPS, đổi hiệu năng, chỉnh quạt ở màn dưới.", image: I + "hands.webp" },
    { title: "Bảng điều khiển riêng", text: "Thor Control Center gom mọi cài đặt vào một nơi.", image: I + "tcc.webp" },
  ],
  screens: [
    { title: "Màn trên", value: "6 inch AMOLED", tags: "1080 × 1920, 120Hz, 650 nit, 152% sRGB" },
    { title: "Màn dưới", value: "3,92 inch AMOLED", tags: "1080 × 1240, 60Hz, 550 nit, 150% sRGB" },
  ],
  power: {
    title: "Mạnh hơn hẳn ở bản 8 Gen 2",
    text: "Base, Pro và Max dùng Snapdragon 8 Gen 2. Bản Lite dùng Snapdragon 865, rẻ hơn và vẫn đủ cho game cổ.",
    image: I + "chip.webp", nameA: "8 Gen 2", nameB: "865", note: "Điểm do AYN công bố.",
    rows: [{ label: "Đơn nhân", a: 1991, b: 1117 }, { label: "Đa nhân", a: 5299, b: 3274 }, { label: "Đồ hoạ", a: 9064, b: 3038 }],
  },
  advisorTitle: "Bạn hay chơi gì?",
  advisor: [
    { q: "Game tuổi thơ, PSP, DS", pick: "Lite", why: "Chơi tốt game cổ với giá thấp nhất." },
    { q: "PS2, GameCube, 3DS", pick: "Base", why: "Chip 8 Gen 2 cho các đời máy nặng hơn." },
    { q: "Game Android nặng, nhiều game", pick: "Pro", why: "12GB RAM, 256GB, đủ bốn màu." },
    { q: "Cài rất nhiều game, dùng lâu dài", pick: "Max 512GB", why: "16GB RAM, 512GB, ít phải lo đầy bộ nhớ." },
  ],
  detailTitle: "Từng chi tiết đều cho người chơi",
  details: [
    { image: I + "exploded.webp", title: "Bên trong gọn gàng", text: "Chip, pin, quạt xếp lớp trong thân dày 25,6mm" },
    { image: I + "stick.webp", title: "Cần Hall có đèn", text: "Không lo trôi cần sau thời gian dài" },
    { image: I + "battery.webp", title: "Pin 6000mAh", text: "Sạc nhanh 27W" },
    { image: I + "cooling.webp", title: "Có quạt tản nhiệt", text: "Giữ máy mát khi chơi lâu" },
    { image: I + "hinge.webp", title: "Bản lề gia cố", text: "Mở gập chắc tay" },
    { image: I + "typec.webp", title: "USB-C xuất hình", text: "Cắm TV 4K60 ở bản 8 Gen 2" },
    { image: I + "abxy.webp", title: "Nút ABXY ép hai màu", text: "Chữ không phai khi dùng lâu" },
  ],
  colorTitle: "Bốn màu, chọn màu của bạn",
  size: {
    title: "Bỏ túi áo khoác, mang đi mỗi ngày", image: I + "pocket.webp", drawing: I + "dims.webp",
    stats: [{ label: "Nặng", value: "380", unit: "gram" }, { label: "Dài", value: "150", unit: "mm" }, { label: "Rộng", value: "94", unit: "mm" }],
  },
  compareText: "| Lite | Base | Pro | Max 512GB | Max 1TB\nChip | 865 | 8 Gen 2 | 8 Gen 2 | 8 Gen 2 | 8 Gen 2\nBộ nhớ | 8GB + 128GB | 8GB + 128GB | 12GB + 256GB | 16GB + 512GB | 16GB + 1TB\nXuất hình | 1080p | 4K60 | 4K60 | 4K60 | 4K60\nMàu | Đen | Đen | 4 màu | 4 màu | 4 màu",
  faq: [
    { q: "Máy có cài sẵn game không?", a: "Không. Hãng giao máy không cài sẵn game." },
    { q: "Lite và Base khác nhau thế nào?", a: "Cùng RAM và bộ nhớ, nhưng Base dùng chip 8 Gen 2 mạnh hơn nhiều, có Wi-Fi 7 và xuất hình 4K60." },
    { q: "Có xuất hoá đơn VAT không?", a: "Có. Hilitek xuất đủ hoá đơn VAT." },
  ],
};
export const THOR_SPECS = "Màn trên | 6 inch AMOLED, 1080 × 1920, 120Hz\nMàn dưới | 3,92 inch AMOLED, 1080 × 1240, 60Hz\nChip | Snapdragon 8 Gen 2 (bản Lite: 865)\nĐồ hoạ | Adreno 740 (bản Lite: Adreno 650)\nPin | 6000mAh, sạc 27W\nTản nhiệt | Quạt chủ động\nKết nối | Wi-Fi 7, Bluetooth 5.3 (bản Lite: Wi-Fi 6, 5.1)\nCổng | USB 3.1 Type-C, jack 3,5mm, khe thẻ TF\nHệ điều hành | Android 13\nKích thước | 150 × 94 × 25,6mm\nKhối lượng | 380g";
