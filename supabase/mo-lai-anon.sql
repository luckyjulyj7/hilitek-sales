-- ══════════════════════════════════════════════════════════════════════
--  QUAY LUI khoa-anon.sql — mở lại quyền anon như trước (CHỈ dùng khi cần trở về bản cũ
--  của trang quản lý, ví dụ đã git revert về tag backup-truoc-bao-mat-server-2026-11-11).
-- ══════════════════════════════════════════════════════════════════════
grant select, insert, update, delete on table public.app_state to anon;
drop policy if exists "anon full access app_state" on public.app_state;
create policy "anon full access app_state"
  on public.app_state for all to anon using (true) with check (true);

drop policy if exists "product-media insert" on storage.objects;
create policy "product-media insert" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'product-media');
drop policy if exists "product-media update" on storage.objects;
create policy "product-media update" on storage.objects
  for update to anon, authenticated using (bucket_id = 'product-media');
drop policy if exists "product-media delete" on storage.objects;
create policy "product-media delete" on storage.objects
  for delete to anon, authenticated using (bucket_id = 'product-media');
