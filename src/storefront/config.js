/**
 * Cấu hình hiển thị của website bán hàng.
 *
 * ⚠️ CÁC GIÁ TRỊ "C<...>" LÀ CHỖ TRỐNG — thay bằng thông tin thật của Hilitek
 *    trước khi đưa web vào dùng. Chỉ sửa file này, không cần đụng tới component.
 */

export const SITE = {
  name: "HILITEK",
  tagline: "Linh kiện & phụ kiện máy tính chính hãng",

  // ┌───────────────────────────────────────────────────────────────────────┐
  // │  CHỖ ĐỂ THÊM LOGO:  hilitek-app/public/logo.png                        │
  // │  Chép file logo Hilitek vào thư mục `public/`, đặt tên `logo.png`     │
  // │  (hoặc .jpg / .webp / .svg cũng được) — web tự nhận, không cần sửa gì.│
  // │  Bản vẽ vector tạm `/logo.svg` sẽ tự bị thay khi có file thật.        │
  // └───────────────────────────────────────────────────────────────────────┘
  logo: {
    src: "/logo.png",
    alts: ["/logo.jpg", "/logo.jpeg", "/logo.webp"],
    fallbackSrc: "/logo.svg",
    wordmark: true, // false nếu file logo đã có sẵn chữ "Hilitek"
  },
  intro:
    "Hilitek phân phối linh kiện PC, gaming gear, thiết bị lưu trữ, màn hình và phần mềm bản quyền — hàng chính hãng, đủ hoá đơn VAT, bảo hành tra cứu theo số serial.",

  // Pháp lý — hiện ở chân trang + trang hướng dẫn thanh toán.
  legalName: "Công Ty TNHH TM DV HiLi",
  taxCode: "0316296138",
  // Tài khoản ngân hàng nhận chuyển khoản.
  bank: {
    name: "ACB (Ngân hàng Á Châu)",
    accountNumber: "19551097",
    branch: "Phòng giao dịch Lý Thường Kiệt",
    holder: "CÔNG TY TNHH TM DV HILI",
  },

  // --- Liên hệ ---
  phone: "0939 206 868",
  phoneRaw: "0939206868", // dùng cho href tel: — chỉ chữ số
  // Số hotline hiện ở góc phải header. Thêm dòng nếu có nhiều số (KINH DOANH, KỸ THUẬT...).
  hotlines: [
    { label: "HOTLINE", number: "0939 206 868", raw: "0939206868" },
  ],
  zalo: "0939 206 865",
  zaloHref: "https://zalo.me/0939206865",
  messengerHref: "https://m.me/HiLiPC627A",
  email: "Hilitek@gmail.com",
  address: "6/27A Đường Số 3, C/x Lữ Gia, Phường Phú Thọ, TP Hồ Chí Minh, Việt Nam",
  workingHours: "8:00 – 21:00, cả T7 & CN", // sửa lại nếu khác
  // Google Maps: nhúng trực tiếp theo địa chỉ (không cần API key). Muốn ghim đúng
  // toạ độ hơn: mở Google Maps → Share → Embed a map → dán URL trong src="..." vào đây.
  mapEmbedUrl:
    "https://www.google.com/maps?q=6/27A%20%C4%90%C6%B0%E1%BB%9Dng%20S%E1%BB%91%203,%20C%C6%B0%20x%C3%A1%20L%E1%BB%AF%20Gia,%20Ph%C6%B0%E1%BB%9Dng%20Ph%C3%BA%20Th%E1%BB%8D,%20TP%20H%E1%BB%93%20Ch%C3%AD%20Minh&output=embed",
  mapLink:
    "https://www.google.com/maps/search/?api=1&query=6%2F27A%20%C4%90%C6%B0%E1%BB%9Dng%20S%E1%BB%91%203%2C%20C%C6%B0%20x%C3%A1%20L%E1%BB%AF%20Gia%2C%20Ph%C6%B0%E1%BB%9Dng%20Ph%C3%BA%20Th%E1%BB%8D%2C%20TP%20H%E1%BB%93%20Ch%C3%AD%20Minh",
  facebookHref: "https://www.facebook.com/HiLiPC627A",

  // Kênh bán hàng / mạng xã hội khác — hiện ở chân trang + sidebar trang sản phẩm.
  // Điền link thật vào `href`; chỗ nào còn "C<...>" sẽ hiện mờ (chưa có link).
  socials: [
    { kind: "facebook", label: "Fanpage", href: "https://www.facebook.com/HiLiPC627A" },
    { kind: "zalo", label: "Zalo OA", href: "C<link Zalo OA>" },
    { kind: "shopee", label: "Shopee", href: "C<link Shopee>" },
    { kind: "tiktok", label: "TikTok Shop", href: "C<link TikTok>" },
    { kind: "youtube", label: "YouTube", href: "C<link YouTube>" },
  ],

  // --- Chính sách (hiển thị ở trang Chính sách + trang Bảo hành) ---
  policies: [
    {
      title: "Bảo hành chính hãng theo serial",
      body:
        "Mọi sản phẩm có số serial được ghi nhận khi xuất kho. Khách tra cứu thời hạn bảo hành bằng số serial in trên tem/thân máy — không cần giữ hoá đơn giấy.",
    },
    { title: "Đổi trả", body: "C<mô tả chính sách đổi trả: thời gian, điều kiện tem/hộp, chi phí...>" },
    { title: "Giao hàng", body: "C<mô tả giao hàng: nội thành / toàn quốc, đối tác vận chuyển, phí, thời gian>" },
    { title: "Thanh toán", body: "C<mô tả hình thức thanh toán: tiền mặt, chuyển khoản, COD...>" },
  ],
};

/**
 * Các mục nằm trên thanh nav (cạnh nút "Danh mục sản phẩm") — kiểu maianhpc.vn.
 * `to` là route nội bộ; đổi đích khi có trang riêng.
 */
export const SUPPORT_LINKS = [
  { label: "Hướng dẫn thanh toán", to: "/huong-dan-thanh-toan", icon: "CreditCard" },
  { label: "Hướng dẫn trả góp", to: "/huong-dan-thanh-toan", icon: "Wallet" },
  { label: "Chính sách giao hàng", to: "/chinh-sach-giao-hang", icon: "Truck" },
  { label: "Chính sách bảo hành", to: "/bao-hanh", icon: "ShieldCheck" },
  { label: "Xây dựng cấu hình PC", to: "/xay-dung-cau-hinh", icon: "Wrench" },
];

/** Bật/tắt tính năng chưa hoàn thiện. */
export const FEATURES = {
  // Tra cứu bảo hành trực tuyến — TẠM ẨN cho tới khi nối API /api/web/warranty.
  // Trang /bao-hanh vẫn còn (hiện nội dung chính sách), chỉ ẩn ô nhập serial + link trên menu.
  warrantyLookup: false,
};

/** Ngưỡng để gắn nhãn "Sắp hết" trên thẻ sản phẩm. */
export const LOW_STOCK_THRESHOLD = 5;

/**
 * Cây danh mục 3 tầng cho menu:  CHÍNH (group) → PHỤ (sub) → CHI TIẾT (child).
 *
 * group:  { group, slug, icon, subs: [...] }
 * sub:    { name, slug, cat, children: [...] }
 *           `cat` = tên danh mục — khớp "Danh mục trên web" của sản phẩm. Bấm phụ → lọc theo cat.
 * child:  1 trong 4 kiểu:
 *   { label, type: "cat",   value: "RTX 4060" }                       → lọc theo danh mục / tag
 *   { label, type: "brand", value: "NVIDIA" }                         → lọc theo nhãn hiệu SP
 *   { label, type: "price", min?: 0, max?: 15000000 }                 → lọc theo khoảng giá
 *   { label, type: "spec",  specKey: "Tần số quét", specValue: "165Hz" } → lọc theo thông số web
 *
 * Chỉnh trong app quản lý: Website → Cấu hình web → "Danh mục sản phẩm web".
 * icon = tên icon lucide (xem components/groupIcons.js).
 */
export const MENU = [
  {
    group: "Linh kiện PC", slug: "linh-kien-pc", icon: "Cpu",
    subs: [
      { name: "VGA - Card màn hình", slug: "vga", cat: "Card màn hình", children: [
        { label: "RTX 4060", type: "cat", value: "RTX 4060" },
        { label: "RTX 4070", type: "cat", value: "RTX 4070" },
        { label: "NVIDIA", type: "brand", value: "NVIDIA" },
        { label: "Dưới 15 triệu", type: "price", max: 15000000 },
        { label: "15 - 25 triệu", type: "price", min: 15000000, max: 25000000 },
      ] },
      { name: "CPU - Vi xử lý", slug: "cpu", cat: "CPU", children: [
        { label: "Intel", type: "brand", value: "Intel" },
        { label: "AMD", type: "brand", value: "AMD" },
      ] },
      { name: "Bo mạch chủ", slug: "mainboard", cat: "Mainboard", children: [] },
      { name: "RAM - Bộ nhớ", slug: "ram", cat: "RAM", children: [
        { label: "DDR5", type: "spec", specKey: "Loại", specValue: "DDR5" },
        { label: "DDR4", type: "spec", specKey: "Loại", specValue: "DDR4" },
      ] },
      { name: "Nguồn máy tính", slug: "psu", cat: "Nguồn máy tính", children: [] },
      { name: "Tản nhiệt", slug: "tan-nhiet", cat: "Tản nhiệt", children: [] },
    ],
  },
  {
    group: "Gaming Gear", slug: "gaming-gear", icon: "Gamepad2",
    subs: [
      { name: "Bàn phím", slug: "ban-phim", cat: "Bàn phím", children: [] },
      { name: "Chuột", slug: "chuot", cat: "Chuột", children: [] },
      { name: "Tai nghe", slug: "tai-nghe", cat: "Tai nghe", children: [] },
      { name: "Lót chuột", slug: "lot-chuot", cat: "Lót chuột", children: [] },
    ],
  },
  {
    group: "Thiết bị lưu trữ", slug: "luu-tru", icon: "HardDrive",
    subs: [
      { name: "Ổ cứng SSD", slug: "ssd", cat: "Ổ cứng SSD", children: [
        { label: "Dưới 2 triệu", type: "price", max: 2000000 },
        { label: "Trên 1TB", type: "spec", specKey: "Dung lượng", specValue: "2 TB" },
      ] },
      { name: "Ổ cứng HDD", slug: "hdd", cat: "Ổ cứng HDD", children: [] },
      { name: "SSD di động", slug: "ssd-di-dong", cat: "SSD di động", children: [] },
      { name: "USB & Thẻ nhớ", slug: "usb", cat: "USB & Thẻ nhớ", children: [] },
    ],
  },
  {
    group: "Màn hình", slug: "man-hinh", icon: "Monitor",
    subs: [
      { name: "Màn hình gaming", slug: "man-hinh-gaming", cat: "Màn hình gaming", children: [
        { label: "144Hz", type: "spec", specKey: "Tần số quét", specValue: "144 Hz" },
        { label: "165Hz", type: "spec", specKey: "Tần số quét", specValue: "165 Hz" },
        { label: "24 inch", type: "spec", specKey: "Kích thước", specValue: "24 inch" },
        { label: "27 inch", type: "spec", specKey: "Kích thước", specValue: "27 inch" },
      ] },
      { name: "Màn hình văn phòng", slug: "man-hinh-vp", cat: "Màn hình văn phòng", children: [] },
    ],
  },
  {
    group: "Phần mềm & Gia dụng", slug: "phan-mem-gia-dung", icon: "AppWindow",
    subs: [
      { name: "Phần mềm bản quyền", slug: "phan-mem", cat: "Phần mềm bản quyền", children: [] },
      { name: "Gia dụng", slug: "gia-dung", cat: "Gia dụng", children: [] },
    ],
  },
];

/** Mọi tên danh mục (cat) khả dụng — dùng cho ô "Danh mục trên web" của sản phẩm. */
export function allWebCategories(menu = MENU) {
  const out = [];
  (menu || []).forEach((g) => (g.subs || []).forEach((s) => {
    if (s.cat && !out.includes(s.cat)) out.push(s.cat);
    (s.children || []).forEach((c) => { if (c.type === "cat" && c.value && !out.includes(c.value)) out.push(c.value); });
  }));
  return out;
}

/** Tra nhanh: tên danh mục -> nhóm cha. */
export const CATEGORY_TO_GROUP = {};
function rebuildCatToGroup(menu = MENU) {
  Object.keys(CATEGORY_TO_GROUP).forEach((k) => delete CATEGORY_TO_GROUP[k]);
  (menu || []).forEach((g) => (g.subs || []).forEach((s) => {
    if (s.cat) CATEGORY_TO_GROUP[s.cat] = g.group;
    (s.children || []).forEach((c) => { if (c.type === "cat" && c.value) CATEGORY_TO_GROUP[c.value] = g.group; });
  }));
}
rebuildCatToGroup();
export { rebuildCatToGroup };

/* ── Helpers ── */
export function productCategories(p) {
  if (Array.isArray(p.categories) && p.categories.length) return p.categories;
  return p.category ? [p.category] : [];
}
export function productGroups(p) {
  if (p.group) return [p.group];
  return [...new Set(productCategories(p).map((c) => CATEGORY_TO_GROUP[c]).filter(Boolean))];
}
export const productInGroup = (p, group) => productGroups(p).includes(group);
export const productInCategory = (p, cat) => productCategories(p).includes(cat);

/** So khớp thông số: tìm cặp [nhãn ~ key] có giá trị chứa `value` (không phân biệt hoa/thường, khoảng trắng). */
export function specMatch(p, key, value) {
  const specs = Array.isArray(p.specs) ? p.specs : [];
  const norm = (s) => String(s || "").trim().toLowerCase().replace(/\s+/g, " ");
  const k = norm(key), v = norm(value);
  return specs.some((row) => Array.isArray(row) && norm(row[0]) === k && norm(row[1]).includes(v));
}

/** Sản phẩm khớp 1 mục "chi tiết" của menu. */
export function productMatchesChild(p, child) {
  if (!child) return true;
  if (child.type === "brand") return (p.brand || "") === child.value;
  if (child.type === "price") {
    const pr = Number(p.price) || 0;
    if (child.min != null && pr < Number(child.min)) return false;
    if (child.max != null && pr > Number(child.max)) return false;
    return true;
  }
  if (child.type === "spec") return specMatch(p, child.specKey, child.specValue);
  return productInCategory(p, child.value); // "cat"
}

/** Query string cho link 1 mục "chi tiết". */
export function childQuery(child, sub, group) {
  const q = {};
  if (group) q.group = group;
  if (sub && sub.cat) q.cat = sub.cat;
  if (!child) return q;
  if (child.type === "brand") q.brand = child.value;
  else if (child.type === "price") { if (child.min != null) q.pmin = child.min; if (child.max != null) q.pmax = child.max; }
  else if (child.type === "spec") q.spec = `${child.specKey}|${child.specValue}`;
  else if (child.type === "cat") { q.cat = child.value; delete q.group; }
  return q;
}

/**
 * Khu vực poster / banner trang chủ (bố cục kiểu maianhpc.vn).
 * Giờ chỉ là KHUNG TRỐNG — khi có ảnh, thêm `image` (đặt file trong `public/`,
 * ví dụ "/posters/hero.jpg") và `href` ("#/danh-muc?..." hoặc link ngoài).
 * `w`/`h` chỉ để hiển thị gợi ý kích thước trên khung trống, không ép ảnh.
 *
 * Poster CHÍNH chạy được slide nhiều ảnh: điền `slides: [{ image, href }, ...]`.
 *   - 2 ảnh trở lên  -> tự chạy slide (đổi mỗi 5 giây) + nút ‹ › + chấm chỉ số.
 *   - 1 ảnh          -> ảnh tĩnh.
 *   - không có slide  -> quay lại dùng `image`/`href` đơn (nếu có), không thì khung gợi ý.
 * Chỉnh trong app quản lý: Website -> Cấu hình web -> "Poster chính (slider)".
 */
export const HOME_POSTERS = {
  hero: { w: 892, h: 460, label: "Poster chính (slider)", image: "", href: "", slides: [] },
  side: [
    { w: 300, h: 226, label: "Poster phụ 1", image: "", href: "" },
    { w: 300, h: 226, label: "Poster phụ 2", image: "", href: "" },
  ],
  strip: [
    { w: 394, h: 150, label: "Banner 1", image: "", href: "" },
    { w: 394, h: 150, label: "Banner 2", image: "", href: "" },
    { w: 394, h: 150, label: "Banner 3", image: "", href: "" },
  ],
};

/** Flash Sale — dải đếm ngược trang chủ. */
export const FLASH_SALE = {
  enabled: true,
  // Thời điểm kết thúc đợt sale. Để trống -> tự đặt 2 ngày kể từ khi mở web (demo).
  endsAt: "",
};

/**
 * Cột bên phải trang chi tiết sản phẩm — cam kết + banner dọc + giao hàng/thanh
 * toán. Tất cả tuỳ chỉnh được ở đây, không cần sửa component.
 * Icon dùng tên trong lucide-react (xem danh sách trong ProductSidebar.jsx).
 */
export const PRODUCT_SIDEBAR = {
  commitmentsTitle: "Bảo hành chính hãng — Yên tâm mua hàng",
  commitments: [
    { icon: "BadgeCheck", text: "Cam kết hàng chính hãng, đủ hoá đơn VAT" },
    { icon: "RefreshCw", text: "Thu cũ đổi mới, hỗ trợ nâng cấp" },
    { icon: "Truck", text: "Giao hàng toàn quốc" },
    { icon: "Wrench", text: "Miễn phí lắp đặt khu vực TP.HCM" },
    { icon: "MapPin", text: "6/27A Đường Số 3, C/x Lữ Gia, P.Phú Thọ, TP.HCM" },
  ],
  // Banner dọc — đặt ảnh trong public/posters/, ví dụ "/posters/side-banner.jpg"
  banner: { image: "", href: "", w: 300, h: 520, label: "Banner dọc (tuỳ chỉnh)" },
  shippingTitle: "Giao hàng & thanh toán",
  shipping: [
    "Giao COD toàn quốc — freeship nội thành cho đơn từ 500K",
    "Giao hoả tốc nội thành trong 2 giờ",
    "Chính hãng — Full VAT — Bảo hành 1 đổi 1",
  ],
  payments: ["Tiền mặt", "Chuyển khoản", "VISA", "Mastercard", "MoMo", "ZaloPay"],
};

/** Nội dung khối bên phải trang đặt hàng (kiểu maianhpc.vn) — sửa chữ tại đây. */
export const CHECKOUT = {
  bankTitle: "Thanh toán qua chuyển khoản ngân hàng (khuyên dùng)",
  bankNote:
    "Thực hiện thanh toán vào tài khoản ngân hàng của Hilitek. Vui lòng ghi Mã đơn hàng vào phần Nội dung chuyển khoản. Đơn hàng sẽ được giao sau khi tiền đã chuyển.",
  // Dòng checkbox điều khoản (bắt buộc tick mới đặt được hàng).
  termsLabel:
    "Tôi đã đọc và đồng ý với Điều khoản & Điều kiện bán hàng của website Hilitek. Bấm “Đặt hàng” đồng nghĩa với việc đồng ý các điều khoản này.",
  termsLinkText: "Chính sách & Điều khoản bán hàng",
  termsLinkTo: "/chinh-sach",
  // Các dòng ghi chú dưới form.
  notes: [
    "Dữ liệu cá nhân của Quý khách chỉ dùng để xử lý đơn hàng và hỗ trợ trong quá trình mua hàng, theo Chính sách bảo mật của Hilitek.",
    "Khi bấm “Đặt hàng”, Quý khách xác nhận đã đọc và đồng ý với Điều khoản & Điều kiện của website Hilitek.",
  ],
  urgentSupport: "Hỗ trợ xử lý đơn hàng gấp: HOTLINE " + SITE.phone + " (Zalo)",
};

/**
 * Nội dung các trang chính sách (soạn theo mẫu maianhpc.vn, thay thông tin Hilitek).
 * Sửa text trực tiếp ở đây — trang tự render (components/pages/PolicyPage.jsx).
 * Mỗi section: { heading, body?: string|string[], bullets?: string[] }.
 */
export const PAGES = {
  "huong-dan-thanh-toan": {
    title: "Hướng dẫn thanh toán",
    intro:
      "Hilitek hỗ trợ nhiều hình thức thanh toán linh hoạt: tại cửa hàng, chuyển khoản ngân hàng, thanh toán khi nhận hàng (COD) và trả góp qua thẻ tín dụng.",
    // Số tài khoản lấy từ SITE.bank (PolicyPage tự ghép) — ở đây chỉ ghi chú thêm.
    bank: {
      note: "Nội dung chuyển khoản ghi: [Họ tên] - [Số điện thoại] - [Mã đơn hàng]. Sau khi chuyển khoản, vui lòng nhắn Zalo/gọi hotline để Hilitek xác nhận và giao hàng.",
    },
    sections: [
      {
        heading: "1. Thanh toán tại cửa hàng",
        body: `Quý khách đến trực tiếp showroom Hilitek tại ${SITE.address} để xem hàng và thanh toán bằng tiền mặt hoặc quẹt thẻ. Giờ làm việc: ${SITE.workingHours}.`,
      },
      {
        heading: "2. Chuyển khoản ngân hàng",
        body: "Chuyển khoản trước 100% hoặc đặt cọc theo thoả thuận vào tài khoản bên trên. Hilitek giao hàng ngay sau khi nhận được xác nhận chuyển khoản.",
      },
      {
        heading: "3. Thanh toán khi nhận hàng (COD)",
        body:
          "Áp dụng cho khu vực nội thành TP.HCM và đơn giao qua đơn vị vận chuyển. Quý khách thanh toán phần còn lại (sau khi trừ cọc, nếu có) cho nhân viên giao hàng bằng tiền mặt hoặc chuyển khoản khi nhận và kiểm tra hàng.",
      },
      {
        heading: "4. Trả góp",
        bullets: [
          "Trả góp qua thẻ tín dụng (Visa/Mastercard/JCB) của các ngân hàng liên kết — lãi suất 0% theo chương trình từng thời điểm.",
          "Trả góp qua công ty tài chính cho đơn đủ điều kiện.",
          "Liên hệ hotline " + SITE.phone + " hoặc Zalo " + SITE.zalo + " để được tư vấn hồ sơ và kỳ hạn phù hợp.",
        ],
      },
    ],
  },

  "chinh-sach-giao-hang": {
    title: "Chính sách giao hàng",
    intro:
      "Hilitek giao hàng toàn quốc. Đơn hàng được xác nhận qua điện thoại/Zalo trước khi giao; quý khách vui lòng kiểm tra hàng trước khi thanh toán.",
    sections: [
      {
        heading: "1. Miễn phí giao hàng nội thành TP.HCM",
        bullets: [
          "Miễn phí giao hàng cho đơn từ 500.000đ trong khu vực nội thành TP.HCM (theo tuyến giao của cửa hàng).",
          "Miễn phí lắp đặt tại nhà khu vực TP.HCM khi mua/ráp bộ PC.",
        ],
      },
      {
        heading: "2. Giao hàng có tính phí (ngoại thành & đi tỉnh)",
        bullets: [
          "Khu vực ngoại thành TP.HCM (Bình Chánh, Nhà Bè, Hóc Môn, Củ Chi…): phụ phí theo quãng đường.",
          "Giao đi tỉnh: phí theo bảng giá đơn vị vận chuyển; quý khách chuyển khoản trước tiền hàng, phí ship thu khi nhận.",
          "Giao hàng thu hộ (COD) đi tỉnh: giá trị thu hộ tối đa 20 triệu đồng; phí theo đơn vị vận chuyển; đặt cọc trước.",
        ],
      },
      {
        heading: "3. Giao hoả tốc nội thành (Grab, Ahamove…)",
        bullets: [
          "Áp dụng trong nội thành TP.HCM, nhận hàng trong ngày.",
          "Quý khách chuyển khoản trước 100% giá trị đơn hàng.",
          "Phí dịch vụ hoả tốc do quý khách chi trả theo cước thực tế.",
        ],
      },
      {
        heading: "4. Thời gian giao hàng",
        bullets: [
          "Nội thành TP.HCM: trong ngày hoặc 24 giờ kể từ khi xác nhận đơn.",
          "Các tỉnh: 2 – 5 ngày làm việc tuỳ khu vực và đơn vị vận chuyển.",
        ],
      },
      {
        heading: "5. Kiểm tra khi nhận hàng",
        body:
          "Quý khách được đồng kiểm (mở hộp kiểm tra ngoại quan, số serial, phụ kiện) trước khi thanh toán. Nếu sản phẩm không đúng đơn hoặc hư hỏng do vận chuyển, vui lòng từ chối nhận và liên hệ hotline " + SITE.phone + " để được đổi.",
      },
    ],
  },

  "chinh-sach-bao-hanh": {
    title: "Chính sách bảo hành",
    intro:
      "Sản phẩm Hilitek được bảo hành chính hãng theo số serial ghi nhận khi xuất kho. Quý khách không cần giữ hoá đơn giấy — tra cứu bằng số serial in trên tem/thân máy.",
    sections: [
      {
        heading: "1. Liên hệ bảo hành",
        bullets: [
          "Nhắn tin qua website, Fanpage hoặc Zalo " + SITE.zalo + ".",
          "Mang sản phẩm trực tiếp đến cửa hàng Hilitek.",
          "Liên hệ trung tâm bảo hành của nhà sản xuất (với sản phẩm bảo hành hãng).",
        ],
      },
      {
        heading: "2. Điều kiện được bảo hành",
        bullets: [
          "Còn trong thời hạn bảo hành (đối chiếu theo thông tin mua hàng và số serial).",
          "Tem niêm phong / tem bảo hành còn nguyên vẹn.",
          "Sản phẩm không trầy xước, móp méo, biến dạng vượt tiêu chuẩn của hãng.",
          "Lỗi phát sinh do nhà sản xuất (linh kiện, lỗi kỹ thuật).",
        ],
      },
      {
        heading: "3. Ưu đãi thêm",
        bullets: [
          "Đổi mới trong 30 ngày đầu nếu lỗi do nhà sản xuất và đủ điều kiện.",
          "Khách ráp bộ PC tại Hilitek: đổi mới linh kiện lỗi trong 3 tháng đầu (đủ điều kiện).",
          "Hỗ trợ sản phẩm dùng tạm trong thời gian chờ bảo hành (khu vực TP.HCM).",
          "Hỗ trợ kỹ thuật online miễn phí trong suốt thời gian bảo hành.",
        ],
      },
      {
        heading: "4. Trường hợp KHÔNG được bảo hành",
        bullets: [
          "Hết thời hạn bảo hành.",
          "Thiếu phụ kiện bắt buộc đi kèm.",
          "Hư hỏng do người dùng: rơi vỡ, cấn móp, vào nước, chập cháy do nguồn điện.",
          "Đã can thiệp sửa chữa / tháo lắp bởi bên thứ ba ngoài Hilitek và hãng.",
          "Số serial bị mờ, rách, không trùng khớp hoặc không xác định được.",
          "Hư hỏng do thiên tai, hoả hoạn, côn trùng.",
        ],
      },
      {
        heading: "5. Lưu ý",
        bullets: [
          "Dữ liệu trong thiết bị (ổ cứng, SSD…) không thuộc phạm vi bảo hành — quý khách vui lòng tự sao lưu.",
          "Không bảo hành phần mềm (Windows, game, lỗi phần mềm).",
        ],
      },
      {
        heading: "6. Địa điểm & thời gian tiếp nhận",
        body: `Địa chỉ: ${SITE.address}. Giờ tiếp nhận: ${SITE.workingHours}. Hotline: ${SITE.phone} (Zalo ${SITE.zalo}).`,
      },
    ],
  },
};
