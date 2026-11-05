import React from "react";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { SITE, MENU, NEWS_PATH, POLICY_LINKS } from "../config.js";
import { href } from "../router.js";
import Logo from "./Logo.jsx";
import SocialLinks from "./SocialLinks.jsx";
import NewsletterSignup from "./NewsletterSignup.jsx";

const HELP = [
  { label: "Tin tức & video", to: NEWS_PATH },
  { label: "Tra cứu đơn hàng", to: "/tra-cuu-don-hang" },
  { label: "Tra cứu bảo hành", to: "/bao-hanh" },
  { label: "Điểm tích luỹ", to: "/diem-tich-luy" },
  { label: "Xây dựng cấu hình PC", to: "/xay-dung-cau-hinh" },
  { label: "Liên hệ và bản đồ", to: "/lien-he" },
];

function Card({ icon: Icon, label, title, note, ...link }) {
  return (
    <a {...link} className="group flex min-w-0 items-center gap-4 rounded-xl border border-white/10 p-4 transition hover:border-yellow/60 sm:p-5">
      <Icon size={26} strokeWidth={1.6} className="shrink-0 text-yellow" />
      <span className="min-w-0">
        <span className="block text-[14px] text-white/60">{label}</span>
        <span className="block truncate font-display text-[20px] font-bold text-white">{title}</span>
        <span className="block truncate text-[14px] text-white/60">{note}</span>
      </span>
    </a>
  );
}

function Column({ title, children }) {
  return (
    <div>
      <h4 className="mb-4 font-display text-[17px] font-bold text-white">{title}</h4>
      <ul className="space-y-3 text-[15px]">{children}</ul>
    </div>
  );
}

export default function Footer({ navigate }) {
  const link = (to) => ({ href: to, onClick: (e) => { e.preventDefault(); navigate(to.replace(/^\//, "")); }, className: "transition hover:text-yellow" });
  const shop = SITE.mapLink
    ? { href: SITE.mapLink, target: "_blank", rel: "noreferrer" }
    : { href: "/lien-he", onClick: (e) => { e.preventDefault(); navigate("lien-he"); } };

  return (
    <footer className="mt-16 bg-ink text-white/70 font-sans pb-[calc(env(safe-area-inset-bottom)+56px)] lg:pb-0">
      <NewsletterSignup />

      <div className="mx-auto max-w-[1280px] px-4">
        <div className="grid gap-3 border-b border-white/10 py-8 md:grid-cols-3">
          <Card icon={Phone} label="Gọi mua hàng" title={SITE.phone} note={SITE.workingHours} href={"tel:" + SITE.phoneRaw} />
          <Card icon={MessageCircle} label="Tư vấn qua Zalo" title={`Zalo ${SITE.zalo}`} note="Hỏi kỹ trước khi mua" href={SITE.zaloHref} target="_blank" rel="noreferrer" />
          <Card icon={MapPin} label="Cửa hàng" title="Phường Phú Thọ, TP.HCM" note="Bấm để xem đường đi" {...shop} />
        </div>

        <div className="grid gap-x-12 gap-y-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.35fr]">
          <div>
            <Logo size={38} textClass="text-2xl text-white" className="text-white" />
            <p className="mt-4 max-w-[340px] text-[15px] leading-relaxed">Phím chuột, màn hình, linh kiện PC và máy chơi game cầm tay chính hãng. Đủ hoá đơn VAT, bảo hành theo số serial.</p>
            <SocialLinks title="" className="mt-5" />
            {SITE.mapEmbedUrl && (
              <div className="mt-5 h-[190px] max-w-[380px] overflow-hidden rounded-xl border border-white/15">
                <iframe title="Bản đồ Hilitek" src={SITE.mapEmbedUrl} className="h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
            )}
          </div>
          <Column title="Sản phẩm">
            {MENU.slice(0, 8).map((g) => <li key={g.slug}><a {...link(href("/danh-muc", { group: g.group }))}>{g.group}</a></li>)}
          </Column>
          <Column title="Hỗ trợ">
            {HELP.map((h) => <li key={h.to}><a {...link(h.to)}>{h.label}</a></li>)}
          </Column>
          <Column title="Chính sách">
            {POLICY_LINKS.map((p) => <li key={p.to}><a {...link(p.to)}>{p.label}</a></li>)}
          </Column>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-x-8 gap-y-4 px-4 py-5 text-[14px] text-white/60">
          <div className="min-w-0 flex-1 basis-[420px] leading-relaxed">
            <p>{SITE.legalName}{SITE.taxCode && <> · MST {SITE.taxCode}</>}</p>
            <p>{SITE.address}</p>
            <p>© {new Date().getFullYear()} {SITE.name}. Giá và tình trạng hàng có thể thay đổi không báo trước.</p>
          </div>
          <a href="https://online.gov.vn/nen-tang/b0779da4-2084-41a1-ad8b-6f445882b9ec" target="_blank" rel="noreferrer noopener" title="Đã thông báo Bộ Công Thương">
            <img src="/bo-cong-thuong.png" alt="Đã thông báo Bộ Công Thương" width="150" height="56" loading="lazy" className="h-[52px] w-auto" />
          </a>
        </div>
      </div>
    </footer>
  );
}
