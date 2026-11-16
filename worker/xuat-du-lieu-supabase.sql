-- XUẤT DỮ LIỆU TỪ SUPABASE ĐỂ CHUYỂN SANG CLOUDFLARE D1
-- Supabase -> SQL Editor -> dán câu dưới -> Run -> nút "Export" / "Download" -> CSV.
-- Mỗi hàng dữ liệu được cắt thành các khúc 400.000 ký tự (ô quá dài dễ bị cắt khi xuất), kèm md5
-- để scripts/cf-import.mjs kiểm tra ghép đủ. Chỉ ĐỌC, không sửa gì trên Supabase.
select a.key,
       n as part,
       length(a.value) as total_len,
       md5(a.value) as md5,
       a.updated_at,
       substr(a.value, n * 400000 + 1, 400000) as chunk
from app_state a
cross join generate_series(0, 50) as n
where (a.key = 'solbh-data-v2' or a.key like 'solbh-data-v2:%')
  and a.value is not null
  and n * 400000 < length(a.value)
order by a.key, n;
