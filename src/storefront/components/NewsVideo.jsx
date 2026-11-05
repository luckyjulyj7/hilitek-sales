import React from "react";
import { ArrowRight, FileText, Gamepad2, Play } from "lucide-react";
import { NEWS_KINDS, NEWS_PATH, newsItems } from "../config.js";

export const linkProps = (to, navigate) => (/^https?:/.test(to)
  ? { href: to, target: "_blank", rel: "noreferrer" }
  : { href: to, onClick: (e) => { e.preventDefault(); navigate(to.slice(1)); } });

/** Ảnh bìa của bài, bài chưa có ảnh dùng nền vàng và biểu tượng. */
export function NewsCover({ item }) {
  if (item.image) return <img src={item.image} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />;
  const Icon = item.icon === "game" ? Gamepad2 : item.kind === "video" ? Play : FileText;
  return <div className="flex h-full w-full items-center justify-center bg-yellow text-ink"><Icon size="42%" strokeWidth={1.4} /></div>;
}

export const PlayMark = ({ size = 56 }) => (
  <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-yellow text-ink shadow-card transition duration-300 group-hover:scale-110" style={{ width: size, height: size }}>
    <Play size={size * 0.42} fill="currentColor" strokeWidth={0} className="ml-0.5" />
  </span>
);

/** Khối Tin tức & video ở cuối trang chủ: một bài lớn và danh sách bài mới bên cạnh. */
export default function NewsVideo({ navigate }) {
  const [lead, ...rest] = newsItems();
  const side = rest.slice(0, 4);

  return (
    <section className="mx-auto max-w-[1500px] px-3 pt-10 sm:px-4">
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="font-display text-[30px] sm:text-[38px] font-bold text-ink">Tin tức &amp; video</h2>
        <a {...linkProps(NEWS_PATH, navigate)} className="inline-flex min-h-[44px] shrink-0 items-center gap-1 text-[15px] font-semibold text-navy hover:underline">Xem tất cả <ArrowRight size={15} /></a>
      </div>
      <div className="grid gap-3 lg:h-[468px] lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <a {...linkProps(lead.to, navigate)} className="group relative block min-h-[320px] overflow-hidden rounded-2xl bg-ink text-white">
          <div className="absolute inset-0"><NewsCover item={lead} /></div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(0deg,rgba(6,10,42,.94),rgba(6,10,42,.45) 46%,transparent 74%)" }} />
          {lead.kind === "video" && <PlayMark size={72} />}
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
            <span className="inline-block rounded-md bg-yellow px-2.5 py-1 text-[14px] font-bold text-ink">{NEWS_KINDS[lead.kind]}</span>
            <h3 className="mt-3 max-w-[640px] font-display text-[26px] font-bold leading-[1.12] sm:text-[36px]">{lead.title}</h3>
            {lead.summary && <p className="mt-2 max-w-[560px] text-[15px] leading-snug text-white/85">{lead.summary}</p>}
          </div>
        </a>
        <div className="grid divide-y divide-line rounded-2xl bg-white px-4 lg:grid-rows-4">
          {side.map((n) => (
            <a key={n.to + n.title} {...linkProps(n.to, navigate)} className="group flex min-w-0 items-center gap-4 py-3">
              <div className="relative h-[84px] w-[128px] shrink-0 overflow-hidden rounded-xl bg-ink">
                <NewsCover item={n} />
                {n.kind === "video" && <PlayMark size={34} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-navy">{NEWS_KINDS[n.kind]}</p>
                <h3 className="mt-0.5 line-clamp-2 text-[16px] font-semibold leading-snug text-ink group-hover:text-navy">{n.title}</h3>
              </div>
              <ArrowRight size={18} className="hidden shrink-0 text-ink/40 transition group-hover:translate-x-1 group-hover:text-navy sm:block" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
