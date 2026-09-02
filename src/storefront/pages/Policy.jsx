import React from "react";
import { SITE } from "../config.js";

export default function Policy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 font-sans">
      <h1 className="font-display text-3xl font-bold text-ink">Chính sách</h1>
      <p className="mt-3 text-ink/70 text-[14px]">
        Tóm tắt các chính sách áp dụng khi mua hàng tại {SITE.name}. Nội dung chi tiết sẽ được cập nhật đầy đủ.
      </p>

      <div className="mt-8 space-y-6">
        {SITE.policies.map((p) => (
          <section key={p.title} className="border-l-[3px] border-yellow pl-4">
            <h2 className="font-display text-lg font-semibold text-ink">{p.title}</h2>
            <p className="mt-1.5 text-[14px] text-ink/75 leading-relaxed whitespace-pre-line">{p.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
