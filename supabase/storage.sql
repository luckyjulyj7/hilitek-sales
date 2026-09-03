-- ══════════════════════════════════════════════════════════════════════
--  KHO ẢNH MÔ TẢ SẢN PHẨM  (bucket "product-media")
--  Dùng cho: dán / kéo-thả ảnh vào ô "Mô tả sản phẩm (web)" trong app quản lý.
--  Ảnh được tải lên đây -> link dạng /media/... (rewrite trong vercel.json),
--  KHÔNG lộ trang nguồn.
-- ══════════════════════════════════════════════════════════════════════

-- 1) Tạo bucket công khai (nếu đã tạo bằng tay ở Dashboard → Storage thì bỏ qua).
insert into storage.buckets (id, name, public)
values ('product-media', 'product-media', true)
on conflict (id) do update set public = true;

-- 2) Cho phép client (khoá anon — app quản lý dùng) TẢI ẢNH LÊN bucket này.
drop policy if exists "product-media insert" on storage.objects;
create policy "product-media insert" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'product-media');

-- 3) Cho phép ghi đè / xoá (tuỳ chọn — để dọn ảnh cũ).
drop policy if exists "product-media update" on storage.objects;
create policy "product-media update" on storage.objects
  for update to anon, authenticated
  using (bucket_id = 'product-media');

drop policy if exists "product-media delete" on storage.objects;
create policy "product-media delete" on storage.objects
  for delete to anon, authenticated
  using (bucket_id = 'product-media');

-- (ĐỌC đã công khai sẵn vì bucket để public = true.)
