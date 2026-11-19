import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, X, Send, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { adminApi } from "./lib/adminApi.js";
import { uploadProductImage } from "./lib/mediaUpload.js";

/**
 * Chat nội bộ — 1 phòng chung cho mọi tài khoản đăng nhập /quanlybanhang.
 *
 * Tiết kiệm lượt Worker (Cloudflare Free):
 *  - Khung đóng: KHÔNG tự hỏi máy chủ. Vòng đồng bộ 20 giây sẵn có (op=poll) đã kèm id tin mới nhất
 *    (sự kiện "hili-poll", xem lib/storage.js); chỉ khi id đó lớn hơn id đang có mới tải phần mới (op=chat&after).
 *  - Khung mở và tab đang hiện: hỏi 5 giây/lần để tin đến gần như ngay.
 * Dữ liệu: bảng chat_msgs (worker/schema.sql). Dòng kind 'm' = tin, 'd' = lệnh xoá tin ref, 'x' = tin đã xoá.
 */
const INK = "#1E2A8A";
const TEXT = "#111827";
const MUTE = "#6B7280";
const LINE = "#E5E7EB";
const RUST = "#C62828";
const OPEN_POLL_MS = 5000;
const DEL_WINDOW_MS = 5 * 60 * 1000;
const MAX_KEEP = 300; // giữ tối đa bấy nhiêu tin trên máy

const readKey = (uid) => "hili_chat_read_" + uid;
const fmtTime = (iso) => {
  const d = new Date(iso);
  const now = new Date();
  const hm = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  return d.toDateString() === now.toDateString() ? hm : `${hm} ${d.getDate()}/${d.getMonth() + 1}`;
};

// Biến link http(s) thành thẻ <a>; giữ nguyên xuống dòng.
function Linkified({ text }) {
  const parts = String(text).split(/(https?:\/\/[^\s<]+)/g);
  return parts.map((p, i) =>
    /^https?:\/\//.test(p)
      ? <a key={i} href={p} target="_blank" rel="noopener noreferrer" className="underline break-all">{p}</a>
      : <React.Fragment key={i}>{p}</React.Fragment>
  );
}

export default function StaffChat({ currentUser, accounts = [] }) {
  const uid = currentUser?.id;
  const myName = currentUser?.fullName || currentUser?.username || "";
  const isAdmin = currentUser?.role === "admin";
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [readId, setReadId] = useState(() => { try { return Number(localStorage.getItem(readKey(uid))) || 0; } catch { return 0; } });
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [noTable, setNoTable] = useState(false);
  const lastRef = useRef(0);
  const loadingRef = useRef(false);
  const listRef = useRef(null);
  const fileRef = useRef(null);
  const atBottomRef = useRef(true);

  const nameOf = useMemo(() => {
    const m = new Map(accounts.map((a) => [a.id, a.fullName || a.username]));
    return (msg) => m.get(msg.uid) || msg.name || "Không rõ";
  }, [accounts]);

  // Gộp dòng mới vào danh sách: áp lệnh xoá ('d'), bỏ trùng.
  const merge = useCallback((rows) => {
    if (!rows || !rows.length) return;
    setMsgs((cur) => {
      const byId = new Map(cur.map((m) => [m.id, m]));
      for (const r of rows) {
        if (r.kind === "d") {
          const t = byId.get(r.ref);
          if (t) byId.set(r.ref, { ...t, kind: "x", text: "", img: "" });
        } else byId.set(r.id, r);
      }
      return [...byId.values()].filter((m) => m.kind !== "d").sort((a, b) => a.id - b.id).slice(-MAX_KEEP);
    });
    lastRef.current = Math.max(lastRef.current, ...rows.map((r) => r.id));
  }, []);

  const load = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const r = await adminApi("chat", { query: lastRef.current ? { after: lastRef.current } : {}, retries: 1 });
      if (r.noTable) { setNoTable(true); return; }
      setNoTable(false);
      merge(r.msgs);
      setErr("");
    } catch (e) {
      setErr(String((e && e.message) || e));
    } finally { loadingRef.current = false; }
  }, [merge]);

  // Lần đầu: tải 60 tin mới nhất (để biết số tin chưa đọc).
  useEffect(() => { if (uid) load(); }, [uid, load]);

  // Khung đóng: nghe vòng đồng bộ sẵn có, có tin mới mới tải.
  useEffect(() => {
    const onPoll = (e) => {
      const last = Number(e.detail && e.detail.chat) || 0;
      if (last > lastRef.current) load();
    };
    window.addEventListener("hili-poll", onPoll);
    return () => window.removeEventListener("hili-poll", onPoll);
  }, [load]);

  // Khung mở + tab đang hiện: hỏi nhanh.
  useEffect(() => {
    if (!open) return;
    load();
    const iv = setInterval(() => { if (!document.hidden) load(); }, OPEN_POLL_MS);
    const onVis = () => { if (!document.hidden) load(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { clearInterval(iv); document.removeEventListener("visibilitychange", onVis); };
  }, [open, load]);

  // Đánh dấu đã đọc khi khung đang mở và tab đang hiện.
  const lastId = msgs.length ? msgs[msgs.length - 1].id : 0;
  useEffect(() => {
    if (!open || document.hidden || !lastId || lastId <= readId) return;
    setReadId(lastId);
    try { localStorage.setItem(readKey(uid), String(lastId)); } catch { /* bỏ qua */ }
  }, [open, lastId, readId, uid]);

  const unread = useMemo(() => msgs.filter((m) => m.id > readId && m.kind === "m" && m.uid !== uid).length, [msgs, readId, uid]);

  // Số tin chưa đọc trên tiêu đề tab.
  useEffect(() => {
    const base = document.title.replace(/^\(\d+\+?\)\s*/, "");
    document.title = unread ? `(${unread > 99 ? "99+" : unread}) ${base}` : base;
  }, [unread]);

  // Cuộn xuống cuối khi có tin mới (nếu đang ở cuối) hoặc khi mở khung.
  useLayoutEffect(() => {
    const el = listRef.current;
    if (el && (atBottomRef.current || !open)) el.scrollTop = el.scrollHeight;
  }, [msgs, open]);
  const onScroll = () => {
    const el = listRef.current;
    if (el) atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  };

  const send = async ({ img = "" } = {}) => {
    const t = text.trim();
    if ((!t && !img) || busy) return;
    setBusy(true); setErr("");
    try {
      const r = await adminApi("chat-send", { method: "POST", body: { text: img ? "" : t, img, name: myName }, retries: 1 });
      if (!img) setText("");
      atBottomRef.current = true;
      merge([r.msg]);
    } catch (e) { setErr(String((e && e.message) || e)); }
    finally { setBusy(false); }
  };

  const sendFile = async (file) => {
    if (!file || !/^image\//.test(file.type)) return;
    setBusy(true); setErr("");
    try {
      const { url } = await uploadProductImage(file);
      setBusy(false);
      await send({ img: url });
    } catch (e) { setErr("Tải ảnh lỗi: " + String((e && e.message) || e)); setBusy(false); }
  };

  const del = async (m) => {
    if (!window.confirm("Xoá tin nhắn này?")) return;
    try { await adminApi("chat-del", { method: "POST", body: { id: m.id }, retries: 1 }); await load(); }
    catch (e) { setErr(String((e && e.message) || e)); }
  };

  if (!uid) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Chat nội bộ"
        aria-label="Chat nội bộ"
        className="fixed bottom-[76px] right-6 z-50 w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition-all hover:brightness-110"
        style={{ background: INK, color: "#fff" }}
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full text-[11px] font-semibold flex items-center justify-center" style={{ background: RUST, color: "#fff" }}>
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed bottom-[132px] right-6 z-50 w-[360px] max-w-[calc(100vw-32px)] h-[480px] max-h-[65vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
          style={{ border: `1px solid ${LINE}` }}
          onPaste={(e) => { const f = [...(e.clipboardData?.files || [])].find((x) => /^image\//.test(x.type)); if (f) { e.preventDefault(); sendFile(f); } }}
        >
          <div className="px-4 py-2.5 flex items-center justify-between text-white" style={{ background: INK }}>
            <div className="font-semibold text-sm">Chat nội bộ · Phòng chung</div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Đóng chat" className="opacity-80 hover:opacity-100"><X size={18} /></button>
          </div>

          <div ref={listRef} onScroll={onScroll} className="flex-1 overflow-y-auto px-3 py-2 space-y-2" style={{ background: "#F6F7FB" }}>
            {noTable && <div className="text-xs text-center mt-6" style={{ color: RUST }}>Chưa tạo bảng chat trên máy chủ (chạy worker/schema.sql).</div>}
            {!noTable && msgs.length === 0 && <div className="text-xs text-center mt-6" style={{ color: MUTE }}>Chưa có tin nhắn nào. Gửi lời chào mọi người nhé!</div>}
            {msgs.map((m, i) => {
              const mine = m.uid === uid;
              const prev = msgs[i - 1];
              const showName = !mine && (!prev || prev.uid !== m.uid || Date.parse(m.at) - Date.parse(prev.at) > 10 * 60 * 1000);
              const canDel = m.kind === "m" && (isAdmin || (mine && Date.now() - Date.parse(m.at) < DEL_WINDOW_MS));
              return (
                <div key={m.id} className={`group flex flex-col ${mine ? "items-end" : "items-start"}`}>
                  {showName && <div className="text-[11px] font-medium mb-0.5 px-1" style={{ color: MUTE }}>{nameOf(m)}</div>}
                  <div className={`flex items-end gap-1 ${mine ? "flex-row-reverse" : ""}`}>
                    <div
                      className="max-w-[260px] rounded-2xl px-3 py-1.5 text-sm whitespace-pre-wrap break-words"
                      style={m.kind === "x" ? { background: "transparent", color: MUTE, border: `1px dashed ${LINE}`, fontStyle: "italic" } : mine ? { background: INK, color: "#fff" } : { background: "#fff", color: TEXT, border: `1px solid ${LINE}` }}
                    >
                      {m.kind === "x" ? "Tin nhắn đã bị xoá" : (
                        <>
                          {m.img && <a href={m.img} target="_blank" rel="noopener noreferrer"><img src={m.img} alt="Ảnh" className="rounded-lg max-h-[200px] my-1" loading="lazy" /></a>}
                          {m.text && <Linkified text={m.text} />}
                        </>
                      )}
                    </div>
                    <div className="flex flex-col items-center shrink-0">
                      {canDel && (
                        <button type="button" onClick={() => del(m)} title="Xoá tin" aria-label="Xoá tin" className="opacity-0 group-hover:opacity-100 p-0.5" style={{ color: MUTE }}><Trash2 size={13} /></button>
                      )}
                      <span className="text-[10px]" style={{ color: MUTE }}>{fmtTime(m.at)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {err && <div className="px-3 py-1 text-xs" style={{ color: RUST, background: "#FDECEC" }}>{err}</div>}

          <div className="p-2 flex items-end gap-2" style={{ borderTop: `1px solid ${LINE}` }}>
            <button type="button" onClick={() => fileRef.current && fileRef.current.click()} disabled={busy || noTable} title="Gửi ảnh" aria-label="Gửi ảnh" className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40" style={{ color: INK }}>
              <ImagePlus size={18} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files && e.target.files[0]; e.target.value = ""; sendFile(f); }} />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }}
              placeholder="Nhập tin nhắn… (Enter gửi, Shift+Enter xuống dòng)"
              rows={1}
              disabled={noTable}
              className="flex-1 resize-none rounded-lg px-3 py-2 text-sm outline-none max-h-28"
              style={{ border: `1px solid ${LINE}`, color: TEXT }}
            />
            <button type="button" onClick={() => send()} disabled={busy || !text.trim() || noTable} title="Gửi" aria-label="Gửi tin nhắn" className="p-2 rounded-lg text-white disabled:opacity-40" style={{ background: INK }}>
              {busy ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
