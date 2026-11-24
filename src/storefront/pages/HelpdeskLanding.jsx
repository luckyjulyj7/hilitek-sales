import React, { useEffect, useRef, useState } from "react";
import {
  ArrowRight, MessageCircle, Phone, Headphones, MonitorSmartphone, Wifi, Server, Mail, ShieldCheck, Printer, Cctv,
  DatabaseBackup, Wrench, ClipboardCheck, Clock, Users, TrendingDown, CheckCircle2, ChevronDown, Ticket, Building2,
} from "lucide-react";
import { SITE } from "../config.js";
import useReveal from "./useReveal.js";
import "./software.css";
import "./landing-extra.css";

/**
 * Trang "Dịch vụ IT Helpdesk cho doanh nghiệp" (/dich-vu-it-helpdesk).
 * Phạm vi, cách làm việc và gói dịch vụ tổng hợp từ cách các đơn vị IT thuê ngoài tại TP.HCM đang làm.
 * Giá và thời gian phản hồi chưa ghi cứng: báo giá theo số máy, SLA ghi trong hợp đồng.
 */
export const HELPDESK_PATH = "/dich-vu-it-helpdesk";

const SCOPE = [
  { icon: MonitorSmartphone, t: "Máy tính, laptop", d: "Cài đặt, sửa lỗi Windows, Office, phần mềm nghiệp vụ, máy chậm, lỗi in, lỗi mạng." },
  { icon: Wifi, t: "Mạng nội bộ, Wi-Fi", d: "Router, switch, Wi-Fi phủ văn phòng, VPN làm việc từ xa, mạng chập chờn." },
  { icon: Server, t: "Máy chủ, chia sẻ file", d: "File server, Active Directory, phân quyền thư mục, máy chủ phần mềm kế toán." },
  { icon: Mail, t: "Email, Microsoft 365", d: "Email tên miền công ty, tài khoản nhân viên, OneDrive, Teams." },
  { icon: DatabaseBackup, t: "Sao lưu dữ liệu", d: "Lịch sao lưu tự động, kiểm tra bản sao lưu định kỳ, khôi phục khi sự cố." },
  { icon: ShieldCheck, t: "Bảo mật", d: "Diệt virus doanh nghiệp, vá lỗi, phòng mã độc tống tiền, rà soát bản quyền phần mềm." },
  { icon: Printer, t: "Máy in, máy chấm công", d: "Cài đặt, chia sẻ máy in, khắc phục máy chấm công, thiết bị văn phòng." },
  { icon: Cctv, t: "Camera giám sát", d: "Kiểm tra, bảo trì, xem camera từ xa trên điện thoại." },
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
  { icon: Ticket, t: "Gửi yêu cầu", d: "Nhắn Zalo, gọi hotline hoặc email. Mỗi yêu cầu được ghi lại để theo dõi." },
  { icon: Headphones, t: "Xử lý từ xa", d: "Phần lớn lỗi phần mềm được xử lý qua điều khiển từ xa, không cần chờ người tới." },
  { icon: Wrench, t: "Tới tận nơi", d: "Lỗi phần cứng, mạng, máy in: kỹ thuật tới văn phòng tại TP.HCM." },
  { icon: ClipboardCheck, t: "Báo cáo", d: "Ghi lại nguyên nhân, cách xử lý; đề xuất phòng ngừa để lỗi không lặp lại." },
];

const WHY = [
  { icon: TrendingDown, b: "Tiết kiệm", d: "Không tốn lương, bảo hiểm cho một nhân sự IT toàn thời gian; trả theo đúng số máy." },
  { icon: Users, b: "Cả đội kỹ thuật", d: "Không phụ thuộc một người; nghỉ phép, nghỉ việc vẫn có người hỗ trợ." },
  { icon: Clock, b: "Ít gián đoạn", d: "Bảo trì định kỳ phát hiện lỗi sớm, đỡ cảnh cả văn phòng ngồi chờ máy." },
  { icon: Building2, b: "Một đầu mối", d: "Hilitek vừa hỗ trợ kỹ thuật vừa cung cấp linh kiện, bản quyền: đổi, nâng cấp nhanh." },
];

const FAQ = [
  ["Thuê IT ngoài khác gì tuyển một nhân viên IT?", "Với văn phòng dưới khoảng 50 máy, khối lượng việc IT thường không đủ cho một người làm cả ngày. Thuê ngoài trả theo số máy, có cả đội kỹ thuật hỗ trợ, không lo người nghỉ việc mang theo mật khẩu và hiểu biết về hệ thống."],
  ["Hilitek hỗ trợ ở khu vực nào?", "Hỗ trợ từ xa cho mọi nơi. Kỹ thuật tới tận nơi tại TP.HCM; khu vực lân cận vui lòng hỏi trước qua Zalo."],
  ["Bao lâu thì có người phản hồi?", "Thời gian phản hồi và thời gian tới tận nơi được ghi rõ trong hợp đồng theo mức độ sự cố (khẩn cấp, bình thường), để hai bên cùng theo dõi."],
  ["Giá dịch vụ tính thế nào?", "Tuỳ số máy, số người dùng, có máy chủ hay không và tần suất bảo trì tại văn phòng. Hilitek khảo sát miễn phí rồi báo giá trọn gói theo tháng."],
  ["Dữ liệu công ty có an toàn không?", "Kỹ thuật chỉ truy cập khi được công ty cho phép, mỗi lần hỗ trợ từ xa đều cần người dùng đồng ý. Hai bên có thể ký thoả thuận bảo mật thông tin."],
];

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div className="sw-faq">
      {FAQ.map(([q, a], i) => (
        <div key={q} className={"sw-qa rv" + (open === i ? " on" : "")}>
          <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}><span>{q}</span><ChevronDown size={18} /></button>
          {open === i && <p>{a}</p>}
        </div>
      ))}
    </div>
  );
}

export default function HelpdeskLanding() {
  const root = useRef(null);
  useReveal(root);
  const zalo = SITE.zaloHref || "https://zalo.me/" + (SITE.phoneRaw || "");
  const tel = "tel:" + (SITE.techPhoneRaw || SITE.phoneRaw || "");

  useEffect(() => {
    const prev = document.title;
    document.title = "Dịch vụ IT Helpdesk cho doanh nghiệp tại TP.HCM | Hilitek";
    return () => { document.title = prev; };
  }, []);

  return (
    <div ref={root} className="sw font-sans">
      {/* ===== Đầu trang ===== */}
      <section className="sw-hero">
        <div className="sw-wrap sw-hero-in">
          <div className="rv">
            <span className="sw-tag"><Headphones size={14} /> Dịch vụ IT cho doanh nghiệp</span>
            <h1>IT Helpdesk cho công ty: <em>máy chạy ổn, nhân viên yên tâm làm việc</em></h1>
            <p className="sw-lead">Hilitek làm bộ phận IT thuê ngoài cho văn phòng: hỗ trợ từ xa, kỹ thuật tới tận nơi tại TP.HCM, bảo trì định kỳ, sao lưu dữ liệu và bảo mật. Trả theo số máy, không cần tuyển IT riêng.</p>
            <div className="sw-cta">
              <a href={zalo} target="_blank" rel="noreferrer" className="hx-key y sw-btn"><MessageCircle size={18} /> Khảo sát miễn phí qua Zalo</a>
              <a href={tel} className="hx-key sw-btn"><Phone size={17} /> Gọi kỹ thuật</a>
            </div>
            <ul className="sw-ticks">
              <li><CheckCircle2 size={15} /> Hỗ trợ từ xa và tận nơi</li>
              <li><CheckCircle2 size={15} /> SLA ghi trong hợp đồng</li>
              <li><CheckCircle2 size={15} /> Hoá đơn VAT</li>
            </ul>
          </div>
          {/* Hình minh hoạ: ảnh kỹ thuật viên + bảng theo dõi yêu cầu */}
          <div className="hd-visual rv">
            <img src="/home/it-helpdesk.webp" alt="Kỹ thuật viên IT Helpdesk Hilitek" className="hd-photo" loading="eager" decoding="async" />
            <div className="hd-ticket">
              <div className="hd-tk-h"><Ticket size={15} /> Yêu cầu hỗ trợ</div>
              {[["Máy kế toán không in được", "Đã xử lý", "ok"], ["Wi-Fi tầng 2 chập chờn", "Đang xử lý", "run"], ["Tạo email nhân viên mới", "Đã xử lý", "ok"]].map(([t, s, k]) => (
                <div key={t} className="hd-tk-row"><span>{t}</span><b className={k}>{s}</b></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Lợi ích ===== */}
      <section className="sw-wrap sw-stats hd-why">
        {WHY.map(({ icon: I, b, d }) => (
          <div key={b} className="rv"><span className="sw-ic"><I size={20} /></span><b>{b}</b><span>{d}</span></div>
        ))}
      </section>

      {/* ===== Phạm vi ===== */}
      <section className="sw-wrap sw-sec">
        <h2 className="rv">Hilitek lo những việc gì?</h2>
        <p className="sw-sub rv">Toàn bộ thiết bị và phần mềm công nghệ trong văn phòng, từ một chiếc máy in tới máy chủ.</p>
        <div className="sw-grid4">
          {SCOPE.map(({ icon: I, t, d }) => (
            <div key={t} className="sw-card hd-card rv"><span className="sw-ic"><I size={20} /></span><h3>{t}</h3><p>{d}</p></div>
          ))}
        </div>
      </section>

      {/* ===== Quy trình ===== */}
      <section className="sw-law">
        <div className="sw-wrap sw-sec">
          <h2 className="rv">Gửi yêu cầu là có người lo</h2>
          <p className="sw-sub rv">Quy trình bốn bước, mỗi yêu cầu đều được ghi lại để công ty theo dõi.</p>
          <ol className="hd-flow">
            {STEPS.map(({ icon: I, t, d }, i) => (
              <li key={t} className="rv" style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="hd-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="hd-fic"><I size={22} /></span>
                <h3>{t}</h3><p>{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ===== Gói dịch vụ ===== */}
      <section className="sw-wrap sw-sec">
        <h2 className="rv">Chọn cách làm việc phù hợp</h2>
        <p className="sw-sub rv">Báo giá theo số máy, số người dùng và tần suất bảo trì. Khảo sát văn phòng miễn phí.</p>
        <div className="hd-plans">
          {PLANS.map((p) => (
            <div key={p.t} className={"hd-plan rv" + (p.hot ? " hot" : "")}>
              {p.hot && <span className="hd-badge">Nhiều công ty chọn</span>}
              <h3>{p.t}</h3>
              <p className="hd-plan-sub">{p.sub}</p>
              <ul>{p.f.map((x) => <li key={x}><CheckCircle2 size={16} /> {x}</li>)}</ul>
              <a href={zalo} target="_blank" rel="noreferrer" className={"hx-key sw-btn hd-plan-btn" + (p.hot ? " y" : "")}>Nhận báo giá <ArrowRight size={16} /></a>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SLA tham khảo ===== */}
      <section className="sw-wrap sw-sec">
        <div className="hd-sla rv">
          <div>
            <h2>Cam kết thời gian, ghi rõ trong hợp đồng</h2>
            <p>Mỗi mức sự cố có thời gian phản hồi và thời gian tới tận nơi riêng. Ví dụ cách chia thường gặp trên thị trường:</p>
          </div>
          <div className="hd-sla-grid">
            <div><b className="red">Khẩn cấp</b><span>Cả văn phòng mất mạng, máy chủ dừng: ưu tiên xử lý ngay</span></div>
            <div><b className="yel">Cao</b><span>Một bộ phận không làm việc được: xử lý trong ngày</span></div>
            <div><b className="grn">Thường</b><span>Lỗi một máy, cài phần mềm, tạo tài khoản: xếp lịch</span></div>
          </div>
        </div>
      </section>

      {/* ===== Hỏi đáp ===== */}
      <section className="sw-wrap sw-sec">
        <h2 className="rv">Câu hỏi thường gặp</h2>
        <Faq />
      </section>

      <section className="sw-wrap sw-sec">
        <div className="sw-final rv">
          <div>
            <h2>Khảo sát hệ thống IT miễn phí</h2>
            <p>Cho Hili biết số máy và việc công ty đang dùng, kỹ thuật sẽ khảo sát và gửi đề xuất trong ngày.</p>
          </div>
          <div className="sw-cta">
            <a href={zalo} target="_blank" rel="noreferrer" className="hx-key y sw-btn"><MessageCircle size={18} /> Nhắn Zalo</a>
            <a href={tel} className="hx-key sw-btn"><Phone size={17} /> Gọi {SITE.techPhone || SITE.phone}</a>
          </div>
        </div>
      </section>
    </div>
  );
}
