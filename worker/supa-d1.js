/**
 * Thay Supabase bằng Cloudflare D1 (cơ sở dữ liệu) + R2 (kho ảnh) mà KHÔNG phải sửa code api/.
 *
 * Code api/ gọi client().from(bảng).select(...).eq(...)... như Supabase. Lớp này dịch đúng phần
 * cú pháp mà api/ dùng sang SQL của D1, và client().storage.from(bucket) sang R2.
 * Bảng: app_state, app_records, app_state_backups (xem worker/schema.sql).
 *
 * Tiết kiệm CPU (Workers Free ~10 ms/lượt): giá trị app_records được trả nguyên chuỗi khi nơi gọi
 * xin { hiliRaw: true } (trường value_raw), khỏi parse rồi stringify lại.
 */
import { Buffer } from "node:buffer";
import crypto from "node:crypto";

let ENV = null;
/** index.js gọi mỗi lượt: gắn binding DB (D1) và MEDIA (R2). */
export function bindEnv(env) { ENV = env; }
const db = () => {
  if (!ENV || !ENV.DB) { const e = new Error("Thiếu binding D1 \"DB\" (wrangler.jsonc)."); e.code = "NO_CONFIG"; throw e; }
  return ENV.DB;
};

export const NOW_SQL = "strftime('%Y-%m-%dT%H:%M:%fZ','now')";
const JSON_COLS = { app_records: new Set(["value"]) };
const BOOL_COLS = { app_records: new Set(["deleted"]) };
const PK = { app_state: ["key"], app_records: ["ns", "coll", "id"], app_state_backups: ["id"] };
const TOUCH = { app_state: "updated_at", app_records: "updated_at" }; // tự đặt mốc khi ghi (như trigger Postgres)

function ident(c) {
  if (!/^[a-z_][a-z0-9_]*$/i.test(c)) throw new Error("Tên cột không hợp lệ: " + c);
  return c;
}
function colExpr(c) {
  const m = /^(\w+)->>(\w+)$/.exec(c);
  if (m) return `CAST(json_extract(${ident(m[1])}, '$.${ident(m[2])}') AS TEXT)`;
  return ident(c);
}
const toSql = (t, c, v) => (BOOL_COLS[t] && BOOL_COLS[t].has(c) ? (v ? 1 : 0) : typeof v === "boolean" ? (v ? 1 : 0) : v);

// .or() chỉ dùng cho phân trang theo khoá: coll.gt."x",and(coll.eq."x",id.gt."y")
function parseOr(str) {
  const re = /^(\w+)\.gt\.("(?:[^"\\]|\\.)*"),and\((\w+)\.eq\.("(?:[^"\\]|\\.)*"),(\w+)\.gt\.("(?:[^"\\]|\\.)*")\)$/;
  const m = re.exec(str);
  if (!m) throw new Error("or() chưa hỗ trợ: " + str);
  return { sql: `(${ident(m[1])} > ? OR (${ident(m[3])} = ? AND ${ident(m[5])} > ?))`, params: [JSON.parse(m[2]), JSON.parse(m[4]), JSON.parse(m[6])] };
}

class Query {
  constructor(table) {
    this.t = ident(table); this.where = []; this.params = []; this.orders = []; this.lim = null;
    this.mode = "select"; this.cols = "*"; this.selOpts = {}; this.returning = null; this._one = false;
  }
  select(cols = "*", opts = {}) {
    if (this.mode === "select") { this.cols = cols; this.selOpts = opts || {}; }
    else this.returning = cols; // .upsert(...).select("updated_at") = RETURNING
    return this;
  }
  _f(sql, ...p) { this.where.push(sql); this.params.push(...p); return this; }
  eq(c, v) { return v === null ? this._f(`${colExpr(c)} IS NULL`) : this._f(`${colExpr(c)} = ?`, toSql(this.t, c, v)); }
  neq(c, v) { return this._f(`${colExpr(c)} != ?`, toSql(this.t, c, v)); }
  gt(c, v) { return this._f(`${colExpr(c)} > ?`, v); }
  gte(c, v) { return this._f(`${colExpr(c)} >= ?`, v); }
  lt(c, v) { return this._f(`${colExpr(c)} < ?`, v); }
  lte(c, v) { return this._f(`${colExpr(c)} <= ?`, v); }
  // 1 tham số JSON thay vì n dấu ? (D1 giới hạn 100 tham số/câu).
  in(c, arr) { return this._f(`${colExpr(c)} IN (SELECT value FROM json_each(?))`, JSON.stringify((arr || []).map((v) => toSql(this.t, c, v)))); }
  or(s) { const o = parseOr(s); return this._f(o.sql, ...o.params); }
  order(c, o = {}) { this.orders.push(`${ident(c)} ${o.ascending === false ? "DESC" : "ASC"}`); return this; }
  limit(n) { this.lim = Math.max(0, Number(n) | 0); return this; }
  maybeSingle() { this._one = true; return this; }
  single() { this._one = true; return this; }
  upsert(rows, opts = {}) { this.mode = "upsert"; this.rows = Array.isArray(rows) ? rows : [rows]; this.opts = opts || {}; return this; }
  insert(rows) { this.mode = "insert"; this.rows = Array.isArray(rows) ? rows : [rows]; this.opts = {}; return this; }
  update(obj) { this.mode = "update"; this.obj = obj; return this; }
  delete(opts = {}) { this.mode = "delete"; this.delOpts = opts; return this; }

  then(resolve, reject) { return this.exec().then(resolve, reject); }

  _whereSql() { return this.where.length ? " WHERE " + this.where.join(" AND ") : ""; }
  _projCols(cols) {
    return String(cols).split(",").map((s) => s.trim()).filter(Boolean).map((c) => (c === "*" ? "*" : ident(c)));
  }
  _decode(rows, raw) {
    const js = JSON_COLS[this.t], bs = BOOL_COLS[this.t];
    if (!js && !bs) return rows;
    for (const r of rows) {
      if (js) for (const c of js) if (c in r) {
        if (raw) { r[c + "_raw"] = r[c]; delete r[c]; }
        else if (typeof r[c] === "string") { try { r[c] = JSON.parse(r[c]); } catch { /* giữ chuỗi */ } }
      }
      if (bs) for (const c of bs) if (c in r) r[c] = !!r[c];
    }
    return rows;
  }

  async exec() {
    try {
      return await this._exec();
    } catch (e) {
      return { data: null, error: { message: String((e && e.message) || e) }, count: null };
    }
  }

  async _exec() {
    const D = db();
    if (this.mode === "select") {
      if (this.selOpts.head) {
        const r = await D.prepare(`SELECT count(*) AS n FROM ${this.t}${this._whereSql()}`).bind(...this.params).first();
        return { data: null, error: null, count: r ? r.n : 0 };
      }
      const cols = this._projCols(this.cols).join(", ");
      let sql = `SELECT ${cols} FROM ${this.t}${this._whereSql()}`;
      if (this.orders.length) sql += " ORDER BY " + this.orders.join(", ");
      if (this._one) sql += " LIMIT 1";
      else if (this.lim != null) sql += ` LIMIT ${this.lim}`;
      const { results } = await D.prepare(sql).bind(...this.params).all();
      const rows = this._decode(results || [], this.selOpts.hiliRaw === true);
      return { data: this._one ? rows[0] || null : rows, error: null, count: rows.length };
    }
    if (this.mode === "update") {
      const sets = [], p = [];
      for (const [k, v] of Object.entries(this.obj || {})) {
        sets.push(`${ident(k)} = ?`);
        p.push(JSON_COLS[this.t] && JSON_COLS[this.t].has(k) ? (v == null ? null : JSON.stringify(v)) : toSql(this.t, k, v));
      }
      if (TOUCH[this.t] && !(TOUCH[this.t] in (this.obj || {}))) sets.push(`${TOUCH[this.t]} = ${NOW_SQL}`);
      let sql = `UPDATE ${this.t} SET ${sets.join(", ")}${this._whereSql()}`;
      if (this.returning) sql += " RETURNING " + this._projCols(this.returning).join(", ");
      const r = await D.prepare(sql).bind(...p, ...this.params).all();
      return { data: this.returning ? this._decode(r.results || [], false) : null, error: null };
    }
    if (this.mode === "delete") {
      const r = await D.prepare(`DELETE FROM ${this.t}${this._whereSql()}`).bind(...this.params).run();
      return { data: null, error: null, count: (r.meta && r.meta.changes) || 0 };
    }
    return this._write();
  }

  // INSERT / UPSERT: mọi dòng gửi trong 1 tham số JSON (json_each) — 1 câu SQL dù nhiều dòng.
  async _write() {
    const D = db();
    const rows = this.rows || [];
    if (!rows.length) return { data: this.returning ? [] : null, error: null };
    const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))].map(ident);
    const touch = TOUCH[this.t] && !cols.includes(TOUCH[this.t]) ? TOUCH[this.t] : null;
    const js = JSON_COLS[this.t];
    const enc = (r) => cols.map((c) => {
      const v = r[c];
      if (v === undefined) return null;
      if (js && js.has(c)) return v == null ? null : JSON.stringify(v);
      return toSql(this.t, c, v);
    });
    const allCols = touch ? [...cols, touch] : cols;
    const sel = cols.map((_, i) => `json_extract(j.value, '$[${i}]')`);
    if (touch) sel.push(NOW_SQL);
    let conflict = "";
    if (this.mode === "upsert") {
      const keys = this.opts.onConflict ? this.opts.onConflict.split(",").map((s) => ident(s.trim())) : PK[this.t];
      const upd = allCols.filter((c) => !keys.includes(c));
      conflict = this.opts.ignoreDuplicates || !upd.length
        ? ` ON CONFLICT(${keys.join(", ")}) DO NOTHING`
        : ` ON CONFLICT(${keys.join(", ")}) DO UPDATE SET ${upd.map((c) => `${c} = excluded.${c}`).join(", ")}`;
    }
    const ret = this.returning ? " RETURNING " + this._projCols(this.returning).join(", ") : "";
    const sql = `INSERT INTO ${this.t} (${allCols.join(", ")}) SELECT ${sel.join(", ")} FROM json_each(?) j WHERE 1${conflict}${ret}`;
    // Chia gói ~400 KB / câu (D1 giới hạn kích thước dòng/câu).
    const out = [];
    let batch = [], size = 0;
    const flush = async () => {
      if (!batch.length) return;
      const r = await D.prepare(sql).bind("[" + batch.join(",") + "]").all();
      if (this.returning) out.push(...(r.results || []));
      batch = []; size = 0;
    };
    for (const r of rows) {
      const s = JSON.stringify(enc(r));
      if (size + s.length > 400000) await flush();
      batch.push(s); size += s.length;
    }
    await flush();
    return { data: this.returning ? this._decode(out, false) : null, error: null };
  }
}

/* ---------------- Sao lưu (thay hàm Postgres app_records_backup) ---------------- */
async function recordsBackup({ p_ns, p_reason = "cron", p_keep = 60, p_force = false } = {}) {
  const D = db();
  const ns = String(p_ns), keep = Math.max(1, Number(p_keep) || 60);
  const last = await D.prepare("SELECT id, taken_at FROM app_state_backups ORDER BY id DESC LIMIT 1").first();
  const changed = await D.prepare("SELECT max(updated_at) AS m FROM app_records WHERE ns = ?").bind(ns).first();
  const authRow = await D.prepare("SELECT updated_at FROM app_state WHERE key = ?").bind(ns + ":auth").first();
  const newest = [changed && changed.m, authRow && authRow.updated_at].filter(Boolean).sort().pop() || "";
  if (!p_force && last && newest && newest <= last.taken_at) return { ok: true, skipped: "Dữ liệu chưa đổi kể từ bản sao lưu gần nhất." };
  const b = await D.prepare("INSERT INTO app_state_backups (reason, bytes, value) VALUES (?, 0, NULL) RETURNING id, taken_at").bind(String(p_reason).slice(0, 40)).first();
  const bid = b.id;
  const cutoff = new Date(Date.now() - 30 * 86400000).toISOString();
  const res = await D.batch([
    D.prepare("INSERT INTO backup_rows (bid, coll, id, value) SELECT ?, coll, id, value FROM app_records WHERE ns = ? AND deleted = 0").bind(bid, ns),
    D.prepare("INSERT INTO backup_rows (bid, coll, id, value) SELECT ?, '__auth', key, value FROM app_state WHERE key = ?").bind(bid, ns + ":auth"),
    D.prepare("UPDATE app_state_backups SET bytes = (SELECT coalesce(sum(length(value)), 0) FROM backup_rows WHERE bid = ?) WHERE id = ?").bind(bid, bid),
    // Dòng đã xoá quá 30 ngày: bỏ hẳn (các tab đều đã đồng bộ xong từ lâu).
    D.prepare("DELETE FROM app_records WHERE ns IN (?, ?) AND deleted = 1 AND updated_at < ?").bind(ns, ns + ":web", cutoff),
    D.prepare("DELETE FROM backup_rows WHERE bid IN (SELECT id FROM app_state_backups ORDER BY id DESC LIMIT -1 OFFSET ?)").bind(keep),
    D.prepare("DELETE FROM app_state_backups WHERE id IN (SELECT id FROM app_state_backups ORDER BY id DESC LIMIT -1 OFFSET ?)").bind(keep),
  ]);
  const rows = (res[0].meta && res[0].meta.changes) || 0;
  const pruned = (res[5].meta && res[5].meta.changes) || 0;
  return { ok: true, backupId: bid, rows, pruned, tombstonesPurged: (res[3].meta && res[3].meta.changes) || 0 };
}

/* ---------------- Kho ảnh R2 (thay Supabase Storage) ---------------- */
export function mediaToken(path) {
  return crypto.createHmac("sha256", process.env.ADMIN_SESSION_SECRET || "").update("media:" + path).digest("base64url");
}
function bucket() {
  if (!ENV || !ENV.MEDIA) { const e = new Error("Thiếu binding R2 \"MEDIA\" (wrangler.jsonc)."); e.code = "NO_CONFIG"; throw e; }
  return ENV.MEDIA;
}
const storage = {
  from() {
    return {
      async upload(path, data, opts = {}) {
        try {
          const B = bucket();
          if (opts.upsert === false && (await B.head(path))) return { data: null, error: { message: "Đã có file cùng tên." } };
          const body = Buffer.isBuffer(data) || data instanceof Uint8Array || data instanceof ArrayBuffer ? data : await new Response(data).arrayBuffer();
          await B.put(path, body, { httpMetadata: { contentType: opts.contentType || "application/octet-stream", cacheControl: "public, max-age=31536000, immutable" } });
          return { data: { path }, error: null };
        } catch (e) { return { data: null, error: { message: String(e.message || e) } }; }
      },
      async remove(paths) {
        try { await bucket().delete(paths); return { data: paths.map((name) => ({ name })), error: null }; }
        catch (e) { return { data: null, error: { message: String(e.message || e) } }; }
      },
      async list(folder, { limit = 1000, offset = 0 } = {}) {
        try {
          const all = [];
          let cursor;
          do {
            const r = await bucket().list({ prefix: folder ? folder.replace(/\/$/, "") + "/" : "", cursor, limit: 1000 });
            for (const o of r.objects) all.push({ id: o.key, name: o.key.slice(folder ? folder.length + 1 : 0), metadata: { size: o.size } });
            cursor = r.truncated ? r.cursor : null;
          } while (cursor);
          all.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
          return { data: all.slice(offset, offset + limit), error: null };
        } catch (e) { return { data: null, error: { message: String(e.message || e) } }; }
      },
      // Trình duyệt không ghi thẳng vào R2: gửi file qua /api/admin?op=put-media kèm mã này.
      async createSignedUploadUrl(path) {
        return { data: { path, token: mediaToken(path), put: true }, error: null };
      },
    };
  },
};

const RPC = { app_records_backup: recordsBackup };

export const d1Client = {
  from: (t) => new Query(t),
  async rpc(name, args) {
    if (!RPC[name]) return { data: null, error: { message: "Không có hàm " + name } };
    try { return { data: await RPC[name](args), error: null }; }
    catch (e) { return { data: null, error: { message: String(e.message || e) } }; }
  },
  storage,
};

/** Thay cho createClient của @supabase/supabase-js (wrangler alias trỏ vào đây). */
export function createClient() { return d1Client; }
