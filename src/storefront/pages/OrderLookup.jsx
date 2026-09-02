import React from "react";
import { PackageSearch } from "lucide-react";
import { SITE } from "../config.js";

export default function OrderLookup() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 font-sans">
      <div className="flex items-center gap-2 text-navy">
        <PackageSearch size={20} />
        <span className="font-mono text-[12px] uppercase tracking-[0.2em]">Tra cứu đơn hàng</span>
      </div>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink">Kiểm tra tình trạng đơn hàng</h1>
      <div className="mt-6 border border-dashed border-line rounded-lg p-5 bg-white text-[13.5px] text-mute leading-relaxed">
        Tính năng tra cứu đơn hàng trực tuyến đang được hoàn thiện. Hiện tại, sau khi đặt hàng
        trên web, Hilitek sẽ gọi lại để xác nhận; bạn có thể hỏi tình trạng đơn qua{" "}
        <a href={"tel:" + SITE.phoneRaw} className="font-mono text-navy">{SITE.phone}</a>{" "}
        hoặc Zalo <a href={SITE.zaloHref} target="_blank" rel="noreferrer" className="text-navy">{SITE.zalo}</a>.
      </div>
    </div>
  );
}
