import React, { useMemo, useRef } from "react";
import { SITE, productInCategory } from "../config.js";
import { formatVND } from "../lib/format.js";
import LandingFigure, { hasLandingImage } from "./LandingFigure.jsx";
import { useEdPage } from "./edFonts.js";
import "./ed.css";
/**
 * Trang giới thiệu "Phần mềm bản quyền cho doanh nghiệp" (/phan-mem-ban-quyen).
 * Nội dung pháp lý tóm tắt từ văn bản chính thức (xem nguồn ở cuối trang); sản phẩm lấy từ
 * danh mục "Phần mềm bản quyền" đang bán, cộng các dòng phần mềm báo giá theo số lượng.
 */
export const SOFTWARE_PATH = "/phan-mem-ban-quyen";
const SW_CAT = "Phần mềm bản quyền";

const RISKS = [
  { t: "Rủi ro pháp lý", d: "Phần mềm máy tính được bảo hộ như tác phẩm. Dùng bản không có giấy phép cho công việc có thể bị phạt hành chính đến 500 triệu đồng với tổ chức, kèm tịch thu tang vật vi phạm." },
  { t: "Rủi ro bảo mật", d: "Bản crack, bản bẻ khoá thường kèm mã độc, mã đào tiền ảo hoặc mã tống tiền. Một lần mất dữ liệu kế toán, hợp đồng thường đắt hơn nhiều so với tiền bản quyền." },
  { t: "Không được cập nhật", d: "Bản lậu hay bị chặn cập nhật bảo mật, lỗi kích hoạt giữa chừng, không được hãng hỗ trợ. Máy chạy chập chờn, nhân viên mất thời gian xử lý." },
  { t: "Chi phí hợp lệ", d: "Mua bản quyền có hoá đơn VAT, chứng từ đầy đủ: khoản chi được ghi nhận vào chi phí của doanh nghiệp, đầy đủ khi quyết toán và kiểm tra." },
];

const LAWS = [
  {
    tag: "Luật",
    t: "Luật Sở hữu trí tuệ",
    d: "Chương trình máy tính được bảo hộ quyền tác giả. Sao chép, cài đặt, sử dụng phần mềm khi chưa được chủ sở hữu cho phép là hành vi xâm phạm quyền tác giả.",
  },
  {
    tag: "Từ 15/02/2026",
    t: "Nghị định 341/2025/NĐ-CP",
    d: "Thay thế Nghị định 131/2013. Quy định xử phạt hành chính về quyền tác giả, quyền liên quan: mức phạt tối đa 250 triệu đồng với cá nhân và 500 triệu đồng với tổ chức, kèm tịch thu tang vật vi phạm.",
  },
  {
    tag: "Hình sự",
    t: "Điều 225 Bộ luật Hình sự",
    d: "Vi phạm ở quy mô thương mại có thể bị truy cứu trách nhiệm hình sự. Pháp nhân thương mại có thể bị phạt tiền đến hàng tỷ đồng và bị đình chỉ hoạt động có thời hạn.",
  },
];

// Dòng phần mềm báo giá theo số lượng máy, số người dùng.
const QUOTE = [
  { t: "Windows 11 Pro / Enterprise", d: "Cho máy văn phòng, đủ BitLocker, tham gia domain." },
  { t: "Microsoft Office 2024 / LTSC", d: "Word, Excel, PowerPoint, Outlook dùng vĩnh viễn." },
  { t: "Microsoft 365 Business", d: "Office + email tên miền + OneDrive, trả theo năm." },
  { t: "Windows Server 2025", d: "Máy chủ file, domain, phần mềm kế toán. Tư vấn số CAL." },
  { t: "SQL Server 2025", d: "Cơ sở dữ liệu cho phần mềm kế toán, ERP, bán hàng." },
  { t: "Diệt virus doanh nghiệp", d: "Bảo vệ máy trạm, máy chủ, quản lý tập trung." },
];

const STEPS = [
  ["Khảo sát", "Cho Hili biết số máy, việc đang dùng (kế toán, thiết kế, máy chủ…)."],
  ["Báo giá trong ngày", "Đề xuất đúng phiên bản, đúng số lượng, không mua thừa."],
  ["Hoá đơn VAT, giấy phép", "Xuất hoá đơn cho công ty, giao key, tem, giấy phép điện tử."],
  ["Cài đặt, kích hoạt", "Kỹ thuật Hili cài và kích hoạt tận nơi tại TP.HCM hoặc hỗ trợ từ xa."],
];

// Phần mềm theo bộ phận: giúp khách biết nhanh công ty mình cần gì.
const DEPTS = [
  { t: "Văn phòng, hành chính", d: "Soạn thảo, bảng tính, email, họp trực tuyến.", chips: ["Windows 11 Pro", "Office 2024", "Microsoft 365"] },
  { t: "Kế toán", d: "Phần mềm kế toán thường chạy trên SQL Server, cần máy chủ ổn định.", chips: ["Windows 11 Pro", "Office", "SQL Server"] },
  { t: "Máy chủ, IT", d: "Chia sẻ file, quản lý tài khoản, phân quyền cho nhân viên.", chips: ["Windows Server", "CAL người dùng", "Sao lưu"] },
  { t: "Bảo mật", d: "Chặn mã độc, mã tống tiền, quản lý tập trung các máy.", chips: ["Diệt virus doanh nghiệp", "Cập nhật Windows"] },
];

// Bảng so sánh các loại giấy phép phổ biến.
const LICENSES = [
  ["OEM / FQC", "Gắn với 1 máy cài đầu tiên", "Không", "Trả 1 lần", "Máy mới, dùng cố định lâu dài"],
  ["Retail (FPP)", "1 máy tại một thời điểm", "Có (gỡ máy cũ)", "Trả 1 lần", "Hay thay, luân chuyển máy"],
  ["ESD (điện tử)", "Theo loại OEM hoặc Retail", "Theo loại", "Trả 1 lần", "Cần kích hoạt nhanh, mua nhiều máy"],
  ["Microsoft 365", "Theo người dùng (nhiều thiết bị)", "Có", "Theo tháng, năm", "Cần email, lưu trữ đám mây, luôn bản mới"],
];

export const SW_FAQ = [
  ["Bản OEM, Retail, FQC, ESD khác nhau thế nào?", "OEM gắn với máy cài đầu tiên. Retail (FPP) chuyển được sang máy khác. FQC là mã của bản Windows OEM đóng hộp DSP. ESD là bản quyền điện tử, nhận key qua email, không có hộp. Hili tư vấn loại phù hợp theo cách công ty dùng máy."],
  ["Hilitek có xuất hoá đơn VAT cho công ty không?", "Có. Mọi đơn phần mềm đều xuất hoá đơn VAT theo thông tin công ty, kèm chứng từ để kế toán ghi nhận chi phí."],
  ["Làm sao kiểm tra máy đang dùng bản quyền thật?", "Windows: Cài đặt → Hệ thống → Kích hoạt, trạng thái phải là \"Đã kích hoạt\" bằng giấy phép số hoặc khoá sản phẩm hợp lệ. Office: mở Word → Tài khoản → Thông tin sản phẩm. Hili kiểm tra giúp miễn phí nếu cần."],
  ["Mua cho nhiều máy có giá riêng không?", "Có. Từ 5 máy trở lên Hili báo giá theo số lượng và gộp cài đặt một lần. Gửi số máy qua Zalo để nhận báo giá."],
  ["Đang dùng bản crack thì chuyển sang bản quyền thế nào?", "Thường không cần cài lại máy: nhập key bản quyền vào Windows, Office là kích hoạt. Trường hợp bản lậu đã sửa hệ thống, Hili sẽ sao lưu dữ liệu rồi cài sạch."],
];

// Ảnh dự phòng khi danh mục chưa tải xong.
const HERO_IMG = "https://media.hilipc.vn/desc/mwixu5no-sbc24zg3.webp";

function info(p) {
  const n = p.name || "";
  if (/win(dows)?\s*(pro\s*)?11|win pro 11/i.test(n)) return { name: "Windows 11 Pro", code: "FQC-10528 · OEM", d: "Bản 64-bit đóng hộp, dùng vĩnh viễn cho một máy." };
  if (/office home & business 2024/i.test(n)) return { name: "Office Home & Business 2024", code: "EP2-06604 · ESD", d: "Word, Excel, PowerPoint, Outlook. Bản điện tử, dùng vĩnh viễn." };
  return { name: n.replace(/^Phần mềm\s+/i, ""), code: p.sku || "", d: p.shortDesc || "" };
}

export default function SoftwareLanding({ catalog, navigate }) {
  useEdPage("Phần mềm bản quyền cho doanh nghiệp: Windows, Office, Server | Hilitek");
  const products = useMemo(() => (catalog?.products || []).filter((p) => productInCategory(p, SW_CAT)), [catalog]);
  const tel = "tel:" + (SITE.phoneRaw || "");
  const zalo = SITE.zaloHref || "https://zalo.me/" + (SITE.phoneRaw || "");
  const listRef = useRef(null);
  const lead = products.find((p) => /win/i.test(p.name)) || products[0];
  const li = lead ? info(lead) : { name: "Windows 11 Pro", code: "FQC-10528 · OEM" };
  const open = (slug) => (e) => { e.preventDefault(); navigate(`san-pham/${slug}`); };
  const toList = (e) => { e.preventDefault(); listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  return (
    <div className="ed">
      {/* ===== Đầu trang ===== */}
      <section className="ed-hero"><div className="ed-wrap ed-grid">
        <div className="ed-hero-tx">
          <p className="ed-label"><b>Phần mềm Microsoft</b> &nbsp;/&nbsp; cho doanh nghiệp</p>
          <h1>Bản quyền cho cả công ty. <span className="ed-u">Có hoá đơn, có chứng nhận.</span></h1>
          <p>Windows, Office, Microsoft 365, Windows Server và SQL Server chính hãng. Mỗi giấy phép kèm hoá đơn VAT và chứng nhận bản quyền. Kỹ thuật Hilitek cài đặt, kích hoạt và hỗ trợ từ xa khi máy gặp sự cố.</p>
          <div className="ed-cta">
            <a className="ed-btn" href={zalo} target="_blank" rel="noreferrer">Nhận báo giá qua Zalo <span className="ed-ar">→</span></a>
            <a className="ed-link" href="#bang-gia" onClick={toList}>Xem bảng giá</a>
          </div>
        </div>
        <figure className="ed-hero-pic">
          {lead
            ? <a className="ed-shot" href={`/san-pham/${lead.slug}`} onClick={open(lead.slug)}><img src={lead.images?.[0] || HERO_IMG} alt={lead.name} loading="eager" decoding="async" /></a>
            : <div className="ed-shot"><img src={HERO_IMG} alt="Windows 11 Pro bản OEM đóng hộp" loading="eager" decoding="async" /></div>}
          <dl className="ed-spec">
            <div><dt>Sản phẩm</dt><dd>{li.name}</dd></div>
            <div><dt>Mã</dt><dd className="ed-num">{li.code}</dd></div>
            <div><dt>Kèm theo</dt><dd>Hoá đơn VAT, chứng nhận bản quyền</dd></div>
            <div><dt>Bảo hành</dt><dd>Hỗ trợ từ xa qua UltraViewer, AnyDesk</dd></div>
            {lead && <div><dt>Giá, gồm VAT</dt><dd className="p">{formatVND(lead.price)}</dd></div>}
          </dl>
        </figure>
      </div></section>

      <section className="ed-facts"><div className="ed-wrap ed-grid">
        <div><span className="ed-label">01</span><b>Có hoá đơn VAT</b><span>Xuất theo thông tin công ty</span></div>
        <div><span className="ed-label">02</span><b>Có chứng nhận bản quyền</b><span>Giấy phép chính hãng Microsoft</span></div>
        <div><span className="ed-label">03</span><b>Bảo hành online</b><span>Kỹ thuật hỗ trợ từ xa qua UltraViewer, AnyDesk</span></div>
        <div><span className="ed-label">04</span><b>Cài đặt, kích hoạt giúp</b><span>Tận nơi tại TP.HCM hoặc từ xa</span></div>
      </div></section>

      {/* ===== Pháp lý ===== */}
      <section className="ed-sec"><div className="ed-wrap ed-grid">
        <p className="ed-label ed-side">01 &nbsp;Pháp lý</p>
        <div className="ed-main">
          <h2>Từ 15/02/2026, tổ chức dùng phần mềm không bản quyền có thể bị phạt tới <span className="ed-u">500 triệu đồng</span>.<sup>1</sup></h2>
          <div className="ed-two">
            <p>{LAWS[0].d}</p>
            <p>Ngoài tiền phạt, tang vật và phương tiện vi phạm có thể bị tịch thu. Vi phạm ở quy mô thương mại còn có thể bị truy cứu theo Điều 225 Bộ luật Hình sự.<sup>2</sup></p>
          </div>
          <div className="ed-big"><strong>500</strong><span>triệu đồng, mức phạt hành chính tối đa với tổ chức. Cá nhân tới 250 triệu đồng.</span></div>
          <p className="ed-foot">
            <span className="ed-num">1</span> Nghị định 341/2025/NĐ-CP, thay Nghị định 131/2013. <a href="https://congbao.chinhphu.vn/van-ban/nghi-dinh-so-341-2025-nd-cp-468563.htm" target="_blank" rel="noreferrer nofollow">Công báo Chính phủ</a>, <a href="https://cov.gov.vn/tin-tuc/gioi-thieu-nghi-dinh-so-3412025ndcp-quy-dinh-xu-phat-vi-pham-hanh-chinh-ve-quyen-tac-gia-quyen-lien-quan-168844.html" target="_blank" rel="noreferrer nofollow">Cục Bản quyền tác giả</a>.
            &nbsp; <span className="ed-num">2</span> Bộ luật Hình sự 2015, sửa đổi 2017. Thông tin tham khảo, không thay tư vấn pháp lý.
          </p>
        </div>
      </div></section>

      {/* ===== Sản phẩm có sẵn ===== */}
      <section id="bang-gia" ref={listRef} className="ed-sec stone" style={{ scrollMarginTop: 110 }}><div className="ed-wrap">
        <div className="ed-head">
          <h2>Có sẵn, giao key trong ngày.</h2>
          <p className="ed-label">{products.length || 2} sản phẩm &nbsp;/&nbsp; giá đã gồm VAT</p>
        </div>
        {products.length > 0 && (
          <div className="ed-cards">
            {products.map((p) => {
              const x = info(p);
              return (
                <a key={p.id} className="ed-card" href={`/san-pham/${p.slug}`} onClick={open(p.slug)}>
                  <div className="pic"><img src={p.images?.[0] || HERO_IMG} alt={p.name} loading="lazy" decoding="async" /></div>
                  <div className="tx"><h3>{x.name}</h3><span className="pr">{formatVND(p.price)}</span><p>{x.d}</p><span className="ed-link">Xem chi tiết</span></div>
                </a>
              );
            })}
          </div>
        )}
      </div></section>

      {/* ===== Báo giá theo số máy ===== */}
      <section className="ed-sec"><div className="ed-wrap ed-grid">
        <p className="ed-label ed-side">02 &nbsp;Báo giá theo số máy</p>
        <div className="ed-main">
          <h2>Phần mềm cho cả hệ thống, báo giá trong ngày.</h2>
          <p>Từ 5 máy trở lên Hilitek báo giá riêng và gộp cài đặt một lần. Bấm vào dòng cần báo giá để nhắn Zalo.</p>
          <div className="ed-rows">
            {QUOTE.map(({ t, d }, i) => (
              <a key={t} href={zalo} target="_blank" rel="noreferrer">
                <span className="n">{String(i + 1).padStart(2, "0")}</span><h3>{t}</h3><p>{d}</p><span className="go">→</span>
              </a>
            ))}
          </div>
        </div>
      </div></section>

      {/* ===== Chọn giấy phép ===== */}
      <section className="ed-sec line"><div className="ed-wrap ed-grid">
        <p className="ed-label ed-side">03 &nbsp;Chọn giấy phép</p>
        <div className="ed-main">
          <h2>Cùng là Windows, mỗi loại giấy phép hợp một cách dùng máy.</h2>
          <div className="ed-table">
            <table>
              <thead><tr><th>Loại</th><th>Dùng cho</th><th>Chuyển máy</th><th>Thanh toán</th><th>Hợp khi</th></tr></thead>
              <tbody>{LICENSES.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </div>
      </div></section>

      {/* ===== Theo bộ phận ===== */}
      <section className="ed-sec stone"><div className="ed-wrap ed-grid">
        <p className="ed-label ed-side">04 &nbsp;Theo bộ phận</p>
        <div className="ed-main">
          <h2>Mỗi phòng ban cần một bộ phần mềm khác nhau.</h2>
          <ul className="ed-rows">
            {DEPTS.map(({ t, d, chips }, i) => (
              <li key={t}><span className="n">{String(i + 1).padStart(2, "0")}</span><h3>{t}</h3><p>{d}<small>{chips.join("  ·  ")}</small></p><span /></li>
            ))}
          </ul>
        </div>
      </div></section>

      {/* ===== Rủi ro ===== */}
      <section className="ed-sec"><div className="ed-wrap ed-grid">
        <p className="ed-label ed-side">05 &nbsp;Vì sao</p>
        <div className="ed-main">
          <h2>Bản crack rẻ lúc đầu, đắt về sau.</h2>
          <ul className="ed-rows">
            {RISKS.map(({ t, d }, i) => <li key={t}><span className="n">{String(i + 1).padStart(2, "0")}</span><h3>{t}</h3><p>{d}</p><span /></li>)}
          </ul>
        </div>
      </div></section>

      {/* ===== Quy trình ===== */}
      <section className="ed-sec line"><div className="ed-wrap">
        <h2>Hilitek làm trọn, từ khảo sát tới kích hoạt.</h2>
        <ol className="ed-steps">
          {STEPS.map(([t, d]) => <li key={t}><h3>{t}</h3><p>{d}</p></li>)}
        </ol>
        {["sw-meeting.webp", "sw-install.webp", "sw-office-team.webp"].some(hasLandingImage) && (
          <div className="ed-photos">
            <LandingFigure src="/landing/sw-meeting.webp" alt="Nhân viên Hilitek tư vấn bản quyền cho doanh nghiệp" />
            <LandingFigure src="/landing/sw-install.webp" alt="Kỹ thuật viên Hilitek cài đặt, kích hoạt phần mềm" />
            <LandingFigure src="/landing/sw-office-team.webp" alt="Văn phòng dùng phần mềm bản quyền" />
          </div>
        )}
      </div></section>

      {/* ===== Hỏi đáp ===== */}
      <section className="ed-sec stone"><div className="ed-wrap ed-grid">
        <p className="ed-label ed-side">06 &nbsp;Hỏi đáp</p>
        <div className="ed-main">
          <h2 style={{ marginBottom: 40 }}>Câu hỏi các công ty hay hỏi.</h2>
          <div className="ed-faq">{SW_FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
        </div>
      </div></section>

      {/* ===== Cuối trang ===== */}
      <section className="ed-end"><div className="ed-wrap ed-grid">
        <h2>Rà soát bản quyền miễn phí cho cả văn phòng.</h2>
        <div className="ed-end-r">
          <p className="ed-label">Gọi hoặc nhắn Zalo</p>
          <a className="ed-tel" href={tel}>{SITE.phone}</a>
          <p style={{ marginTop: 14 }}>Gửi số máy và phần mềm đang dùng, Hilitek báo giá trọn gói trong ngày.</p>
          <a className="ed-btn y" href={zalo} target="_blank" rel="noreferrer">Nhắn Zalo <span className="ed-ar">→</span></a>
        </div>
      </div></section>
    </div>
  );
}
