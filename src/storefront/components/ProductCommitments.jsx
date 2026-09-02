import React from "react";
import { BadgeCheck, RefreshCw, Truck, Wrench, MapPin, ShieldCheck, CreditCard } from "lucide-react";
import { PRODUCT_SIDEBAR } from "../config.js";

const ICONS = { BadgeCheck, RefreshCw, Truck, Wrench, MapPin, ShieldCheck, CreditCard };

/** "Bảo hành chính hãng — Yên tâm mua hàng": khối cam kết, nằm cạnh khối thông tin sản phẩm (không phải sidebar). */
export default function ProductCommitments({ className = "" }) {
  const s = PRODUCT_SIDEBAR;
  if (!s.commitments?.length) return null;
  return (
    <div className={"border border-line rounded-lg bg-white p-4 " + className}>
      <h3 className="font-display font-bold text-[14px] text-ink leading-snug">{s.commitmentsTitle}</h3>
      <ul className="mt-3 grid sm:grid-cols-2 gap-x-5 gap-y-2">
        {s.commitments.map((c, i) => {
          const Icon = ICONS[c.icon] || ShieldCheck;
          return (
            <li key={i} className="flex items-start gap-2 text-[13px] text-ink/80">
              <Icon size={16} className="text-navy shrink-0 mt-0.5" />
              <span>{c.text}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
