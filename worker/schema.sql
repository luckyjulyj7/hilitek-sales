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
