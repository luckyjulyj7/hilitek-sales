#!/usr/bin/env node
/**
 * Chép ảnh cũ từ Supabase Storage sang Cloudflare R2 (chạy SAU KHI Supabase hết chặn).
 *
 *   node scripts/cf-copy-media.mjs https://hilipc.vn
 *
 * Lấy mọi link "/media/..." trong dữ liệu (D1, qua wrangler), rồi mở từng ảnh trên web: ảnh nào
 * chưa có trong R2, Worker tự lấy từ Supabase 1 lần và lưu vào R2 (xem worker/index.js media()).
 * Chạy lại bao nhiêu lần cũng được; ảnh đã có trong R2 thì không tải lại từ Supabase.
 */
import { execSync } from "node:child_process";

const site = (process.argv[2] || "").replace(/\/$/, "");
if (!/^https?:\/\//.test(site)) { console.error("Cách dùng: node scripts/cf-copy-media.mjs https://hilipc.vn"); process.exit(1); }

const sql = "select value from app_records where ns like 'solbh-data-v2%' and deleted = 0 and value like '%/media/%'";
const out = execSync(`npx wrangler d1 execute hilitek --remote --json --command "${sql}"`, { maxBuffer: 512 * 1024 * 1024 }).toString();
const rows = JSON.parse(out.slice(out.indexOf("[")))[0].results;
const paths = new Set();
for (const r of rows) for (const m of String(r.value).matchAll(/\/media\/([\w\-./]+?\.[a-z0-9]{2,5})(?![\w.])/gi)) paths.add(m[1]);
console.log(`Có ${paths.size} file ảnh/âm thanh được dùng trong dữ liệu.`);

const list = [...paths];
let done = 0, okN = 0;
const bad = [];
async function worker() {
  while (list.length) {
    const p = list.shift();
    try {
      const r = await fetch(`${site}/media/${p}`);
      await r.arrayBuffer();
      if (r.ok) okN++; else bad.push(`${r.status} ${p}`);
    } catch (e) { bad.push(`lỗi ${p}: ${e.message}`); }
    if (++done % 100 === 0) console.log(`  ${done}/${paths.size}...`);
  }
}
await Promise.all([worker(), worker(), worker(), worker()]);
console.log(`Xong: ${okN} file đã có trong R2, ${bad.length} file lỗi.`);
if (bad.length) console.log(bad.slice(0, 50).join("\n"));
