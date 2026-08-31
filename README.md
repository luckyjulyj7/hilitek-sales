# Hilitek — Quản lý bán hàng (web app)

Dự án web thật dựng lại từ bản đặc tả `../quan-ly-ban-hang (1).jsx` (chạy trong Claude Artifact).
Xem `../README-MIGRATION.md` để hiểu bối cảnh và toàn bộ nghiệp vụ.

## Stack

| Thành phần | Công nghệ |
|---|---|
| Build tool | Vite 5 |
| Framework | React 18 |
| Styling | Tailwind CSS 3 (build chuẩn qua PostCSS) |
| Icon / biểu đồ / Excel | `lucide-react`, `recharts`, `xlsx` |
| Lưu trữ | Supabase (1 blob JSON) khi có `.env`, không thì `localStorage` — `src/lib/storage.js` |

## Phân quyền tài khoản

- **Tài khoản chủ** (`isOwner`) — cấp cao nhất, đúng 1 tài khoản. Seed = `admin`; dữ liệu cũ
  chưa có cờ này thì `ensureOwner()` tự gán cho tài khoản username `admin` (không có thì
  tài khoản đầu tiên). Chủ luôn ở vai trò admin + đang hoạt động, không đổi được.
- **QTV** (vai trò `admin` không phải chủ) — quản lý được mọi tài khoản khác **trừ tài
  khoản chủ**: không thấy, không sửa, không khoá, không xoá. Không thấy "Vùng nguy hiểm"
  (đặt lại dữ liệu giao dịch) — mục đó chỉ chủ thấy.
- **staff / ctv** — như cũ.
- **Trang "Tài khoản cá nhân"** (`MyProfile`) — mọi vai trò đều có, chỉ sửa chính mình:
  đổi họ tên + đổi mật khẩu (phải nhập đúng mật khẩu hiện tại; mật khẩu mới ≥ 6 ký tự).

## Chạy

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview  # xem thử bản build
```

Đăng nhập lần đầu: **admin / admin123** (tài khoản seed, xem `seedAccounts()` trong `src/SalesManager.jsx`).

## Cấu trúc

```
hilitek-app/
├── index.html              # nạp 3 Google Fonts: Fraunces / Inter / IBM Plex Mono
├── src/
│   ├── main.jsx              # entry — initStorage() rồi mount <SalesManager/> (hoặc màn lỗi)
│   ├── index.css             # @tailwind base/components/utilities
│   ├── SalesManager.jsx      # BẢN COPY NGUYÊN của file .jsx gốc (~11k dòng, chưa tách)
│   └── lib/
│       ├── storage.js        # chọn backend: localStorage <-> Supabase, + initStorage()
│       └── supabaseStorage.js # backend Supabase (1 blob JSON) + healthCheck()
├── supabase/
│   └── schema.sql           # tạo bảng app_state + RLS — chạy trong Supabase SQL Editor
├── .env.example             # mẫu VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

### Vì sao `SalesManager.jsx` vẫn là 1 file lớn

Quyết định giai đoạn 1: copy nguyên xi, chỉ đổi lớp lưu trữ, để app chạy được trước đã.
File gốc **không bị sửa nội dung** — chỉ khác ở chỗ `window.storage` giờ do shim cung cấp.
Việc tách thành `src/components/*`, `src/lib/*`, `src/constants.js`... để làm sau, khi cần bảo trì.

## Lớp lưu trữ — cách chọn backend

`src/lib/storage.js` → `initStorage()` (gọi 1 lần ở `main.jsx`) chọn backend theo `.env`:

| Điều kiện | Backend | Ghi chú |
|---|---|---|
| Không có `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | **localStorage** | Giai đoạn 1, mặc định |
| Có đủ 2 biến trên | **Supabase** (1 blob JSON) | Health-check trước khi mount app |

Cả 2 backend đều cài `window.storage` với đúng chữ ký bản gốc gọi, nên
`loadData()` / `saveData()` trong `SalesManager.jsx` **không phải sửa**:

```js
await window.storage.get(key, shared)   // -> { value: "<chuỗi JSON>" } | null
await window.storage.set(key, value, shared)
```

`shared` bị bỏ qua ở cả hai. Dữ liệu là 1 blob JSON (ghi sau mỗi thay đổi, debounce 400ms —
logic ở cuối `SalesManager.jsx`), key `solbh-data-v2` + marker `solbh-data-v2:shared-migrated`.

### Phiên đăng nhập tách theo thiết bị (`withDeviceSession`)

Bản gốc lưu `session.userId` (ai đang đăng nhập) **chung trong blob**. Với Supabase blob
là 1 hàng dùng chung → ai mở link cũng nhận phiên của người đăng nhập gần nhất, **vào
thẳng không cần mật khẩu**. Wrapper `withDeviceSession` trong `storage.js` chặn điều này:

- Khi **ghi** blob: rút `session.userId` ra `localStorage["hilitek:session-userId"]` của
  máy hiện tại, rồi ghi phần còn lại lên backend với `session.userId = null`.
- Khi **đọc** blob: ghép `session.userId` từ localStorage máy này vào.

Kết quả: mỗi trình duyệt tự nhớ mình đăng nhập ai; mở link ở máy lạ → hiện màn đăng nhập.
`SalesManager.jsx` vẫn không phải sửa. (Giải pháp đúng bài về sau: Supabase Auth.)

### Giai đoạn 1 — localStorage (đang mặc định)

Dữ liệu ở `localStorage["hilitek:solbh-data-v2"]`. **Giới hạn:** chỉ 1 trình duyệt / 1 máy;
xoá cache là mất; không đồng bộ nhiều người.

### Giai đoạn 2 — Supabase (1 blob JSON), đã scaffold sẵn

Bật lên bằng 4 bước (không cần đụng code):

1. Tạo project ở https://supabase.com (Free tier đủ).
2. **SQL Editor → chạy toàn bộ `supabase/schema.sql`** → tạo bảng `app_state` + RLS.
3. **Settings → API** → copy *Project URL* + *anon public key*.
   Copy `.env.example` thành `.env`, điền `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`.
4. `npm run dev` lại. Console in `[storage] Supabase`. Nếu sai key / chưa chạy SQL,
   app hiện **màn "Lỗi khởi tạo lưu trữ"** thay vì mount (cố ý — tránh rơi về seedData
   rồi auto-save đè mất dữ liệu cloud).

**Chuyển dữ liệu localStorage → Supabase:** mở app (đang ở chế độ localStorage),
DevTools Console: `copy(localStorage["hilitek:solbh-data-v2"])`. Trong Supabase
Table Editor, insert 1 hàng `app_state`: `key = solbh-data-v2`, `value =` (dán chuỗi vừa copy).
Thêm hàng `key = solbh-data-v2:shared-migrated`, `value = 1`.

**Bảo mật:** anon key nằm trong bundle JS phía client → ai có key cũng đọc/ghi được
bảng `app_state` (RLS đang mở cho `anon`). Chấp nhận được cho nội bộ/demo. Dùng thật
nên chuyển `accounts` sang **Supabase Auth** rồi siết policy theo `auth.uid()`
(README-MIGRATION.md mục 4).

### Nâng cấp sau: bảng chi tiết theo từng entity

Hướng blob hiện tại không query/báo cáo server-side được. Khi cần, tách `app_state`
thành 18 bảng (products, orders, customers, suppliers, purchaseOrders, quotations,
stocktakes, warrantyTickets, repairTickets, helpdeskTickets, shippingTickets, plans,
accounts, activityLog, notifications, categories, brands, printSettings) — dùng các
hàm `normalizeX()` trong `SalesManager.jsx` làm schema, JSONB cho trường lồng nhau,
rồi viết lại `loadData()`/`saveData()` bằng `supabase.from(...).select()/.upsert()`.

### Deploy

Vercel, nối GitHub repo để auto-deploy. Đặt `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
trong Project Settings → Environment Variables.

## Nghiệp vụ cần giữ nguyên khi refactor

Xem `../README-MIGRATION.md` mục 5 — phân quyền 3 vai trò, giá bán tối thiểu theo vai trò,
4 mức VAT (giá đã gồm thuế), tồn kho tính động từ `movements[]`, quản lý serial,
khoá trạng thái đơn 1 chiều, phiếu bảo hành 4 trạng thái, in ấn qua `window.open()` + Blob.

## Đã kiểm tra

- `npm run build` OK (bundle ~1.6MB / 458KB gzip — chưa code-split, để sau).
- `npm run dev` (chế độ localStorage, chưa có `.env`): đăng nhập admin, Tổng quan,
  Sản phẩm & Tồn kho (có seed data), Bán hàng, Báo cáo — không lỗi console,
  dữ liệu ghi xuống `localStorage`.
- Backend Supabase: code + schema + health-check đã xong, **chưa test với project thật**
  (cần bạn tạo project + dán key theo 4 bước ở trên).
