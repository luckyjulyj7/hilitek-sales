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
  phone: "0869 196 079", // HOTLINE chính — dùng khắp website (nút gọi, footer, Zalo...)
  phoneRaw: "0869196079", // dùng cho href tel: — chỉ chữ số
  // Số hỗ trợ kỹ thuật — hiện thành dòng thứ 2 ở góc phải header. Để trống nếu không dùng.
  techPhone: "0939 206 868",
  techPhoneRaw: "0939206868",
  // (Tuỳ chọn) Ghi đè hẳn danh sách hotline ở header. Bỏ trống để tự dựng từ phone + techPhone.
  hotlines: [],
  zalo: "0869 196 079",
  zaloHref: "https://zalo.me/0869196079",
  messengerHref: "https://m.me/HiLiPC627A",
  email: "hilitekcom3005@gmail.com",
  address: "6/27A Đường Số 3, C/x Lữ Gia, Phường Phú Thọ, TP Hồ Chí Minh, Việt Nam",
  workingHours: "8:00 – 21:00, cả T7 & CN", // sửa lại nếu khác
  // Google Maps: URL nhúng CHÍNH THỨC lấy từ Google Maps → Share → Embed a map → copy src="...".
  // (Không dùng dạng "maps?q=...&output=embed" — dạng đó hay bị Google chuyển hướng qua 1 bước
  // có X-Frame-Options: SAMEORIGIN, khiến bản đồ không hiện được trên một số trình duyệt di động.)
  // Đổi địa chỉ: mở lại Google Maps → Share → Embed a map → dán URL src mới vào đây.
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4930578386857!2d106.654704!3d10.773498000000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752ec0eee44efd%3A0xdb1ba03123914dd6!2zNi8yN0EgxJAuIFPhu5EgMyBDxrAgWMOhIEzhu68gR2lhLCBQaMO6IFRo4buNLCBI4buTIENow60gTWluaCwgVmlldG5hbQ!5e0!3m2!1svi!2s!4v1788612575639!5m2!1svi!2s",
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
 * Menu 2 tầng:  NHÓM CHÍNH (group)  →  DANH MỤC PHỤ (sub).
 *
 * group: { group, slug, icon, subs: [ { name, slug } ] }
 *   sub  = 1 "group sản phẩm" do shop tự đặt tên (VD: "Bàn phím cơ", "Màn hình 144Hz",
 *          "PC Gaming tầm trung"...). Khi thêm/sửa sản phẩm, tick chọn sản phẩm thuộc
 *          danh mục phụ nào (chọn nhiều được) — lưu ở `web.categories` của sản phẩm.
 *   TÊN sub phải KHÁC NHAU trên toàn menu.
 *
 * Ngoài các sub tự đặt, menu xổ ra + trang danh mục còn TỰ SINH 2 cột:
 *   • "Thương hiệu" — từ Nhãn hiệu của các sản phẩm trong nhóm
 *   • "Khoảng giá"  — theo PRICE_BUCKETS bên dưới
 *
 * Chỉnh trong app quản lý: Website → Cấu hình web → "Danh mục sản phẩm web".
 * icon = tên icon lucide (xem components/groupIcons.js).
 */
export const MENU = [
  {
    group: "Linh kiện PC", slug: "linh-kien-pc", icon: "Cpu",
    subs: [
      { name: "Card màn hình", slug: "card-man-hinh" },
      { name: "CPU", slug: "cpu" },
      { name: "Mainboard", slug: "mainboard" },
      { name: "RAM", slug: "ram" },
      { name: "Nguồn máy tính", slug: "nguon-may-tinh" },
      { name: "Tản nhiệt", slug: "tan-nhiet" },
    ],
  },
  {
    group: "Gaming Gear", slug: "gaming-gear", icon: "Gamepad2",
    subs: [
      { name: "Bàn phím", slug: "ban-phim" },
      { name: "Chuột", slug: "chuot" },
      { name: "Tai nghe", slug: "tai-nghe" },
      { name: "Lót chuột", slug: "lot-chuot" },
    ],
  },
  {
    group: "Thiết bị lưu trữ", slug: "luu-tru", icon: "HardDrive",
    subs: [
      { name: "Ổ cứng SSD", slug: "o-cung-ssd" },
      { name: "Ổ cứng HDD", slug: "o-cung-hdd" },
      { name: "SSD di động", slug: "ssd-di-dong" },
      { name: "USB & Thẻ nhớ", slug: "usb-the-nho" },
    ],
  },
  {
    group: "Màn hình", slug: "man-hinh", icon: "Monitor",
    subs: [
      { name: "Màn hình gaming", slug: "man-hinh-gaming" },
      { name: "Màn hình văn phòng", slug: "man-hinh-van-phong" },
    ],
  },
  {
    group: "Phần mềm & Gia dụng", slug: "phan-mem-gia-dung", icon: "AppWindow",
    subs: [
      { name: "Phần mềm bản quyền", slug: "phan-mem-ban-quyen" },
      { name: "Gia dụng", slug: "gia-dung" },
    ],
  },
];

/** Cột "Khoảng giá" tự sinh trong menu + trang danh mục. */
export const PRICE_BUCKETS = [
  { label: "Dưới 1 triệu", max: 1000000 },
  { label: "1 – 3 triệu", min: 1000000, max: 3000000 },
  { label: "3 – 5 triệu", min: 3000000, max: 5000000 },
  { label: "5 – 10 triệu", min: 5000000, max: 10000000 },
  { label: "10 – 20 triệu", min: 10000000, max: 20000000 },
  { label: "Trên 20 triệu", min: 20000000 },
];
export const priceInRange = (price, min, max) => {
  const n = Number(price) || 0;
  if (min != null && n < Number(min)) return false;
  if (max != null && n > Number(max)) return false;
  return true;
};
export function priceBucketQuery(b, group) {
  const q = {};
  if (group) q.group = group;
  if (b.min != null) q.pmin = b.min;
  if (b.max != null) q.pmax = b.max;
  return q;
}

/** Mọi tên danh mục phụ — dùng cho ô "Danh mục phụ trên web" của sản phẩm. */
export function allWebCategories(menu = MENU) {
  const out = [];
  (menu || []).forEach((g) => (g.subs || []).forEach((s) => {
    if (s.name && !out.includes(s.name)) out.push(s.name);
  }));
  return out;
}
/** [{ group, subs:[tên] }] — cho ô chọn có nhóm ở app quản lý. */
export function webCategoryGroups(menu = MENU) {
  return (menu || []).map((g) => ({ group: g.group, subs: (g.subs || []).map((s) => s.name).filter(Boolean) }));
}

/** Tra nhanh: tên danh mục phụ -> nhóm cha. */
export const CATEGORY_TO_GROUP = {};
function rebuildCatToGroup(menu = MENU) {
  Object.keys(CATEGORY_TO_GROUP).forEach((k) => delete CATEGORY_TO_GROUP[k]);
  (menu || []).forEach((g) => (g.subs || []).forEach((s) => {
    if (s.name) CATEGORY_TO_GROUP[s.name] = g.group;
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

/** Nhãn hiệu của các sản phẩm thuộc 1 nhóm — cho cột "Thương hiệu" tự sinh. */
export function brandsInGroup(products, group) {
  const set = new Set();
  (products || []).forEach((p) => {
    if ((!group || productInGroup(p, group)) && p.brand) set.add(p.brand);
  });
  return [...set].sort((a, b) => a.localeCompare(b, "vi"));
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

/**
 * Flash Sale — khối nổi bật ngay dưới dải đếm ngược ở trang chủ.
 * Dùng cùng bộ lọc như HOME_SECTIONS + thêm `minDiscount` (chỉ lấy hàng giảm sâu).
 * Chỉnh ở app quản lý → Website → Cấu hình web → "Flash Sale".
 */
export const FLASH_SALE = {
  enabled: true,
  endsAt: "",          // thời điểm kết thúc; để trống = tự +2 ngày (demo)
  title: "Flash Sale",
  minDiscount: 10,     // % — chỉ lấy sản phẩm giảm từ mức này trở lên
  group: "",
  cat: "",
  brand: "",
  onSale: true,        // luôn ưu tiên hàng đang giảm giá
  pmin: null,
  pmax: null,
  skus: [],
  sort: "discount",
  limit: 12,
  layout: "carousel",  // carousel | marquee | grid
};

/**
 * KHỐI SẢN PHẨM TRANG CHỦ — các hàng sản phẩm chạy ngang ở trang chủ
 * (kiểu hotgear.vn / nguyencongpc.vn). Chủ shop tự thêm/sửa ở
 *   app quản lý → Website → Cấu hình web → "Khối sản phẩm trang chủ".
 *
 * Mỗi khối:
 *   title     : tên khối hiện trên trang chủ (VD "Laptop khuyến mãi Hot")
 *   group     : lọc theo NHÓM CHÍNH (tên trong MENU) — "" = mọi nhóm
 *   cat       : lọc theo DANH MỤC PHỤ (tên sub) — "" = mọi danh mục
 *   brand     : lọc theo thương hiệu — "" = mọi thương hiệu
 *   onSale    : true = chỉ lấy sản phẩm đang giảm giá
 *   pmin/pmax : lọc khoảng giá (đ) — null = không giới hạn
 *   skus      : mảng SKU chọn tay — nếu có, DÙNG ĐÚNG danh sách này (bỏ qua các lọc trên)
 *   sort      : "discount" | "priceAsc" | "priceDesc" | "name" | "newest"
 *   limit     : số sản phẩm tối đa
 *   rows      : 1 hoặc 2 (số dòng khi cuộn ngang)
 *   layout    : "carousel" (nút ‹ ›) | "marquee" (tự chạy phải→trái) | "grid" (lưới, không cuộn)
 *   seeAllText: chữ nút xem tất cả (mặc định "Xem tất cả")
 *   seeAllHref: link xem tất cả tự đặt (VD "#/danh-muc?..."); bỏ trống = tự suy từ bộ lọc
 *   enabled   : bật/tắt khối
 */
export const HOME_SECTIONS = MENU.map((g) => ({
  title: g.group,
  group: g.group,
  cat: "",
  brand: "",
  onSale: false,
  pmin: null,
  pmax: null,
  skus: [],
  sort: "discount",
  limit: 12,
  rows: 1,
  layout: "carousel",
  seeAllText: "Xem tất cả",
  seeAllHref: "",
  enabled: true,
}));

export const HOME_SECTION_SORTS = [
  { id: "discount", label: "Giảm giá nhiều nhất" },
  { id: "newest", label: "Mới nhất" },
  { id: "priceAsc", label: "Giá thấp → cao" },
  { id: "priceDesc", label: "Giá cao → thấp" },
  { id: "name", label: "Tên A → Z" },
];
export const HOME_SECTION_LAYOUTS = [
  { id: "carousel", label: "Cuộn ngang — có nút ‹ ›" },
  { id: "marquee", label: "Tự chạy phải → trái" },
  { id: "grid", label: "Lưới (không cuộn)" },
];

const _onSale = (p) => Number(p.listPrice) > Number(p.price);

/** Lọc + sắp xếp + cắt số lượng sản phẩm cho 1 khối trang chủ. */
export function homeSectionProducts(products, s) {
  const list = Array.isArray(products) ? products : [];
  const lim = Number(s.limit) > 0 ? Number(s.limit) : 12;

  // Chọn tay theo SKU: dùng đúng danh sách, đúng thứ tự.
  if (Array.isArray(s.skus) && s.skus.length) {
    const bySku = new Map(list.map((p) => [String(p.sku || "").toLowerCase(), p]));
    return s.skus
      .map((k) => bySku.get(String(k).trim().toLowerCase()))
      .filter(Boolean)
      .slice(0, lim);
  }

  let r = list.filter((p) => {
    if (s.group && !productInGroup(p, s.group)) return false;
    if (s.cat && !productInCategory(p, s.cat)) return false;
    if (s.brand && (p.brand || "") !== s.brand) return false;
    if (s.onSale && !_onSale(p)) return false;
    if (s.minDiscount) {
      const d = Number(p.listPrice) > 0 ? (1 - Number(p.price) / Number(p.listPrice)) * 100 : 0;
      if (d < Number(s.minDiscount)) return false;
    }
    if ((s.pmin != null || s.pmax != null) && !priceInRange(p.price, s.pmin, s.pmax)) return false;
    return true;
  });

  const cmp = {
    discount: (a, b) =>
      (Number(b.listPrice) - Number(b.price)) / (Number(b.listPrice) || 1) -
      (Number(a.listPrice) - Number(a.price)) / (Number(a.listPrice) || 1),
    priceAsc: (a, b) => Number(a.price) - Number(b.price),
    priceDesc: (a, b) => Number(b.price) - Number(a.price),
    name: (a, b) => String(a.name).localeCompare(String(b.name), "vi"),
    newest: () => 0, // danh sách API đã theo thứ tự sản phẩm mới nhất trước
  }[s.sort] || (() => 0);

  return [...r].sort(cmp).slice(0, lim);
}

/** Query cho nút "Xem tất cả" của 1 khối → mở trang /danh-muc đã lọc sẵn. */
export function homeSectionSeeAll(s) {
  if (s.seeAllHref) return { _href: s.seeAllHref };
  const q = {};
  if (s.group) q.group = s.group;
  if (s.cat) q.cat = s.cat;
  if (s.brand) q.brand = s.brand;
  if (s.pmin != null) q.pmin = s.pmin;
  if (s.pmax != null) q.pmax = s.pmax;
  if (s.onSale) q.sale = "1";
  const sortMap = { discount: "discount", priceAsc: "price-asc", priceDesc: "price-desc", name: "name" };
  if (sortMap[s.sort]) q.sort = sortMap[s.sort];
  return q;
}

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
  termsLinkText: "Điều khoản và điều kiện của website",
  termsLinkTo: "/dieu-khoan-website",
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
    title: "Chính sách thanh toán",
    intro:
      `${SITE.name} hỗ trợ nhiều hình thức thanh toán: tại cửa hàng, chuyển khoản ngân hàng, thanh toán khi nhận hàng (COD) và trả góp qua thẻ tín dụng / công ty tài chính.`,
    // Số tài khoản lấy từ SITE.bank (PolicyPage tự ghép) — ở đây chỉ ghi chú thêm.
    bank: {
      note: "Nội dung chuyển khoản ghi: [Họ tên] - [Số điện thoại] - [Mã đơn hàng]. Sau khi chuyển khoản, vui lòng nhắn Zalo / gọi hotline để Hilitek xác nhận và giao hàng.",
    },
    sections: [
      {
        heading: "1. Thanh toán tại cửa hàng",
        body: `Quý khách đến trực tiếp showroom Hilitek tại ${SITE.address} để xem hàng và thanh toán bằng tiền mặt hoặc quẹt thẻ (miễn phí phụ thu). Giờ làm việc: ${SITE.workingHours}.`,
      },
      {
        heading: "2. Chuyển khoản ngân hàng",
        bullets: [
          "Chuyển khoản trước 100% hoặc đặt cọc theo thoả thuận vào tài khoản công ty ở trên.",
          "Ghi đúng nội dung chuyển khoản để Hilitek đối soát nhanh.",
          "Hilitek giao hàng / xuất hàng ngay sau khi nhận được xác nhận chuyển khoản thành công.",
        ],
      },
      {
        heading: "3. Thanh toán khi nhận hàng (COD)",
        body:
          "Áp dụng cho khu vực nội thành TP.HCM và đơn giao qua đơn vị vận chuyển (giá trị thu hộ theo hạn mức của đơn vị vận chuyển). Quý khách thanh toán phần còn lại (sau khi trừ cọc, nếu có) cho nhân viên giao hàng bằng tiền mặt hoặc chuyển khoản ngay khi nhận và kiểm tra hàng.",
      },
      {
        heading: "4. Trả góp",
        bullets: [
          "Trả góp qua thẻ tín dụng (Visa / Mastercard / JCB) của các ngân hàng liên kết — lãi suất 0% theo chương trình từng thời điểm.",
          "Trả góp qua công ty tài chính cho đơn hàng đủ điều kiện (chỉ cần CMND/CCCD + 1 loại giấy tờ phụ).",
          `Liên hệ hotline ${SITE.phone} hoặc Zalo ${SITE.zalo} để được tư vấn hồ sơ và kỳ hạn phù hợp.`,
        ],
      },
      {
        heading: "5. Xuất hoá đơn VAT",
        body: `Hilitek xuất hoá đơn GTGT cho mọi đơn hàng khi Quý khách yêu cầu. Vui lòng cung cấp: tên công ty, mã số thuế, địa chỉ đăng ký kinh doanh ngay khi đặt hàng. Đơn vị bán: ${SITE.legalName} — MST ${SITE.taxCode}.`,
      },
    ],
  },

  "chinh-sach-giao-hang": {
    title: "Chính sách giao hàng - kiểm hàng",
    intro:
      "Hilitek giao hàng toàn quốc. Mọi đơn hàng đều được xác nhận qua điện thoại / Zalo trước khi giao và Quý khách được kiểm tra hàng trước khi thanh toán.",
    sections: [
      {
        heading: "1. Miễn phí giao hàng nội thành TP.HCM",
        bullets: [
          "Miễn phí giao hàng khu vực nội thành TP.HCM cho đơn từ 1.000.000đ (sắp xếp giao theo tuyến của cửa hàng).",
          "Miễn phí giao + lắp đặt tận nơi trong bán kính ~20km khi Quý khách ráp bộ PC tại Hilitek.",
        ],
      },
      {
        heading: "2. Giao hàng có tính phí (ngoại thành & đi tỉnh)",
        bullets: [
          "Ngoại thành TP.HCM (Bình Chánh, Nhà Bè, Hóc Môn, Củ Chi…): phụ phí theo quãng đường.",
          "Đi tỉnh: phí theo bảng giá của đơn vị vận chuyển; Quý khách chuyển khoản trước tiền hàng, phí ship thu khi nhận (hoặc theo thoả thuận).",
          "Giao thu hộ (COD) đi tỉnh: giá trị thu hộ theo hạn mức của đơn vị vận chuyển; cần đặt cọc trước.",
        ],
      },
      {
        heading: "3. Giao hoả tốc nội thành (Grab, Ahamove…)",
        bullets: [
          "Áp dụng trong nội thành TP.HCM, nhận hàng trong ngày.",
          "Quý khách chuyển khoản trước 100% giá trị đơn hàng.",
          "Phí dịch vụ hoả tốc do Quý khách chi trả theo cước thực tế.",
        ],
      },
      {
        heading: "4. Thời gian giao hàng dự kiến",
        bullets: [
          "Nội thành TP.HCM: trong ngày hoặc trong 24 giờ kể từ khi xác nhận đơn.",
          "Các tỉnh: 2 – 5 ngày làm việc tuỳ khu vực và đơn vị vận chuyển.",
          "Thời gian có thể thay đổi vào dịp lễ, Tết, cao điểm hoặc do thời tiết, sự cố vận chuyển.",
        ],
      },
      {
        heading: "5. Kiểm tra khi nhận hàng",
        body:
          `Quý khách được đồng kiểm (mở hộp kiểm tra ngoại quan, số serial, phụ kiện, số lượng, đối chiếu với đơn hàng) TRƯỚC khi thanh toán / ký nhận. Nếu sản phẩm không đúng đơn hoặc hư hỏng do vận chuyển, vui lòng từ chối nhận và liên hệ hotline ${SITE.phone} để được đổi mới.`,
      },
    ],
  },

  "chinh-sach-bao-hanh": {
    title: "Chính sách bảo hành",
    intro:
      "Sản phẩm mua tại Hilitek được bảo hành chính hãng theo số serial ghi nhận khi xuất kho. Quý khách không cần giữ hoá đơn giấy — tra cứu bằng số serial in trên tem / thân máy.",
    sections: [
      {
        heading: "1. Cách liên hệ bảo hành",
        bullets: [
          `Nhắn tin qua website, Fanpage hoặc Zalo ${SITE.zalo}.`,
          `Mang sản phẩm trực tiếp đến cửa hàng Hilitek: ${SITE.address}.`,
          "Mang / gửi đến trung tâm bảo hành của hãng hoặc nhà phân phối sản phẩm.",
          `Hotline hỗ trợ kỹ thuật: ${SITE.techPhone}.`,
        ],
      },
      {
        heading: "2. Điều kiện được bảo hành",
        bullets: [
          "Còn trong thời hạn bảo hành (đối chiếu theo thông tin mua hàng và số serial / Service Tag).",
          "Còn tem niêm phong bảo hành hoặc tem của nhà phân phối; với sản phẩm bảo hành theo hộp phải còn đủ hộp và phụ kiện.",
          "Sản phẩm còn nguyên trạng, không trầy xước, cấn móp, biến dạng vượt tiêu chuẩn của hãng / nhà phân phối.",
          "Lỗi phát sinh trong quá trình sử dụng do nhà sản xuất (linh kiện, lỗi kỹ thuật).",
        ],
      },
      {
        heading: "3. Ưu đãi thêm cho khách Hilitek",
        bullets: [
          "Đổi mới ngay trong 30 ngày đầu nếu sản phẩm lỗi do nhà sản xuất và đủ điều kiện.",
          "Khách ráp bộ PC tại Hilitek: đổi mới linh kiện lỗi trong 3 tháng đầu (đủ điều kiện bảo hành).",
          "Hỗ trợ sản phẩm dùng tạm trong thời gian chờ bảo hành (khu vực TP.HCM).",
          "Khách ở tỉnh: gửi sản phẩm về cửa hàng, Hilitek hỗ trợ tiếp nhận và xử lý bảo hành.",
          "Hỗ trợ kỹ thuật online miễn phí trong suốt thời gian còn bảo hành.",
        ],
      },
      {
        heading: "4. Thu đổi linh kiện khi nâng cấp hoặc đổi ý",
        bullets: [
          "Dưới 1 tuần: khấu trừ từ 25% giá trị theo hoá đơn (gear & màn hình từ 30%).",
          "Dưới 1 tháng: khấu trừ từ 30% giá trị theo hoá đơn (gear & màn hình từ 35%).",
          "Trên 1 tháng: khấu trừ từ 35% trở lên (hoặc theo giá thị trường linh kiện cũ).",
          "Sản phẩm không còn hộp: khấu trừ từ 40% trở lên (hoặc theo giá thị trường linh kiện cũ không hộp).",
          "Sản phẩm thu đổi phải còn đủ hộp và phụ kiện. Không áp dụng thu đổi bàn, ghế.",
        ],
      },
      {
        heading: "5. Trường hợp KHÔNG được bảo hành",
        bullets: [
          "Hết thời hạn bảo hành.",
          "Thiếu thiết bị / phụ kiện bắt buộc đi kèm (receiver, adapter…).",
          "Hư hỏng do người dùng: rơi vỡ, cấn móp, vào nước, chập cháy do nguồn điện, dùng sai hướng dẫn.",
          "Đã can thiệp sửa chữa, tháo lắp hoặc thay đổi kết cấu bởi bên thứ ba ngoài Hilitek và hãng.",
          "Số serial / IMEI / Service Tag bị mờ, rách, không trùng khớp hoặc không xác định được.",
          "Hư hỏng do thiên tai, hoả hoạn, động vật, côn trùng, môi trường.",
        ],
      },
      {
        heading: "6. Lưu ý về dữ liệu và phần mềm",
        bullets: [
          "Dữ liệu trong thiết bị (ổ cứng, SSD, thẻ nhớ…) KHÔNG thuộc phạm vi bảo hành — Quý khách vui lòng tự sao lưu trước khi gửi bảo hành. Hilitek không chịu trách nhiệm nếu dữ liệu bị mất / hư hỏng trong quá trình kiểm tra, xử lý.",
          "KHÔNG bảo hành phần mềm (lỗi Windows, phần mềm, game). Khách mang máy đến cửa hàng được hỗ trợ cài lại miễn phí; hỗ trợ tận nơi khu vực TP.HCM có tính phí.",
        ],
      },
      {
        heading: "7. Địa điểm & thời gian tiếp nhận",
        body: `Địa chỉ: ${SITE.address}. Giờ tiếp nhận: ${SITE.workingHours}. Hotline: ${SITE.phone} — Kỹ thuật: ${SITE.techPhone} (Zalo ${SITE.zalo}).`,
      },
    ],
  },

  "chinh-sach-bao-mat": {
    title: "Chính sách bảo mật",
    intro:
      `${SITE.legalName} cam kết bảo mật thông tin cá nhân của Quý khách khi mua sắm tại website ${SITE.name}. Chính sách này giải thích cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ thông tin của Quý khách.`,
    sections: [
      {
        heading: "1. Mục đích và phạm vi thu thập thông tin",
        bullets: [
          "Thông tin cá nhân thu thập: họ tên, địa chỉ, số điện thoại, email.",
          "Thông tin về đơn hàng: tên sản phẩm, số lượng, giá trị, thời gian giao nhận, phương thức thanh toán.",
          "Thông tin xuất hoá đơn (nếu Quý khách yêu cầu): tên công ty, mã số thuế, địa chỉ.",
          "Hilitek chỉ thu thập những thông tin cần thiết cho việc bán hàng, giao hàng và chăm sóc khách hàng.",
        ],
      },
      {
        heading: "2. Phạm vi sử dụng thông tin",
        bullets: [
          "Xử lý đơn hàng, giao hàng, xuất hoá đơn và bảo hành.",
          "Hỗ trợ, tư vấn, chăm sóc khách hàng và giải quyết khiếu nại.",
          "Gửi thông tin khuyến mãi, sản phẩm mới, sự kiện (chỉ khi Quý khách đăng ký nhận).",
          "Nâng cao chất lượng dịch vụ và trải nghiệm mua sắm.",
          "Cung cấp cho cơ quan nhà nước có thẩm quyền khi có yêu cầu hợp pháp.",
        ],
      },
      {
        heading: "3. Thời gian lưu trữ thông tin",
        body:
          "Thông tin cá nhân được lưu trữ cho đến khi Quý khách yêu cầu xoá, hoặc theo thời hạn lưu trữ chứng từ kế toán theo quy định pháp luật.",
      },
      {
        heading: "4. Đối tượng được tiếp cận thông tin",
        bullets: [
          `Nhân viên phụ trách xử lý đơn hàng, giao hàng, bảo hành, kế toán của ${SITE.legalName}.`,
          "Đơn vị vận chuyển: chỉ nhận tên, số điện thoại, địa chỉ nhận hàng để phục vụ giao hàng.",
          "Đối tác thực hiện một phần dịch vụ theo hợp đồng, có ràng buộc bảo mật.",
          "Cơ quan tư pháp (viện kiểm sát, toà án, công an điều tra) khi có yêu cầu hợp pháp.",
        ],
      },
      {
        heading: "5. Đơn vị thu thập và quản lý thông tin",
        body: `${SITE.legalName} — Địa chỉ: ${SITE.address} — Điện thoại: ${SITE.phone} — Website: hilipc.vn — Email: ${SITE.email}.`,
      },
      {
        heading: "6. Tiếp cận và chỉnh sửa dữ liệu cá nhân",
        body:
          `Quý khách có quyền yêu cầu xem, cập nhật hoặc xoá thông tin cá nhân của mình bất kỳ lúc nào. Vui lòng liên hệ email ${SITE.email} hoặc hotline ${SITE.phone} để được hỗ trợ.`,
      },
      {
        heading: "7. Tiếp nhận và giải quyết khiếu nại về thông tin cá nhân",
        body:
          `Hilitek cam kết không bán, cho thuê hoặc chia sẻ thông tin cá nhân của Quý khách cho bên thứ ba vì mục đích thương mại. Mọi thắc mắc, khiếu nại liên quan đến việc thông tin cá nhân bị sử dụng sai mục đích hoặc phạm vi đã thông báo, vui lòng liên hệ hotline ${SITE.phone} hoặc email ${SITE.email}. Trường hợp hệ thống bị tấn công làm lộ dữ liệu, Hilitek sẽ thông báo cho Quý khách và cơ quan chức năng để phối hợp xử lý.`,
      },
    ],
  },

  "chinh-sach-doi-tra": {
    title: "Chính sách đổi trả - hoàn tiền",
    intro:
      "Hilitek hỗ trợ đổi trả trong trường hợp sản phẩm lỗi do nhà sản xuất hoặc giao sai đơn. Vui lòng đọc kỹ điều kiện bên dưới trước khi yêu cầu.",
    sections: [
      {
        heading: "1. Đổi trả trong 30 ngày đầu",
        bullets: [
          "Sản phẩm lỗi kỹ thuật do nhà sản xuất, không phải lỗi người dùng: Hilitek đổi sản phẩm mới đúng loại đã mua.",
          "Hỗ trợ đổi sang sản phẩm khác theo yêu cầu; phần chênh lệch giá trị được thương lượng và thống nhất giữa hai bên.",
          "Giao sai mẫu, sai cấu hình, thiếu phụ kiện, thiếu số lượng so với đơn: đổi / bổ sung trong 24 giờ.",
        ],
      },
      {
        heading: "2. Sản phẩm lỗi do người dùng",
        bullets: [
          "Nếu sản phẩm còn bảo hành được: Hilitek hỗ trợ mang đi bảo hành giúp Quý khách.",
          "Nếu tình trạng quá nặng (bể, vỡ, gãy, cháy, xước, vào nước…) không bảo hành được: Hilitek hỗ trợ gửi hãng sửa chữa, khắc phục (có tính phí). Trường hợp hãng không khắc phục được sẽ gửi lại sản phẩm cho Quý khách.",
        ],
      },
      {
        heading: "3. Điều kiện đổi trả",
        bullets: [
          "Sản phẩm còn đầy đủ vỏ hộp, phụ kiện, quà tặng đi kèm (nếu có).",
          "Tem niêm phong, tem bảo hành, tem của Hilitek còn nguyên vẹn, không rách / tẩy xoá.",
          "Không giải quyết các trường hợp thiếu, mất hoặc hư hỏng vỏ hộp và phụ kiện kèm theo.",
          "Có thông tin đơn hàng (mã đơn / số điện thoại đặt hàng) để đối chiếu.",
        ],
      },
      {
        heading: "4. Trường hợp KHÔNG áp dụng đổi trả",
        bullets: [
          "Sản phẩm đã qua sử dụng, đã cài đặt / kích hoạt bản quyền phần mềm (Windows, Office…).",
          "Hư hỏng do lỗi người dùng, lắp đặt sai, nguồn điện không ổn định.",
          "Không còn hộp / thiếu phụ kiện / mất tem.",
          "Sản phẩm thanh lý, giảm giá sâu có ghi rõ 'không áp dụng đổi trả'.",
        ],
      },
      {
        heading: "5. Cách thức đổi trả",
        bullets: [
          `Liên hệ hotline ${SITE.phone} hoặc Zalo ${SITE.zalo} để thông báo và được hướng dẫn.`,
          `Mang sản phẩm đến trực tiếp cửa hàng (${SITE.address}) hoặc gửi về theo hướng dẫn của nhân viên.`,
          "Hilitek kiểm tra và phản hồi trong vòng 1 – 3 ngày làm việc.",
        ],
      },
      {
        heading: "6. Hoàn tiền",
        bullets: [
          "Áp dụng khi Hilitek không còn sản phẩm để đổi hoặc theo thoả thuận với Quý khách.",
          "Hình thức: chuyển khoản về đúng tài khoản người mua hoặc hoàn tiền mặt tại cửa hàng.",
          "Thời gian: 3 – 7 ngày làm việc kể từ khi hai bên thống nhất.",
          "Phí vận chuyển đổi trả: Hilitek chịu nếu lỗi do Hilitek; Quý khách chịu nếu đổi trả vì lý do cá nhân.",
        ],
      },
    ],
  },

  "quyen-nghia-vu": {
    title: "Quyền và nghĩa vụ của người mua và người bán",
    intro:
      `Nội dung dưới đây quy định quyền và nghĩa vụ của Quý khách (người mua) và ${SITE.legalName} (người bán) khi giao dịch qua website ${SITE.name}.`,
    sections: [
      {
        heading: "1. Nghĩa vụ của người bán",
        bullets: [
          "Tư vấn, cung cấp đầy đủ thông tin về sản phẩm / dịch vụ để người mua hiểu và sử dụng đúng.",
          "Cung cấp hàng hoá đúng loại, đúng số lượng, đúng thời hạn đã thoả thuận sau khi người mua thanh toán đầy đủ.",
          "Giải quyết các thắc mắc, khó khăn của người mua trong quá trình sử dụng sản phẩm.",
          "Cung cấp các chứng từ liên quan: hoá đơn, phiếu bảo hành, phiếu thu / phiếu giao hàng.",
          "Bảo mật thông tin người mua theo Chính sách bảo mật.",
        ],
      },
      {
        heading: "2. Quyền của người bán",
        bullets: [
          "Từ chối hoặc huỷ đơn hàng có dấu hiệu gian lận, thông tin không hợp lệ hoặc vượt khả năng cung ứng.",
          "Yêu cầu người mua đặt cọc với đơn giá trị lớn, đơn đặt trước hoặc đơn giao tỉnh.",
          "Thay đổi giá bán, chương trình khuyến mãi theo từng thời điểm (áp dụng cho đơn phát sinh sau thời điểm thay đổi).",
        ],
      },
      {
        heading: "3. Nghĩa vụ của người mua",
        bullets: [
          "Thực hiện đúng các quy định, quy trình liên quan đến việc mua hàng do người bán công bố.",
          "Cung cấp thông tin đặt hàng (họ tên, số điện thoại, địa chỉ) chính xác.",
          "Thanh toán đầy đủ, đúng hạn theo đơn đặt hàng và phương thức đã chọn.",
          "Kiểm tra hàng khi nhận và phản hồi trong thời hạn quy định nếu có sai sót.",
          "Hỗ trợ, cung cấp thông tin cho người bán khi có yêu cầu hợp lý liên quan đến giao dịch.",
          "Không sử dụng website vào mục đích gian lận, phá hoại hoặc vi phạm pháp luật.",
        ],
      },
      {
        heading: "4. Quyền của người mua",
        bullets: [
          "Được cung cấp đầy đủ thông tin về sản phẩm: tên, xuất xứ, tình trạng, giá, chính sách bảo hành.",
          "Được kiểm tra hàng (đồng kiểm) trước khi thanh toán / nhận hàng.",
          "Được bảo hành, đổi trả theo đúng chính sách đã công bố.",
          "Được bảo mật thông tin cá nhân, khiếu nại và yêu cầu giải quyết khi quyền lợi bị ảnh hưởng.",
        ],
      },
      {
        heading: "5. Giải quyết tranh chấp",
        body:
          `Hai bên ưu tiên thương lượng, hoà giải trên tinh thần thiện chí. Trường hợp không thống nhất được, tranh chấp sẽ được giải quyết tại cơ quan có thẩm quyền theo quy định pháp luật Việt Nam. Mọi phản ánh vui lòng gửi về hotline ${SITE.phone} hoặc email ${SITE.email}.`,
      },
    ],
  },

  "dieu-khoan-website": {
    title: "Điều khoản và điều kiện của website",
    intro:
      `Khi truy cập và mua hàng tại ${SITE.name}, Quý khách đồng ý với các điều khoản dưới đây. ${SITE.legalName} có thể cập nhật điều khoản theo từng thời điểm và công bố tại trang này.`,
    sections: [
      {
        heading: "1. Nguyên tắc chung",
        bullets: [
          "Website hỗ trợ khách hàng tìm hiểu sản phẩm và đặt mua trực tuyến.",
          "Quý khách phải đủ năng lực hành vi dân sự theo quy định pháp luật để thực hiện giao dịch.",
          "Thông tin sản phẩm, giá bán, khuyến mãi có thể thay đổi mà không cần báo trước; đơn hàng được xác nhận qua điện thoại / Zalo trước khi giao.",
        ],
      },
      {
        heading: "2. Thu thập thông tin",
        bullets: [
          "Hilitek thu thập thông tin trực tiếp từ Quý khách qua các cách thức minh bạch và hợp pháp: khi đặt hàng, liên hệ tư vấn, đăng ký nhận tin.",
          "Thông tin bao gồm: tên, thông tin liên hệ, thông tin đơn hàng và cách sử dụng sản phẩm / dịch vụ.",
          "Với khách truy cập trực tuyến, hệ thống có thể ghi nhận địa chỉ IP, loại trình duyệt / hệ điều hành, thời điểm và trang đã truy cập nhằm hoàn thiện website và cải thiện trải nghiệm.",
        ],
      },
      {
        heading: "3. Sử dụng thông tin",
        bullets: [
          "Chỉ sử dụng hoặc tiết lộ thông tin đúng mục đích thu thập, hoặc theo sự đồng ý của Quý khách, hoặc theo quy định pháp luật.",
          "Không chia sẻ thông tin cá nhân của Quý khách cho tổ chức bên ngoài vì mục đích tiếp thị nếu chưa có sự đồng ý.",
          "Quý khách có quyền từ chối nhận thông tin ưu đãi bất kỳ lúc nào.",
          "Thông tin được giữ trong thời gian cần thiết để phục vụ giao dịch và theo quy định pháp luật.",
        ],
      },
      {
        heading: "4. Phương thức bảo vệ thông tin",
        bullets: [
          "Áp dụng các biện pháp bảo vệ an ninh phù hợp với mức độ quan trọng của thông tin, ngăn chặn truy cập, công bố, sửa đổi hoặc sử dụng trái phép.",
          "Với thông tin được chuyển cho nhà cung cấp dịch vụ (vận chuyển…), các đơn vị này có trách nhiệm bảo vệ thông tin theo thoả thuận và chính sách bảo mật của Hilitek.",
        ],
      },
      {
        heading: "5. Quyền sở hữu trí tuệ",
        body: `Toàn bộ nội dung, hình ảnh, logo, thiết kế trên website thuộc sở hữu của ${SITE.legalName} hoặc đối tác. Không sao chép, sử dụng lại cho mục đích thương mại khi chưa được đồng ý bằng văn bản.`,
      },
      {
        heading: "6. Xoá dữ liệu người dùng",
        body:
          `Quý khách có thể yêu cầu xoá thông tin cá nhân của mình bất kỳ lúc nào bằng cách gửi yêu cầu về email ${SITE.email} hoặc hotline ${SITE.phone}. Hilitek sẽ xoá dữ liệu trừ phần bắt buộc phải lưu theo quy định về chứng từ kế toán.`,
      },
      {
        heading: "7. Giới hạn trách nhiệm & luật áp dụng",
        bullets: [
          "Hilitek không chịu trách nhiệm với thiệt hại gián tiếp phát sinh ngoài giá trị đơn hàng.",
          "Hilitek không chịu trách nhiệm với gián đoạn do sự cố kỹ thuật, đường truyền hoặc nguyên nhân bất khả kháng.",
          "Các điều khoản này được điều chỉnh bởi pháp luật Việt Nam; tranh chấp (nếu có) được giải quyết theo quy định pháp luật hiện hành.",
        ],
      },
    ],
  },

  "chinh-sach-kiem-hang": {
    title: "Chính sách kiểm hàng",
    intro:
      "Hilitek khuyến khích Quý khách kiểm tra kỹ hàng hoá trước khi thanh toán hoặc ký nhận, nhằm đảm bảo quyền lợi của cả hai bên.",
    sections: [
      {
        heading: "1. Quý khách được mở hàng kiểm tra",
        body:
          "Quý khách được phép mở kiện hàng để kiểm tra số lượng, chủng loại và chất lượng thực tế của sản phẩm có đúng với thông tin trên website hay không — trước khi ký biên bản nhận hàng và thanh toán.",
      },
      {
        heading: "2. Nội dung cần kiểm tra",
        bullets: [
          "Ngoại quan sản phẩm, hộp, tem niêm phong, tem bảo hành.",
          "Đối chiếu tên sản phẩm, cấu hình, số lượng, phụ kiện, quà tặng so với đơn hàng.",
          "Đối chiếu số serial trên thân máy / tem với phiếu (nếu có).",
        ],
      },
      {
        heading: "3. Lưu ý khi kiểm hàng",
        bullets: [
          "Với sản phẩm còn niêm phong hãng, việc bật nguồn / chạy thử chỉ thực hiện tại cửa hàng hoặc theo thoả thuận, tránh làm mất điều kiện đổi trả.",
          "Không tự ý bóc tem bảo hành, tem chống giả trước khi hoàn tất kiểm tra.",
        ],
      },
      {
        heading: "4. Nếu phát hiện sai lệch / hư hỏng",
        bullets: [
          "Từ chối nhận hàng hoặc ghi chú rõ tình trạng với nhân viên giao hàng.",
          `Chụp ảnh / quay video hiện trạng và liên hệ ngay hotline ${SITE.phone} hoặc Zalo ${SITE.zalo}.`,
          "Hilitek sẽ đổi mới, bổ sung hoặc thu hồi xử lý trong thời gian sớm nhất.",
        ],
      },
      {
        heading: "5. Sau khi ký nhận",
        body:
          "Sau khi Quý khách đã đồng kiểm và ký nhận (hoặc thanh toán đối với đơn COD), các khiếu nại về ngoại quan, thiếu phụ kiện sẽ được xem xét theo Chính sách đổi trả và Chính sách bảo hành.",
      },
    ],
  },

  "chinh-sach-van-chuyen": {
    title: "Chính sách về vận chuyển và giao nhận",
    intro:
      "Hilitek giao hàng toàn quốc qua đội giao hàng của cửa hàng và các đơn vị vận chuyển uy tín. Đơn hàng luôn được xác nhận qua điện thoại / Zalo trước khi giao.",
    sections: [
      {
        heading: "1. Khu vực & phương thức giao hàng",
        bullets: [
          "Nội thành TP.HCM: đội giao hàng của Hilitek, giao trong ngày hoặc trong 24 giờ.",
          "Ngoại thành & các tỉnh: qua đơn vị vận chuyển (Viettel Post, GHN, GHTK, nhà xe…).",
          "Giao hoả tốc nội thành (Grab, Ahamove…) theo yêu cầu, phí do Quý khách chi trả.",
        ],
      },
      {
        heading: "2. Phí vận chuyển",
        bullets: [
          "Miễn phí giao hàng nội thành TP.HCM cho đơn từ 1.000.000đ (theo tuyến giao của cửa hàng).",
          "Ngoại thành / đi tỉnh: phí theo bảng giá của đơn vị vận chuyển và khối lượng / kích thước kiện hàng.",
          "Với đơn đi tỉnh, Quý khách chuyển khoản trước tiền hàng; phí ship thu khi nhận (hoặc theo thoả thuận).",
        ],
      },
      {
        heading: "3. Thời gian giao hàng dự kiến",
        bullets: [
          "Nội thành TP.HCM: trong ngày hoặc 24 giờ kể từ khi xác nhận đơn.",
          "Các tỉnh: 2 – 5 ngày làm việc tuỳ khu vực và đơn vị vận chuyển.",
          "Thời gian có thể thay đổi vào dịp lễ, Tết, cao điểm hoặc do thời tiết, sự cố vận chuyển.",
        ],
      },
      {
        heading: "4. Đóng gói & phân định trách nhiệm",
        bullets: [
          "Hàng hoá được đóng gói chống sốc phù hợp với từng loại sản phẩm; kèm phiếu giao hàng / phiếu bảo hành.",
          "Trong quá trình vận chuyển, đơn vị vận chuyển chịu trách nhiệm về tình trạng bên ngoài kiện hàng và tiến độ giao theo cam kết.",
          "Hàng hư hỏng do vận chuyển: Quý khách từ chối nhận hoặc ghi nhận hiện trạng và liên hệ Hilitek để được đổi mới; Hilitek làm việc với đơn vị vận chuyển để xử lý.",
          `Mọi thắc mắc về vận chuyển vui lòng liên hệ hotline ${SITE.phone}.`,
        ],
      },
    ],
  },
};

/**
 * Danh sách link chính sách hiện ở chân trang (cột "Chính sách").
 * Thêm/bớt/sửa nội dung từng trang trong app quản lý: Website → Cấu hình web → "Trang chính sách".
 * `to` khớp key trong PAGES ở trên (route tự map).
 */
export const POLICY_LINKS = [
  { label: "Chính sách bảo mật", to: "/chinh-sach-bao-mat" },
  { label: "Chính sách bảo hành", to: "/chinh-sach-bao-hanh" },
  { label: "Chính sách giao hàng - kiểm hàng", to: "/chinh-sach-giao-hang" },
  { label: "Chính sách thanh toán", to: "/huong-dan-thanh-toan" },
  { label: "Chính sách đổi trả - hoàn tiền", to: "/chinh-sach-doi-tra" },
  { label: "Quyền và nghĩa vụ của người mua và người bán", to: "/quyen-nghia-vu" },
  { label: "Điều khoản và điều kiện của website", to: "/dieu-khoan-website" },
  { label: "Chính sách kiểm hàng", to: "/chinh-sach-kiem-hang" },
  { label: "Chính sách về vận chuyển và giao nhận", to: "/chinh-sach-van-chuyen" },
];
