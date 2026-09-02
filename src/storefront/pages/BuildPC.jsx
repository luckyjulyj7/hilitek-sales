import React from "react";
import { Wrench, Hammer } from "lucide-react";
import ContactInfo from "../components/ContactInfo.jsx";

export default function BuildPC() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 font-sans">
      <div className="flex items-center gap-2 text-navy">
        <Wrench size={20} />
        <span className="font-mono text-[12px] uppercase tracking-[0.2em]">Xây dựng cấu hình PC</span>
      </div>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink">Tự ráp cấu hình PC theo nhu cầu</h1>

      <div className="mt-6 flex items-start gap-3 border border-dashed border-line bg-navy-050/40 rounded-lg p-5">
        <Hammer size={22} className="text-navy shrink-0 mt-0.5" />
        <div className="text-[14px] text-ink/80 leading-relaxed">
          <b className="font-display text-ink">Công cụ chọn cấu hình đang được hoàn thiện.</b>
          <p className="mt-1">
            Trong lúc chờ, bạn cho Hilitek biết nhu cầu (chơi game / làm đồ hoạ / văn phòng) và
            ngân sách — nhân viên sẽ tư vấn cấu hình phù hợp, báo giá và lắp ráp giúp bạn.
          </p>
        </div>
      </div>

      <h2 className="mt-10 font-display text-xl font-bold text-ink border-l-4 border-yellow pl-3">Liên hệ tư vấn</h2>
      <ContactInfo className="mt-5" />
    </div>
  );
}
