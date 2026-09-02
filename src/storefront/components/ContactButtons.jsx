import React from "react";
import { Phone, MessageCircle } from "lucide-react";
import { SITE } from "../config.js";

/** Nút liên hệ nhanh (Zalo / gọi điện) — dùng ở trang Liên hệ và chi tiết sản phẩm. */
export default function ContactButtons({ product, className = "" }) {
  const msg = product
    ? `Xin chào Hilitek, tôi quan tâm sản phẩm: ${product.name} (SKU ${product.sku}).`
    : "Xin chào Hilitek, tôi cần tư vấn sản phẩm.";
  const zaloHref = SITE.zaloHref + (SITE.zaloHref.includes("?") ? "&" : "?") + "text=" + encodeURIComponent(msg);

  return (
    <div className={"flex flex-wrap gap-3 " + className}>
      <a
        href={zaloHref}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-md bg-navy text-white font-semibold px-5 py-2.5 text-sm hover:bg-navy-600"
      >
        <MessageCircle size={18} /> Nhắn Zalo
      </a>
      <a
        href={"tel:" + SITE.phoneRaw}
        className="inline-flex items-center gap-2 rounded-md border border-navy text-navy font-semibold px-5 py-2.5 text-sm hover:bg-navy hover:text-white"
      >
        <Phone size={18} /> Gọi {SITE.phone}
      </a>
    </div>
  );
}
