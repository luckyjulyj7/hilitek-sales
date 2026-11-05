import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { NEWS_KINDS, NEWS_PATH, SITE, findPage } from "../config.js";
import { fetchLanding } from "../lib/api.js";
import RichText from "../components/RichText.jsx";

/** Trang nội dung / landing tự tạo — poster / banner trỏ tới bằng /trang/<slug>. */
export default function LandingPage({ slug, navigate }) {
  // Cấu hình chung chỉ giữ tiêu đề/slug (nội dung nặng — có thể vài MB nếu nhúng ảnh — tải riêng
  // khi mở đúng trang này). Bản mặc định trong config.js (chưa cấu hình) thì còn nguyên nội dung.
  const meta = findPage(slug);
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
      {meta.news && (
        <>
          <a href={NEWS_PATH} onClick={(e) => { e.preventDefault(); navigate(NEWS_PATH.slice(1)); }} className="mb-4 inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-navy hover:underline"><ArrowLeft size={16} /> Tin tức &amp; video</a>
          <p className="mb-2 text-[14px] font-semibold text-navy">{NEWS_KINDS[meta.news]}{meta.date ? ` · ${meta.date.split("-").reverse().join("/")}` : ""}</p>
        </>
      )}
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-5">{meta.title}</h1>
      {meta.news && meta.cover && !meta.videoUrl && <img src={meta.cover} alt="" className="mb-6 w-full rounded-2xl" />}
      {page ? (
        <RichText text={[meta.videoUrl && !String(page.body).includes(meta.videoUrl) ? meta.videoUrl : "", page.body].filter(Boolean).join("\n\n")} />
      ) : failed ? (
        <p className="text-mute">Không tải được nội dung trang. Vui lòng tải lại trang.</p>
      ) : (
        <p className="text-mute">Đang tải…</p>
      )}
      {meta.cta && (
        <a href={meta.cta.to} onClick={(e) => { e.preventDefault(); navigate(meta.cta.to.slice(1)); }} className="mt-6 inline-flex min-h-[46px] items-center rounded-lg bg-ink px-4 font-semibold text-white hover:bg-navy">{meta.cta.label}</a>
      )}
    </div>
  );
}
