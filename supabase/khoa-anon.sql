-- ══════════════════════════════════════════════════════════════════════
--  KHOÁ QUYỀN ANON — chạy SAU KHI trang quản lý bản mới (đăng nhập qua /api/admin)
--  đã chạy ổn trên hilipc.vn/quanlybanhang.
--  Supabase Dashboard → SQL Editor → New query → dán toàn bộ → Run.
--
--  Sau khi chạy: khoá anon (nằm trong file JS ai cũng tải được) KHÔNG còn đọc/ghi được
--  bảng app_state và KHÔNG tải/xoá được ảnh. Chỉ máy chủ Vercel (khoá service_role) làm được.
--  Ảnh vẫn xem công khai bình thường qua /media/... (bucket vẫn public).
--
--  Muốn quay lại như cũ: chạy supabase/mo-lai-anon.sql
-- ══════════════════════════════════════════════════════════════════════

-- 1) Bảng dữ liệu: bỏ policy mở toàn quyền cho anon. RLS vẫn bật -> anon bị chặn hết,
--    service_role (máy chủ) vẫn đọc/ghi bình thường vì service_role bỏ qua RLS.
drop policy if exists "anon full access app_state" on public.app_state;
alter table public.app_state enable row level security;
revoke all on table public.app_state from anon, authenticated;

-- 2) Kho ảnh: bỏ quyền tải lên / sửa / xoá của anon. Trang quản lý tải ảnh bằng link dùng
--    1 lần do máy chủ cấp (createSignedUploadUrl), không cần policy này nữa.
drop policy if exists "product-media insert" on storage.objects;
drop policy if exists "product-media update" on storage.objects;
drop policy if exists "product-media delete" on storage.objects;

-- 3) Kiểm tra: phải KHÔNG còn dòng nào cho app_state / product-media.
select schemaname, tablename, policyname, roles, cmd
from pg_policies
where (schemaname = 'public' and tablename = 'app_state')
   or (schemaname = 'storage' and tablename = 'objects' and policyname like 'product-media%');
