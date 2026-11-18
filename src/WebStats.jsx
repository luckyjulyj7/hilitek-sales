import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Loader2, RefreshCw, BarChart3 } from "lucide-react";
import { adminApi } from "./lib/adminApi.js";

/**
 * Mục "Thống kê" — lượt truy cập web khách hilipc.vn. Số liệu do Worker cộng dồn theo ngày (worker/track.js),
 * trang này chỉ đọc qua op=stats (vài trăm dòng nhỏ), không đọc kho dữ liệu chính.
 */
const INK = "#1E2A8A";
const TEXT = "#111827";
const MUTE = "#6B7280";
const LIGHT = "#C9CEF0"; // cột nhạt
const LINE = "#E5E7EB";
const GOLD = "#F5C518";

const nf = (n) => Number(n || 0).toLocaleString("vi-VN");
const dayAdd = (day, n) => new Date(Date.parse(day + "T00:00:00Z") + n * 86400000).toISOString().slice(0, 10);
const dmy = (day) => day.split("-").reverse().join("/");
const WD = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
const SRC_LABEL = { direct: "Gõ thẳng / không rõ (Messenger, một số ứng dụng ẩn nguồn)", internal: "Trong web (mở tab mới)", google: "Google", facebook: "Facebook", zalo: "Zalo", tiktok: "TikTok", youtube: "YouTube", instagram: "Instagram", search: "Công cụ tìm kiếm khác" };
const ACT_LABEL = { cart: "Thêm vào giỏ", zalo: "Bấm Zalo", phone: "Bấm gọi điện", messenger: "Bấm Messenger" };
const MARKET_LABEL = { shopee: "Shopee", lazada: "Lazada", tiktok: "TikTok Shop", tiki: "Tiki", other: "Sàn khác" };
const KINDS = [["all", "Tất cả"], ["product", "Sản phẩm"], ["article", "Bài viết"], ["category", "Danh mục"], ["other", "Trang khác"]];

const PAGE_NAMES = {
  "/": "Trang chủ", "/gio-hang": "Giỏ hàng", "/dat-hang": "Đặt hàng", "/bao-hanh": "Tra cứu bảo hành", "/lien-he": "Liên hệ",
  "/tra-cuu-don-hang": "Tra cứu đơn hàng", "/diem-tich-luy": "Điểm tích luỹ", "/xay-dung-cau-hinh": "Xây dựng cấu hình PC",
  "/may-choi-game-cam-tay": "Máy chơi game cầm tay", "/tin-tuc": "Tin tức và video", "/chinh-sach": "Chính sách",
  "/huong-dan-thanh-toan": "Hướng dẫn thanh toán", "/chinh-sach-giao-hang": "Chính sách giao hàng", "/chinh-sach-bao-hanh": "Chính sách bảo hành",
};
// Trang "khác" dùng chung tiêu đề mặc định của web nên gọi theo đường dẫn; sản phẩm/danh mục/bài viết dùng tiêu đề thật.
const pageLabel = (p) => (p.kind === "other" ? PAGE_NAMES[p.path] || prettyPath(p.path) : p.title || prettyPath(p.path));

function prettyPath(path) {
  if (path === "/") return "Trang chủ";
  let p = path;
  try { p = decodeURIComponent(path); } catch { /* giữ nguyên */ }
  return p;
}

function Delta({ cur, prev }) {
  if (!prev) return <span style={{ color: MUTE }} className="ml-1 text-xs">{cur ? "mới" : "• 0%"}</span>;
  const pct = Math.round(((cur - prev) / prev) * 100);
  if (pct === 0) return <span style={{ color: MUTE }} className="ml-1 text-xs">• 0%</span>;
  const up = pct > 0;
  return <span className="ml-1 text-xs font-semibold" style={{ color: up ? "#15803D" : "#B45309" }}>{up ? "▲" : "▼"} {Math.abs(pct)}%</span>;
}

function Card({ title, sub, children }) {
  return (
    <section className="bg-white rounded-lg p-4 sm:p-5 mb-4" style={{ border: `1px solid ${LINE}` }}>
      <h3 className="font-bold text-base" style={{ color: INK }}>{title}</h3>
      {sub && <p className="text-xs mt-0.5 mb-3" style={{ color: MUTE }}>{sub}</p>}
      {children}
    </section>
  );
}

function Tile({ label, value, hint }) {
  return (
    <div className="rounded-lg p-3" style={{ background: "#F5F6FD" }} title={hint}>
      <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: MUTE }}>{label}</div>
      <div className="text-2xl font-bold mt-1" style={{ color: INK }}>{value}</div>
    </div>
  );
}

export default function WebStats({ customers = [] }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [kind, setKind] = useState("all");
  const [dark, setDark] = useState("visits"); // cột đậm: visits | clicks

  const load = useCallback(async () => {
    setBusy(true); setErr("");
    try { setData(await adminApi("stats")); }
    catch (e) { setErr(e.message || String(e)); }
    finally { setBusy(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const m = useMemo(() => {
    if (!data || data.missing) return null;
    const by = Object.fromEntries((data.days || []).map((d) => [d.day, d]));
    const days = [];
    for (let i = 29; i >= 0; i--) { const day = dayAdd(data.today, -i); days.push({ day, views: 0, visits: 0, mobile: 0, clicks: 0, ...(by[day] || {}) }); }
    const sum = (arr) => arr.reduce((a, d) => ({ views: a.views + d.views, visits: a.visits + d.visits, mobile: a.mobile + d.mobile, clicks: a.clicks + d.clicks }), { views: 0, visits: 0, mobile: 0, clicks: 0 });
    const total = sum(days);
    const rows = [
      ["Hôm nay", days.slice(29), null],
      ["Hôm qua", days.slice(28, 29), null],
      ["7 ngày gần nhất", days.slice(23), days.slice(16, 23)],
      ["7 ngày trước đó", days.slice(16, 23), null],
    ].map(([label, cur, prev]) => ({ label, cur: sum(cur), prev: prev ? sum(prev) : null }));
    const wd = Array(7).fill(0);
    days.forEach((d) => { wd[new Date(d.day + "T00:00:00Z").getUTCDay()] += d.views; });
    const hours = Array(24).fill(0);
    (data.hours || []).forEach((r) => { if (r.h >= 0 && r.h < 24) hours[r.h] = r.n; });
    const evTotal = {}; const byPath = {};
    (data.events || []).forEach((r) => {
      evTotal[r.ev] = (evTotal[r.ev] || 0) + r.n;
      const o = (byPath[r.path] ||= { cart: 0, click: 0, contact: 0 });
      if (r.ev === "act:cart") o.cart += r.n; else if (r.ev.startsWith("click:")) o.click += r.n; else o.contact += r.n;
    });
    const titles = Object.fromEntries((data.pages || []).map((p) => [p.path, p]));
    return { days, total, rows, wd, hours, evTotal, byPath, titles };
  }, [data]);

  // Khách để lại thông tin qua form web (đã nằm trong danh sách Khách hàng, nhận ra qua ghi chú).
  const leads = useMemo(() => {
    const TYPES = [[/Báo khi có hàng/, "Báo khi có hàng"], [/Nhu cầu từ web/, "Nhu cầu / tư vấn"], [/Đăng ký nhận ưu đãi trên website/, "Nhận ưu đãi"]];
    return (customers || []).map((c) => {
      const note = String(c.note || "");
      const t = TYPES.find(([re]) => re.test(note));
      if (!t) return null;
      let at = c.createdAt || "";
      if (!at) { const m = /\((\d{1,2})\/(\d{1,2})\/(\d{4})\)/.exec(note); if (m) at = `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`; }
      return { id: c.id, name: c.name, phone: c.phone, email: c.email, type: t[1], at };
    }).filter(Boolean).sort((a, b) => String(b.at).localeCompare(String(a.at)));
  }, [customers]);

  const downloadLeads = () => {
    const esc = (v) => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
    const head = ["Họ tên", "Điện thoại", "Email", "Loại", "Ngày"].map(esc).join(",");
    const lines = leads.map((l) => [l.name, l.phone, l.email, l.type, l.at ? l.at.slice(0, 10) : ""].map(esc).join(","));
    const csv = "﻿" + [head, ...lines].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = "khach-dang-ky-web.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  const pages = useMemo(() => (data && data.pages ? data.pages.filter((p) => kind === "all" || p.kind === kind).slice(0, 40) : []), [data, kind]);

  const head = (
    <div className="flex items-center justify-between mb-4 gap-3">
      <div className="flex items-center gap-2"><BarChart3 size={20} style={{ color: INK }} /><h2 className="text-xl font-bold" style={{ color: TEXT }}>Thống kê truy cập web</h2></div>
      <button onClick={load} disabled={busy} className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-md" style={{ background: INK, color: "#fff", opacity: busy ? 0.6 : 1 }}>
        {busy ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Làm mới
      </button>
    </div>
  );

  if (!data && !err) return <div>{head}<div className="flex items-center gap-2 py-16 justify-center" style={{ color: TEXT }}><Loader2 className="animate-spin" size={18} /> Đang tải…</div></div>;
  if (err) return <div>{head}<p className="text-sm" style={{ color: "#B91C1C" }}>Không tải được thống kê: {err}</p></div>;
  if (data.missing) return (
    <div>{head}
      <Card title="Chưa tạo bảng thống kê">
        <p className="text-sm" style={{ color: TEXT }}>Cơ sở dữ liệu chưa có các bảng <code>stats_*</code>. Chạy một lần (xem HUONG-DAN-CHAT-HE-THONG.md, mục Thống kê):</p>
        <pre className="text-xs mt-2 p-2 rounded bg-gray-100 overflow-x-auto">npx wrangler d1 execute hilitek --remote --file=worker/schema.sql</pre>
      </Card>
    </div>
  );

  const { days, total, rows, wd, hours, evTotal, byPath, titles } = m;
  const maxHour = Math.max(1, ...hours);
  const topActPages = Object.entries(byPath).map(([path, o]) => [path, o.cart + o.click + o.contact]).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const clickKeys = Object.keys(evTotal).filter((k) => k.startsWith("click:"));
  const max = Math.max(1, ...days.map((d) => d.views));
  const maxWd = Math.max(1, ...wd);
  const perVisit = total.visits ? (total.views / total.visits).toFixed(1) : "0";
  const per100 = total.visits ? ((total.clicks / total.visits) * 100).toFixed(1) : "0";
  const topPage = Math.max(1, ...pages.map((p) => p.v));
  const srcTotal = (data.refs || []).reduce((a, r) => a + r.n, 0) || 1;

  return (
    <div>
      {head}
      <Card title="Tổng quan 30 ngày" sub="Lượt truy cập = số phiên khách vào web (mỗi người mở web tính 1 lần, cách quãng trên 30 phút tính lần mới). Bot và máy của chủ shop không tính.">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Tile label="Lượt xem trang" value={nf(total.views)} />
          <Tile label="Lượt truy cập" value={nf(total.visits)} />
          <Tile label="Trang / lượt truy cập" value={perVisit} />
          <Tile label="Bấm sang sàn" value={nf(total.clicks)} hint="Bấm vào link Shopee, Lazada, TikTok Shop, Tiki trên web" />
          <Tile label="Bấm sàn / 100 lượt truy cập" value={per100} />
        </div>
      </Card>

      <Card title="So sánh theo khoảng thời gian" sub={'Cột "Điện thoại": số lượt truy cập từ điện thoại / tổng lượt truy cập.'}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr style={{ color: TEXT }} className="text-right font-semibold">
              <th className="text-left py-2">Khoảng thời gian</th><th>Lượt xem</th><th>Lượt truy cập</th><th>Bấm sàn</th><th>Điện thoại</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="text-right" style={{ borderTop: `1px solid ${LINE}` }}>
                  <td className="text-left py-2" style={{ color: TEXT }}>{r.label}</td>
                  <td>{nf(r.cur.views)}{r.prev && <Delta cur={r.cur.views} prev={r.prev.views} />}</td>
                  <td>{nf(r.cur.visits)}{r.prev && <Delta cur={r.cur.visits} prev={r.prev.visits} />}</td>
                  <td>{nf(r.cur.clicks)}{r.prev && <Delta cur={r.cur.clicks} prev={r.prev.clicks} />}</td>
                  <td>{r.cur.mobile}/{r.cur.visits}</td>
                </tr>))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Theo ngày (30 ngày)" sub={`Cột nhạt = lượt xem trang, cột đậm = ${dark === "visits" ? "lượt truy cập" : "lượt bấm sang sàn"}. Rê chuột lên cột để xem số.`}>
        <div className="flex gap-2 mb-2">
          {[["visits", "Đậm: lượt truy cập"], ["clicks", "Đậm: bấm sàn"]].map(([k, l]) => (
            <button key={k} onClick={() => setDark(k)} className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: dark === k ? INK : "#EEF0FA", color: dark === k ? "#fff" : INK }}>{l}</button>))}
        </div>
        <div className="flex items-end gap-[3px] h-40">
          {days.map((d) => {
            const v = d[dark];
            return (
              <div key={d.day} className="flex-1 h-full flex flex-col justify-end items-center" title={`${dmy(d.day)}: ${d.views} lượt xem · ${d.visits} lượt truy cập · ${d.clicks} bấm sàn`}>
                <div className="w-full relative rounded-t-sm" style={{ height: `${(d.views / max) * 100}%`, minHeight: d.views ? 2 : 0, background: LIGHT }}>
                  <div className="absolute bottom-0 left-0 right-0 rounded-t-sm" style={{ height: d.views ? `${Math.min(100, (v / d.views) * 100)}%` : 0, background: INK }} />
                </div>
              </div>);
          })}
        </div>
        <div className="flex justify-between text-xs mt-1" style={{ color: MUTE }}><span>{dmy(days[0].day)}</span><span>Hôm nay</span></div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Theo thứ trong tuần" sub="Lượt xem trang, cộng 30 ngày.">
          {[1, 2, 3, 4, 5, 6, 0].map((i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between text-sm" style={{ color: TEXT }}><span>{WD[i]}</span><b>{nf(wd[i])}</b></div>
              <div className="h-2 rounded-full" style={{ background: "#EEF0FA" }}><div className="h-2 rounded-full" style={{ width: `${(wd[i] / maxWd) * 100}%`, background: INK }} /></div>
            </div>))}
        </Card>
        <Card title="Khách đến từ đâu" sub="Nguồn của các lượt truy cập mới, 30 ngày.">
          {(data.refs || []).length === 0 && <p className="text-sm" style={{ color: MUTE }}>Chưa có số liệu.</p>}
          {(data.refs || []).slice(0, 8).map((r) => (
            <div key={r.src} className="mb-2">
              <div className="flex justify-between text-sm" style={{ color: TEXT }}><span>{SRC_LABEL[r.src] || r.src.replace(/^other:/, "")}</span><b>{nf(r.n)} <span className="font-normal text-xs" style={{ color: MUTE }}>({Math.round((r.n / srcTotal) * 100)}%)</span></b></div>
              <div className="h-2 rounded-full" style={{ background: "#EEF0FA" }}><div className="h-2 rounded-full" style={{ width: `${(r.n / srcTotal) * 100}%`, background: GOLD }} /></div>
            </div>))}
          <p className="text-xs mt-3" style={{ color: MUTE }}>Nguồn tính theo trang giới thiệu, tham số utm_source (gắn vào link quảng cáo, ví dụ ?utm_source=facebook) và ứng dụng đang mở link. Số liệu chỉ bắt đầu từ ngày bật thống kê. Google không báo từ khoá tìm kiếm; xem ở Google Search Console.</p>
        </Card>
      </div>

      <Card title="Khách xem gì nhiều nhất" sub="30 ngày qua. Bấm nhóm để lọc.">
        <div className="flex flex-wrap gap-2 mb-3">
          {KINDS.map(([k, l]) => (
            <button key={k} onClick={() => setKind(k)} className="text-sm px-3 py-1 rounded-full font-semibold" style={{ background: kind === k ? INK : "#EEF0FA", color: kind === k ? "#fff" : INK }}>{l}</button>))}
        </div>
        {pages.length === 0 && <p className="text-sm" style={{ color: MUTE }}>Chưa có số liệu.</p>}
        {pages.map((p) => (
          <div key={p.path} className="mb-2.5">
            <div className="flex justify-between gap-3 text-sm" style={{ color: TEXT }}>
              <a href={p.path} target="_blank" rel="noreferrer" className="truncate hover:underline" title={prettyPath(p.path)}>{pageLabel(p)}</a>
              <b className="shrink-0">{nf(p.v)}</b>
            </div>
            <div className="h-2 rounded-full" style={{ background: "#EEF0FA" }}><div className="h-2 rounded-full" style={{ width: `${(p.v / topPage) * 100}%`, background: INK }} /></div>
          </div>))}
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Thiết bị & giờ cao điểm" sub="Giờ Việt Nam, cộng dồn 30 ngày. Dùng để chọn khung giờ đăng bài, chạy quảng cáo.">
          <div className="text-sm mb-2" style={{ color: TEXT }}>
            Máy tính <b>{nf(total.visits - total.mobile)}</b> ({total.visits ? Math.round(((total.visits - total.mobile) / total.visits) * 100) : 0}%) · Điện thoại <b>{nf(total.mobile)}</b> ({total.visits ? Math.round((total.mobile / total.visits) * 100) : 0}%)
          </div>
          <div className="flex items-end gap-[3px] h-28">
            {hours.map((n, h) => (
              <div key={h} className="flex-1 h-full flex items-end" title={`${h}h: ${n} lượt xem`}>
                <div className="w-full rounded-t-sm" style={{ height: `${(n / maxHour) * 100}%`, minHeight: n ? 2 : 0, background: INK }} />
              </div>))}
          </div>
          <div className="flex justify-between text-xs mt-1" style={{ color: MUTE }}><span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>23h</span></div>
        </Card>
        <Card title="Trang khách mở đầu tiên" sub="Trang đầu tiên của mỗi lượt truy cập mới, 30 ngày.">
          {(data.land || []).length === 0 && <p className="text-sm" style={{ color: MUTE }}>Chưa có số liệu.</p>}
          {(data.land || []).slice(0, 8).map((l) => (
            <div key={l.path} className="mb-2">
              <div className="flex justify-between gap-3 text-sm" style={{ color: TEXT }}>
                <span className="truncate" title={prettyPath(l.path)}>{pageLabel(titles[l.path] || { path: l.path, kind: "other" })}</span><b className="shrink-0">{nf(l.n)}</b></div>
              <div className="h-2 rounded-full" style={{ background: "#EEF0FA" }}><div className="h-2 rounded-full" style={{ width: `${(l.n / (data.land[0].n || 1)) * 100}%`, background: INK }} /></div>
            </div>))}
        </Card>
      </div>

      <Card title="Khách làm gì trên web" sub="30 ngày: thêm vào giỏ, liên hệ, bấm sang sàn.">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          {Object.entries(ACT_LABEL).map(([k, l]) => <Tile key={k} label={l} value={nf(evTotal["act:" + k])} />)}
        </div>
        <div className="text-sm" style={{ color: TEXT }}>
          <b>Bấm sang sàn:</b> {clickKeys.length ? clickKeys.map((k) => `${MARKET_LABEL[k.slice(6)] || k.slice(6)} ${evTotal[k]}`).join(" · ") : "chưa có lượt nào"}
        </div>
      </Card>

      <Card title="Sản phẩm: xem → thêm giỏ / bấm" sub="Nhiều người xem mà ít thêm giỏ hoặc liên hệ: xem lại giá, ảnh, mô tả. Ít người xem mà tỉ lệ cao: nên đẩy lên trang chủ, viết bài.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-right font-semibold" style={{ color: TEXT }}><th className="text-left py-2">Sản phẩm</th><th>Lượt xem</th><th>Thêm giỏ</th><th>Liên hệ</th><th>Bấm sàn</th><th>Tỉ lệ</th></tr></thead>
            <tbody>
              {(data.pages || []).filter((p) => p.kind === "product").slice(0, 30).map((p) => {
                const o = byPath[p.path] || { cart: 0, click: 0, contact: 0 };
                const act = o.cart + o.click + o.contact;
                return (
                  <tr key={p.path} className="text-right" style={{ borderTop: `1px solid ${LINE}` }}>
                    <td className="text-left py-1.5 pr-3 max-w-[320px] truncate" style={{ color: TEXT }}><a href={p.path} target="_blank" rel="noreferrer" className="hover:underline">{pageLabel(p)}</a></td>
                    <td>{nf(p.v)}</td><td>{o.cart}</td><td>{o.contact}</td><td>{o.click}</td>
                    <td className="font-semibold" style={{ color: act ? INK : MUTE }}>{Math.round((act / p.v) * 100)}%</td>
                  </tr>);
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Trang tạo ra nhiều lượt bấm nhất" sub="Trang mà khách đang xem ngay trước khi thêm giỏ, liên hệ hoặc bấm sang sàn.">
        {topActPages.length === 0 && <p className="text-sm" style={{ color: MUTE }}>Chưa có số liệu.</p>}
        {topActPages.map(([path, n]) => (
          <div key={path} className="mb-2">
            <div className="flex justify-between gap-3 text-sm" style={{ color: TEXT }}><span className="truncate">{pageLabel(titles[path] || { path, kind: "other" })}</span><b>{nf(n)}</b></div>
            <div className="h-2 rounded-full" style={{ background: "#EEF0FA" }}><div className="h-2 rounded-full" style={{ width: `${(n / topActPages[0][1]) * 100}%`, background: GOLD }} /></div>
          </div>))}
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Khách tìm gì" sub="Từ khoá gõ vào ô tìm kiếm của web, 30 ngày.">
          {(data.search || []).length === 0 && <p className="text-sm" style={{ color: MUTE }}>Chưa có ai tìm kiếm.</p>}
          {(data.search || []).slice(0, 15).map((r) => (
            <div key={r.q} className="flex justify-between gap-3 text-sm py-1" style={{ color: TEXT, borderTop: `1px solid ${LINE}` }}>
              <span className="truncate">{r.q}{r.zero > 0 && <span className="ml-2 text-xs font-semibold" style={{ color: "#B45309" }}>{r.zero} lần không có kết quả</span>}</span><b>{nf(r.n)}</b>
            </div>))}
        </Card>
        <Card title="Tìm mà không có kết quả" sub="Khách cần mà web chưa có: ưu tiên nhập hàng hoặc đăng thêm.">
          {(data.search || []).filter((r) => r.zero > 0).length === 0 && <p className="text-sm" style={{ color: MUTE }}>Chưa có.</p>}
          {(data.search || []).filter((r) => r.zero > 0).sort((a, b) => b.zero - a.zero).slice(0, 15).map((r) => (
            <div key={r.q} className="flex justify-between gap-3 text-sm py-1" style={{ color: TEXT, borderTop: `1px solid ${LINE}` }}><span className="truncate">{r.q}</span><b style={{ color: "#B45309" }}>{nf(r.zero)}</b></div>))}
        </Card>
      </div>

      <Card title={`Khách đăng ký (${leads.length})`} sub="Khách để lại tên, số điện thoại, email qua form Nhận ưu đãi, Báo khi có hàng, Tư vấn nhu cầu. Cũng nằm trong mục Khách hàng.">
        {leads.length > 0 && <button onClick={downloadLeads} className="text-sm font-semibold px-3 py-1.5 rounded-md mb-3" style={{ background: "#EEF0FA", color: INK }}>Tải danh sách (.csv)</button>}
        {leads.length === 0 ? <p className="text-sm" style={{ color: MUTE }}>Chưa có khách đăng ký.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left font-semibold" style={{ color: TEXT }}><th className="py-2">Điện thoại / Email</th><th>Tên</th><th>Loại</th><th>Ngày đăng ký</th></tr></thead>
              <tbody>
                {leads.slice(0, 100).map((l) => (
                  <tr key={l.id} style={{ borderTop: `1px solid ${LINE}` }}>
                    <td className="py-1.5 pr-3">
                      {l.phone && <a href={`https://zalo.me/${l.phone}`} target="_blank" rel="noreferrer" className="underline" style={{ color: INK }}>Zalo {l.phone}</a>}
                      {l.email && <div><a href={`mailto:${l.email}`} className="underline" style={{ color: INK }}>{l.email}</a></div>}
                    </td>
                    <td className="pr-3" style={{ color: TEXT }}>{l.name}</td><td className="pr-3" style={{ color: TEXT }}>{l.type}</td>
                    <td style={{ color: MUTE }}>{l.at ? (l.at.length > 10 ? new Date(l.at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) : dmy(l.at)) : "—"}</td>
                  </tr>))}
              </tbody>
            </table>
          </div>)}
      </Card>
    </div>
  );
}
