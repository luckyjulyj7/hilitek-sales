import React from "react";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { SITE, MENU, NEWS_PATH, POLICY_LINKS } from "../config.js";
import { href } from "../router.js";
import { LabLogo } from "./Logo.jsx";
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

/** Một "phím" liên hệ lớn: bấm như phím cơ. */
function Card({ icon: Icon, label, title, note, go, ...link }) {
  return (
    <a {...link} className="hx-cc">
      <span className="ic"><Icon size={22} strokeWidth={2} /></span>
      <span className="min-w-0"><small>{label}</small><b>{title}</b><span className="n">{note}</span></span>
      <span className="go" aria-hidden="true">{go} →</span>
    </a>
  );
}

function Column({ title, children }) {
  return (
    <div>
      <h4>{title}</h4>
      <ul>{children}</ul>
    </div>
  );
}

export default function Footer({ navigate }) {
  const link = (to) => ({ href: to, onClick: (e) => { e.preventDefault(); navigate(to.replace(/^\//, "")); }, className: "transition hover:text-yellow" });
  const shop = SITE.mapLink
    ? { href: SITE.mapLink, target: "_blank", rel: "noreferrer" }
    : { href: "/lien-he", onClick: (e) => { e.preventDefault(); navigate("lien-he"); } };

  return (
    <footer className="hx-foot mt-16 font-sans pb-[calc(env(safe-area-inset-bottom)+56px)] lg:pb-0">
      <NewsletterSignup />

      <div className="mx-auto max-w-[1280px] px-4">
        <div className="hx-contact pt-10">
          <Card icon={Phone} label="Gọi mua hàng" title={SITE.phone} note={SITE.workingHours} go="Gọi" href={"tel:" + SITE.phoneRaw} />
          <Card icon={MessageCircle} label="Tư vấn qua Zalo" title={`Zalo ${SITE.zalo}`} note="Hỏi kỹ trước khi mua" go="Nhắn" href={SITE.zaloHref} target="_blank" rel="noreferrer" />
          <Card icon={MapPin} label="Cửa hàng" title="Phường Phú Thọ, TP.HCM" note="Xem đường đi" go="Đi" {...shop} />
        </div>

        <div className="hx-cols">
          <div>
            <LabLogo size={38} textClass="text-2xl text-white" />
            <p className="mt-4 max-w-[340px] text-[15px] leading-relaxed">Phím chuột, màn hình, linh kiện PC và máy chơi game cầm tay chính hãng. Đủ hoá đơn VAT, bảo hành theo số serial.</p>
            <SocialLinks title="" className="mt-5" />
            {SITE.mapEmbedUrl && (
              <div className="hx-map">
                <iframe title="Bản đồ Hilitek" src={SITE.mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
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


      <div className="hx-legal">
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
