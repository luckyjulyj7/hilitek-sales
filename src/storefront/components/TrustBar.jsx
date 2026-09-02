import React from "react";
import { BadgeCheck, ShieldCheck, Truck, RefreshCw } from "lucide-react";

const ITEMS = [
  { icon: BadgeCheck, title: "Hàng chính hãng", desc: "Nhập trực tiếp, đủ hoá đơn VAT" },
  { icon: ShieldCheck, title: "Bảo hành theo serial", desc: "Tra cứu online, không cần hoá đơn giấy" },
  { icon: Truck, title: "Giao nhanh toàn quốc", desc: "Nội thành trong ngày" },
  { icon: RefreshCw, title: "Đổi mới 7 ngày", desc: "Lỗi do nhà sản xuất" },
];

export default function TrustBar({ className = "" }) {
  return (
    <div className={"grid grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line rounded-lg overflow-hidden " + className}>
      {ITEMS.map((it) => (
        <div key={it.title} className="flex items-start gap-3 bg-white p-4">
          <it.icon size={22} className="text-navy shrink-0 mt-0.5" />
          <div>
            <div className="font-display font-semibold text-ink text-[14px]">{it.title}</div>
            <div className="text-[12.5px] text-mute leading-snug">{it.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
