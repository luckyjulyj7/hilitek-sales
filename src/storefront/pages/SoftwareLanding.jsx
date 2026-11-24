import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, ShieldCheck, Scale, Bug, RefreshCw, Receipt, Phone, MessageCircle, ChevronDown, FileCheck2, KeyRound, Building2, Server, Database, Cloud, Monitor } from "lucide-react";
import { SITE, productInCategory } from "../config.js";
import ProductCard from "../components/ProductCard.jsx";
import "./software.css";

/**
 * Trang giới thiệu "Phần mềm bản quyền cho doanh nghiệp" (/phan-mem-ban-quyen).
 * Nội dung pháp lý tóm tắt từ văn bản chính thức (xem nguồn ở cuối trang); sản phẩm lấy từ
 * danh mục "Phần mềm bản quyền" đang bán, cộng các dòng phần mềm báo giá theo số lượng.
 */
export const SOFTWARE_PATH = "/phan-mem-ban-quyen";
const SW_CAT = "Phần mềm bản quyền";

const RISKS = [
  { icon: Scale, t: "Rủi ro pháp lý", d: "Phần mềm máy tính được bảo hộ như tác phẩm. Dùng bản không có giấy phép cho công việc có thể bị phạt hành chính đến 500 triệu đồng với tổ chức, kèm tịch thu tang vật vi phạm." },
  { icon: Bug, t: "Rủi ro bảo mật", d: "Bản crack, bản bẻ khoá thường kèm mã độc, mã đào tiền ảo hoặc mã tống tiền. Một lần mất dữ liệu kế toán, hợp đồng thường đắt hơn nhiều so với tiền bản quyền." },
  { icon: RefreshCw, t: "Không được cập nhật", d: "Bản lậu hay bị chặn cập nhật bảo mật, lỗi kích hoạt giữa chừng, không được hãng hỗ trợ. Máy chạy chập chờn, nhân viên mất thời gian xử lý." },
  { icon: Receipt, t: "Chi phí hợp lệ", d: "Mua bản quyền có hoá đơn VAT, chứng từ đầy đủ: khoản chi được ghi nhận vào chi phí của doanh nghiệp, đầy đủ khi quyết toán và kiểm tra." },
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
  { icon: Monitor, t: "Windows 11 Pro / Enterprise", d: "Cho máy văn phòng, đủ BitLocker, tham gia domain." },
  { icon: FileCheck2, t: "Microsoft Office 2024 / LTSC", d: "Word, Excel, PowerPoint, Outlook dùng vĩnh viễn." },
  { icon: Cloud, t: "Microsoft 365 Business", d: "Office + email tên miền + OneDrive, trả theo năm." },
  { icon: Server, t: "Windows Server 2025", d: "Máy chủ file, domain, phần mềm kế toán. Tư vấn số CAL." },
  { icon: Database, t: "SQL Server 2025", d: "Cơ sở dữ liệu cho phần mềm kế toán, ERP, bán hàng." },
  { icon: ShieldCheck, t: "Diệt virus doanh nghiệp", d: "Bảo vệ máy trạm, máy chủ, quản lý tập trung." },
];

const STEPS = [
  ["Khảo sát", "Cho Hili biết số máy, việc đang dùng (kế toán, thiết kế, máy chủ…)."],
  ["Báo giá trong ngày", "Đề xuất đúng phiên bản, đúng số lượng, không mua thừa."],
  ["Hoá đơn VAT, giấy phép", "Xuất hoá đơn cho công ty, giao key, tem, giấy phép điện tử."],
  ["Cài đặt, kích hoạt", "Kỹ thuật Hili cài và kích hoạt tận nơi tại TP.HCM hoặc hỗ trợ từ xa."],
];

export const SW_FAQ = [
  ["Bản OEM, Retail, FQC, ESD khác nhau thế nào?", "OEM gắn với máy cài đầu tiên. Retail (FPP) chuyển được sang máy khác. FQC là mã của bản Windows OEM đóng hộp DSP. ESD là bản quyền điện tử, nhận key qua email, không có hộp. Hili tư vấn loại phù hợp theo cách công ty dùng máy."],
  ["Hilitek có xuất hoá đơn VAT cho công ty không?", "Có. Mọi đơn phần mềm đều xuất hoá đơn VAT theo thông tin công ty, kèm chứng từ để kế toán ghi nhận chi phí."],
  ["Làm sao kiểm tra máy đang dùng bản quyền thật?", "Windows: Cài đặt → Hệ thống → Kích hoạt, trạng thái phải là \"Đã kích hoạt\" bằng giấy phép số hoặc khoá sản phẩm hợp lệ. Office: mở Word → Tài khoản → Thông tin sản phẩm. Hili kiểm tra giúp miễn phí nếu cần."],
  ["Mua cho nhiều máy có giá riêng không?", "Có. Từ 5 máy trở lên Hili báo giá theo số lượng và gộp cài đặt một lần. Gửi số máy qua Zalo để nhận báo giá."],
  ["Đang dùng bản crack thì chuyển sang bản quyền thế nào?", "Thường không cần cài lại máy: nhập key bản quyền vào Windows, Office là kích hoạt. Trường hợp bản lậu đã sửa hệ thống, Hili sẽ sao lưu dữ liệu rồi cài sạch."],
];

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div className="sw-faq">
      {SW_FAQ.map(([q, a], i) => (
        <div key={q} className={"sw-qa" + (open === i ? " on" : "")}>
          <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
            <span>{q}</span><ChevronDown size={18} />
          </button>
          {open === i && <p>{a}</p>}
        </div>
      ))}
    </div>
  );
}

export default function SoftwareLanding({ catalog, navigate }) {
  const products = useMemo(() => (catalog?.products || []).filter((p) => productInCategory(p, SW_CAT)), [catalog]);
  const tel = "tel:" + (SITE.phoneRaw || "");
  const zalo = SITE.zaloHref || "https://zalo.me/" + (SITE.phoneRaw || "");
  const toList = (e) => { e.preventDefault(); document.getElementById("sw-sp")?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  useEffect(() => {
    const prev = document.title;
    document.title = "Phần mềm bản quyền cho doanh nghiệp: Windows, Office, Server | Hilitek";
    return () => { document.title = prev; };
  }, []);

  return (
    <div className="sw font-sans">
      {/* ===== Đầu trang ===== */}
      <section className="sw-hero">
        <div className="sw-wrap sw-hero-in">
          <div>
            <span className="sw-tag"><Building2 size={14} /> Giải pháp bản quyền cho doanh nghiệp</span>
            <h1>Phần mềm bản quyền cho doanh nghiệp: <em>đúng luật, an toàn, có hoá đơn VAT</em></h1>
            <p className="sw-lead">Windows, Office, Microsoft 365, Windows Server, SQL Server chính hãng Microsoft. Hili khảo sát, báo giá theo số máy, xuất hoá đơn và cài đặt kích hoạt cho công ty.</p>
            <div className="sw-cta">
              <a href={zalo} target="_blank" rel="noreferrer" className="hx-key y sw-btn"><MessageCircle size={18} /> Nhận báo giá qua Zalo</a>
              <a href="#sw-sp" onClick={toList} className="hx-key sw-btn">Xem sản phẩm <ArrowRight size={16} /></a>
            </div>
            <ul className="sw-ticks">
              <li><ShieldCheck size={15} /> Hàng chính hãng Microsoft</li>
              <li><Receipt size={15} /> Hoá đơn VAT cho công ty</li>
              <li><KeyRound size={15} /> Cài đặt, kích hoạt giúp</li>
            </ul>
          </div>
          <div className="sw-boxes" aria-hidden="true">
            {["sw-office", "sw-windows", "sw-server", "sw-sql"].map((n, i) => (
              <img key={n} src={`/home/${n}.webp`} alt="" className={"b" + i} loading={i < 2 ? "eager" : "lazy"} decoding="async" />
            ))}
          </div>
        </div>
      </section>

      {/* ===== Con số cần biết ===== */}
      <section className="sw-wrap sw-stats">
        <div><b>500 triệu đồng</b><span>Mức phạt hành chính tối đa với tổ chức vi phạm quyền tác giả (Nghị định 341/2025/NĐ-CP)</span></div>
        <div><b>15/02/2026</b><span>Ngày Nghị định 341/2025/NĐ-CP có hiệu lực, thay Nghị định 131/2013</span></div>
        <div><b>Tịch thu</b><span>Tang vật, phương tiện dùng để vi phạm có thể bị tịch thu, ngoài tiền phạt</span></div>
      </section>

      {/* ===== Vì sao ===== */}
      <section className="sw-wrap sw-sec">
        <h2>Vì sao doanh nghiệp cần phần mềm bản quyền?</h2>
        <div className="sw-grid4">
          {RISKS.map(({ icon: I, t, d }) => (
            <div key={t} className="sw-card"><span className="sw-ic"><I size={20} /></span><h3>{t}</h3><p>{d}</p></div>
          ))}
        </div>
      </section>

      {/* ===== Pháp luật ===== */}
      <section className="sw-law">
        <div className="sw-wrap sw-sec">
          <h2>Pháp luật đang siết chặt phần mềm lậu</h2>
          <p className="sw-sub">Tóm tắt các văn bản doanh nghiệp cần biết. Đây là thông tin tham khảo, không thay cho tư vấn pháp lý.</p>
          <ol className="sw-laws">
            {LAWS.map((l) => (
              <li key={l.t}><span className="sw-lt">{l.tag}</span><h3>{l.t}</h3><p>{l.d}</p></li>
            ))}
          </ol>
          <p className="sw-note">
            Văn bản gốc: <a href="https://congbao.chinhphu.vn/van-ban/nghi-dinh-so-341-2025-nd-cp-468563.htm" target="_blank" rel="noreferrer nofollow">Nghị định 341/2025/NĐ-CP trên Công báo Chính phủ</a> ·{" "}
            <a href="https://cov.gov.vn/tin-tuc/gioi-thieu-nghi-dinh-so-3412025ndcp-quy-dinh-xu-phat-vi-pham-hanh-chinh-ve-quyen-tac-gia-quyen-lien-quan-168844.html" target="_blank" rel="noreferrer nofollow">Cục Bản quyền tác giả giới thiệu Nghị định</a>
          </p>
        </div>
      </section>

      {/* ===== Sản phẩm ===== */}
      <section id="sw-sp" className="sw-wrap sw-sec">
        <h2>Chọn phần mềm cho công ty</h2>
        {products.length > 0 && (
          <>
            <p className="sw-sub">Có sẵn, giao key trong ngày, giá đã gồm VAT.</p>
            <div className="sw-products">
              {products.map((p) => <ProductCard key={p.id} product={p} onOpen={(slug) => navigate(`san-pham/${slug}`)} />)}
            </div>
          </>
        )}
        <h3 className="sw-h3">Báo giá theo số máy, số người dùng</h3>
        <div className="sw-grid3">
          {QUOTE.map(({ icon: I, t, d }) => (
            <a key={t} href={zalo} target="_blank" rel="noreferrer" className="sw-card sw-quote">
              <span className="sw-ic"><I size={20} /></span>
              <h3>{t}</h3><p>{d}</p>
              <span className="sw-go">Nhận báo giá <ArrowRight size={15} /></span>
            </a>
          ))}
        </div>
      </section>

      {/* ===== Quy trình ===== */}
      <section className="sw-wrap sw-sec">
        <h2>Hili làm gì cho bạn</h2>
        <ol className="sw-steps">
          {STEPS.map(([t, d], i) => <li key={t}><b>{String(i + 1).padStart(2, "0")}</b><h3>{t}</h3><p>{d}</p></li>)}
        </ol>
      </section>

      {/* ===== Hỏi đáp ===== */}
      <section className="sw-wrap sw-sec">
        <h2>Câu hỏi thường gặp</h2>
        <Faq />
      </section>

      {/* ===== Kêu gọi ===== */}
      <section className="sw-wrap sw-sec">
        <div className="sw-final">
          <div>
            <h2>Rà soát bản quyền miễn phí cho công ty bạn</h2>
            <p>Gửi số máy và phần mềm đang dùng, Hili kiểm tra và báo giá trọn gói trong ngày.</p>
          </div>
          <div className="sw-cta">
            <a href={zalo} target="_blank" rel="noreferrer" className="hx-key y sw-btn"><MessageCircle size={18} /> Nhắn Zalo</a>
            <a href={tel} className="hx-key sw-btn"><Phone size={17} /> Gọi {SITE.phone}</a>
          </div>
        </div>
      </section>
    </div>
  );
}
