#!/usr/bin/env node
/**
 * Chuyển dữ liệu Supabase -> file SQL nạp vào Cloudflare D1.
 *
 *   node scripts/cf-import.mjs <file CSV xuất từ Supabase> [file SQL ra]
 *   node scripts/cf-import.mjs --json <file sao lưu .json>  [file SQL ra]   (thử với bản sao lưu)
 *
 * File CSV: kết quả câu worker/xuat-du-lieu-supabase.sql (SQL Editor -> Export -> CSV). Mỗi hàng
 * app_state bị cắt thành các khúc 400.000 ký tự, có md5 để kiểm tra ghép đủ.
 *
 * Kết quả (mặc định cf-import.sql) nạp bằng:
 *   npx wrangler d1 execute hilitek --remote --file=cf-import.sql
 * Chỉ dùng cho D1 MỚI (vừa chạy worker/schema.sql): ghi đè dòng trùng khoá, không xoá gì.
 */
import fs from "node:fs";
import crypto from "node:crypto";
import { splitState, assembleState, parseKey, canon } from "../src/lib/records.js";
import { buildWebParts, webPartsToMap } from "../src/lib/webCatalog.js";

const MAIN = "solbh-data-v2";
const SECRET_FIELDS = ["passwordHash", "passwordSalt", "passwordAlgo", "passwordIter", "password", "_legacyPassword"];
const sha256 = (s) => crypto.createHash("sha256").update(String(s)).digest("hex");

function die(msg) { console.error("LỖI: " + msg); process.exit(1); }

/* ---------- đọc CSV (RFC 4180: dấu phẩy, ngoặc kép, xuống dòng trong ô) ---------- */
function parseCsv(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const rows = [];
  let row = [], cell = "", i = 0, q = false;
  while (i < text.length) {
    const ch = text[i];
    if (q) {
      if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i += 2; continue; } q = false; i++; continue; }
      cell += ch; i++; continue;
    }
    if (ch === '"') { q = true; i++; continue; }
    if (ch === ",") { row.push(cell); cell = ""; i++; continue; }
    if (ch === "\r") { i++; continue; }
    if (ch === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; i++; continue; }
    cell += ch; i++;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  const head = rows.shift().map((h) => h.trim());
  return rows.filter((r) => r.length > 1).map((r) => Object.fromEntries(head.map((h, k) => [h, r[k]])));
}

function readCsvRows(file) {
  const recs = parseCsv(fs.readFileSync(file, "utf8"));
  const need = ["key", "part", "total_len", "md5", "chunk"];
  for (const n of need) if (!recs.length || !(n in recs[0])) die(`File CSV thiếu cột "${n}". Dùng đúng câu trong worker/xuat-du-lieu-supabase.sql.`);
  const byKey = new Map();
  for (const r of recs) {
    if (!byKey.has(r.key)) byKey.set(r.key, { parts: [], len: Number(r.total_len), md5: r.md5, updated_at: r.updated_at || "" });
    byKey.get(r.key).parts.push([Number(r.part), r.chunk]);
  }
  const out = new Map();
  for (const [key, v] of byKey) {
    v.parts.sort((a, b) => a[0] - b[0]);
    v.parts.forEach(([n], k) => { if (n !== k) die(`${key}: thiếu khúc số ${k} (file CSV bị cắt?).`); });
    const value = v.parts.map((p) => p[1]).join("");
    const md5 = crypto.createHash("md5").update(value, "utf8").digest("hex");
    if (md5 !== v.md5) die(`${key}: ghép lại không khớp md5 (${[...value].length}/${v.len} ký tự). Xuất lại file CSV.`);
    out.set(key, value);
  }
  return out;
}

/* ---------- mật khẩu: chỉ giữ h2 = SHA-256(mã băm), xem api/web/_auth.js ---------- */
function convertAuth(auth, state) {
  const accounts = {};
  const src = auth && auth.accounts ? auth.accounts : {};
  // Hàng auth chưa có (dữ liệu rất cũ): dựng từ danh sách tài khoản trong khối chính.
  if (!auth || !auth.migratedAt) {
    for (const a of Array.isArray(state.accounts) ? state.accounts : []) {
      if (!a || !a.id) continue;
      const prev = src[a.id] || {};
      accounts[a.id] = {
        username: String(a.username || "").trim().toLowerCase(), active: a.active !== false,
        role: a.role === "admin" ? "admin" : String(a.role || "staff"),
        hash: a.passwordHash || prev.hash || "", salt: a.passwordSalt || prev.salt || "",
        algo: (a.passwordHash ? a.passwordAlgo : prev.algo) === "pbkdf2" ? "pbkdf2" : "sha256",
        iter: Number(a.passwordHash ? a.passwordIter : prev.iter) || 210000,
      };
    }
  } else Object.assign(accounts, JSON.parse(JSON.stringify(src)));
  for (const e of Object.values(accounts)) {
    if (e.hash && !e.h2) e.h2 = sha256(String(e.hash).toLowerCase());
    delete e.hash;
  }
  return { ...(auth || {}), accounts, migratedAt: (auth && auth.migratedAt) || new Date().toISOString() };
}

/* ---------- SQL ---------- */
const lit = (s) => (s == null ? "NULL" : "'" + String(s).replace(/'/g, "''") + "'");
const MAX_PIECE = 25000; // ký tự UTF-16 / khúc -> < 100 KB / câu SQL (giới hạn của D1)
function pieces(s) {
  const out = [];
  let i = 0;
  while (i < s.length) {
    let j = Math.min(s.length, i + MAX_PIECE);
    if (j < s.length && /[\uD800-\uDBFF]/.test(s[j - 1])) j--; // không cắt đôi emoji
    out.push(s.slice(i, j)); i = j;
  }
  return out.length ? out : [""];
}

function main() {
  const args = process.argv.slice(2);
  let values;
  let outFile;
  if (args[0] === "--json") {
    if (!args[1]) die("Thiếu đường dẫn file .json");
    let st = JSON.parse(fs.readFileSync(args[1], "utf8"));
    if (st.value && typeof st.value === "string") st = JSON.parse(st.value);
    const auth = st.__auth || null;
    delete st.__auth; delete st._backup;
    values = new Map([[MAIN, JSON.stringify(st)]]);
    if (auth) values.set(MAIN + ":auth", JSON.stringify(auth));
    outFile = args[2] || "cf-import.sql";
  } else {
    if (!args[0]) die("Cách dùng: node scripts/cf-import.mjs <file.csv> [cf-import.sql]");
    values = readCsvRows(args[0]);
    outFile = args[1] || "cf-import.sql";
  }
  if (!values.has(MAIN)) die(`Không có hàng "${MAIN}" (khối dữ liệu chính).`);
  const state = JSON.parse(values.get(MAIN));
  if (!Array.isArray(state.products)) die("Khối dữ liệu chính không có danh sách sản phẩm.");
  const authRaw = values.has(MAIN + ":auth") ? JSON.parse(values.get(MAIN + ":auth")) : null;
  const auth = convertAuth(authRaw, state);
  if (!Object.keys(auth.accounts).length) die("Không có tài khoản đăng nhập nào — dừng để tránh khoá ngoài.");
  delete state.session;
  if (Array.isArray(state.accounts)) state.accounts = state.accounts.map((a) => { const c = { ...a }; SECRET_FIELDS.forEach((k) => delete c[k]); return c; });

  const now = new Date().toISOString();
  const rows = []; // [ns, coll, id, valueText]
  const { map } = splitState(state);
  for (const [k, s] of map) { const [c, i] = parseKey(k); rows.push([MAIN, c, i, s]); }
  rows.push([MAIN, "_sys", "migrated", JSON.stringify({ at: now, rows: map.size, from: "supabase" })]);
  const web = webPartsToMap(buildWebParts(state));
  for (const [k, v] of web) { const [c, i] = parseKey(k); rows.push([MAIN + ":web", c, i, JSON.stringify(v)]); }

  // Kiểm tra: ghép lại từ các dòng phải ra đúng dữ liệu gốc.
  const back = assembleState(map);
  for (const k of Object.keys(back)) if (!(k in state) && Array.isArray(back[k]) && !back[k].length) delete back[k];
  const strip = (o) => { const x = { ...o }; ["session", "__restore", "__updatedAt"].forEach((k) => delete x[k]); return x; };
  if (canon(strip(back)) !== canon(strip(state))) die("Ghép lại không khớp dữ liệu gốc — dừng, không tạo file.");

  const small = [[MAIN + ":auth", JSON.stringify(auth)]];
  for (const suf of [":kicked-accounts", ":edit-locks", ":shared-migrated"]) if (values.has(MAIN + suf)) small.push([MAIN + suf, values.get(MAIN + suf)]);

  const sql = ["-- Tạo bởi scripts/cf-import.mjs lúc " + now + ". Nạp vào D1 mới (đã chạy worker/schema.sql)."];
  for (const [key, v] of small) sql.push(`INSERT OR REPLACE INTO app_state (key, value, updated_at) VALUES (${lit(key)}, ${lit(v)}, ${lit(now)});`);
  let batch = [], size = 0;
  const flush = () => {
    if (!batch.length) return;
    sql.push("INSERT OR REPLACE INTO app_records (ns, coll, id, value, deleted, writer, updated_at) VALUES\n" + batch.join(",\n") + ";");
    batch = []; size = 0;
  };
  for (const [ns, c, i, v] of rows) {
    const ps = pieces(v);
    const tuple = `(${lit(ns)}, ${lit(c)}, ${lit(i)}, ${lit(ps[0])}, 0, 'import', ${lit(now)})`;
    const bytes = Buffer.byteLength(tuple);
    if (ps.length > 1) {
      // Dòng rất lớn: ghi khúc đầu rồi nối dần.
      flush();
      sql.push(`INSERT OR REPLACE INTO app_records (ns, coll, id, value, deleted, writer, updated_at) VALUES ${tuple};`);
      for (const p of ps.slice(1)) sql.push(`UPDATE app_records SET value = value || ${lit(p)} WHERE ns = ${lit(ns)} AND coll = ${lit(c)} AND id = ${lit(i)};`);
      continue;
    }
    if (size + bytes > 80000) flush();
    batch.push(tuple); size += bytes;
  }
  flush();
  fs.writeFileSync(outFile, sql.join("\n") + "\n", "utf8");

  const count = (coll) => rows.filter((r) => r[0] === MAIN && r[1] === coll).length;
  console.log(`Đã tạo ${outFile} (${(fs.statSync(outFile).size / 1e6).toFixed(2)} MB, ${sql.length} câu SQL).`);
  console.log(`  sản phẩm ${count("products")}, đơn ${count("orders")}, khách ${count("customers")}, tổng ${rows.length} dòng; web ${web.size} dòng; tài khoản ${Object.keys(auth.accounts).length}.`);
}

main();
