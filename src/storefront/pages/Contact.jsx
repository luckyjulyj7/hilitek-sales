import React from "react";
import ContactInfo from "../components/ContactInfo.jsx";

export default function Contact() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 font-sans">
      <h1 className="font-display text-3xl font-bold text-ink">Liên hệ</h1>
      <p className="mt-3 text-ink/70 text-[14px]">
        Cần tư vấn cấu hình hoặc kiểm tra tồn kho? Nhắn Zalo hoặc gọi điện, Hilitek phản hồi trong giờ làm việc.
      </p>
      <ContactInfo className="mt-8" />
    </div>
  );
}
