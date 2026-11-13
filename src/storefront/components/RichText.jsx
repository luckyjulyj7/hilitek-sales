import { loadDescFonts, fontsInHtml } from "../../lib/descFonts.js";
import React, { useEffect, useRef } from "react";

// ---- Thẻ "nghe thử" âm thanh trong mô tả (VD tiếng gõ switch bàn phím) ----
// Trang quản lý lưu âm thanh thành 1 dòng link riêng: <p><a href="/media/desc/x.mp3">🔊 Tên | dòng ngắn</a></p>.
// Ở đây đổi dòng đó thành thẻ có nút phát. File mẫu thường chỉ là 1 tiếng gõ (~0,2 giây) nên khi bấm
// phát lặp lại theo nhịp gõ phím ~2 giây cho khách nghe rõ; file dài hơn 1 giây thì phát 1 lần.
const SOUND_P_RE = /<p[^>]*>\s*<a\b[^>]*\bhref="([^"]+\.(?:mp3|m4a|wav|ogg)(?:\?[^"]*)?)"[^>]*>([\s\S]*?)<\/a>\s*<\/p>/gi;
const escAttr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const WAVE = [3, 6, 4, 9, 5, 12, 7, 4, 10, 6, 3, 8, 5, 11, 4, 7, 3, 9, 6, 4, 8, 5, 3, 6];

function soundCards(html) {
  const withCards = html.replace(SOUND_P_RE, (_, src, inner) => {
    const text = inner.replace(/<[^>]+>/g, "").replace(/^\s*🔊\s*/u, "").trim();
    const [title, ...rest] = text.split("|");
    const sub = rest.join("|").trim();
    const bars = WAVE.map((h) => `<i style="height:${h * 2}px"></i>`).join("");
    return `<div class="hili-sound" data-src="${escAttr(src)}" role="group" aria-label="Nghe thử ${escAttr(title.trim())}">` +
      `<button type="button" class="hili-sound__play" aria-label="Nghe thử ${escAttr(title.trim())}"><span class="hili-sound__icon"></span></button>` +
      `<div class="hili-sound__body"><div class="hili-sound__tag">🔊 Nghe thử · bấm để nghe</div><div class="hili-sound__title">${title.trim()}</div>` +
      (sub ? `<div class="hili-sound__sub">${sub}</div>` : "") +
      `<div class="hili-sound__wave" aria-hidden="true">${bars}</div></div></div><!--/hs-->`;
  });
  // Các thẻ đứng liền nhau gom thành 1 khối (xếp cạnh nhau trên máy tính) cho dễ thấy, dễ so sánh.
  return withCards.replace(/((?:<div class="hili-sound"[\s\S]*?<!--\/hs-->\s*)+)/g, '<div class="hili-sound-group">$1</div>');
}

// Phát / dừng cho các thẻ âm thanh trong 1 khối nội dung (bắt sự kiện ở khối cha).
function useSoundCards(ref, deps) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    let timers = [];
    let playing = null;
    const stop = () => {
      timers.forEach(clearTimeout); timers = [];
      if (playing) playing.classList.remove("is-playing");
      playing = null;
    };
    const onClick = (e) => {
      // Bấm bất kỳ đâu trên thẻ cũng phát/dừng (không bắt buộc trúng nút ▶).
      const card = e.target.closest(".hili-sound");
      if (!card || !root.contains(card)) return;
      if (playing === card) { stop(); return; }
      stop();
      const src = card.getAttribute("data-src");
      const base = new Audio(src);
      base.preload = "auto";
      playing = card;
      card.classList.add("is-playing");
      const startPattern = () => {
        const dur = base.duration;
        if (!isFinite(dur) || dur > 1) {
          base.currentTime = 0;
          base.play().catch(stop);
          base.onended = stop;
          return;
        }
        // Nhịp gõ: 14 tiếng, khoảng cách 110-200ms (giống người gõ thật, không đều tăm tắp).
        let t = 0;
        for (let i = 0; i < 14; i++) {
          timers.push(setTimeout(() => { const a = base.cloneNode(); a.volume = 0.9; a.play().catch(() => {}); }, t));
          t += 110 + Math.round(Math.random() * 90);
        }
        timers.push(setTimeout(stop, t + 300));
      };
      if (base.readyState >= 1) startPattern();
      else { base.addEventListener("loadedmetadata", startPattern, { once: true }); base.addEventListener("error", stop, { once: true }); base.load(); }
    };
    root.addEventListener("click", onClick);
    return () => { root.removeEventListener("click", onClick); stop(); };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

const YT_RE = /(?:youtube\.com\/(?:watch\?(?:[^ ]*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/;
const IMG_MD_RE = /^!\[([^\]]*)\]\(\s*((?:https?:\/\/|\/)[^\s)]+)\s*\)$/;
const IMG_URL_RE = /^((?:https?:\/\/|\/)\S+?\.(?:png|jpe?g|webp|gif|avif|svg))(?:\?\S*)?$/i;
const INLINE_RE = /\*\*(.+?)\*\*|\*(.+?)\*|__(.+?)__/g;

// In đậm **chữ**, in nghiêng *chữ*, gạch chân __chữ__ trong 1 dòng — trả về mảng node để render.
function parseInline(text) {
  const nodes = [];
  let last = 0, m, key = 0;
  INLINE_RE.lastIndex = 0;
  while ((m = INLINE_RE.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1] !== undefined) nodes.push(<b key={key++}>{m[1]}</b>);
    else if (m[2] !== undefined) nodes.push(<i key={key++}>{m[2]}</i>);
    else if (m[3] !== undefined) nodes.push(<u key={key++}>{m[3]}</u>);
    last = INLINE_RE.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes.length ? nodes : text;
}

/**
 * Render nội dung dạng "văn bản giàu":
 *  - dòng trống = đoạn mới · dòng "- " = gạch đầu dòng
 *  - dòng "# " = tiêu đề LỚN · "## " = tiêu đề VỪA · "### " = tiêu đề NHỎ (đều in đậm)
 *  - **chữ** = in đậm · *chữ* = in nghiêng · __chữ__ = gạch chân
 *  - dòng là ảnh:  ![mô tả](https://.../anh.jpg)  hoặc chỉ dán link ảnh
 *  - dòng là video YouTube: dán link youtube.com/watch?v=... hoặc youtu.be/... -> nhúng khung phát
 * Dùng chung cho mô tả sản phẩm + trang nội dung / landing.
 */
export default function RichText({ text, className = "" }) {
  const raw = String(text || "");
  const htmlRef = useRef(null);
  useSoundCards(htmlRef, [raw]); // nút phát cho thẻ âm thanh (chỉ có tác dụng với mô tả HTML)
  // Mô tả tạo bằng trình soạn thảo mới (Quill) lưu dạng HTML — nhận diện qua thẻ mở đầu, hiện
  // trực tiếp. Mô tả cũ (trước khi đổi sang Quill) là văn bản kiểu Markdown tự chế — parse như cũ.
  if (/^\s*</.test(raw)) {
    // Ảnh trong mô tả chỉ tải khi khách cuộn tới (mô tả nhiều ảnh không làm chậm lúc mở trang).
    // Dòng link tới file .mp3 đứng riêng -> thẻ nghe thử (xem soundCards ở trên).
    const html = soundCards(raw.replace(/<img(?![^>]*\bloading=)/gi, '<img loading="lazy" decoding="async"'));
    loadDescFonts(fontsInHtml(raw)); // mô tả có dùng font riêng thì mới tải font đó
    return <div ref={htmlRef} className={"ql-content space-y-3 text-[15px] text-ink/80 leading-relaxed " + className} dangerouslySetInnerHTML={{ __html: html }} />;
  }
  const lines = raw.replace(/\r/g, "").split("\n");
  const blocks = [];
  let para = [];
  let list = [];
  const flushPara = () => { if (para.length) { blocks.push({ type: "p", text: para.join(" ") }); para = []; } };
  const flushList = () => { if (list.length) { blocks.push({ type: "ul", items: list }); list = []; } };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushPara(); flushList(); continue; }

    const yt = line.match(YT_RE);
    const imgMd = line.match(IMG_MD_RE);
    const imgUrl = !imgMd && line.match(IMG_URL_RE);
    if (line.startsWith("### ")) {
      flushPara(); flushList();
      blocks.push({ type: "h3", text: line.slice(4) });
    } else if (line.startsWith("## ")) {
      flushPara(); flushList();
      blocks.push({ type: "h2", text: line.slice(3) });
    } else if (line.startsWith("# ")) {
      flushPara(); flushList();
      blocks.push({ type: "h1", text: line.slice(2) });
    } else if (yt && /^(https?:\/\/|www\.)/i.test(line)) {
      flushPara(); flushList();
      blocks.push({ type: "yt", id: yt[1] });
    } else if (imgMd) {
      flushPara(); flushList();
      blocks.push({ type: "img", src: imgMd[2], alt: imgMd[1] });
    } else if (imgUrl) {
      flushPara(); flushList();
      blocks.push({ type: "img", src: imgUrl[1] + (line.slice(imgUrl[1].length) || ""), alt: "" });
    } else if (line.startsWith("- ")) {
      flushPara(); list.push(line.slice(2));
    } else {
      flushList(); para.push(line);
    }
  }
  flushPara(); flushList();

  return (
    <div className={"space-y-3 text-[15px] text-ink/80 leading-relaxed " + className}>
      {blocks.map((b, i) => {
        if (b.type === "h1")
          return <h1 key={i} className="font-display text-2xl sm:text-3xl font-bold text-ink pt-2">{parseInline(b.text)}</h1>;
        if (b.type === "h2")
          return <h2 key={i} className="font-display text-xl sm:text-2xl font-bold text-ink pt-2">{parseInline(b.text)}</h2>;
        if (b.type === "h3")
          return <h3 key={i} className="font-display text-[17px] font-bold text-ink pt-1">{parseInline(b.text)}</h3>;
        if (b.type === "ul")
          return (
            <ul key={i} className="list-disc pl-5 space-y-1">
              {b.items.map((it, j) => <li key={j}>{parseInline(it)}</li>)}
            </ul>
          );
        if (b.type === "img")
          return <img key={i} src={b.src} alt={b.alt} loading="lazy" className="rounded-lg border border-line max-w-full mx-auto my-2" />;
        if (b.type === "yt")
          return (
            <div key={i} className="relative w-full my-3 rounded-lg overflow-hidden border border-line" style={{ aspectRatio: "16 / 9" }}>
              <iframe
                src={`https://www.youtube.com/embed/${b.id}`}
                title="Video"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          );
        return <p key={i}>{parseInline(b.text)}</p>;
      })}
    </div>
  );
}
