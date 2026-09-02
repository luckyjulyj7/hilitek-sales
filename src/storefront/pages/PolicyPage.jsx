import React from "react";
import { Landmark, Copy } from "lucide-react";
import { PAGES, SITE } from "../config.js";

/** Trang chính sách chung — render từ PAGES[key] trong config.js. */
export default function PolicyPage({ pageKey }) {
  const page = PAGES[pageKey];
  if (!page) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 font-sans text-center text-mute">
        Nội dung trang đang được cập nhật.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 font-sans">
      <h1 className="font-display text-3xl font-bold text-ink">{page.title}</h1>
      {page.intro && <p className="mt-3 text-ink/75 text-[14.5px] leading-relaxed">{page.intro}</p>}

      {page.bank && <BankCard bank={page.bank} />}

      <div className="mt-8 space-y-7">
        {(page.sections || []).map((s, i) => (
          <section key={i} className="border-l-[3px] border-yellow pl-4">
            <h2 className="font-display text-[17px] font-bold text-ink">{s.heading}</h2>
            {Array.isArray(s.body)
              ? s.body.map((b, j) => (
                  <p key={j} className="mt-2 text-[14px] text-ink/80 leading-relaxed">{b}</p>
                ))
              : s.body && <p className="mt-2 text-[14px] text-ink/80 leading-relaxed">{s.body}</p>}
            {s.bullets?.length > 0 && (
              <ul className="mt-2 list-disc pl-5 space-y-1.5 text-[14px] text-ink/80 leading-relaxed">
                {s.bullets.map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="mt-10 text-[13px] text-mute">
        Cần hỗ trợ thêm? Gọi <a href={"tel:" + SITE.phoneRaw} className="text-navy font-medium">{SITE.phone}</a>{" "}
        hoặc nhắn Zalo <a href={SITE.zaloHref} target="_blank" rel="noreferrer" className="text-navy font-medium">{SITE.zalo}</a>.
      </div>
    </div>
  );
}

function BankCard({ bank }) {
  return (
    <div className="mt-6 border border-line rounded-lg bg-white p-5">
      <div className="flex items-center gap-2 text-navy font-display font-bold text-[15px]">
        <Landmark size={18} /> Tài khoản chuyển khoản
      </div>
      <dl className="mt-3 grid grid-cols-[110px_1fr] gap-y-2 text-[14px]">
        <dt className="text-mute">Ngân hàng</dt>
        <dd className="text-ink font-medium">{bank.name}</dd>
        <dt className="text-mute">Số tài khoản</dt>
        <dd className="text-ink font-bold font-mono tracking-wide">{bank.accountNumber}</dd>
        <dt className="text-mute">Chủ tài khoản</dt>
        <dd className="text-ink font-medium">{bank.holder}</dd>
        <dt className="text-mute">Chi nhánh</dt>
        <dd className="text-ink">{bank.branch}</dd>
      </dl>
      {bank.note && (
        <p className="mt-3 pt-3 border-t border-line text-[13px] text-ink/70 leading-relaxed">
          <Copy size={13} className="inline -mt-0.5 mr-1 text-navy" />
          {bank.note}
        </p>
      )}
    </div>
  );
}
