import React, { useState } from "react";
import { Search } from "lucide-react";
import { FEATURES, SITE } from "../config.js";
import { lookupWarranty } from "../lib/api.js";
import PolicyPage from "./PolicyPage.jsx";

/** /bao-hanh — chính sách bảo hành (từ PAGES) + ô tra cứu serial (ẩn theo FEATURES). */
export default function Warranty() {
  const [serial, setSerial] = useState("");
  const [state, setState] = useState({ status: "idle" });

  const submit = async (e) => {
    e.preventDefault();
    const s = serial.trim();
    if (!s) return;
    setState({ status: "loading" });
    try {
      const res = await lookupWarranty(s);
      setState({ status: "done", res });
    } catch (err) {
      setState({ status: "error", message: err.message });
    }
  };

  return (
    <>
      <PolicyPage pageKey="chinh-sach-bao-hanh" />

      <div className="mx-auto max-w-3xl px-4 pb-14 font-sans">
        {FEATURES.warrantyLookup ? (
          <div className="border-t border-line pt-8">
            <h2 className="font-display text-xl font-bold text-ink">Tra cứu bảo hành theo số serial</h2>
            <p className="mt-2 text-[14px] text-ink/70 leading-relaxed">
              Nhập số serial in trên tem hoặc thân sản phẩm để xem tên sản phẩm, ngày xuất bán và
              thời hạn bảo hành còn lại.
            </p>
            <form onSubmit={submit} className="mt-4 flex gap-2">
              <input
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                placeholder="VD: HLT-2405-000123"
                className="flex-1 border border-line bg-white rounded-md px-3 py-3 font-mono text-sm outline-none focus:border-navy"
              />
              <button className="inline-flex items-center gap-2 bg-navy text-white px-5 rounded-md font-semibold hover:bg-navy-600" disabled={state.status === "loading"}>
                <Search size={16} /> {state.status === "loading" ? "Đang tra…" : "Tra cứu"}
              </button>
            </form>
            <div className="mt-5">
              {state.status === "error" && <p className="text-navy text-sm">Có lỗi khi tra cứu: {state.message}</p>}
              {state.status === "done" && !state.res?.found && (
                <div className="border border-line bg-white rounded-md p-4 text-sm text-ink/70">
                  {state.res?.message || "Không tìm thấy serial này trong hệ thống."}
                </div>
              )}
              {state.status === "done" && state.res?.found && (
                <div className="border border-line bg-white rounded-md p-5">
                  <div className="font-display text-lg text-ink">{state.res.productName}</div>
                  <dl className="mt-3 grid grid-cols-[130px_1fr] gap-y-2 text-sm">
                    <dt className="text-mute">Số serial</dt><dd className="font-mono text-ink">{state.res.serial}</dd>
                    <dt className="text-mute">Ngày xuất bán</dt><dd className="text-ink">{state.res.soldDate || "—"}</dd>
                    <dt className="text-mute">Hạn bảo hành</dt><dd className="text-ink">{state.res.warrantyUntil || "—"}</dd>
                    <dt className="text-mute">Tình trạng</dt>
                    <dd className={state.res.active ? "text-emerald-700" : "text-navy"}>{state.res.active ? "Còn bảo hành" : "Hết bảo hành"}</dd>
                  </dl>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-line rounded-lg p-5 bg-white text-[13.5px] text-mute leading-relaxed">
            <b className="text-ink font-display">Tra cứu bảo hành trực tuyến</b> đang được hoàn thiện và sẽ sớm
            mở tại đây. Trong lúc chờ, vui lòng gọi{" "}
            <a href={"tel:" + SITE.phoneRaw} className="font-mono text-navy">{SITE.phone}</a>{" "}
            kèm số serial để được kiểm tra.
          </div>
        )}
      </div>
    </>
  );
}
