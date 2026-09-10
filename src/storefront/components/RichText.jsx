import React from "react";

const YT_RE = /(?:youtube\.com\/(?:watch\?(?:[^ ]*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/;
const IMG_MD_RE = /^!\[([^\]]*)\]\(\s*((?:https?:\/\/|\/)[^\s)]+)\s*\)$/;
const IMG_URL_RE = /^((?:https?:\/\/|\/)\S+?\.(?:png|jpe?g|webp|gif|avif|svg))(?:\?\S*)?$/i;

/**
 * Render nội dung dạng "văn bản giàu":
 *  - dòng trống = đoạn mới · dòng "- " = gạch đầu dòng
 *  - dòng "## " = tiêu đề mục · dòng "### " = tiêu đề nhỏ
 *  - dòng là ảnh:  ![mô tả](https://.../anh.jpg)  hoặc chỉ dán link ảnh
 *  - dòng là video YouTube: dán link youtube.com/watch?v=... hoặc youtu.be/... -> nhúng khung phát
 * Dùng chung cho mô tả sản phẩm + trang nội dung / landing.
 */
export default function RichText({ text, className = "" }) {
  const lines = String(text || "").replace(/\r/g, "").split("\n");
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
        if (b.type === "h2")
          return <h2 key={i} className="font-display text-xl sm:text-2xl font-bold text-ink pt-2">{b.text}</h2>;
        if (b.type === "h3")
          return <h3 key={i} className="font-display text-[17px] font-bold text-ink pt-1">{b.text}</h3>;
        if (b.type === "ul")
          return (
            <ul key={i} className="list-disc pl-5 space-y-1">
              {b.items.map((it, j) => <li key={j}>{it}</li>)}
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
        return <p key={i}>{b.text}</p>;
      })}
    </div>
  );
}
