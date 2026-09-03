import React from "react";
import { Phone, MessageCircle, Mail, MapPin, Clock, Facebook } from "lucide-react";
import { SITE } from "../config.js";
import ContactButtons from "./ContactButtons.jsx";

/** Khối thông tin liên hệ + bản đồ — dùng ở trang Liên hệ và trang Xây dựng cấu hình PC. */
export default function ContactInfo({ className = "" }) {
  return (
    <div className={"grid sm:grid-cols-2 gap-8 " + className}>
      <ul className="space-y-4 text-sm">
        <Row icon={Phone} label="Điện thoại"><a href={"tel:" + SITE.phoneRaw} className="text-ink hover:text-navy font-mono">{SITE.phone}</a></Row>
        <Row icon={MessageCircle} label="Zalo"><a href={SITE.zaloHref} target="_blank" rel="noreferrer" className="text-ink hover:text-navy">{SITE.zalo}</a></Row>
        <Row icon={Mail} label="Email"><a href={`mailto:${SITE.email}`} className="text-ink hover:text-navy break-all">{SITE.email}</a></Row>
        <Row icon={MapPin} label="Địa chỉ"><span className="text-ink">{SITE.address}</span></Row>
        <Row icon={Clock} label="Giờ làm việc"><span className="text-ink">{SITE.workingHours}</span></Row>
        <Row icon={Facebook} label="Facebook"><a href={SITE.facebookHref} target="_blank" rel="noreferrer" className="text-ink hover:text-navy break-all">{SITE.facebookHref}</a></Row>
      </ul>

      <div>
        <div className="border border-line bg-white rounded-lg aspect-[4/3] flex items-center justify-center text-mute text-sm overflow-hidden">
          {SITE.mapEmbedUrl ? (
            <iframe title="Bản đồ Hilitek" src={SITE.mapEmbedUrl} className="w-full h-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          ) : (
            <span>Bản đồ hiển thị khi có link nhúng Google Maps</span>
          )}
        </div>
        <ContactButtons className="mt-4" />
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, children }) {
  return (
    <li className="flex gap-3">
      <Icon size={18} className="text-navy shrink-0 mt-0.5" />
      <div>
        <div className="text-[13px] uppercase tracking-wide text-mute">{label}</div>
        <div className="mt-0.5">{children}</div>
      </div>
    </li>
  );
}
