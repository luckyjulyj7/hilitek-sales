import React, { useEffect, useState } from "react";
import { NEWS_KINDS, SITE, newsItems } from "../config.js";
import { NewsCover, PlayMark, linkProps } from "../components/NewsVideo.jsx";

/** Trang /tin-tuc: tất cả bài, lọc theo loại. Loại chưa có bài thì không hiện nút lọc. */
export default function News({ navigate }) {
  const items = newsItems();
  const kinds = Object.keys(NEWS_KINDS).filter((k) => items.some((n) => n.kind === k));
  const [kind, setKind] = useState("");
  const shown = items.filter((n) => !kind || n.kind === kind);

  useEffect(() => {
    const prev = document.title;
    document.title = `Tin tức và video | ${SITE.name}`;
    return () => { document.title = prev; };
  }, []);

  const chip = (k, label) => (
    <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)}
      className={"min-h-[44px] shrink-0 rounded-lg px-4 text-[15px] font-semibold transition " + (kind === k ? "bg-ink text-yellow" : "bg-white text-ink hover:bg-yellow")}>{label}</button>
  );

  return (
    <div className="mx-auto max-w-[1500px] px-3 pb-10 pt-8 font-sans sm:px-4">
      <h1 className="font-display text-[34px] font-bold text-ink sm:text-[44px]">Tin tức &amp; video</h1>
      {kinds.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">{chip("", "Tất cả")}{kinds.map((k) => chip(k, NEWS_KINDS[k]))}</div>}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((n) => (
          <a key={n.to + n.title} {...linkProps(n.to, navigate)} className="group block overflow-hidden rounded-2xl bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-card">
            <div className="relative aspect-video overflow-hidden bg-ink">
              <NewsCover item={n} />
              {n.kind === "video" && <PlayMark />}
            </div>
            <div className="p-4 sm:p-5">
              <p className="text-[14px] font-semibold text-navy">{NEWS_KINDS[n.kind]}{n.date ? ` · ${n.date.split("-").reverse().join("/")}` : ""}</p>
              <h2 className="mt-1 font-display text-[22px] font-bold leading-tight text-ink">{n.title}</h2>
              {n.summary && <p className="mt-1.5 text-[15px] leading-snug text-ink/70">{n.summary}</p>}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
