import React, { useEffect, useState } from "react";
import { LANDINGS, SITE } from "../config.js";
import { fetchLanding } from "../lib/api.js";
import RichText from "../components/RichText.jsx";

/** Trang nội dung / landing tự tạo — poster / banner trỏ tới bằng /trang/<slug>. */
export default function LandingPage({ slug, navigate }) {
  // Cấu hình chung chỉ giữ tiêu đề/slug (nội dung nặng — có thể vài MB nếu nhúng ảnh — tải riêng
  // khi mở đúng trang này). Bản mặc định trong config.js (chưa cấu hình) thì còn nguyên nội dung.
  const meta = LANDINGS.find((l) => l && l.slug === slug && l.published !== false);
  const hasMeta = !!meta;
  const hasInlineBody = !!(meta && meta.body);
  const [fetched, setFetched] = useState(null);
  const [failed, setFailed] = useState(false);

  // Chỉ phụ thuộc slug/hasMeta (không phụ thuộc object meta): cứ 60s cấu hình web tự làm mới và
  // tạo object mới — không được vì vậy mà tải lại trang đang đọc.
  useEffect(() => {
    setFailed(false);
    if (!hasMeta || hasInlineBody) return;
    let alive = true;
    fetchLanding(slug)
      .then((p) => { if (alive) { setFetched(p); if (!p) setFailed(true); } })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [slug, hasMeta, hasInlineBody]);

  const page = hasInlineBody ? meta : (fetched && fetched.slug === slug ? fetched : null);
  const title = (page || meta || {}).title;

  useEffect(() => {
    if (!title) return;
    const prev = document.title;
    document.title = `${title} | ${SITE.name}`;
    return () => { document.title = prev; };
  }, [title]);

  if (!meta) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 font-sans text-center">
        <p className="text-mute">Trang này đang được cập nhật hoặc không tồn tại.</p>
        <button onClick={() => navigate("/")} className="mt-4 text-navy font-semibold">Về trang chủ</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 font-sans">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-5">{meta.title}</h1>
      {page ? (
        <RichText text={page.body} />
      ) : failed ? (
        <p className="text-mute">Không tải được nội dung trang. Vui lòng tải lại trang.</p>
      ) : (
        <p className="text-mute">Đang tải…</p>
      )}
    </div>
  );
}
