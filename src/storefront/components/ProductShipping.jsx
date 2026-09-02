import React from "react";
import { PRODUCT_SIDEBAR } from "../config.js";

/** "Giao hàng & thanh toán": nằm cạnh khối thông tin sản phẩm, dưới hộp mua. */
export default function ProductShipping({ className = "" }) {
  const s = PRODUCT_SIDEBAR;
  return (
    <div className={"border border-line rounded-lg bg-white p-4 " + className}>
      <h3 className="font-display font-bold text-[14px] text-ink">{s.shippingTitle}</h3>
      <ul className="mt-2.5 grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[13px] text-ink/75 list-disc pl-4">
        {s.shipping.map((line, i) => <li key={i}>{line}</li>)}
      </ul>
      {s.payments?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-line flex flex-wrap gap-1.5">
          {s.payments.map((p) => (
            <span key={p} className="text-[11.5px] font-medium text-mute border border-line rounded px-2 py-1">{p}</span>
          ))}
        </div>
      )}
    </div>
  );
}
