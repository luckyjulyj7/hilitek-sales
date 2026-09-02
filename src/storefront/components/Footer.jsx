import React from "react";
import { Phone, MessageCircle, Mail, MapPin, Clock } from "lucide-react";
import { SITE, MENU, FEATURES } from "../config.js";
import { href } from "../router.js";
import Logo from "./Logo.jsx";
import SocialLinks from "./SocialLinks.jsx";

export default function Footer({ navigate }) {
  const go = (to) => (e) => {
    e.preventDefault();
    navigate(to);
  };

  return (
    <footer className="mt-16 bg-ink text-white/70 font-sans">
      <div className="mx-auto max-w-[1500px] px-4 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr_1.4fr]">
        <div>
          <Logo size={34} textClass="text-xl text-white" className="text-white" />
          <p className="mt-3 text-[13px] leading-relaxed">{SITE.intro}</p>
          <SocialLinks title="Kênh chính thức" titleClass="text-white/50" className="mt-4" />
          <p className="mt-4 text-[12px] leading-relaxed text-white/45">
            {SITE.legalName}
            {SITE.taxCode && <> — MST: {SITE.taxCode}</>}
          </p>
        </div>

        <div>
          <h4 className="font-display text-[13px] font-semibold uppercase tracking-wide text-white mb-3">Danh mục</h4>
          <ul className="space-y-2 text-[13px]">
            {MENU.map((g) => (
              <li key={g.slug}>
                <a
                  href={href("/danh-muc", { group: g.group })}
                  onClick={go(href("/danh-muc", { group: g.group }).slice(1))}
                  className="hover:text-white"
                >
                  {g.group}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-[13px] font-semibold uppercase tracking-wide text-white mb-3">Hỗ trợ</h4>
          <ul className="space-y-2 text-[13px]">
            <li><a href="#/tra-cuu-don-hang" onClick={go("/tra-cuu-don-hang")} className="hover:text-white">Tra cứu đơn hàng</a></li>
            <li><a href="#/huong-dan-thanh-toan" onClick={go("/huong-dan-thanh-toan")} className="hover:text-white">Hướng dẫn thanh toán</a></li>
            <li><a href="#/chinh-sach-giao-hang" onClick={go("/chinh-sach-giao-hang")} className="hover:text-white">Chính sách giao hàng</a></li>
            <li><a href="#/bao-hanh" onClick={go("/bao-hanh")} className="hover:text-white">Chính sách bảo hành</a></li>
            <li><a href="#/lien-he" onClick={go("/lien-he")} className="hover:text-white">Liên hệ &amp; địa chỉ</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-[13px] font-semibold uppercase tracking-wide text-white mb-3">Liên hệ</h4>
          <ul className="space-y-2 text-[13px]">
            <li className="flex items-start gap-2"><Phone size={14} className="mt-0.5 shrink-0 text-yellow" /><a href={"tel:" + SITE.phoneRaw} className="hover:text-white font-mono">{SITE.phone}</a></li>
            <li className="flex items-start gap-2"><MessageCircle size={14} className="mt-0.5 shrink-0 text-yellow" /><a href={SITE.zaloHref} target="_blank" rel="noreferrer" className="hover:text-white">Zalo {SITE.zalo}</a></li>
            <li className="flex items-start gap-2"><Mail size={14} className="mt-0.5 shrink-0 text-yellow" /><a href={`mailto:${SITE.email}`} className="hover:text-white break-all">{SITE.email}</a></li>
            <li className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 shrink-0 text-yellow" />
              <span>
                {SITE.address}
                {SITE.mapLink && (
                  <>
                    {" — "}
                    <a href={SITE.mapLink} target="_blank" rel="noreferrer" className="text-yellow hover:underline">Chỉ đường</a>
                  </>
                )}
              </span>
            </li>
            <li className="flex items-start gap-2"><Clock size={14} className="mt-0.5 shrink-0 text-yellow" /><span>{SITE.workingHours}</span></li>
          </ul>
        </div>

        {SITE.mapEmbedUrl && (
          <div className="sm:col-span-2 lg:col-span-1">
            <h4 className="font-display text-[13px] font-semibold uppercase tracking-wide text-white mb-3">Bản đồ</h4>
            <div className="rounded-md overflow-hidden border border-white/15 h-[180px]">
              <iframe
                title="Bản đồ Hilitek"
                src={SITE.mapEmbedUrl}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[1500px] px-4 py-4 text-[12px] text-white/45 flex flex-col sm:flex-row gap-1 sm:gap-4 justify-between">
          <span>© {new Date().getFullYear()} {SITE.name}. Giá và tình trạng hàng có thể thay đổi không báo trước.</span>
          <a href="/admin" className="hover:text-white/80">Trang quản lý nội bộ</a>
        </div>
      </div>
    </footer>
  );
}
