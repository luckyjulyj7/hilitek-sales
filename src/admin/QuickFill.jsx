// "Dán nhanh toàn bộ" cho form sửa sản phẩm web: dán 1 khối chữ có các mục (Tên web:, Mô tả ngắn:,
// Thông số:, Mô tả:, Khuyến mãi:, Danh mục:, Tiêu đề SEO:, Mô tả SEO:, Đường dẫn:, Khối lượng:, Giá so sánh:)
// là tự điền cả form. Mục nào không có thì giữ nguyên. Không gọi máy chủ.
import React, { useState } from "react";
import { ClipboardPaste, Copy, Check, ChevronDown } from "lucide-react";

const fold = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase().trim();
// Tên mục (đã bỏ dấu) → khoá trong form
const KEYS = [
  ["ten web", "name"], ["ten hien thi", "name"], ["ten", "name"],
  ["mo ta ngan", "shortDesc"],
  ["thong so ky thuat", "specsText"], ["thong so", "specsText"],
  ["mo ta seo", "seoDesc"], ["seo mo ta", "seoDesc"], ["seo desc", "seoDesc"], ["meta description", "seoDesc"],
  ["tieu de seo", "seoTitle"], ["seo title", "seoTitle"], ["seo tieu de", "seoTitle"],
  ["mo ta chi tiet", "description"], ["mo ta", "description"], ["noi dung", "description"],
  ["khuyen mai", "promo"], ["qua tang", "promo"],
  ["danh muc", "categories"],
  ["duong dan", "slug"], ["slug", "slug"],
  ["khoi luong", "weight"], ["can nang", "weight"],
  ["gia so sanh", "compareAtPrice"], ["gia gach", "compareAtPrice"],
];
export const QUICK_TEMPLATE = `Tên web: Bàn phím cơ không dây ABC 75 Tri-mode
Mô tả ngắn: 1–2 câu nêu điểm mạnh nhất, có bảo hành.
Danh mục: Bàn phím cơ, Gaming gear
Thông số:
Kết nối | Bluetooth 5.0, 2.4GHz, USB-C
Switch | Linear, hot-swap
Pin | 4000mAh
Bảo hành | 12 tháng
Mô tả:
## Điểm nổi bật
- Ý 1
- Ý 2
Đoạn giới thiệu chi tiết…
Khuyến mãi:
Tặng keycap puller
Tiêu đề SEO: Bàn phím cơ ABC 75 Tri-mode hot-swap - Hilitek
Mô tả SEO: 140–160 ký tự, có từ khoá chính, giá trị nổi bật và lời mời mua.
Khối lượng: 900
Giá so sánh: 1590000`;

/** Tách khối chữ thành { key: giá trị }. Dòng "Tên mục: …" mở mục mới; các dòng sau thuộc mục đó. */
export function parseQuickFill(raw) {
  const out = {};
  let cur = null;
  const lines = String(raw || "").replace(/\r/g, "").split("\n");
  for (const line of lines) {
    const m = line.match(/^\s*([^:|]{2,30})\s*:\s*(.*)$/);
    const key = m && KEYS.find(([k]) => fold(m[1]) === k)?.[1];
    if (key) { cur = key; out[cur] = m[2] ? [m[2]] : []; continue; }
    if (cur) out[cur].push(line);
  }
  const txt = (k) => (out[k] || []).join("\n").trim();
  const res = {};
  for (const k of Object.keys(out)) {
    const v = txt(k);
    if (!v) continue;
    if (k === "categories") res.categories = v.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
    else if (k === "weight") res.weight = Number(v.replace(/[^\d]/g, "")) || 0;
    else if (k === "compareAtPrice") res.compareAtPrice = Number(v.replace(/[^\d]/g, "")) || 0;
    else if (k === "promo") res.promo = v.split("\n").map((s) => s.replace(/^\s*[-•*]\s*/, "").trim()).filter(Boolean).join("\n");
    else res[k] = v;
  }
  return res;
}

const LABEL = { name: "Tên web", shortDesc: "Mô tả ngắn", specsText: "Thông số", description: "Mô tả", promo: "Khuyến mãi", categories: "Danh mục", seoTitle: "Tiêu đề SEO", seoDesc: "Mô tả SEO", slug: "Đường dẫn", weight: "Khối lượng", compareAtPrice: "Giá so sánh" };

/** onApply(patch, unknownCategories) — patch đã có description dạng HTML. toHtml: Markdown/chữ trơn → HTML. */
export default function QuickFill({ onApply, toHtml, knownCats }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const apply = () => {
    const r = parseQuickFill(text);
    const keys = Object.keys(r);
    if (!keys.length) { setMsg("Chưa nhận ra mục nào. Mỗi mục bắt đầu bằng tên mục và dấu hai chấm, ví dụ \"Mô tả ngắn: …\". Bấm \"Chép mẫu\" để xem."); return; }
    const patch = { ...r };
    if (patch.description) patch.description = toHtml(patch.description);
    let unknown = [];
    if (patch.categories && knownCats.length) {
      const map = new Map(knownCats.map((c) => [fold(c), c]));
      unknown = patch.categories.filter((c) => !map.has(fold(c)));
      patch.categories = patch.categories.map((c) => map.get(fold(c))).filter(Boolean);
      if (!patch.categories.length) delete patch.categories;
    }
    onApply(patch);
    setMsg(`Đã điền: ${keys.map((k) => LABEL[k]).join(", ")}.${unknown.length ? ` Danh mục chưa có trên web nên bỏ qua: ${unknown.join(", ")}.` : ""} Kiểm tra lại rồi bấm Lưu.`);
    setText("");
  };
  const copyTpl = async () => { try { await navigator.clipboard.writeText(QUICK_TEMPLATE); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { setText(QUICK_TEMPLATE); } };
  return (
    <div className="rounded-md" style={{ border: "1px solid #C7CCE8", background: "#F7F8FE" }}>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="w-full flex items-center gap-2 px-4 min-h-[48px] text-left">
        <ClipboardPaste size={17} style={{ color: "#1E2A8A" }} />
        <b className="text-sm whitespace-nowrap" style={{ color: "#1E2A8A" }}>Dán nhanh toàn bộ</b>
        <span className="hidden sm:inline text-xs truncate" style={{ color: "#4B5563" }}>Dán 1 khối chữ có các mục là tự điền tên, mô tả, thông số, danh mục, SEO</span>
        <ChevronDown size={16} className="ml-auto shrink-0" style={{ transform: open ? "rotate(180deg)" : "none", color: "#6B7280" }} />
      </button>
      {open && (
        <div className="px-4 pb-4">
          <textarea id="hili-dan-nhanh" aria-label="Dán nhanh toàn bộ thông tin sản phẩm" rows={10} value={text} onChange={(e) => setText(e.target.value)}
            placeholder={QUICK_TEMPLATE} className="w-full border rounded-md px-3 py-2 text-sm bg-white" style={{ borderColor: "#D7DBE5", fontFamily: "'Inter', sans-serif" }} />
          {msg && <p className="text-xs mt-1.5" role="status" style={{ color: msg.startsWith("Đã") ? "#166534" : "#C62828" }}>{msg}</p>}
          <div className="flex flex-wrap gap-2 mt-2">
            <button type="button" onClick={apply} disabled={!text.trim()} className="px-4 py-2 rounded-md text-sm font-semibold text-white disabled:opacity-40" style={{ background: "#1E2A8A" }}>Điền vào form</button>
            <button type="button" onClick={copyTpl} className="px-3 py-2 rounded-md text-sm border inline-flex items-center gap-1.5 bg-white" style={{ borderColor: "#D7DBE5", color: "#111827" }}>{copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Đã chép mẫu" : "Chép mẫu"}</button>
            <span className="text-xs self-center" style={{ color: "#6B7280" }}>Mục nào không có trong khối chữ thì giữ nguyên.</span>
          </div>
        </div>
      )}
    </div>
  );
}

/** Gợi ý SEO theo chuẩn Hilitek: tiêu đề 50–60 ký tự "… - Hilitek", mô tả 140–160 ký tự. */
export function suggestSeo({ name, shortDesc, descText, promo }) {
  const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();
  const cut = (s, max) => { s = clean(s); if (s.length <= max) return s; const t = s.slice(0, max + 1); return t.slice(0, t.lastIndexOf(" ")).replace(/[,;:\-–]+$/, "").trim(); };
  const end = (s) => (s && !/[.!?]$/.test(s) ? s + "." : s);
  let base = cut(String(name || "").replace(/\s*\|.*$/, ""), 60 - " - Hilitek".length);
  if ((base + " - Hilitek").length < 50 && (base + " chính hãng - Hilitek").length <= 60) base += " chính hãng";
  const title = `${base} - Hilitek`;
  // Mô tả: ghép mô tả ngắn, câu đầu mô tả chi tiết, khuyến mãi, cam kết cho đủ 140 ký tự rồi cắt ở 160.
  const sentences = clean(descText).split(/(?<=[.!?])\s+/).filter((x) => x.length > 20);
  const parts = [end(clean(shortDesc)), ...sentences.slice(0, 2).map(end), end(clean((promo || "").split("\n")[0])), "Chính hãng, bảo hành tại Hilitek."].filter(Boolean);
  let desc = "";
  // Thêm trọn từng câu, câu nào làm vượt 160 ký tự thì bỏ qua (không cắt giữa câu).
  for (const p of parts) { if (desc.length >= 140) break; const next = clean(desc + " " + p); if (next.length <= 160 && !desc.includes(p)) desc = next; }
  if (desc.length < 100) desc = clean(parts.join(" "));
  return { seoTitle: title, seoDesc: cut(desc || name, 160) };
}
