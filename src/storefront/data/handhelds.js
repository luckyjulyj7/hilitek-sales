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

// Máy thêm từ 11/2026. Cấu hình K đã lưu trước đó chưa có các máy này, nên gộp thêm khi đọc (mergeModels);
// K xoá máy nào ở trang quản lý thì slug nằm trong HANDHELD.removed và không hiện lại.
export const NEW_MODELS = [
  { slug: "trimui-brick-pro", name: "Trimui Brick Pro", brand: "Trimui", tier: "retro", inch: 3.95, screen: "3.95 inch 1024×768", chip: "Allwinner A133 Plus" },
  { slug: "anbernic-rg-40xx-h", name: "Anbernic RG 40XX H", brand: "Anbernic", tier: "retro", inch: 4, screen: "4 inch, máy ngang", chip: "Allwinner H700" },
  { slug: "anbernic-rg-40xxv", name: "Anbernic RG 40XXV", brand: "Anbernic", tier: "retro", inch: 4, screen: "4 inch, máy đứng", chip: "Allwinner H700" },
  { slug: "anbernic-rg-cubexx", name: "Anbernic RG CubeXX", brand: "Anbernic", tier: "retro", inch: 3.95, screen: "3.95 inch 720×720", chip: "Allwinner H700" },
  { slug: "anbernic-rg-35xx-h", name: "Anbernic RG 35XX H", brand: "Anbernic", tier: "retro", inch: 3.5, screen: "3.5 inch 640×480", chip: "Allwinner H700" },
  { slug: "anbernic-rg-35xxsp", name: "Anbernic RG 35XXSP", brand: "Anbernic", tier: "retro", inch: 3.5, screen: "3.5 inch, thân gập", chip: "Allwinner H700" },
  { slug: "anbernic-rg-28xx", name: "Anbernic RG 28XX", brand: "Anbernic", tier: "retro", inch: 2.8, screen: "2.8 inch, siêu nhỏ", chip: "Allwinner H700" },
  { slug: "anbernic-rg-rotate", name: "Anbernic RG Rotate", brand: "Anbernic", tier: "retro", inch: 3.5, screen: "3.5 inch 720×720, xoay", chip: "Unisoc T618" },
  { slug: "trimui-brick", name: "Trimui Brick", brand: "Trimui", tier: "retro", inch: 3.2, screen: "3.2 inch 1024×768", chip: "Allwinner A133 Plus", photo: true },
  { slug: "trimui-brick-hammer", name: "Trimui Brick Hammer", brand: "Trimui", tier: "retro", inch: 3.2, screen: "3.2 inch 1024×768", chip: "Allwinner A133 Plus", photo: true },
  { slug: "trimui-smart-pro", name: "Trimui Smart Pro", brand: "Trimui", tier: "retro", inch: 4.96, screen: "4.96 inch 1280×720", chip: "Allwinner A133 Plus" },
  { slug: "trimui-smart-pro-s", name: "Trimui Smart Pro S", brand: "Trimui", tier: "retro", inch: 4.96, screen: "4.96 inch 1280×720", chip: "Allwinner A523" },
  { slug: "retroid-pocket-duo", name: "Retroid Pocket Duo", brand: "Retroid", tier: "android", inch: 5.5, screen: "2 màn AMOLED 5.5 và 4.5 inch", chip: "Dragonwing Q-7790", photo: true },
  { slug: "retroid-pocket-duo-lite", name: "Retroid Pocket Duo Lite", brand: "Retroid", tier: "android", inch: 5.5, screen: "2 màn 5.5 và 4.2 inch", chip: "Dragonwing QCS6125", photo: true },
  { slug: "retroid-pocket-flip-2", name: "Retroid Pocket Flip 2", brand: "Retroid", tier: "android", inch: 5.5, screen: "5.5 inch AMOLED, thân gập", chip: "Snapdragon 865" },
  { slug: "retroid-pocket-classic", name: "Retroid Pocket Classic", brand: "Retroid", tier: "android", inch: 3.92, screen: "3.92 inch AMOLED 1240×1080", chip: "Snapdragon G1 Gen 2" },
  { slug: "retroid-pocket-4-pro", name: "Retroid Pocket 4 Pro", brand: "Retroid", tier: "android", inch: 4.7, screen: "4.7 inch 1334×750", chip: "Dimensity 1100" },
  { slug: "ayn-odin-3-portal", name: "AYN Odin 3 Portal", brand: "AYN", tier: "android", inch: 7, screen: "7 inch AMOLED 120Hz", chip: "Dragonwing Q8" },
  { slug: "ayn-odin-2-portal", name: "AYN Odin 2 Portal", brand: "AYN", tier: "android", inch: 7, screen: "7 inch AMOLED 120Hz", chip: "Snapdragon 8 Gen 2" },
  { slug: "ayaneo-pocket-ds", name: "AYANEO Pocket DS", brand: "AYANEO", tier: "android", inch: 7, screen: "2 màn 7 và 5 inch", chip: "Snapdragon G3x Gen 2", photo: true },
  { slug: "ayaneo-pocket-ace", name: "AYANEO Pocket ACE", brand: "AYANEO", tier: "android", inch: 4.5, screen: "4.5 inch 1620×1080", chip: "Snapdragon G3x Gen 2", photo: true },
  { slug: "ayaneo-pocket-dmg", name: "AYANEO Pocket DMG", brand: "AYANEO", tier: "android", inch: 3.92, screen: "3.92 inch OLED 1240×1080", chip: "Snapdragon G3x Gen 2", photo: true },
  { slug: "ayaneo-pocket-vert", name: "AYANEO Pocket VERT", brand: "AYANEO", tier: "android", inch: 3.5, screen: "3.5 inch 1600×1440", chip: "Snapdragon 8+ Gen 1", photo: true },
  { slug: "ayaneo-pocket-air-mini", name: "AYANEO Pocket AIR Mini", brand: "AYANEO", tier: "android", inch: 4.2, screen: "4.2 inch 1280×960", chip: "Helio G90T", photo: true },
];

/** Danh sách đã lưu + máy mới chưa có. Máy mới chèn sau máy cuối cùng cùng dòng. */
export function mergeModels(saved, removed = []) {
  const out = [...saved];
  const key = (n) => String(n || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const m of NEW_MODELS) {
    if (removed.includes(m.slug) || out.some((x) => x.slug === m.slug || key(x.name) === key(m.name))) continue;
    const at = out.reduce((a, x, i) => (x.tier === m.tier ? i + 1 : a), 0) || out.length;
    out.splice(at, 0, m);
  }
  return out;
}
{ const all = mergeModels(MODELS); MODELS.length = 0; MODELS.push(...all); }

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

export const HH_BRANDS = ["Anbernic", "Miyoo", "Trimui", "Retroid", "AYN", "AYANEO", "Mangmi", "Valve", "ASUS ROG", "Lenovo Legion", "MSI Claw", "GPD", "OneXPlayer"];

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

// Máy đã có ảnh "sân khấu tối Hili" (nền chung, máy cùng cỡ) trong public/handheld/stage/.
export const HH_STAGE = new Set(["trimui-brick", "trimui-brick-hammer", "trimui-smart-pro", "trimui-smart-pro-s", "retroid-pocket-duo", "retroid-pocket-duo-lite", "retroid-pocket-flip-2", "retroid-pocket-classic", "retroid-pocket-4-pro", "ayn-odin-3-portal", "ayn-odin-2-portal", "ayaneo-pocket-ds", "ayaneo-pocket-ace", "ayaneo-pocket-dmg", "ayaneo-pocket-vert", "ayaneo-pocket-air-mini", "trimui-brick-pro", "anbernic-rg-40xx-h", "anbernic-rg-40xxv", "anbernic-rg-cubexx", "anbernic-rg-35xx-h", "anbernic-rg-35xxsp", "anbernic-rg-28xx", "anbernic-rg-rotate", "anbernic-rg-34xx", "anbernic-rg-34xxsp", "anbernic-rg-35xx-pro", "anbernic-rg-476h", "anbernic-rg-557", "ayn-odin-3", "ayn-thor", "gpd-win-max-2025", "legion-go-2", "mangmi-air-x", "mangmi-pocket-max", "miyoo-flip-v2", "miyoo-mini-plus", "msi-claw-8-ai", "retroid-pocket-5", "retroid-pocket-6", "retroid-pocket-nova", "rog-xbox-ally-x", "steam-deck-oled"]);

/** Ảnh cho thẻ máy: ảnh nền tối chủ shop tải lên, rồi tới ảnh sân khấu, không có thì trả về rỗng. */
export const hhCard = (m) => (m.image && m.photo ? m.image : HH_STAGE.has(m.slug) ? `/handheld/stage/${m.slug}.webp` : "");

/** Ảnh của một máy: ảnh chủ shop tải lên, không có thì lấy ảnh mặc định theo slug. */
export const hhImage = (m) => m.image || `/handheld/${m.slug}.webp`;

const fill = (arr, next) => { if (Array.isArray(next)) { arr.length = 0; next.forEach((x) => arr.push(x)); } };

/** Ghi đè nội dung mặc định bằng phần chủ shop chỉnh ở Website, Nội dung, Máy chơi game cầm tay. */
export function applyHandheld(c) {
  if (!c || typeof c !== "object") return;
  if (Array.isArray(c.models)) fill(MODELS, mergeModels(c.models, c.removed));
  fill(SPOTLIGHT, c.spotlight);
  fill(ERAS, c.eras);
  fill(HH_FAQ, c.faq);
  fill(HH_BRANDS, c.brands);
  if (Array.isArray(c.tiers) && c.tiers.length === TIERS.length) fill(TIERS, c.tiers);
  if (c.hero) Object.keys(c.hero).forEach((k) => { if (String(c.hero[k] || "").trim()) HH_HERO[k] = c.hero[k]; });
  if (c.life) { HH_LIFE.on = !!c.life.on; if (Array.isArray(c.life.items) && c.life.items.length === 4) HH_LIFE.items = c.life.items; }
}
