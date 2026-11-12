-- ══════════════════════════════════════════════════════════════════════
--  KHÔI PHỤC dữ liệu từ 1 bản sao lưu (bảng app_state_backups).
--  Thay 123 bằng id bản sao lưu muốn khôi phục (cột id), rồi Run toàn bộ.
--  Trước khi ghi, bản hiện tại được cất vào app_state_backups (reason 'truoc-khoi-phuc').
-- ══════════════════════════════════════════════════════════════════════
begin;

-- 0) Cất bản hiện tại phòng khi cần quay lại
insert into public.app_state_backups (reason, bytes, value)
select 'truoc-khoi-phuc', length(value), value from public.app_state where key = 'solbh-data-v2';

-- 1) Dữ liệu chính (bỏ trường __auth đi kèm trong bản sao lưu)
update public.app_state
set value = ((select value::jsonb from public.app_state_backups where id = 123) - '__auth')::text,
    updated_at = now()
where key = 'solbh-data-v2';

-- 2) Mật khẩu tài khoản (nếu bản sao lưu có kèm)
insert into public.app_state (key, value, updated_at)
select 'solbh-data-v2:auth', (value::jsonb -> '__auth')::text, now()
from public.app_state_backups where id = 123 and value::jsonb ? '__auth'
on conflict (key) do update set value = excluded.value, updated_at = now();

commit;

-- 3) Kiểm tra
select key, length(value) as bytes, updated_at,
  json_array_length((value::json)->'products') as san_pham,
  json_array_length((value::json)->'accounts') as tai_khoan
from public.app_state where key = 'solbh-data-v2';
