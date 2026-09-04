import React, { useEffect, useMemo, useState } from "react";
import { Zap } from "lucide-react";
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
    <div className="flex flex-col items-center justify-center bg-sale text-white rounded-lg w-[56px] h-[52px] sm:w-[62px] sm:h-[56px] shadow-[0_2px_8px_rgba(237,28,36,0.35)]">
      <span className="font-mono font-extrabold text-lg leading-none tabular-nums">{String(v).padStart(2, "0")}</span>
      <span className="text-[10px] uppercase tracking-wide mt-1 text-white/85">{label}</span>
    </div>
  );

  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-6">
      {/* Logo FLASH SALE — khối 2 màu nghiêng + tia sét vàng, nhấp nháy & rung theo nhịp */}
      <div className="relative shrink-0 select-none pr-5 origin-center animate-flashpulse">
        <div className="font-display font-extrabold italic leading-none -skew-x-6">
          <div className="bg-ink text-white text-lg sm:text-xl px-3 py-1 rounded-t-md">FLASH</div>
          <div className="bg-sale text-white text-lg sm:text-xl px-3 py-1 rounded-b-md shadow-[0_0_14px_rgba(237,28,36,0.55)]">SALE</div>
        </div>
        <Zap
          size={40}
          className="absolute -right-1 top-1/2 -translate-y-1/2 text-yellow fill-yellow drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)] animate-flashbolt"
        />
      </div>

      {/* Đồng hồ đếm ngược */}
      <div className="flex items-center gap-2">
        {cell(days, "Ngày")}
        {cell(hours, "Giờ")}
        {cell(mins, "Phút")}
        {cell(secs, "Giây")}
      </div>

      <button
        onClick={goSeeAll}
        className="ml-auto text-sale font-semibold text-[14px] underline underline-offset-2 hover:text-red-700 shrink-0"
      >
        Xem tất cả
      </button>
    </div>
  );
}
