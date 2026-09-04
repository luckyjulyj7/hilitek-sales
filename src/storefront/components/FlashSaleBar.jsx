import React, { useEffect, useMemo, useState } from "react";
import { Zap, ArrowRight } from "lucide-react";
import { FLASH_SALE, homeSectionSeeAll } from "../config.js";
import { href } from "../router.js";

function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    mins: Math.floor((s % 3600) / 60),
    secs: s % 60,
    done: diff === 0,
  };
}

export default function FlashSaleBar({ navigate }) {
  const target = useMemo(() => {
    const t = FLASH_SALE.endsAt ? Date.parse(FLASH_SALE.endsAt) : NaN;
    return Number.isFinite(t) ? t : Date.now() + 2 * 86400 * 1000; // demo: 2 ngày
  }, []);
  const { days, hours, mins, secs } = useCountdown(target);
  const goSeeAll = () => {
    const q = homeSectionSeeAll(FLASH_SALE);
    if (q._href) { navigate(q._href.replace(/^#/, "") || "/"); return; }
    navigate(href("/danh-muc", Object.keys(q).length ? q : { sort: "discount" }).slice(1));
  };

  const cell = (v, label) => (
    <div className="flex flex-col items-center bg-white/15 rounded-md px-3 py-1.5 min-w-[58px]">
      <span className="font-mono font-bold text-lg leading-none tabular-nums">{String(v).padStart(2, "0")}</span>
      <span className="text-[11px] uppercase tracking-wide text-white/80">{label}</span>
    </div>
  );

  return (
    <div className="rounded-lg bg-gradient-to-r from-rose-600 to-red-500 text-white px-4 py-3 flex flex-wrap items-center gap-3 sm:gap-5">
      <div className="flex items-center gap-2 font-display font-extrabold text-lg tracking-wide uppercase">
        <Zap size={20} className="fill-yellow text-yellow animate-pulse" /> {FLASH_SALE.title || "Flash Sale"}
      </div>
      <div className="flex items-center gap-2">
        {cell(days, "Ngày")}
        {cell(hours, "Giờ")}
        {cell(mins, "Phút")}
        {cell(secs, "Giây")}
      </div>
      <button
        onClick={goSeeAll}
        className="ml-auto inline-flex items-center gap-1.5 bg-white text-red-600 font-semibold text-[14px] rounded-md px-4 py-2 hover:bg-yellow-300"
      >
        Xem tất cả <ArrowRight size={15} />
      </button>
    </div>
  );
}
