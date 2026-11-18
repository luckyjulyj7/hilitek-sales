-- Cơ sở dữ liệu D1 (Cloudflare) thay cho Supabase. Chạy 1 lần khi tạo D1:
--   npx wrangler d1 execute hilitek --remote --file=worker/schema.sql
-- Cấu trúc giống Supabase (supabase/schema.sql + records.sql) để code api/ chạy được không đổi.

-- Hàng nhỏ: mật khẩu (:auth), danh sách bị đá ra (:kicked-accounts), khoá sửa (:edit-locks), sai mật khẩu (:login-fails)...
create table if not exists app_state (
  key text primary key,
  value text,
  updated_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Kho theo TỪNG DÒNG (xem src/lib/records.js). value là chuỗi JSON.
create table if not exists app_records (
  ns text not null,
  coll text not null,
  id text not null,
  value text,
  deleted integer not null default 0,
  writer text not null default '',
  updated_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  primary key (ns, coll, id)
) without rowid;
create index if not exists app_records_ns_updated on app_records (ns, updated_at);

-- Sao lưu: mỗi bản 1 dòng ở app_state_backups, các dòng dữ liệu của bản đó ở backup_rows.
create table if not exists app_state_backups (
  id integer primary key autoincrement,
  taken_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  reason text,
  bytes integer not null default 0,
  value text
);
create table if not exists backup_rows (
  bid integer not null,
  coll text not null,
  id text not null,
  value text,
  primary key (bid, coll, id)
) without rowid;

-- Thống kê lượt truy cập web khách (worker/track.js). CỘNG DỒN theo ngày (giờ Việt Nam), KHÔNG lưu từng lượt,
-- không lưu IP, không mã người dùng. Chạy lại file này an toàn (create ... if not exists).
create table if not exists stats_day (
  day text primary key,            -- YYYY-MM-DD
  views integer not null default 0,   -- lượt xem trang
  visits integer not null default 0,  -- lượt truy cập (phiên khách)
  mobile integer not null default 0,  -- lượt truy cập từ điện thoại
  clicks integer not null default 0   -- lượt bấm sang sàn (Shopee, Lazada, TikTok Shop...)
) without rowid;
create table if not exists stats_page (
  day text not null,
  path text not null,
  kind text not null,              -- product | category | article | other
  title text,
  views integer not null default 0,
  primary key (day, path)
) without rowid;
create table if not exists stats_ref (
  day text not null,
  src text not null,               -- google | facebook | zalo | tiktok | youtube | direct | other:<tên miền>
  n integer not null default 0,
  primary key (day, src)
) without rowid;
-- (stats_click: bản đầu tiên, không còn dùng; số bấm sàn nằm trong stats_event.)
create table if not exists stats_hour (  -- lượt xem theo giờ Việt Nam
  day text not null,
  h integer not null,
  n integer not null default 0,
  primary key (day, h)
) without rowid;
create table if not exists stats_land (  -- trang khách mở đầu tiên của lượt truy cập mới
  day text not null,
  path text not null,
  n integer not null default 0,
  primary key (day, path)
) without rowid;
create table if not exists stats_event (  -- hành động theo trang: click:shopee|lazada|tiktok|tiki|other, act:cart|zalo|phone|messenger
  day text not null,
  ev text not null,
  path text not null,
  n integer not null default 0,
  primary key (day, ev, path)
) without rowid;
create table if not exists stats_search (  -- từ khoá khách gõ vào ô tìm kiếm của web; zero = số lần không có kết quả
  day text not null,
  q text not null,
  n integer not null default 0,
  zero integer not null default 0,
  primary key (day, q)
) without rowid;
