-- ============================================================================
-- Hilitek — Quản lý bán hàng · Supabase schema (giai đoạn 2, hướng "1 blob JSON")
-- Chạy toàn bộ file này trong Supabase Dashboard -> SQL Editor -> New query -> Run.
-- ============================================================================

-- Toàn bộ state của app (products, orders, customers, ...) lưu trong 1 hàng duy
-- nhất: key = 'solbh-data-v2', value = chuỗi JSON.stringify(...) do saveData() tạo.
-- Hàng thứ 2: key = 'solbh-data-v2:shared-migrated', value = '1' (marker migrate).
create table if not exists public.app_state (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);

comment on table public.app_state is
  'Blob JSON của app quản lý bán hàng Hilitek — 1 hàng cho toàn bộ dữ liệu (key solbh-data-v2).';

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
-- CHƯA có Supabase Auth: app dùng anon key và tự quản lý đăng nhập (SHA-256 trong
-- bảng `accounts` nằm trong blob). Vì vậy tạm mở toàn quyền cho vai trò `anon`.
--
-- ⚠️  BẢO MẬT: bất kỳ ai có anon key (nó nằm trong bundle JS phía client) đều
--     đọc/ghi được bảng này. Chấp nhận được cho nội bộ / demo. Khi đưa vào dùng
--     thật nên chuyển sang Supabase Auth rồi siết policy theo auth.uid()
--     (xem README-MIGRATION.md mục 4 dòng `accounts`).
alter table public.app_state enable row level security;

drop policy if exists "anon full access app_state" on public.app_state;
create policy "anon full access app_state"
  on public.app_state
  for all
  to anon
  using (true)
  with check (true);

-- Tự cập nhật updated_at mỗi lần ghi (phòng khi client quên set).
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_app_state_touch on public.app_state;
create trigger trg_app_state_touch
  before insert or update on public.app_state
  for each row execute function public.touch_updated_at();
