import React, { useMemo, useState } from "react";
import { CheckCircle2, ArrowLeft, Landmark, Phone } from "lucide-react";
import { useCart } from "../cart.jsx";
import { formatVND } from "../lib/format.js";
import { SITE, CHECKOUT } from "../config.js";
import { VN_PROVINCES, WARDS_BY_PROVINCE } from "../data/vnAddress.js";
import { placeOrder } from "../lib/api.js";
import SearchSelect from "../components/SearchSelect.jsx";

const ORDER_SOURCE = "Đặt hàng website";

export default function Checkout({ navigate }) {
  const { items, subtotal, clear } = useCart();
  const [form, setForm] = useState({
    name: "", phone: "", email: "", province: "", ward: "", address: "", note: "", pay: "bank",
  });
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});
  const [placed, setPlaced] = useState(null);
  const [sending, setSending] = useState(false);
  const [sendErr, setSendErr] = useState("");

  const wards = useMemo(() => WARDS_BY_PROVINCE[form.province] || [], [form.province]);

  if (placed) {
    return (
      <div className="mx-auto max-w-[640px] px-4 py-16 font-sans text-center">
        <CheckCircle2 size={48} className="mx-auto text-navy" />
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">Đã nhận yêu cầu đặt hàng</h1>
        <p className="mt-2 text-mute text-sm">
          Mã đơn: <span className="font-mono font-semibold text-ink">{placed.code}</span>
        </p>
        <p className="mt-3 text-[14px] text-ink/75 leading-relaxed">
          Hilitek sẽ gọi lại số <span className="font-mono">{placed.phone}</span> trong giờ làm việc để xác nhận
          hàng, phí vận chuyển và chốt đơn. Cảm ơn Quý khách!
        </p>
        {placed.pay === "bank" && (
          <div className="mt-5 text-left border border-line rounded-lg bg-white p-4 text-[13.5px]">
            <div className="font-semibold text-navy mb-1.5">Thông tin chuyển khoản</div>
            <div>{SITE.bank.name} — <b className="font-mono">{SITE.bank.accountNumber}</b></div>
            <div>{SITE.bank.holder} · {SITE.bank.branch}</div>
            <div className="mt-1 text-mute">Nội dung: {placed.code} - {placed.phone}</div>
          </div>
        )}
        <button onClick={() => navigate("/")} className="mt-6 inline-flex items-center gap-2 rounded-md bg-navy text-white px-5 py-3 font-display font-semibold hover:bg-navy-600">
          <ArrowLeft size={18} /> Về trang chủ
        </button>
        <p className="mt-6 text-[12px] text-mute">
          (Bản thử — đơn chưa được lưu. Khi nối API, đơn sẽ đổ về app quản lý bán hàng với nguồn “{ORDER_SOURCE}”.)
        </p>
      </div>
    );
  }

  if (items.length === 0)
    return (
      <div className="mx-auto max-w-[1500px] px-4 py-16 font-sans text-center">
        <p className="text-mute">Giỏ hàng trống nên chưa thể đặt hàng.</p>
        <button onClick={() => navigate("/danh-muc")} className="mt-4 rounded-md bg-navy text-white px-5 py-3 font-display font-semibold">Mua sắm</button>
      </div>
    );

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    const er = {};
    if (!form.name.trim()) er.name = "Nhập họ tên";
    if (!/^0\d{8,10}$/.test(form.phone.replace(/\s/g, ""))) er.phone = "Số điện thoại chưa đúng";
    if (!form.province) er.province = "Chọn tỉnh/thành phố";
    if (!form.ward) er.ward = "Chọn phường/xã";
    if (!form.address.trim()) er.address = "Nhập số nhà, tên đường";
    if (!agree) er.agree = "Vui lòng đồng ý điều khoản";
    setErrors(er);
    if (Object.keys(er).length) return;

    const code = "WEB" + Date.now().toString().slice(-8);
    const order = {
      source: ORDER_SOURCE,
      code,
      createdAt: new Date().toISOString(),
      customer: { name: form.name.trim(), phone: form.phone.replace(/\s/g, ""), email: form.email.trim() },
      shipping: {
        province: form.province,
        ward: form.ward,
        address: form.address.trim(),
        fullAddress: [form.address.trim(), form.ward, form.province].filter(Boolean).join(", "),
        note: form.note.trim(),
      },
      payment: form.pay, // 'cod' | 'bank'
      items: items.map((it) => ({ productId: it.id, sku: it.sku, name: it.name, price: it.price, qty: it.qty, preorder: !!it.preorder })),
      subtotal,
      hasPreorder: items.some((it) => it.preorder),
    };

    setSending(true);
    setSendErr("");
    try {
      const r = await placeOrder(order);
      clear();
      setPlaced({ code: r.code || code, phone: order.customer.phone, pay: form.pay });
      window.scrollTo(0, 0);
    } catch (err) {
      setSendErr(
        (err.message || "Không gửi được đơn.") +
          ` — Vui lòng thử lại hoặc gọi ${SITE.phone} để đặt hàng.`
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 font-sans">
      <h1 className="font-display text-3xl font-bold text-ink">Đặt hàng</h1>
      <button onClick={() => navigate("/gio-hang")} className="mt-1 inline-flex items-center gap-1.5 text-[13px] text-navy font-semibold">
        <ArrowLeft size={15} /> Quay lại giỏ hàng
      </button>

      <form onSubmit={submit} className="mt-6 grid lg:grid-cols-[1fr_400px] gap-6 items-start">
        {/* Cột trái: thông tin nhận hàng */}
        <div className="border border-line rounded-lg bg-white p-5 space-y-4">
          <h2 className="font-display font-bold text-ink">Thông tin nhận hàng</h2>

          <Field label="Họ và tên" required error={errors.name}>
            <input value={form.name} onChange={set("name")} className={inp(errors.name)} placeholder="Nguyễn Văn A" />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Số điện thoại" required error={errors.phone}>
              <input value={form.phone} onChange={set("phone")} className={inp(errors.phone)} placeholder="09xx xxx xxx" inputMode="tel" />
            </Field>
            <Field label="Email (không bắt buộc)">
              <input value={form.email} onChange={set("email")} className={inp()} placeholder="email@example.com" inputMode="email" />
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Tỉnh / Thành phố" required error={errors.province}>
              <SearchSelect
                value={form.province}
                onChange={(v) => setForm((f) => ({ ...f, province: v, ward: "" }))}
                options={VN_PROVINCES}
                placeholder="Chọn tỉnh / thành phố"
                error={!!errors.province}
              />
            </Field>
            <Field label="Phường / Xã" required error={errors.ward}>
              <SearchSelect
                value={form.ward}
                onChange={(v) => setForm((f) => ({ ...f, ward: v }))}
                options={wards}
                placeholder={form.province ? "Chọn phường / xã" : "Chọn tỉnh/thành trước"}
                disabled={!form.province}
                error={!!errors.ward}
              />
            </Field>
          </div>
          <Field label="Số nhà, tên đường" required error={errors.address}>
            <input value={form.address} onChange={set("address")} className={inp(errors.address)} placeholder="Ví dụ: 12 Nguyễn Trãi" />
          </Field>
          <Field label="Ghi chú (không bắt buộc)">
            <textarea value={form.note} onChange={set("note")} rows={3} className={inp() + " resize-none"} placeholder="Thời gian nhận hàng, yêu cầu xuất hoá đơn VAT…" />
          </Field>

          <div>
            <div className="text-[13px] font-medium text-ink mb-2">Hình thức thanh toán</div>
            <label className="flex items-center gap-2 text-[14px] text-ink/80 py-1">
              <input type="radio" name="pay" checked={form.pay === "bank"} onChange={() => setForm((f) => ({ ...f, pay: "bank" }))} />
              Chuyển khoản ngân hàng (khuyên dùng)
            </label>
            <label className="flex items-center gap-2 text-[14px] text-ink/80 py-1">
              <input type="radio" name="pay" checked={form.pay === "cod"} onChange={() => setForm((f) => ({ ...f, pay: "cod" }))} />
              Thanh toán khi nhận hàng (COD)
            </label>
          </div>
        </div>

        {/* Cột phải: đơn hàng + thanh toán */}
        <div className="lg:sticky lg:top-[150px] space-y-4">
          <div className="border border-line rounded-lg bg-white p-5">
            <h2 className="font-display font-bold text-ink">Đơn hàng của bạn</h2>
            <ul className="mt-3 space-y-2 text-[13px]">
              {items.map((it) => (
                <li key={it.id} className="flex justify-between gap-3">
                  <span className="text-ink/80">
                    {it.name} <span className="text-mute">× {it.qty}</span>
                    {it.preorder && <span className="ml-1 text-[11px] font-semibold text-[#E8730C]">(đặt trước)</span>}
                  </span>
                  <span className="font-price text-ink shrink-0">{formatVND(it.qty * it.price)}</span>
                </li>
              ))}
            </ul>
            <div className="my-3 border-t border-line" />
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-mute">Tạm tính</span>
              <span className="font-price text-xl font-bold text-sale">{formatVND(subtotal)}</span>
            </div>
            <p className="mt-2 text-[12px] text-mute">Đã bao gồm VAT · Phí vận chuyển báo khi xác nhận đơn.</p>
            {items.some((it) => it.preorder) && (
              <p className="mt-2 text-[12px] text-[#E8730C] leading-relaxed">
                Đơn có sản phẩm <b>đặt trước</b> (tạm hết hàng). Hilitek sẽ liên hệ báo thời gian có hàng trước khi giao.
              </p>
            )}
          </div>

          {form.pay === "bank" && (
            <div className="border border-line rounded-lg bg-white p-5">
              <div className="flex items-center gap-2 font-display font-bold text-[14px] text-navy">
                <Landmark size={17} /> {CHECKOUT.bankTitle}
              </div>
              <dl className="mt-3 grid grid-cols-[92px_1fr] gap-y-1.5 text-[13.5px]">
                <dt className="text-mute">Ngân hàng</dt><dd className="text-ink font-medium">{SITE.bank.name}</dd>
                <dt className="text-mute">Số TK</dt><dd className="text-ink font-bold font-mono">{SITE.bank.accountNumber}</dd>
                <dt className="text-mute">Chủ TK</dt><dd className="text-ink">{SITE.bank.holder}</dd>
                <dt className="text-mute">Chi nhánh</dt><dd className="text-ink">{SITE.bank.branch}</dd>
              </dl>
              <p className="mt-3 pt-3 border-t border-line text-[12.5px] text-ink/70 leading-relaxed">{CHECKOUT.bankNote}</p>
            </div>
          )}

          <div className="border border-line rounded-lg bg-white p-5">
            <label className="flex items-start gap-2.5 text-[13px] text-ink/80 leading-relaxed">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 shrink-0" />
              <span>
                {CHECKOUT.termsLabel}{" "}
                <a href={"#" + CHECKOUT.termsLinkTo} onClick={(e) => { e.preventDefault(); navigate(CHECKOUT.termsLinkTo); }} className="text-navy font-medium hover:underline">
                  {CHECKOUT.termsLinkText}
                </a>{" "}
                <span className="text-sale">*</span>
              </span>
            </label>
            {errors.agree && <p className="mt-1 text-[12px] text-sale">{errors.agree}</p>}
            {sendErr && <p className="mt-2 text-[12.5px] text-sale leading-relaxed">{sendErr}</p>}

            <button
              type="submit"
              disabled={sending}
              className="mt-4 w-full rounded-md bg-navy text-white font-display font-bold py-3 text-[15px] tracking-wide hover:bg-navy-600 disabled:opacity-60"
            >
              {sending ? "ĐANG GỬI ĐƠN…" : "ĐẶT HÀNG"}
            </button>

            <ul className="mt-4 space-y-1.5 text-[12px] text-mute leading-relaxed">
              {CHECKOUT.notes.map((n, i) => <li key={i}>* {n}</li>)}
            </ul>
            <p className="mt-2 text-[12.5px] font-semibold text-sale flex items-center gap-1.5">
              <Phone size={13} /> {CHECKOUT.urgentSupport}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

function inp(err) {
  return (
    "w-full border rounded-md px-3 py-2 text-[14px] outline-none focus:border-navy " +
    (err ? "border-sale bg-red-50/40" : "border-line")
  );
}
function Field({ label, required, error, children }) {
  return (
    <label className="block">
      <span className="block text-[13px] font-medium text-ink mb-1">
        {label} {required && <span className="text-sale">*</span>}
      </span>
      {children}
      {error && <span className="block mt-1 text-[12px] text-sale">{error}</span>}
    </label>
  );
}
