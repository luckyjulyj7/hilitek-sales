/**
 * Chạy handler kiểu Vercel/Node (req, res) trong Cloudflare Worker (Request -> Response).
 * Chỉ mô phỏng phần api/ dùng: req.method/headers/query/body, res.status/setHeader/json/send/redirect/end.
 */
import { Buffer } from "node:buffer";

async function gunzip(u8) {
  const stream = new Blob([u8]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

class NodeRes {
  constructor() { this.statusCode = 200; this.h = new Map(); this.cookies = []; this.body = null; this.finished = false; }
  status(c) { this.statusCode = c; return this; }
  setHeader(k, v) {
    const key = String(k).toLowerCase();
    if (key === "set-cookie") this.cookies = Array.isArray(v) ? v.map(String) : [String(v)];
    else this.h.set(key, String(v));
    return this;
  }
  getHeader(k) { const key = String(k).toLowerCase(); return key === "set-cookie" ? this.cookies : this.h.get(key); }
  removeHeader(k) { this.h.delete(String(k).toLowerCase()); }
  json(o) {
    if (!this.h.has("content-type")) this.h.set("content-type", "application/json; charset=utf-8");
    return this.end(JSON.stringify(o));
  }
  send(b) {
    if (b != null && typeof b === "object" && !(b instanceof Uint8Array) && !(b instanceof ArrayBuffer)) return this.json(b);
    if (typeof b === "string" && !this.h.has("content-type")) this.h.set("content-type", "text/html; charset=utf-8");
    return this.end(b);
  }
  redirect(a, b) {
    const [code, url] = typeof a === "number" ? [a, b] : [302, a];
    this.statusCode = code; this.h.set("location", url);
    return this.end(null);
  }
  end(b) { if (!this.finished) { this.body = b == null ? null : b; this.finished = true; } return this; }
  toResponse() {
    const headers = new Headers();
    for (const [k, v] of this.h) headers.set(k, v);
    for (const c of this.cookies) headers.append("set-cookie", c);
    const noBody = this.statusCode === 204 || this.statusCode === 304;
    return new Response(noBody ? null : this.body, { status: this.statusCode, headers });
  }
}

/** extraQuery: tham số thêm (VD rewrite /san-pham/:slug -> ?slug=). */
export async function runNode(handler, request, extraQuery = {}) {
  const url = new URL(request.url);
  const headers = {};
  request.headers.forEach((v, k) => { headers[k] = v; });
  headers.host = headers.host || url.host;
  const query = { ...Object.fromEntries(url.searchParams), ...extraQuery };
  let body;
  if (request.method !== "GET" && request.method !== "HEAD") {
    let buf = new Uint8Array(await request.arrayBuffer());
    if (headers["x-hili-gzip"] === "1") {
      // Trình duyệt nén thân request: giải nén luôn ở đây, handler nhận JSON như thường.
      try { buf = await gunzip(buf); } catch { buf = new TextEncoder().encode("{}"); }
      delete headers["x-hili-gzip"];
      headers["content-type"] = "application/json";
    }
    const ct = headers["content-type"] || "";
    if (/json/i.test(ct)) {
      const text = new TextDecoder().decode(buf);
      try { body = text ? JSON.parse(text) : {}; } catch { body = text; }
    } else if (/^text\//i.test(ct) || /x-www-form-urlencoded/i.test(ct)) body = new TextDecoder().decode(buf);
    else body = Buffer.from(buf);
  }
  const req = { method: request.method, headers, query, body, url: url.pathname + url.search, cf: request.cf };
  req[Symbol.asyncIterator] = async function* () {
    if (body == null) return;
    yield Buffer.isBuffer(body) ? body : Buffer.from(typeof body === "string" ? body : JSON.stringify(body));
  };
  const res = new NodeRes();
  await handler(req, res);
  if (!res.finished) res.end(null);
  return res.toResponse();
}
