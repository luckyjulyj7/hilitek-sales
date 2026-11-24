import React, { useRef } from "react";
import { SITE } from "../config.js";
import LandingFigure, { hasLandingImage } from "./LandingFigure.jsx";
import { useEdPage } from "./edFonts.js";
import "./ed.css";
/**
 * Trang "Dịch vụ IT Helpdesk cho doanh nghiệp" (/dich-vu-it-helpdesk).
 * Phạm vi, cách làm việc và gói dịch vụ tổng hợp từ cách các đơn vị IT thuê ngoài tại TP.HCM đang làm.
 * Giá và thời gian phản hồi chưa ghi cứng: báo giá theo số máy, SLA ghi trong hợp đồng.
 */
export const HELPDESK_PATH = "/dich-vu-it-helpdesk";

const SCOPE = [
  { t: "Máy tính, laptop", d: "Cài đặt, sửa lỗi Windows, Office, phần mềm nghiệp vụ, máy chậm, lỗi in, lỗi mạng." },
  { t: "Mạng nội bộ, Wi-Fi", d: "Router, switch, Wi-Fi phủ văn phòng, VPN làm việc từ xa, mạng chập chờn." },
  { t: "Máy chủ, chia sẻ file", d: "File server, Active Directory, phân quyền thư mục, máy chủ phần mềm kế toán." },
  { t: "Email, Microsoft 365", d: "Email tên miền công ty, tài khoản nhân viên, OneDrive, Teams." },
  { t: "Sao lưu dữ liệu", d: "Lịch sao lưu tự động, kiểm tra bản sao lưu định kỳ, khôi phục khi sự cố." },
  { t: "Bảo mật", d: "Diệt virus doanh nghiệp, vá lỗi, phòng mã độc tống tiền, rà soát bản quyền phần mềm." },
  { t: "Máy in, máy chấm công", d: "Cài đặt, chia sẻ máy in, khắc phục máy chấm công, thiết bị văn phòng." },
  { t: "Camera giám sát", d: "Kiểm tra, bảo trì, xem camera từ xa trên điện thoại." },
];

const PLANS = [
  {
    t: "Theo lần gọi", sub: "Cho văn phòng ít máy, ít sự cố",
    f: ["Hỗ trợ từ xa qua UltraViewer, AnyDesk", "Kỹ thuật tới tận nơi khi cần", "Tính phí theo lần xử lý", "Báo giá trước khi làm"],
  },
  {
    t: "Trọn gói theo tháng", sub: "Phổ biến với công ty 5 đến 50 máy", hot: true,
    f: ["Hỗ trợ từ xa không giới hạn trong giờ làm việc", "Bảo trì định kỳ tại văn phòng", "Kiểm tra sao lưu, cập nhật bảo mật", "Báo cáo tình trạng hệ thống hằng tháng", "Thời gian phản hồi ghi rõ trong hợp đồng"],
  },
  {
    t: "Dự án", sub: "Dựng văn phòng mới, chuyển văn phòng",
    f: ["Khảo sát, thiết kế mạng, Wi-Fi", "Lắp đặt máy tính, máy chủ, camera", "Bản quyền Windows, Office, diệt virus", "Bàn giao tài liệu, đào tạo nhân viên"],
  },
];

const STEPS = [
  { t: "Gửi yêu cầu", d: "Nhắn Zalo, gọi hotline hoặc email. Mỗi yêu cầu được ghi lại để theo dõi." },
  { t: "Xử lý từ xa", d: "Phần lớn lỗi phần mềm được xử lý qua điều khiển từ xa, không cần chờ người tới." },
  { t: "Tới tận nơi", d: "Lỗi phần cứng, mạng, máy in: kỹ thuật tới văn phòng tại TP.HCM." },
  { t: "Báo cáo", d: "Ghi lại nguyên nhân, cách xử lý; đề xuất phòng ngừa để lỗi không lặp lại." },
];

const WHY = [
  { b: "Tiết kiệm", d: "Không tốn lương, bảo hiểm cho một nhân sự IT toàn thời gian; trả theo đúng số máy." },
  { b: "Cả đội kỹ thuật", d: "Không phụ thuộc một người; nghỉ phép, nghỉ việc vẫn có người hỗ trợ." },
  { b: "Ít gián đoạn", d: "Bảo trì định kỳ phát hiện lỗi sớm, đỡ cảnh cả văn phòng ngồi chờ máy." },
  { b: "Một đầu mối", d: "Hilitek vừa hỗ trợ kỹ thuật vừa cung cấp linh kiện, bản quyền: đổi, nâng cấp nhanh." },
];

// Dấu hiệu công ty nên có người lo IT.
const SIGNS = [
  "Máy tính chậm, treo, nhân viên phải chờ hoặc tự sửa",
  "Mạng, Wi-Fi rớt liên tục mà không ai biết nguyên nhân",
  "Không ai chắc dữ liệu kế toán, hợp đồng đã được sao lưu",
  "Nhân viên tự cài phần mềm lậu, máy nhiễm virus quảng cáo",
  "Người cũ nghỉ việc, không còn ai nắm mật khẩu router, email",
  "Mỗi lần có sự cố lại gọi một người quen khác nhau",
];

// So sánh IT nội bộ và IT thuê ngoài.
const COMPARE = [
  ["Chi phí", "Lương, bảo hiểm, phụ cấp hằng tháng", "Trả theo số máy, theo gói"],
  ["Số người hỗ trợ", "Thường 1 người", "Cả đội kỹ thuật"],
  ["Khi nghỉ phép, nghỉ việc", "Gián đoạn, mất người nắm hệ thống", "Có người thay, hồ sơ hệ thống được ghi lại"],
  ["Kiến thức", "Phụ thuộc 1 người", "Nhiều mảng: mạng, máy chủ, bảo mật, phần mềm"],
  ["Linh kiện, bản quyền", "Tự đi mua", "Hilitek cung cấp, đổi, nâng cấp nhanh"],
];

const FAQ = [
  ["Thuê IT ngoài khác gì tuyển một nhân viên IT?", "Với văn phòng dưới khoảng 50 máy, khối lượng việc IT thường không đủ cho một người làm cả ngày. Thuê ngoài trả theo số máy, có cả đội kỹ thuật hỗ trợ, không lo người nghỉ việc mang theo mật khẩu và hiểu biết về hệ thống."],
  ["Hilitek hỗ trợ ở khu vực nào?", "Hỗ trợ từ xa cho mọi nơi. Kỹ thuật tới tận nơi tại TP.HCM; khu vực lân cận vui lòng hỏi trước qua Zalo."],
  ["Bao lâu thì có người phản hồi?", "Thời gian phản hồi và thời gian tới tận nơi được ghi rõ trong hợp đồng theo mức độ sự cố (khẩn cấp, bình thường), để hai bên cùng theo dõi."],
  ["Giá dịch vụ tính thế nào?", "Tuỳ số máy, số người dùng, có máy chủ hay không và tần suất bảo trì tại văn phòng. Hilitek khảo sát miễn phí rồi báo giá trọn gói theo tháng."],
  ["Dữ liệu công ty có an toàn không?", "Kỹ thuật chỉ truy cập khi được công ty cho phép, mỗi lần hỗ trợ từ xa đều cần người dùng đồng ý. Hai bên có thể ký thoả thuận bảo mật thông tin."],
];

// Nhật ký yêu cầu mẫu ở đầu trang: đúng thứ công ty khách nhận được mỗi ngày.
const LOG = [
  ["#1042", "Máy kế toán không in được", "Từ xa · 25 phút", "ok", "Đã xong"],
  ["#1043", "Wi-Fi tầng 2 chập chờn", "Tận nơi · kỹ thuật đang tới", "run", "Đang xử lý"],
  ["#1044", "Tạo email cho nhân viên mới", "Từ xa · 10 phút", "ok", "Đã xong"],
  ["#1045", "Kiểm tra bản sao lưu tháng 11", "Máy chủ · 18:00", "new", "Đã lên lịch"],
];

export default function HelpdeskLanding() {
  useEdPage("Dịch vụ IT Helpdesk cho doanh nghiệp tại TP.HCM | Hilitek");
  const zalo = SITE.zaloHref || "https://zalo.me/" + (SITE.phoneRaw || "");
  const tel = "tel:" + (SITE.techPhoneRaw || SITE.phoneRaw || "");
  const scopeRef = useRef(null);
  const toScope = (e) => { e.preventDefault(); scopeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  return (
    <div className="ed">
      {/* ===== Đầu trang ===== */}
      <section className="ed-hero"><div className="ed-wrap ed-grid">
        <div className="ed-hero-tx">
          <p className="ed-label"><b>IT Helpdesk</b> &nbsp;/&nbsp; cho văn phòng tại TP.HCM</p>
          <h1>Bộ phận IT thuê ngoài, <span className="ed-u">trả theo số máy</span>.</h1>
          <p>Hilitek lo máy tính, mạng, máy in, email, sao lưu và bảo mật cho công ty. Kỹ thuật hỗ trợ từ xa qua UltraViewer, AnyDesk trong giờ làm việc và tới tận nơi khi cần, không cần tuyển nhân viên IT.</p>
          <div className="ed-cta">
            <a className="ed-btn" href={zalo} target="_blank" rel="noreferrer">Đặt lịch khảo sát miễn phí <span className="ed-ar">→</span></a>
            <a className="ed-link" href="#pham-vi" onClick={toScope}>Hilitek lo những gì</a>
          </div>
        </div>
        <div className="ed-hero-pic">
          {hasLandingImage("hd-onsite.webp") && <LandingFigure src="/landing/hd-onsite.webp" alt="Kỹ thuật viên Hilitek kiểm tra máy tính tại văn phòng khách" eager />}
          <div className="ed-log" aria-label="Ví dụ nhật ký yêu cầu hỗ trợ của một văn phòng" style={hasLandingImage("hd-onsite.webp") ? { marginTop: 18 } : undefined}>
            <div className="ed-log-h"><b>Yêu cầu hôm nay</b><span className="ed-label">Văn phòng 24 máy</span></div>
            <ol>
              {LOG.map(([id, t, how, st, label]) => (
                <li key={id}><span className="id">{id}</span><span className="t">{t}<small>{how}</small></span><span className={"st " + st}>{label}</span></li>
              ))}
            </ol>
            <div className="ed-log-f"><span>Mọi yêu cầu được ghi lại</span><span>Báo cáo gửi hằng tháng</span></div>
          </div>
        </div>
      </div></section>

      <section className="ed-facts"><div className="ed-wrap ed-grid">
        <div><span className="ed-label">01</span><b>Hỗ trợ từ xa</b><span>Qua UltraViewer, AnyDesk, xử lý ngay trong giờ làm việc</span></div>
        <div><span className="ed-label">02</span><b>Tới tận nơi</b><span>Lỗi phần cứng, mạng, máy in tại TP.HCM</span></div>
        <div><span className="ed-label">03</span><b>Thời hạn trong hợp đồng</b><span>Theo từng mức sự cố</span></div>
        <div><span className="ed-label">04</span><b>Có hoá đơn VAT</b><span>Chi phí hợp lệ cho công ty</span></div>
      </div></section>

      {/* ===== Vì sao ===== */}
      <section className="ed-sec"><div className="ed-wrap ed-grid">
        <p className="ed-label ed-side">01 &nbsp;Vì sao thuê ngoài</p>
        <div className="ed-main">
          <h2>Văn phòng dưới 50 máy hiếm khi đủ việc cho một nhân viên IT làm cả ngày.</h2>
          <div className="ed-two">
            <p>Thuê ngoài, công ty trả theo số máy thay vì lương, bảo hiểm và phụ cấp cho một người. Phía sau là cả đội kỹ thuật, nên khi một người nghỉ phép hay nghỉ việc, văn phòng vẫn có người lo.</p>
            <p>Mật khẩu, sơ đồ mạng, lịch sao lưu được Hilitek ghi thành hồ sơ hệ thống và bàn giao cho công ty. Không còn cảnh người cũ nghỉ là không ai biết mật khẩu router, email.</p>
          </div>
        </div>
      </div></section>

      {/* ===== Phạm vi ===== */}
      <section id="pham-vi" ref={scopeRef} className="ed-sec stone" style={{ scrollMarginTop: 110 }}><div className="ed-wrap ed-grid">
        <p className="ed-label ed-side">02 &nbsp;Phạm vi</p>
        <div className="ed-main">
          <h2>Mọi thiết bị công nghệ trong văn phòng, một đầu mối.</h2>
          <ul className="ed-rows">
            {SCOPE.map(({ t, d }, i) => <li key={t}><span className="n">{String(i + 1).padStart(2, "0")}</span><h3>{t}</h3><p>{d}</p><span /></li>)}
          </ul>
          {["hd-remote.webp", "hd-network.webp", "hd-team.webp"].some(hasLandingImage) && (
            <div className="ed-photos">
              <LandingFigure src="/landing/hd-remote.webp" alt="Kỹ thuật viên Hilitek hỗ trợ từ xa" />
              <LandingFigure src="/landing/hd-network.webp" alt="Kỹ thuật viên Hilitek sắp xếp tủ mạng" />
              <LandingFigure src="/landing/hd-team.webp" alt="Đội kỹ thuật Hilitek" />
            </div>
          )}
        </div>
      </div></section>

      {/* ===== Dấu hiệu ===== */}
      <section className="ed-sec"><div className="ed-wrap ed-grid">
        <p className="ed-label ed-side">03 &nbsp;Tự kiểm tra</p>
        <div className="ed-main">
          <h2>Có từ hai dấu hiệu trở lên, công ty đã cần người lo IT bài bản.</h2>
          <ul className="ed-rows">
            {SIGNS.map((x, i) => <li key={x}><span className="n">{String(i + 1).padStart(2, "0")}</span><h3 style={{ gridColumn: "2 / 4" }}>{x}</h3><span /></li>)}
          </ul>
        </div>
      </div></section>

      {/* ===== Gói dịch vụ ===== */}
      <section className="ed-sec line"><div className="ed-wrap">
        <div className="ed-head">
          <h2>Ba cách làm việc, báo giá theo số máy.</h2>
          <p className="ed-label">Khảo sát miễn phí trước khi báo giá</p>
        </div>
        <div className="ed-plans">
          {PLANS.map((p, i) => (
            <div key={p.t} className={"ed-plan" + (p.hot ? " hot" : "")}>
              <span className="ed-label">{String(i + 1).padStart(2, "0")}{p.hot ? "  /  nhiều công ty chọn" : ""}</span>
              <h3>{p.t}</h3>
              <p className="for">{p.sub}</p>
              <ul>{p.f.map((x) => <li key={x}>{x}</li>)}</ul>
              <a className="ed-link" href={zalo} target="_blank" rel="noreferrer">Nhận báo giá →</a>
            </div>
          ))}
        </div>
      </div></section>

      {/* ===== Quy trình ===== */}
      <section className="ed-sec stone"><div className="ed-wrap">
        <h2>Gửi yêu cầu là có người nhận, người xử lý và báo cáo.</h2>
        <ol className="ed-steps">
          {STEPS.map(({ t, d }) => <li key={t}><h3>{t}</h3><p>{d}</p></li>)}
        </ol>
      </div></section>

      {/* ===== Thời hạn + so sánh ===== */}
      <section className="ed-sec"><div className="ed-wrap ed-grid">
        <p className="ed-label ed-side">04 &nbsp;Cam kết</p>
        <div className="ed-main">
          <h2>Mỗi mức sự cố một thời hạn, ghi trong hợp đồng.</h2>
          <div className="ed-table">
            <table>
              <thead><tr><th>Mức</th><th>Ví dụ</th><th>Cách xử lý</th></tr></thead>
              <tbody>
                <tr><td>Khẩn cấp</td><td>Cả văn phòng mất mạng, máy chủ dừng</td><td className="us">Ưu tiên ngay, tới tận nơi nếu từ xa không được</td></tr>
                <tr><td>Cao</td><td>Một bộ phận không làm việc được, kế toán không in được hoá đơn</td><td className="us">Xử lý trong ngày</td></tr>
                <tr><td>Thường</td><td>Lỗi một máy, cài phần mềm, tạo tài khoản, thêm máy in</td><td className="us">Xếp lịch trong giờ làm việc</td></tr>
              </tbody>
            </table>
          </div>
          <h2 style={{ marginTop: 96 }}>Tuyển IT riêng hay thuê Hilitek?</h2>
          <div className="ed-table">
            <table>
              <thead><tr><th></th><th>Tuyển nhân viên IT</th><th className="us">Thuê Hilitek</th></tr></thead>
              <tbody>{COMPARE.map((r) => <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td className="us">{r[2]}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </div></section>

      {/* ===== Hỏi đáp ===== */}
      <section className="ed-sec stone"><div className="ed-wrap ed-grid">
        <p className="ed-label ed-side">05 &nbsp;Hỏi đáp</p>
        <div className="ed-main">
          <h2 style={{ marginBottom: 40 }}>Câu hỏi các công ty hay hỏi.</h2>
          <div className="ed-faq">{FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
        </div>
      </div></section>

      <section className="ed-end"><div className="ed-wrap ed-grid">
        <h2>Khảo sát hệ thống IT miễn phí, đề xuất gửi trong ngày.</h2>
        <div className="ed-end-r">
          <p className="ed-label">Kỹ thuật Hilitek</p>
          <a className="ed-tel" href={tel}>{SITE.techPhone || SITE.phone}</a>
          <p style={{ marginTop: 14 }}>Cho Hilitek biết số máy và phần mềm công ty đang dùng. Kỹ thuật khảo sát và gửi đề xuất trong ngày.</p>
          <a className="ed-btn y" href={zalo} target="_blank" rel="noreferrer">Nhắn Zalo <span className="ed-ar">→</span></a>
        </div>
      </div></section>
    </div>
  );
}
