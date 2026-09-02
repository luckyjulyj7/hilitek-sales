# 🔌 Nối website bán hàng với app quản lý

## Đường dẫn sau khi deploy

| Đường dẫn | Trang |
|---|---|
| `/`  và  `/admin` | **App quản lý bán hàng** (đăng nhập) |
| `/shop` | **Website bán hàng cho khách** — đang để riêng, CHƯA công khai ở `/` |
| `/api/web/*` | API |

> Khi muốn web khách lên trang chủ `/`: đổi nội dung 2 file `index.html` ↔ `shop.html`
> (đang: `index.html` = quản lý, `shop.html` = web khách), rồi push lại.

---

Website khách và app quản lý **dùng chung 1 database Supabase**.
Website đọc dữ liệu qua các Serverless Function trong `api/web/` (chạy phía server
Vercel — web khách không giữ khoá Supabase nào).

## 1. API đã có

| Endpoint | Việc |
|---|---|
| `GET /api/web/products` | Danh sách sản phẩm đã bật **"Đăng web"** (đã bỏ giá vốn, giá sỉ, NCC, tồn kho chi tiết) |
| `GET /api/web/product/:slug` | Chi tiết 1 sản phẩm (kèm mô tả web + thông số web) |
| `POST /api/web/orders` | Nhận đơn từ web → ghi vào app quản lý, `channel:"online"`, tag **"Đặt hàng website"**, trạng thái chờ duyệt |
| `GET /api/web/config` | Thông tin hiển thị chủ shop chỉnh từ app quản lý (đọc `state.webConfig`) |

## 2. Cần làm 1 lần trên Vercel

**Project Settings → Environment Variables** (cả Production và Preview):

| Biến | Giá trị |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → **service_role** (secret) |
| `SUPABASE_URL` | *(tuỳ chọn — bỏ trống thì tự lấy `VITE_SUPABASE_URL` đã có)* |

> Nếu không đặt `SUPABASE_SERVICE_ROLE_KEY`, API tạm dùng `VITE_SUPABASE_ANON_KEY`
> (vẫn chạy vì RLS đang mở). Nên đặt service_role cho chặt chẽ.

Sau khi thêm biến → **Redeploy**.

## 3. Quản lý website — menu **"Website"** trong app quản lý (chỉ admin)

3 mục con:

### a) Sản phẩm web
Bảng tất cả sản phẩm với:
- ☑️ **Đăng web** — tick/bỏ tick để hiện/ẩn trên web.
- **Giá web (đỏ)** — giá bán hiển thị. Bỏ trống = dùng giá bán lẻ.
- **Giá so sánh** — giá gạch bỏ. Bỏ trống = không hiện gạch.
- Nút **"Nội dung"** mở ô nhập:
  - **Mô tả sản phẩm (web)** — xuống dòng đôi = đoạn mới; dòng `- ` = gạch đầu dòng.
  - **Thông số kỹ thuật (web)** — mỗi dòng `Nhãn | Giá trị`:
    ```
    Chuẩn | M.2 2280 NVMe
    Dung lượng | 1 TB
    ```
  - **Khối lượng (gram)** — tính phí ship.
  - **Slug** — đường dẫn web (bỏ trống = tự tạo).
- Với sản phẩm **có phiên bản** (màu sắc...): mô tả & thông số **áp chung cho cả nhóm**;
  giá / giá so sánh / SKU / khối lượng / tồn kho **riêng từng phiên bản**.

> Khối lượng cũng có trong **Sản phẩm & Tồn kho → form sản phẩm** (ô "Khối lượng (gram)").

### b) Đơn hàng web
Danh sách đơn khách đặt trên website (`channel:online` / tag "Đặt hàng website").
Bấm **"Mở"** để xử lý trong tab **Bán hàng** (xác nhận, phí ship, giao hàng).

### c) Cấu hình web
Sửa nội dung hiển thị trên web **không cần đụng file code**:
- **Liên hệ**: SĐT, hotline, Zalo, Messenger, email, địa chỉ, giờ làm việc, Facebook.
- **Tài khoản ngân hàng** (dùng cho trang thanh toán + bước đặt hàng).
- **Flash Sale**: bật/tắt + ngày kết thúc.
- **Poster / banner trang chủ**: URL ảnh + link (ảnh để trong `public/posters/` hoặc host ngoài).
- **Trang chính sách**: sửa trực tiếp *Hướng dẫn thanh toán*, *Chính sách giao hàng*,
  *Chính sách bảo hành* — tiêu đề, mô tả, và nội dung theo định dạng:
  `## Tiêu đề mục` · `- gạch đầu dòng` · dòng thường = đoạn văn · dòng trống ngăn các mục.
- **Danh mục sản phẩm web (menu)**: thêm/sửa/xoá nhóm, đổi icon, và danh mục con của
  mỗi nhóm (mỗi dòng 1 tên). ⚠️ Tên danh mục con phải **khớp "Nhóm hàng"** của sản phẩm.
  Bấm **"Lưu danh mục"** để áp dụng. **"Khôi phục mặc định"** để quay về cây gốc.

**Đưa sản phẩm vào danh mục nào** = đặt **"Nhóm hàng"** của sản phẩm (ở *Sản phẩm & Tồn kho*
hoặc form sửa sản phẩm) trùng với tên danh mục con trong menu.

Bỏ trống 1 ô = web dùng giá trị mặc định trong `src/storefront/config.js`.
Web đọc mục này qua `/api/web/config` mỗi lần tải trang → lưu xong vài giây web tự cập nhật.

- **Tên nhóm hàng** của sản phẩm nên trùng danh mục con trong `MENU`
  (`src/storefront/config.js`) để nó nằm đúng nhóm trên trang chủ. Không trùng thì
  vẫn hiện ở trang "Tất cả sản phẩm" và tìm kiếm.
- Ảnh sản phẩm: dùng ảnh chính + ảnh phụ trong form (như cũ) — web lấy tự động.
- Bảo hành / tồn kho / SKU: lấy từ dữ liệu quản lý, không cần nhập lại.

## 4. Đơn hàng từ web

Khách đặt trên web → đơn xuất hiện trong **Đơn hàng** của app quản lý:
- `channel = online`, tag **"Đặt hàng website"**, trạng thái **chờ duyệt**.
- Thông tin khách + địa chỉ giao nằm trong phần địa chỉ giao hàng + ghi chú đơn.
- Nhân viên xác nhận, tính phí ship, chốt đơn như đơn thường.

## 5. Chưa nối / để sau

- Tra cứu bảo hành online (`api/web/warranty.js`).
- Màn hình "Cấu hình web" trong app quản lý để sửa liên hệ/poster/flash sale
  (hạ tầng `/api/web/config` + override phía web đã sẵn — chỉ thiếu UI nhập trong
  SalesManager; tạm thời vẫn sửa trong `src/storefront/config.js`).
- Xử lý xung đột ghi (2 người sửa cùng lúc) — hiện là "ghi sau đè ghi trước".
