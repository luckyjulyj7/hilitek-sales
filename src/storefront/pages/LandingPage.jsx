import React, { useEffect } from "react";
import { LANDINGS, SITE } from "../config.js";
import RichText from "../components/RichText.jsx";

/** Trang nội dung / landing tự tạo — poster / banner trỏ tới bằng /trang/<slug>. */
export default function LandingPage({ slug, navigate }) {
  const page = LANDINGS.find((l) => l && l.slug === slug && l.published !== false);

  useEffect(() => {
    if (!page) return;
    const prev = document.title;
    document.title = `${page.title} | ${SITE.name}`;
    return () => { document.title = prev; };
  }, [page]);

  if (!page) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 font-sans text-center">
        <p className="text-mute">Trang này đang được cập nhật hoặc không tồn tại.</p>
        <button onClick={() => navigate("/")} className="mt-4 text-navy font-semibold">Về trang chủ</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 font-sans">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-5">{page.title}</h1>
      <RichText text={page.body} />
    </div>
  );
}
