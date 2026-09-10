import React, { useState } from "react";
import { PackageSearch, Truck, CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";
import { SITE } from "../config.js";
import { lookupOrder } from "../lib/api.js";
import { formatVND } from "../lib/format.js";

const SHIP_STEPS = [
  { id: "packing", label: "Chờ đóng gói" },
  { id: "picked", label: "Chờ lấy hàng" },
  { id: "shipping", label: "Đang giao" },
  { id: "delivered", label: "Đã giao" },
];

function fmtDate(s) {
  if (!s) return "";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleString("vi-VN");
}

export default function OrderLookup() {
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [res, setRes] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setErr(""); setRes(null);
    if (!code.trim() || !phone.trim()) { setErr("Nhập mã đơn hàng và số điện thoại đặt hàng."); return; }
    setBusy(true);
    try {
      setRes(await lookupOrder(code, phone));
    } catch (e2) {
      setErr(e2.message || "Không tra cứu được đơn.");
    } finally {
      setBusy(false);
    }
  };

  const sh = res && res.shipping;
  const failed = sh && (sh.statusId === "failed" || sh.statusId === "returned");
  const activeIdx = sh ? SHIP_STEPS.findIndex((s) => s.id === sh.statusId) : -1;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 font-sans">
      <div className="flex items-center gap-2 text-navy">
        <PackageSearch size={20} />
        <span className="font-mono text-[13px] uppercase tracking-[0.2em]">Tra cứu đơn hàng</span>
      </div>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink">Kiểm tra tình trạng đơn hàng</h1>

      <form onSubmit={submit} className="mt-6 border border-line rounded-lg bg-white p-5 grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
        <label className="block">
          <span className="block text-[13px] font-medium text-ink mb-1">Mã đơn hàng</span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="VD: WEB12345678"
            className="w-full border border-line rounded-md px-3 py-2 text-[15px] outline-none focus:border-navy uppercase"
          />
        </label>
        <label className="block">
          <span className="block text-[13px] font-medium text-ink mb-1">Số điện thoại đặt hàng</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="09xx xxx xxx"
            inputMode="tel"
            className="w-full border border-line rounded-md px-3 py-2 text-[15px] outline-none focus:border-navy"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="h-[42px] rounded-md bg-navy text-white font-display font-bold px-5 text-[14px] tracking-wide hover:bg-navy-600 disabled:opacity-60 inline-flex items-center justify-center gap-2"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <PackageSearch size={16} />} Tra cứu
        </button>
      </form>

      {err && <p className="mt-3 text-[14px] text-sale">{err}</p>}

      {res && (
        <div className="mt-5 border border-line rounded-lg bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="font-mono text-[13px] text-mute">Mã đơn</div>
              <div className="font-mono font-bold text-ink text-[17px]">{res.code}</div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-050 text-navy text-[13px] font-semibold px-3 py-1.5">
              {res.orderStatusId === "cancelled" ? <XCircle size={14} /> : res.orderStatusId === "done" || res.orderStatusId === "delivered" ? <CheckCircle2 size={14} /> : <Clock size={14} />}
              {res.orderStatus}
            </span>
          </div>

          <dl className="mt-4 grid grid-cols-[110px_1fr] gap-y-1.5 text-[14px]">
            {res.placedAt && (<><dt className="text-mute">Ngày đặt</dt><dd className="text-ink">{fmtDate(res.placedAt)}</dd></>)}
            {res.itemCount > 0 && (<><dt className="text-mute">Số lượng</dt><dd className="text-ink">{res.itemCount} sản phẩm</dd></>)}
            {res.recipient && (<><dt className="text-mute">Người nhận</dt><dd className="text-ink">{res.recipient}</dd></>)}
            {res.address && (<><dt className="text-mute">Giao tới</dt><dd className="text-ink">{res.address}</dd></>)}
          </dl>

          <div className="my-4 border-t border-line" />

          {sh ? (
            <div>
              <div className="flex items-center gap-2 font-display font-bold text-ink">
                <Truck size={17} className="text-navy" /> Vận chuyển
              </div>
              <dl className="mt-2 grid grid-cols-[110px_1fr] gap-y-1.5 text-[14px]">
                <dt className="text-mute">Đơn vị VC</dt><dd className="text-ink">{sh.carrier || "—"}</dd>
                <dt className="text-mute">Mã vận đơn</dt><dd className="text-ink font-mono font-semibold">{sh.trackingCode || "—"}</dd>
                {sh.cod > 0 && (<><dt className="text-mute">Thu hộ (COD)</dt><dd className="text-ink font-mono">{formatVND(sh.cod)}</dd></>)}
                {sh.deliveredDate && (<><dt className="text-mute">Ngày giao</dt><dd className="text-ink">{fmtDate(sh.deliveredDate)}</dd></>)}
              </dl>

              {failed ? (
                <div className="mt-4 rounded-md bg-red-50 text-sale text-[14px] font-medium px-3 py-2 inline-flex items-center gap-2">
                  <XCircle size={15} /> {sh.status}
                </div>
              ) : (
                <ol className="mt-4 flex items-center">
                  {SHIP_STEPS.map((s, i) => {
                    const done = i <= activeIdx;
                    return (
                      <li key={s.id} className="flex-1 flex items-center">
                        <div className="flex flex-col items-center text-center">
                          <span className={"w-7 h-7 grid place-items-center rounded-full text-[13px] font-bold " + (done ? "bg-navy text-white" : "bg-navy-050 text-mute")}>
                            {done ? <CheckCircle2 size={15} /> : i + 1}
                          </span>
                          <span className={"mt-1 text-[11px] leading-tight max-w-[72px] " + (done ? "text-ink font-medium" : "text-mute")}>{s.label}</span>
                        </div>
                        {i < SHIP_STEPS.length - 1 && (
                          <span className={"flex-1 h-[2px] mx-1 " + (i < activeIdx ? "bg-navy" : "bg-line")} />
                        )}
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          ) : (
            <p className="text-[14px] text-mute leading-relaxed">
              Đơn đang được Hilitek xử lý, chưa bàn giao cho đơn vị vận chuyển. Nhân viên sẽ gọi
              số <span className="font-mono">{phone}</span> để xác nhận và chốt phí ship.
            </p>
          )}
        </div>
      )}

      <div className="mt-5 text-[13px] text-mute leading-relaxed">
        Cần hỗ trợ gấp? Gọi{" "}
        <a href={"tel:" + SITE.phoneRaw} className="font-mono text-navy">{SITE.phone}</a>{" "}
        hoặc Zalo <a href={SITE.zaloHref} target="_blank" rel="noreferrer" className="text-navy">{SITE.zalo}</a>.
      </div>
    </div>
  );
}
