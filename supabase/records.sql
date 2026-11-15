-- =====================================================================================
-- Kho dữ liệu theo TỪNG DÒNG (15/11/2026) — thay cho 1 khối "solbh-data-v2" ~4 MB.
-- Chạy 1 lần: Supabase -> SQL Editor -> dán toàn bộ file này -> Run.
-- An toàn khi chạy lại (if not exists / or replace). KHÔNG xoá hay sửa bảng app_state cũ.
-- Sau khi chạy, lần đầu trang quản lý mở (bản code mới), máy chủ tự chép dữ liệu từ khối cũ sang
-- bảng này. Khối cũ giữ nguyên làm bản dự phòng.
-- =====================================================================================

create table if not exists public.app_records (
  ns          text        not null,              -- tên kho (solbh-data-v2; bản thử: solbh-data-v2-devtest)
  coll        text        not null,              -- products, orders, ... | _doc | _order
  id          text        not null,
  value       jsonb,                             -- null khi đã xoá
  deleted     boolean     not null default false,
  writer      text        not null default '',   -- mã tab đã ghi (để tab đó khỏi tải lại chính dòng mình ghi)
  updated_at  timestamptz not null default clock_timestamp(),
  primary key (ns, coll, id)
);

create index if not exists idx_app_records_ns_updated on public.app_records (ns, updated_at desc);

-- Mốc thời gian luôn do máy chủ đặt, theo đúng thời điểm ghi từng dòng.
create or replace function public.app_records_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at := clock_timestamp();
  return new;
end $$;

drop trigger if exists trg_app_records_touch on public.app_records;
create trigger trg_app_records_touch
  before insert or update on public.app_records
  for each row execute function public.app_records_touch();

-- Chỉ máy chủ (service_role) được đọc/ghi. Trình duyệt không bao giờ chạm thẳng bảng này.
alter table public.app_records enable row level security;
revoke all on public.app_records from anon, authenticated;

-- -------------------------------------------------------------------------------------
-- Ghép lại thành 1 khối JSON giống định dạng cũ (dùng cho sao lưu, khôi phục).
-- Chạy ngay trong Postgres nên KHÔNG tốn egress.
-- -------------------------------------------------------------------------------------
create or replace function public.app_records_state(p_ns text)
returns jsonb language sql stable as $$
  with recs as (
    select coll, id, value from public.app_records
    where ns = p_ns and not deleted and value is not null
  ),
  ord as (
    select r.id as coll, e.x as id, e.pos
    from recs r, jsonb_array_elements_text(case when jsonb_typeof(r.value) = 'array' then r.value else '[]'::jsonb end)
         with ordinality as e(x, pos)
    where r.coll = '_order'
  ),
  arr as (
    select r.coll, jsonb_agg(r.value order by coalesce(o.pos, 9223372036854775807), r.id) as v
    from recs r left join ord o on o.coll = r.coll and o.id = r.id
    where r.coll not in ('_doc', '_order', '_sys')
    group by r.coll
  ),
  docs as (select id as k, value as v from recs where coll = '_doc')
  select coalesce(jsonb_object_agg(k, v), '{}'::jsonb)
  from (select coll as k, v from arr union all select k, v from docs) t;
$$;

-- Sao lưu: chụp kho (kèm hàng mật khẩu <ns>:auth dưới "__auth") vào app_state_backups.
-- Bỏ qua nếu không có dòng nào đổi kể từ bản sao lưu gần nhất (trừ khi p_force).
-- Dọn luôn dòng đã xoá quá 30 ngày và bản sao lưu cũ (giữ p_keep bản).
create or replace function public.app_records_backup(p_ns text, p_reason text default 'cron', p_keep int default 60, p_force boolean default false)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  last_taken timestamptz;
  last_change timestamptz;
  st jsonb;
  auth_txt text;
  v text;
  pruned int := 0;
begin
  select max(taken_at) into last_taken from app_state_backups;
  select max(updated_at) into last_change from app_records where ns = p_ns;
  if last_change is null then
    return jsonb_build_object('ok', false, 'error', 'Chưa có dữ liệu trong app_records');
  end if;
  if not p_force and last_taken is not null and last_change <= last_taken then
    return jsonb_build_object('ok', true, 'skipped', 'Dữ liệu chưa đổi kể từ bản sao lưu gần nhất');
  end if;
  st := app_records_state(p_ns);
  select value into auth_txt from app_state where key = p_ns || ':auth';
  if auth_txt is not null then
    begin st := st || jsonb_build_object('__auth', auth_txt::jsonb); exception when others then null; end;
  end if;
  v := st::text;
  insert into app_state_backups (reason, bytes, value) values (left(p_reason, 40), length(v), v);
  delete from app_records where ns = p_ns and deleted and updated_at < now() - interval '30 days';
  with old as (
    select taken_at from app_state_backups order by taken_at desc offset greatest(p_keep, 1)
  )
  delete from app_state_backups b using old where b.taken_at = old.taken_at;
  get diagnostics pruned = row_count;
  return jsonb_build_object('ok', true, 'bytes', length(v), 'pruned', pruned);
end $$;

revoke all on function public.app_records_backup(text, text, int, boolean) from anon, authenticated;
revoke all on function public.app_records_state(text) from anon, authenticated;

-- Kiểm tra sau khi chạy (tuỳ chọn):
--   select coll, count(*), pg_size_pretty(sum(pg_column_size(value))) from app_records
--   where ns = 'solbh-data-v2' and not deleted group by coll order by 2 desc;
