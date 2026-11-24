import React, { useMemo, useRef, useState } from "react";
import { ArrowRight, BadgeCheck, Check, CheckCircle2, Cloud, Laptop, Mail, Monitor, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { SITE, productInCategory } from "../config.js";
import { formatVND } from "../lib/format.js";
import { LxEnd, LxFaq, RemoteWindow, useLx, zaloHref } from "./lxParts.jsx";
import "./lx.css";

/** Trang "Phần mềm bản quyền cho doanh nghiệp". Sản phẩm, giá lấy từ danh mục đang bán. */
export const SOFTWARE_PATH = "/phan-mem-ban-quyen";
const SW_CAT = "Phần mềm bản quyền";

const USES = [
  { id: "oem", ic: Monitor, q: "Máy dùng cố định nhiều năm", a: "OEM / FQC", d: "Gắn với máy cài đầu tiên, trả một lần.", l: [["Đổi sang máy khác", "Không"], ["Thanh toán", "Một lần"]] },
  { id: "fpp", ic: RefreshCw, q: "Hay thay, luân chuyển máy", a: "Retail (FPP)", d: "Gỡ khỏi máy cũ rồi cài sang máy mới.", l: [["Đổi sang máy khác", "Có, gỡ máy cũ"], ["Thanh toán", "Một lần"]] },
  { id: "esd", ic: Mail, q: "Cần nhận key qua email", a: "ESD điện tử", d: "Không có hộp, nhận key qua email để kích hoạt.", l: [["Đổi sang máy khác", "Tuỳ bản OEM hay Retail"], ["Thanh toán", "Một lần"]] },
  { id: "365", ic: Cloud, q: "Làm việc trên nhiều thiết bị", a: "Microsoft 365", d: "Office luôn bản mới, kèm email và OneDrive, tính theo người dùng.", l: [["Đổi sang máy khác", "Có"], ["Thanh toán", "Theo tháng, năm"]] },
];
const DV = { oem: [Monitor, Check], fpp: [Monitor, ArrowRight, Laptop], esd: [Mail, ArrowRight, Monitor], 365: [Laptop, Users, Cloud] };
const MORE = [
  ["Windows Server", "Máy chủ file, domain", "/home/sw-server.webp"],
  ["SQL Server", "Kế toán, ERP, bán hàng", "/home/sw-sql.webp"],
  ["Microsoft 365", "Office, email, OneDrive", null, Cloud],
  ["Diệt virus", "Quản lý tập trung", null, ShieldCheck],
];

export const SW_FAQ = [
  ["Bản OEM, Retail, FQC, ESD khác nhau thế nào?", "OEM gắn với máy cài đầu tiên. Retail (FPP) chuyển được sang máy khác. FQC là mã của bản Windows OEM đóng hộp DSP. ESD là bản quyền điện tử, nhận key qua email, không có hộp. Hili tư vấn loại phù hợp theo cách công ty dùng máy."],
  ["Hilitek có xuất hoá đơn VAT cho công ty không?", "Có. Mọi đơn phần mềm đều xuất hoá đơn VAT theo thông tin công ty, kèm chứng từ để kế toán ghi nhận chi phí."],
  ["Làm sao kiểm tra máy đang dùng bản quyền thật?", "Windows: Cài đặt → Hệ thống → Kích hoạt, trạng thái phải là \"Đã kích hoạt\" bằng giấy phép số hoặc khoá sản phẩm hợp lệ. Office: mở Word → Tài khoản → Thông tin sản phẩm. Hili kiểm tra giúp miễn phí nếu cần."],
  ["Mua cho nhiều máy có giá riêng không?", "Có. Từ 5 máy trở lên Hili báo giá theo số lượng và gộp cài đặt một lần. Gửi số máy qua Zalo để nhận báo giá."],
  ["Đang dùng bản crack thì chuyển sang bản quyền thế nào?", "Thường không cần cài lại máy: nhập key bản quyền vào Windows, Office là kích hoạt. Trường hợp bản lậu đã sửa hệ thống, Hili sẽ sao lưu dữ liệu rồi cài sạch."],
];

function look(p) {
  const n = String(p.name || "").normalize("NFC");
  if (/win(dows)?\s*(pro\s*)?11/i.test(n)) return { n: "Windows 11 Pro", d: "Bản OEM đóng hộp FQC-10528, 64-bit, cho một máy.", img: "/landing/win11-cut.webp" };
  if (/office home & business 2024/i.test(n)) return { n: "Office Home & Business 2024", d: "Word, Excel, PowerPoint, Outlook. Dùng vĩnh viễn.", img: "/landing/office24.webp", cov: true };
  return { n: n.replace(/^Phần mềm\s+/i, ""), d: p.shortDesc || "", img: p.images?.[0], cov: true };
}

export default function SoftwareLanding({ catalog, navigate }) {
  useLx("Phần mềm bản quyền cho doanh nghiệp: Windows, Office, Server | Hilitek");
  const products = useMemo(() => (catalog?.products || []).filter((p) => productInCategory(p, SW_CAT)), [catalog]);
  const win = products.find((p) => look(p).n === "Windows 11 Pro");
  const list = useRef(null);
  const [use, setUse] = useState("oem");
  const u = USES.find((x) => x.id === use);
  const zalo = zaloHref();

  return (
    <div className="lx">
      <section className="lx-hero"><div className="lx-mesh" /><div className="lx-w in">
        <div>
          <h1>Windows, Office chính hãng cho cả công ty</h1>
          <p>Có hoá đơn VAT, có chứng nhận bản quyền. Kỹ thuật Hilitek cài đặt và bảo hành online qua điều khiển từ xa.</p>
          <div className="lx-bs">
            <a className="lx-b p" href={zalo} target="_blank" rel="noreferrer">Nhận báo giá qua Zalo</a>
            <button type="button" className="lx-b o" onClick={() => list.current?.scrollIntoView({ behavior: "smooth" })}>Xem giá</button>
          </div>
          <ul className="lx-ok"><li><CheckCircle2 size={19} /> Hoá đơn VAT</li><li><CheckCircle2 size={19} /> Chứng nhận bản quyền</li><li><CheckCircle2 size={19} /> Bảo hành online</li></ul>
        </div>
        <div className="lx-art">
          <img className="big" src="/landing/win11-cut.webp" alt="Bộ Windows 11 Pro OEM gồm đĩa và bao giấy phép" />
          <div className="lx-card act" aria-hidden="true"><span className="lx-mini">Cài đặt, Kích hoạt</span><b><CheckCircle2 size={22} /> Windows đã kích hoạt</b></div>
          {win && <div className="lx-card pr"><span className="lx-mini">Windows 11 Pro</span><b>{formatVND(win.price)}</b></div>}
        </div>
      </div></section>

      <section ref={list} className="lx-w lx-s" style={{ scrollMarginTop: 90 }}>
        <div className="lx-c"><h2>Đang bán tại Hilitek</h2></div>
        <div className="lx-two">
          {products.map((p) => {
            const x = look(p);
            return (
              <a key={p.id} className={"lx-prod" + (x.cov ? " g" : "")} href={`/san-pham/${p.slug}`} onClick={(e) => { e.preventDefault(); navigate(`san-pham/${p.slug}`); }}>
                <h3>{x.n}</h3><p className="d">{x.d}</p>
                <div className="r"><b>{formatVND(p.price)}</b><span>Xem chi tiết <ArrowRight size={16} /></span></div>
                <div className="im"><img className={x.cov ? "cov" : ""} src={x.img} alt={p.name} loading="lazy" /></div>
              </a>
            );
          })}
        </div>
      </section>

      <section className="lx-w lx-s">
        <div className="lx-c"><h2>Mua một lần, đủ giấy tờ và người hỗ trợ</h2></div>
        <div className="lx-bento">
          <div className="lx-t s7 bl"><h3>Hoá đơn VAT theo công ty</h3><p>Kế toán có chứng từ để ghi nhận chi phí.</p>
            <div className="v"><div className="lx-card lx-inv" aria-hidden="true">
              <header><span>HOÁ ĐƠN GTGT</span><span className="lx-mini">Hình minh hoạ</span></header>
              <div><span>Người mua</span><b>Công ty của bạn</b></div><div><span>Windows 11 Pro</span><span>Bản quyền</span></div><div><span>Thuế GTGT</span><span>Có trên hoá đơn</span></div>
            </div></div></div>
          <div className="lx-t s5 ye"><h3>Chứng nhận bản quyền</h3><p>Biết rõ máy nào dùng giấy phép nào.</p>
            <div className="v"><div className="lx-card lx-cert" aria-hidden="true"><BadgeCheck size={64} strokeWidth={1.5} /><b>Giấy phép phần mềm</b><i style={{ width: "72%" }} /><i style={{ width: "54%" }} /></div></div></div>
          <div className="lx-t s7 n"><h3>Bảo hành online</h3><p>Kỹ thuật vào máy qua UltraViewer hoặc AnyDesk khi bạn cho phép.</p><div className="v"><RemoteWindow /></div></div>
          <div className="lx-t s5"><h3>Từ 5 máy có giá riêng</h3><p>Gộp cài đặt cho cả văn phòng một lần.</p>
            <div className="v"><div className="lx-pcs" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <i key={i} className={i < 5 ? "on" : ""}><Monitor size={30} strokeWidth={1.7} /></i>)}</div></div></div>
        </div>
      </section>

      <section className="lx-w lx-s"><div className="lx-fine">
        <div>
          <h2>Phần mềm lậu có thể bị phạt tới 500 triệu đồng</h2>
          <p>Nghị định 341/2025/NĐ-CP, hiệu lực từ 15/02/2026, kèm tịch thu tang vật vi phạm.</p>
          <small>Nguồn: <a href="https://congbao.chinhphu.vn/van-ban/nghi-dinh-so-341-2025-nd-cp-468563.htm" target="_blank" rel="noreferrer nofollow">Công báo Chính phủ</a>, <a href="https://cov.gov.vn/tin-tuc/gioi-thieu-nghi-dinh-so-3412025ndcp-quy-dinh-xu-phat-vi-pham-hanh-chinh-ve-quyen-tac-gia-quyen-lien-quan-168844.html" target="_blank" rel="noreferrer nofollow">Cục Bản quyền tác giả</a>. Thông tin tham khảo.</small>
        </div>
        <div className="lx-bars"><div><b>250<small>triệu</small></b><i style={{ height: "32%" }} /><span>Cá nhân, tối đa</span></div><div className="h"><b>500<small>triệu</small></b><i style={{ height: "64%" }} /><span>Tổ chức, tối đa</span></div></div>
      </div></section>

      <section className="lx-w lx-s">
        <div className="lx-c"><h2>Công ty bạn dùng máy thế nào?</h2><p>Chọn một câu, xem loại giấy phép phù hợp.</p></div>
        <div className="lx-pick">
          <div className="lx-q">{USES.map(({ id, ic: I, q }) => <button key={id} type="button" aria-pressed={id === use} onClick={() => setUse(id)}><I size={26} />{q}</button>)}</div>
          <div className="lx-a" aria-live="polite">
            <div className="dv" aria-hidden="true">{DV[use].map((I, i) => <I key={use + i} size={i === 1 && I !== Users ? 38 : 72} strokeWidth={1.4} />)}</div>
            <div><h3>{u.a}</h3><p>{u.d}</p></div>
            <ul>{u.l.map(([k, v]) => <li key={k}><small>{k}</small>{v}</li>)}</ul>
          </div>
        </div>
      </section>

      <section className="lx-w lx-s">
        <div className="lx-c"><h2>Báo giá theo số máy</h2></div>
        <div className="lx-more">{MORE.map(([t, d, img, I]) => <a key={t} className="lx-m" href={zalo} target="_blank" rel="noreferrer"><span className="im">{img ? <img src={img} alt="" loading="lazy" /> : <I size={120} strokeWidth={1.1} color="#1E2A8A" fill={t === "Microsoft 365" ? "#BFD0FF" : "#F7C600"} />}</span><b>{t}</b><span>{d}</span></a>)}</div>
      </section>

      <LxFaq items={SW_FAQ} />
      <LxEnd title="Cần bao nhiêu bản quyền? Hỏi Hili." text="Gửi số máy và phần mềm đang dùng, Hilitek tư vấn đúng loại." phone={SITE.phone} phoneRaw={SITE.phoneRaw} />
    </div>
  );
}
