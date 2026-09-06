-- ══════════════════════════════════════════════════════════════════════
--  SAO LƯU TỰ ĐỘNG  (bảng "app_state_backups")
--  Chạy file này trong Supabase → SQL Editor → Run.
--
--  Mỗi lần Vercel Cron chạy (/api/cron/backup) sẽ chèn 1 hàng = bản chụp
--  toàn bộ blob app_state tại thời điểm đó. Giữ lại N bản mới nhất (mặc định 60).
-- ══════════════════════════════════════════════════════════════════════

create table if not exists public.app_state_backups (
  id        bigint generated always as identity primary key,
  taken_at  timestamptz not null default now(),
  reason    text not null default 'cron',
  bytes     integer not null default 0,
  value     text not null
);

create index if not exists idx_app_state_backups_taken_at
  on public.app_state_backups (taken_at desc);

comment on table public.app_state_backups is
  'Bản sao lưu blob app_state theo thời gian. CHỈ service_role đọc/ghi (không mở cho anon).';

-- Bật RLS và KHÔNG tạo policy cho anon => khoá anon (nằm trong bundle web) không
-- đọc/ghi được bảng này. Chỉ SUPABASE_SERVICE_ROLE_KEY (bỏ qua RLS) dùng được —
-- đó là lý do /api/cron/backup cần biến môi trường SUPABASE_SERVICE_ROLE_KEY.
alter table public.app_state_backups enable row level security;
revoke all on public.app_state_backups from anon;

-- Khôi phục thủ công (khi cần): xem các bản có sẵn
--   select id, taken_at, reason, bytes from public.app_state_backups order by taken_at desc;
-- rồi ghi đè blob hiện tại bằng 1 bản (THẬN TRỌNG — mất dữ liệu mới hơn):
--   update public.app_state
--     set value = (select value from public.app_state_backups where id = <ID>),
--         updated_at = now()
--   where key = 'solbh-data-v2';
