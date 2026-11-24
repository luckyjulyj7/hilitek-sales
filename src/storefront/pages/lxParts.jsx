import React, { useEffect } from "react";
import { ChevronDown, MessageCircle, MousePointer2, Phone } from "lucide-react";
import { SITE } from "../config.js";

export const zaloHref = () => SITE.zaloHref || "https://zalo.me/" + (SITE.phoneRaw || "");

/** Tiêu đề tab + font Be Vietnam Pro. */
export function useLx(title) {
  useEffect(() => {
    if (!document.getElementById("gp-font")) {
      const l = document.createElement("link");
      l.id = "gp-font"; l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap";
      document.head.appendChild(l);
    }
    const prev = document.title;
    document.title = title;
    return () => { document.title = prev; };
  }, [title]);
}

const SHEET = [["Họ tên", "Công", "Lương"], ["Nhân viên A", "22", "…"], ["Nhân viên B", "21", "…"], ["Nhân viên C", "22", "…"]];

/** Hình minh hoạ: kỹ thuật viên đang điều khiển máy khách từ xa. */
export function RemoteWindow() {
  return (
    <div className="lx-card lx-win" aria-hidden="true">
      <header><i /><i /><i /><span>Hỗ trợ từ xa</span></header>
      <div className="lx-desk">
        <div className="lx-sheet"><b>Bảng lương.xlsx</b>{SHEET.map((r) => <div key={r[0]}>{r.map((c, i) => <span key={i}>{c}</span>)}</div>)}</div>
        <span className="lx-cur"><MousePointer2 size={26} fill="currentColor" /><em>Kỹ thuật Hili</em></span>
        <div className="lx-face"><img src="/landing/ky-thuat.webp" alt="" loading="lazy" /><span>Kỹ thuật Hili</span></div>
      </div>
    </div>
  );
}

export function LxFaq({ items }) {
  return (
    <section className="lx-w lx-s">
      <div className="lx-c"><h2>Câu hỏi thường gặp</h2></div>
      <div className="lx-faq">{items.map(([q, a]) => <details key={q}><summary>{q}<ChevronDown size={20} /></summary><p>{a}</p></details>)}</div>
    </section>
  );
}

export function LxEnd({ title, text, phone, phoneRaw }) {
  return (
    <div className="lx-w"><section className="lx-end">
      <div className="x"><h2>{title}</h2><p>{text}</p>
        <div className="lx-bs">
          <a className="lx-b p" href={zaloHref()} target="_blank" rel="noreferrer"><MessageCircle size={19} /> Nhắn Zalo</a>
          <a className="lx-b o" href={"tel:" + phoneRaw}><Phone size={18} /> {phone}</a>
        </div>
      </div>
      <img src="/landing/ky-thuat.webp" alt="Kỹ thuật viên Hilitek đeo tai nghe hỗ trợ khách" loading="lazy" />
    </section></div>
  );
}
