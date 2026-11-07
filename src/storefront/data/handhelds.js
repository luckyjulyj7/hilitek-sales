/**
 * Danh sách máy trưng bày ở trang Máy chơi game cầm tay. Đây chưa phải hàng trong kho nên không có giá.
 * Khi sản phẩm cùng tên được đăng web, trang tự hiện giá và link của sản phẩm thật.
 * Thông số lấy từ nguồn công khai, cần đối chiếu lại khi nhập hàng.
 */
export const TIERS = [
  { id: "retro", name: "Retro", word: "RETRO", note: "Dưới 3 triệu", for: "Nhỏ gọn, chơi lại game tuổi thơ.", tone: "bg-yellow text-ink", cover: "anbernic-rg-35xx-pro" },
  { id: "android", name: "Android", word: "ANDROID", note: "3 tới 12 triệu", for: "Game mobile và giả lập đời cao, màn đẹp.", tone: "bg-navy text-white", cover: "ayn-odin-3-white" },
  { id: "pc", name: "PC cầm tay", word: "PC GAMING", note: "Từ 12 triệu", for: "Chơi game PC bản quyền trên Steam, Xbox.", tone: "bg-ink text-white", cover: "msi-claw-8-ai" },
  { id: "mini", name: "Mini PC cầm tay", word: "MINI PC", note: "Theo cấu hình", for: "Có bàn phím, vừa làm việc vừa chơi game.", tone: "bg-white text-ink", cover: "gpd-win-max-2025" },
];

// photo: ảnh hãng có nền tối, hiện kín khung. Không có photo: ảnh đã tách nền, đặt trên vạch chéo Hilitek.
export const MODELS = [
  { slug: "anbernic-rg-34xx", name: "Anbernic RG 34XX", brand: "Anbernic", tier: "retro", inch: 3.4, screen: "3.4 inch 720×480", chip: "Allwinner H700" },
  { slug: "anbernic-rg-34xxsp", name: "Anbernic RG 34XXSP", brand: "Anbernic", tier: "retro", inch: 3.4, screen: "3.4 inch, thân gập", chip: "Allwinner H700" },
  { slug: "anbernic-rg-35xx-pro", name: "Anbernic RG 35XX Pro", brand: "Anbernic", tier: "retro", inch: 3.5, screen: "3.5 inch 640×480", chip: "Allwinner H700" },
  { slug: "miyoo-flip-v2", name: "Miyoo Flip V2", brand: "Miyoo", tier: "retro", inch: 3.5, screen: "3.5 inch 640×480, thân gập", chip: "RK3566" },
  { slug: "miyoo-mini-plus", name: "Miyoo Mini Plus", brand: "Miyoo", tier: "retro", inch: 3.5, screen: "3.5 inch 640×480", chip: "SigmaStar SSD202D" },
  { slug: "mangmi-air-x", name: "Mangmi Air X", brand: "Mangmi", tier: "android", inch: 5.5, screen: "5.5 inch 1080p", chip: "Snapdragon 662" },
  { slug: "mangmi-pocket-max", name: "Mangmi Pocket Max", brand: "Mangmi", tier: "android", inch: 7, screen: "7 inch OLED 144Hz", chip: "Snapdragon 865" },
  { slug: "anbernic-rg-476h", name: "Anbernic RG 476H", brand: "Anbernic", tier: "android", inch: 4.7, screen: "4.7 inch 1280×960", chip: "Unisoc T820" },
  { slug: "anbernic-rg-557", name: "Anbernic RG 557", brand: "Anbernic", tier: "android", inch: 5.48, screen: "5.48 inch AMOLED 1080p", chip: "Dimensity 8300" },
  { slug: "retroid-pocket-5", name: "Retroid Pocket 5", brand: "Retroid", tier: "android", inch: 5.5, screen: "5.5 inch OLED", chip: "Snapdragon 865", photo: true },
  { slug: "retroid-pocket-6", name: "Retroid Pocket 6", brand: "Retroid", tier: "android", inch: 5.5, screen: "5.5 inch AMOLED 120Hz", chip: "Snapdragon 8 Gen 2", photo: true },
  { slug: "retroid-pocket-nova", name: "Retroid Pocket Nova", brand: "Retroid", tier: "android", inch: 4.5, screen: "4.5 inch AMOLED 120Hz", chip: "QCS8550", photo: true },
  { slug: "ayn-odin-3", name: "AYN Odin 3", brand: "AYN", tier: "android", inch: 6, screen: "6 inch AMOLED 120Hz", chip: "Snapdragon 8 Elite" },
  { slug: "ayn-thor", name: "AYN Thor", brand: "AYN", tier: "android", inch: 6, screen: "2 màn AMOLED, màn chính 6 inch", chip: "Snapdragon 8 Gen 2", photo: true },
  { slug: "steam-deck-oled", name: "Steam Deck OLED", brand: "Valve", tier: "pc", inch: 7.4, screen: "7.4 inch OLED 90Hz", chip: "AMD APU tuỳ biến" },
  { slug: "rog-xbox-ally-x", name: "ROG Xbox Ally X", brand: "ASUS", tier: "pc", inch: 7, screen: "7 inch 1080p 120Hz", chip: "Ryzen AI Z2 Extreme", photo: true },
  { slug: "legion-go-2", name: "Legion Go 2", brand: "Lenovo", tier: "pc", inch: 8.8, screen: "8.8 inch OLED 144Hz", chip: "Ryzen Z2 Extreme" },
  { slug: "msi-claw-8-ai", name: "MSI Claw 8 AI+", brand: "MSI", tier: "pc", inch: 8, screen: "8 inch 1920×1200 120Hz", chip: "Core Ultra 7 258V" },
  { slug: "gpd-win-max-2025", name: "GPD Win Max 2025", brand: "GPD", tier: "mini", inch: 10.1, screen: "10.1 inch, có bàn phím", chip: "Ryzen AI 9 HX 370" },
  { slug: "onexplayer-x2-mini", name: "OneXPlayer X2 Mini", brand: "OneXPlayer", tier: "mini", inch: 8.8, screen: "8.8 inch OLED, 3 trong 1", chip: "Intel Arc G3 Extreme", photo: true },
];

// Khối máy tiêu điểm, ảnh tối hiện lớn như trang của hãng.
export const SPOTLIGHT = ["retroid-pocket-6", "ayn-thor", "retroid-pocket-nova", "rog-xbox-ally-x"];

// Chọn đời game muốn chơi, trang gợi ý dòng máy và vài mẫu phù hợp.
export const ERAS = [
  { id: "gba", label: "Game Boy, GBA", tier: "retro", text: "Game tuổi thơ chạy rất nhẹ. Máy Retro nhỏ gọn là đủ.", picks: ["anbernic-rg-34xx", "miyoo-mini-plus", "anbernic-rg-34xxsp"] },
  { id: "ps1", label: "PlayStation 1", tier: "retro", text: "Dòng Retro chip H700, RK3566 chơi tốt tới đời máy này.", picks: ["anbernic-rg-35xx-pro", "miyoo-flip-v2", "anbernic-rg-34xxsp"] },
  { id: "psp", label: "PSP, DS", tier: "android", text: "Nên lên máy Android để chạy mượt, màn hình cũng rộng hơn.", picks: ["mangmi-air-x", "anbernic-rg-476h", "ayn-thor"] },
  { id: "ps2", label: "PS2, GameCube", tier: "android", text: "Cần chip mạnh từ Snapdragon 865 trở lên.", picks: ["retroid-pocket-5", "mangmi-pocket-max", "anbernic-rg-557"] },
  { id: "mobile", label: "Game Android nặng", tier: "android", text: "Chọn chip đời cao và màn 120Hz để giữ khung hình ổn định.", picks: ["retroid-pocket-6", "ayn-odin-3", "ayn-thor"] },
  { id: "steam", label: "Game PC, Steam", tier: "pc", text: "Chơi trực tiếp thư viện game PC, không cần máy tính ở nhà.", picks: ["steam-deck-oled", "rog-xbox-ally-x", "legion-go-2"] },
  { id: "work", label: "Vừa làm vừa chơi", tier: "mini", text: "Máy chạy Windows có bàn phím hoặc bàn phím rời, mang đi làm cũng tiện.", picks: ["gpd-win-max-2025", "onexplayer-x2-mini", "msi-claw-8-ai"] },
];

export const HH_BRANDS = ["Anbernic", "Miyoo", "Retroid", "AYN", "Mangmi", "Valve", "ASUS ROG", "Lenovo Legion", "MSI Claw", "GPD", "OneXPlayer"];

export const HH_HERO = {"head": "Máy chơi game", "accent": "cầm tay", "sub": "Từ máy Retro nhỏ gọn tới PC cầm tay chơi game bản quyền. Bấm START, chơi thử một ván rồi chọn máy hợp bạn."};

export const HH_FAQ = [
  {"q": "Nên mua dòng nào cho người mới?", "a": "Nếu chỉ muốn chơi lại game tuổi thơ, dòng Retro là đủ. Muốn chơi game PC bản quyền thì chọn PC cầm tay. Bạn nói game hay chơi, Hili gợi ý máy phù hợp."},
  {"q": "Máy Android khác máy Retro thế nào?", "a": "Máy Android mạnh hơn, chơi được game trên kho ứng dụng và các đời máy sau. Máy Retro gọn và rẻ hơn, tập trung vào game cổ."},
  {"q": "PC cầm tay và Mini PC cầm tay khác nhau ra sao?", "a": "PC cầm tay thiết kế để chơi bằng tay cầm tích hợp. Mini PC cầm tay có thêm bàn phím, hợp khi cần làm việc trên Windows."},
  {"q": "Mua tại Hilitek có hoá đơn không?", "a": "Có. Hilitek xuất đủ hoá đơn VAT và bảo hành theo serial."},
  {"q": "Mẫu chưa có sẵn thì sao?", "a": "Bạn để lại số Zalo ở mẫu đang quan tâm, Hili báo giá và thời gian có hàng."},
];

// Khối ảnh đời sống: chỉ hiện khi bật và đủ 4 ảnh. id là dòng máy khách đi tới khi bấm.
export const HH_LIFE = {
  on: false,
  items: [
    { id: "retro", title: "Trên chuyến xe về", image: "" },
    { id: "android", title: "Ở quán cà phê", image: "" },
    { id: "pc", title: "Tối ở nhà", image: "" },
    { id: "mini", title: "Giờ làm việc", image: "" },
  ],
};

/** Ảnh của một máy: ảnh chủ shop tải lên, không có thì lấy ảnh mặc định theo slug. */
export const hhImage = (m) => m.image || `/handheld/${m.slug}.webp`;

const fill = (arr, next) => { if (Array.isArray(next)) { arr.length = 0; next.forEach((x) => arr.push(x)); } };

/** Ghi đè nội dung mặc định bằng phần chủ shop chỉnh ở Website, Nội dung, Máy chơi game cầm tay. */
export function applyHandheld(c) {
  if (!c || typeof c !== "object") return;
  fill(MODELS, c.models);
  fill(SPOTLIGHT, c.spotlight);
  fill(ERAS, c.eras);
  fill(HH_FAQ, c.faq);
  fill(HH_BRANDS, c.brands);
  if (Array.isArray(c.tiers) && c.tiers.length === TIERS.length) fill(TIERS, c.tiers);
  if (c.hero) Object.keys(c.hero).forEach((k) => { if (String(c.hero[k] || "").trim()) HH_HERO[k] = c.hero[k]; });
  if (c.life) { HH_LIFE.on = !!c.life.on; if (Array.isArray(c.life.items) && c.life.items.length === 4) HH_LIFE.items = c.life.items; }
}
