# 📘 Hướng dẫn sửa nội dung website Hilitek

Tài liệu này liệt kê **sửa cái gì thì mở file nào**. Hầu hết nội dung chữ nằm
trong **một file duy nhất**: `src/storefront/config.js`.

> ⚠️ `config.js` là file code. Sửa **giá trị trong dấu ngoặc kép** thì an toàn,
> nhưng đừng xoá dấu `,` `"` `{` `}` `[` `]` — sai một ký tự là web không chạy.
> Sửa xong phải **đẩy lên GitHub → Vercel tự deploy lại** mới thấy thay đổi.

---

## 🗂️ Bản đồ nhanh

| Muốn sửa | Mở file | Mục |
|---|---|---|
| 📞 SĐT, hotline, Zalo, Messenger, email, địa chỉ, giờ làm việc | `src/storefront/config.js` | `SITE` |
| 🔗 Link Shopee / TikTok / YouTube / Fanpage / Zalo OA | `src/storefront/config.js` | `SITE.socials` |
| 🏦 Tài khoản ngân hàng, MST, tên công ty | `src/storefront/config.js` | `SITE.bank`, `SITE.taxCode`, `SITE.legalName` |
| 🗺️ Google Map | `src/storefront/config.js` | `SITE.mapEmbedUrl`, `SITE.mapLink` |
| 🖼️ Logo + favicon (icon tab trình duyệt) | thư mục `public/` | xem mục [🖼️ Logo](#-logo--favicon) |
| 🧭 5 nhóm danh mục lớn + icon nhóm | `src/storefront/config.js` | `MENU` |
| 🧭 Các link trên thanh nav (Hướng dẫn thanh toán…) | `src/storefront/config.js` | `SUPPORT_LINKS` |
| 🖼️ Poster / banner trang chủ | `src/storefront/config.js` + `public/posters/` | `HOME_POSTERS` |
| ⚡ Flash Sale (bật/tắt, ngày kết thúc) | `src/storefront/config.js` | `FLASH_SALE` |
| 🛡️ Khối cam kết + banner dọc + giao hàng ở trang sản phẩm | `src/storefront/config.js` | `PRODUCT_SIDEBAR` |
| 📄 Nội dung 3 trang: Hướng dẫn thanh toán / Chính sách giao hàng / Chính sách bảo hành | `src/storefront/config.js` | `PAGES` |
| 🧾 Khối bên phải trang Đặt hàng (ghi chú, điều khoản, hotline gấp) | `src/storefront/config.js` | `CHECKOUT` |
| 📝 Mô tả & thông số sản phẩm | (tạm) `src/storefront/data/mockCatalog.js` → sau này: **app quản lý bán hàng** | |

---

## 📞 Thông tin liên hệ — `SITE`

```js
export const SITE = {
  phone: "0939 206 868",            // hiện ở header, chân trang, nút gọi
  phoneRaw: "0939206868",           // dùng cho nút bấm gọi — CHỈ chữ số
  hotlines: [                       // thêm dòng nếu có nhiều số
    { label: "HOTLINE", number: "0939 206 868", raw: "0939206868" },
  ],
  zalo: "0939 206 865",
  zaloHref: "https://zalo.me/0939206865",
  messengerHref: "https://m.me/HiLiPC627A",
  email: "hilitekcom3005@gmail.com",
  address: "6/27A Đường Số 3, C/x Lữ Gia, Phường Phú Thọ, TP Hồ Chí Minh, Việt Nam",
  workingHours: "8:00 – 21:00, cả T7 & CN",
  facebookHref: "https://www.facebook.com/HiLiPC627A",
};
```

### 🔗 Kênh bán hàng — `SITE.socials`
Điền `href` thật. Chỗ nào còn `"C<...>"` sẽ hiện **mờ** (chưa có link).

```js
socials: [
  { kind: "facebook", label: "Fanpage",     href: "https://www.facebook.com/HiLiPC627A" },
  { kind: "zalo",     label: "Zalo OA",      href: "C<link Zalo OA>" },
  { kind: "shopee",   label: "Shopee",       href: "C<link Shopee>" },
  { kind: "tiktok",   label: "TikTok Shop",  href: "C<link TikTok>" },
  { kind: "youtube",  label: "YouTube",      href: "C<link YouTube>" },
],
```

### 🏦 Ngân hàng — `SITE.bank`
Hiện ở trang *Hướng dẫn thanh toán* và cột phải trang *Đặt hàng*.

```js
bank: {
  name: "ACB (Ngân hàng Á Châu)",
  accountNumber: "19551097",
  branch: "Phòng giao dịch Lý Thường Kiệt",
  holder: "CÔNG TY TNHH TM DV HILI",
},
```

### 🗺️ Google Map — `SITE.mapEmbedUrl`
Đang nhúng theo địa chỉ. Muốn ghim đúng toạ độ: mở Google Maps → **Share → Embed a map**
→ copy đoạn URL trong `src="..."` → dán vào `mapEmbedUrl`.

---

## 🖼️ Logo + favicon

Chép file vào thư mục **`public/`**:

| File | Dùng cho |
|---|---|
| `public/logo.png` | Logo ở header + chân trang **và** icon tab trình duyệt (favicon) |
| `public/favicon.ico` hoặc `public/favicon.png` | (tuỳ chọn) icon tab riêng, 32×32 hoặc 48×48 |

- Chấp nhận `logo.png` / `.jpg` / `.webp` / `.svg`. Đổi định dạng thì sửa
  `SITE.logo.src` trong `config.js`.
- Nếu logo đã có sẵn chữ "Hilitek": đặt `SITE.logo.wordmark = false`.
- Chưa có file → tạm hiện bản vẽ vector `logo.svg` + chữ "Hilitek".

---

## 🖼️ Poster / banner trang chủ — `HOME_POSTERS`

1. Chép ảnh vào `public/posters/` (vd `public/posters/hero.jpg`).
2. Điền vào `config.js`:

```js
export const HOME_POSTERS = {
  hero: { w: 892, h: 460, label: "Poster chính",
          image: "/posters/hero.jpg",              // <-- thêm dòng này
          href: "#/danh-muc?sort=discount" },      // <-- link khi bấm vào (tuỳ chọn)
  side: [ ... ],
  strip: [ ... ],
};
```

- `image` để trống = hiện khung xám ghi kích thước.
- `href` có thể là `#/danh-muc?group=Gaming Gear`, `#/san-pham/<slug>`, hoặc link ngoài `https://...`.

---

## ⚡ Flash Sale — `FLASH_SALE`

```js
export const FLASH_SALE = {
  enabled: true,          // false = ẩn hẳn dải flash sale
  endsAt: "2026-09-15T23:59:59",   // ngày giờ kết thúc; để "" = tự đặt +2 ngày
};
```

---

## 🧭 Danh mục — `MENU`

5 nhóm lớn + danh mục con + **icon nhóm**. `icon` là tên icon của thư viện
[lucide](https://lucide.dev/icons) — muốn thêm icon mới phải khai báo trong
`src/storefront/components/groupIcons.js`.

```js
{
  group: "Linh kiện PC",
  slug: "linh-kien-pc",
  icon: "Cpu",
  columns: [
    { heading: "Bo mạch & xử lý", items: ["Mainboard", "CPU", "RAM"] },
    ...
  ],
},
```

> ⚠️ Tên danh mục con (`items`) phải **khớp** với trường `category` của sản phẩm
> thì sản phẩm mới nằm đúng nhóm.

---

## 📄 Trang chính sách — `PAGES`

3 trang: `huong-dan-thanh-toan`, `chinh-sach-giao-hang`, `chinh-sach-bao-hanh`.
Mỗi trang: `title`, `intro`, `sections`. Mỗi mục (`section`):

```js
{
  heading: "1. Tiêu đề mục",
  body: "Một đoạn văn.",              // hoặc mảng nhiều đoạn: ["đoạn 1", "đoạn 2"]
  bullets: ["gạch đầu dòng 1", "..."], // tuỳ chọn
}
```

Trang *Hướng dẫn thanh toán* còn có `bank` (thẻ tài khoản ngân hàng) — tự lấy từ `SITE.bank`.

---

## 🛡️ Cột phải trang sản phẩm — `PRODUCT_SIDEBAR`

```js
export const PRODUCT_SIDEBAR = {
  commitmentsTitle: "Bảo hành chính hãng — Yên tâm mua hàng",
  commitments: [
    { icon: "BadgeCheck", text: "Cam kết hàng chính hãng, đủ hoá đơn VAT" },
    ...
  ],
  banner: { image: "", href: "", w: 300, h: 520 },   // banner dọc — ảnh vào public/posters/
  shippingTitle: "Giao hàng & thanh toán",
  shipping: ["dòng 1", "dòng 2", ...],
  payments: ["Tiền mặt", "Chuyển khoản", "VISA", ...],
};
```

---

## 🧾 Trang Đặt hàng — `CHECKOUT`

Sửa ghi chú, câu điều khoản, hotline hỗ trợ gấp… trong mục `CHECKOUT` của `config.js`.
Danh sách Tỉnh/Phường-Xã lấy từ `src/storefront/data/vnAddress.js` (đồng bộ với app quản lý).

---

## 📝 Sản phẩm (tên, giá, ảnh, mô tả, thông số, tồn kho)

Quản lý toàn bộ trong **app quản lý bán hàng** (`/quanlybanhang`) → **Sản phẩm → Sửa/Thêm**:
- Giá / tồn kho / SKU / bảo hành / ảnh: như bình thường.
- Khối **"Đăng sản phẩm này lên website bán hàng"** ở cuối form: tick để lên web,
  + Giá web (bỏ trống = giá bán lẻ), Mô tả web, Thông số web (`Nhãn | Giá trị`).
- Lưu xong web tự cập nhật. Chi tiết: xem `API-WEB.md`.

> Cần đặt biến `SUPABASE_SERVICE_ROLE_KEY` trên Vercel 1 lần — xem `API-WEB.md` mục 2.
> Khi chạy `npm run dev` ở máy (không có API), web tự dùng dữ liệu mẫu
> `src/storefront/data/mockCatalog.js` để xem giao diện.

---

## 🚀 Sau khi sửa xong

```bash
git add -A
git commit -m "Cập nhật nội dung"
git push
```

Vercel sẽ tự build và cập nhật website sau 1–2 phút.
