import React, { useRef, useState } from "react";
import { ClipboardPaste, Loader2 } from "lucide-react";

const INK = "#1E2A8A";
const TEXT = "#111827";
const LINE = "#E5E7EB";
const RUST = "#C62828";
const isHtml = (s) => /<(p|h[1-6]|ul|ol|li|div|span|strong|b|em|br|img|a|table|blockquote)\b[^>]*>/i.test(s);
const isMarkdown = (s) => /^(#{1,3}\s|-\s)/m.test(s) || /\*\*[^*\n]+\*\*/.test(s);

/**
 * Đổi nội dung dán sang HTML: HTML giữ nguyên, Markdown và chữ trơn đổi theo chuẩn mô tả
 * (tiêu đề đậm, màu xanh Hili). helpers = { markdown, beautify } lấy từ SalesManager.
 */
function pastedToHtml(raw, { markdown, beautify }) {
  const s = String(raw || "").replace(/\r/g, "").trim();
  if (!s) return "";
  if (isHtml(s)) return s;
  if (!isMarkdown(s)) return beautify(s, { boldFirstLine: s.search(/[\n]/) > 0 && s.search(/[\n]/) <= 100 });
  return markdown(s).replace(/<(h[23])>(.*?)<\/\1>/g, (_m, h, t) =>
    `<${h}><strong><span style="color: rgb(30, 42, 138);">${t.replace(/<\/?strong>/g, "")}</span></strong></${h}>`);
}

/** Tải các ảnh web ngoài trong bài về kho Hilitek, giữ nguyên chữ, định dạng và vị trí ảnh. */
async function rehostImages(html, rehost, onStep) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("style,script,meta,title").forEach((x) => x.remove());
  const mine = (u) => { try { return /(^|\.)hilipc\.vn$/.test(new URL(u).hostname); } catch { return false; } };
  const todo = [...doc.querySelectorAll("img")].filter((i) => /^https?:/i.test(i.getAttribute("src") || "") && !mine(i.getAttribute("src"))).slice(0, 20);
  let next = 0, done = 0, fail = 0;
  const work = async () => {
    while (next < todo.length) {
      const img = todo[next++];
      try { img.setAttribute("src", await rehost(img.getAttribute("src"))); } catch { fail++; }
      onStep(`Đang tải ảnh ${++done}/${todo.length}…`);
    }
  };
  await Promise.all([work(), work(), work()]);
  return { html: doc.body.innerHTML, fail };
}

/**
 * Khung "Dán nội dung" của ô Mô tả. Là ô nhập thường nên dán một lần là đủ (kể cả bài dài).
 * onInsert(html, mode, keepColor) với mode: "replace" | "end".
 */
export default function PasteDescPanel({ hasContent, onInsert, onClose, rehost, helpers, notify }) {
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [ask, setAsk] = useState(false);
  const rich = useRef(null); // { text, html } bản có định dạng của lần dán gần nhất

  const take = (plain, html) => {
    const t = String(plain || "").replace(/\r/g, "");
    // Chữ chép từ khung soạn mã cũng kèm HTML tô màu: nếu chữ tự nó là HTML/Markdown thì dùng chữ.
    const useRich = html && !isHtml(t) && !isMarkdown(t) && isHtml(html);
    rich.current = useRich ? { text: t, html } : null;
    setText(t); setAsk(false); setErr("");
    setNote(useRich ? "Đã nhận cả định dạng của bài gốc. Sửa chữ trong ô này thì chỉ giữ lại chữ." : "");
  };
  const readClipboard = async () => {
    setErr("");
    try {
      let plain = "", html = "";
      if (navigator.clipboard.read) {
        for (const it of await navigator.clipboard.read()) {
          if (it.types.includes("text/plain")) plain = await (await it.getType("text/plain")).text();
          if (it.types.includes("text/html")) html = await (await it.getType("text/html")).text();
        }
      } else plain = await navigator.clipboard.readText();
      if (!plain && html) plain = new DOMParser().parseFromString(html, "text/html").body.textContent || "";
      if (!plain.trim()) return setErr("Bộ nhớ tạm chưa có chữ. Chép bài trước, rồi bấm lại.");
      take(plain, html);
    } catch {
      setErr("Trình duyệt chặn đọc bộ nhớ tạm. Bấm vào ô bên dưới rồi dán bằng Ctrl+V, hoặc giữ tay rồi chọn Dán.");
    }
  };
  const apply = async (mode) => {
    if (!text.trim() || busy) return;
    if (mode === "replace" && hasContent() && !ask) return setAsk(true);
    const isRich = rich.current && rich.current.text === text;
    setBusy(true);
    try {
      const r = await rehostImages(isRich ? rich.current.html : pastedToHtml(text, helpers), rehost, setNote);
      onInsert(r.html, mode, !isRich);
      notify((mode === "replace" ? "Đã thay toàn bộ mô tả." : "Đã thêm vào cuối mô tả.") + (r.fail ? ` ${r.fail} ảnh giữ link gốc vì tải lỗi.` : "") + " Bấm nút Hoàn tác ở thanh công cụ nếu chưa ưng.");
      onClose();
    } catch (e) { setErr("Chưa chèn được: " + (e.message || e)); }
    finally { setBusy(false); }
  };
  const btn = "rounded-md border px-3 py-2 text-sm font-medium inline-flex items-center justify-center gap-1.5";
  const off = !text.trim() || busy;
  return (
    <div data-dan-mo-ta className="mb-2 rounded-md p-3" style={{ border: `1px solid ${LINE}`, background: "#fff" }}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <button type="button" onClick={readClipboard} disabled={busy} className={btn} style={{ borderColor: INK, color: INK }}><ClipboardPaste size={15} /> Dán từ bộ nhớ tạm</button>
        <span className="text-xs" style={{ color: "#4B5563" }}>Nhận chữ thường, HTML và Markdown</span>
      </div>
      <textarea id="hili-dan-mo-ta" aria-label="Dán nội dung mô tả" rows={9} value={text}
        onChange={(e) => { setText(e.target.value); setAsk(false); if (note && rich.current?.text !== e.target.value) setNote(""); }}
        onPaste={(e) => {
          if (text.trim()) return; // đang có chữ: dán thêm bình thường
          const plain = e.clipboardData.getData("text/plain"), html = e.clipboardData.getData("text/html");
          if (plain) { e.preventDefault(); take(plain, html); }
        }}
        placeholder="Bấm vào đây rồi dán cả bài mô tả" className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: LINE, color: TEXT, resize: "vertical" }} />
      {(err || note) && <p className="mt-1 text-xs" role="status" style={{ color: err ? RUST : INK }}>{err || note}</p>}
      {ask ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-sm" style={{ color: TEXT }}>Mô tả đang có sẽ bị thay hết. Thay luôn?</span>
          <button type="button" onClick={() => apply("replace")} disabled={busy} className={btn + " text-white"} style={{ background: RUST, borderColor: RUST }}>{busy && <Loader2 size={15} className="animate-spin" />} Thay toàn bộ</button>
          <button type="button" onClick={() => setAsk(false)} disabled={busy} className={btn} style={{ borderColor: LINE, color: TEXT }}>Không thay</button>
        </div>
      ) : (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => apply("replace")} disabled={off} className={btn + " text-white"} style={{ background: INK, borderColor: INK, opacity: off ? 0.45 : 1 }}>{busy && <Loader2 size={15} className="animate-spin" />} Thay toàn bộ mô tả</button>
          <button type="button" onClick={() => apply("end")} disabled={off} className={btn} style={{ borderColor: INK, color: INK, opacity: off ? 0.45 : 1 }}>Thêm vào cuối</button>
          <button type="button" onClick={onClose} disabled={busy} className={btn} style={{ borderColor: "transparent", color: TEXT }}>Đóng</button>
        </div>
      )}
    </div>
  );
}
