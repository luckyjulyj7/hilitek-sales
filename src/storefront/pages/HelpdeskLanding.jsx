import React from "react";
import { Cctv, Check, CheckCircle2, Database, Mail, MapPin, Phone, Printer, ShieldCheck, X } from "lucide-react";
import { SITE } from "../config.js";
import { LxEnd, LxFaq, RemoteWindow, useLx, zaloHref } from "./lxParts.jsx";
import "./lx.css";

/** Trang "Dịch vụ IT Helpdesk". Không ghi giá, thời gian phản hồi: chốt theo hợp đồng. */
export const HELPDESK_PATH = "/dich-vu-it-helpdesk";

const PLANS = [
  {
    t: "Theo lần gọi", sub: "Cho văn phòng ít máy, ít sự cố",
    f: ["Hỗ trợ từ xa qua UltraViewer, AnyDesk", "Kỹ thuật tới tận nơi khi cần", "Tính phí theo lần xử lý", "Báo giá trước khi làm"],
  },
  {
    t: "Trọn gói theo tháng", sub: "Cho công ty cần người lo thường xuyên", hot: true,
    f: ["Hỗ trợ từ xa không giới hạn trong giờ làm việc", "Bảo trì định kỳ tại văn phòng", "Kiểm tra sao lưu, cập nhật bảo mật", "Báo cáo tình trạng hệ thống hằng tháng", "Thời gian phản hồi ghi rõ trong hợp đồng"],
  },
  {
    t: "Dự án", sub: "Dựng văn phòng mới, chuyển văn phòng",
    f: ["Khảo sát, thiết kế mạng, Wi-Fi", "Lắp đặt máy tính, máy chủ, camera", "Bản quyền Windows, Office, diệt virus", "Bàn giao tài liệu, đào tạo nhân viên"],
  },
];

const FAQ = [
  ["Thuê IT ngoài khác gì tuyển một nhân viên IT?", "Với văn phòng dưới khoảng 50 máy, khối lượng việc IT thường không đủ cho một người làm cả ngày. Thuê ngoài trả theo số máy, có cả đội kỹ thuật hỗ trợ, không lo người nghỉ việc mang theo mật khẩu và hiểu biết về hệ thống."],
  ["Hilitek hỗ trợ ở khu vực nào?", "Hỗ trợ từ xa cho mọi nơi. Kỹ thuật tới tận nơi tại TP.HCM; khu vực lân cận vui lòng hỏi trước qua Zalo."],
  ["Bao lâu thì có người phản hồi?", "Thời gian phản hồi và thời gian tới tận nơi được ghi rõ trong hợp đồng theo mức độ sự cố (khẩn cấp, bình thường), để hai bên cùng theo dõi."],
  ["Giá dịch vụ tính thế nào?", "Tuỳ số máy, số người dùng, có máy chủ hay không và tần suất bảo trì tại văn phòng. Hilitek khảo sát miễn phí rồi báo giá trọn gói theo tháng."],
  ["Dữ liệu công ty có an toàn không?", "Kỹ thuật chỉ truy cập khi được công ty cho phép, mỗi lần hỗ trợ từ xa đều cần người dùng đồng ý. Hai bên có thể ký thoả thuận bảo mật thông tin."],
];

const OWN = ["Lương, bảo hiểm, phụ cấp hằng tháng", "Thường chỉ có một người", "Nghỉ phép, nghỉ việc là gián đoạn", "Linh kiện, bản quyền tự đi mua"];
const US = ["Trả theo số máy, theo gói", "Cả đội kỹ thuật", "Có người thay khi một người nghỉ", "Có sẵn linh kiện và bản quyền"];
const WIRES = ["M300 92V150H90V196", "M300 92V196", "M300 92V150H510V196"];

/** Sơ đồ mạng văn phòng, tín hiệu chạy trên dây. */
function NetMap() {
  return (
    <svg className="lx-net" viewBox="0 0 600 290" aria-hidden="true" fill="none">
      {WIRES.map((d, i) => <g key={d}><path d={d} stroke="#8FA2F2" strokeWidth="4" /><path className="pl" d={d} stroke="#F7C600" strokeWidth="8" strokeLinecap="round" style={{ animationDelay: i * -0.8 + "s" }} /></g>)}
      <rect x="220" y="24" width="160" height="70" rx="18" fill="#1E2A8A" />
      {[0, 1, 2, 3].map((i) => <circle key={i} cx={252 + i * 32} cy="59" r="7" fill={i ? "#fff" : "#F7C600"} />)}
      {[[20, "Văn phòng"], [230, "Wi-Fi"], [440, "Máy chủ"]].map(([x, t]) => <g key={t}><rect x={x} y="196" width="140" height="78" rx="18" fill="#fff" /><text x={x + 70} y="243" textAnchor="middle" fontSize="22" fontWeight="600" fill="#0B1230">{t}</text></g>)}
    </svg>
  );
}

export default function HelpdeskLanding() {
  useLx("Dịch vụ IT Helpdesk cho doanh nghiệp tại TP.HCM | Hilitek");
  const zalo = zaloHref();
  const tel = SITE.techPhone || SITE.phone;
  const telRaw = SITE.techPhoneRaw || SITE.phoneRaw;
  return (
    <div className="lx">
      <section className="lx-hero"><div className="lx-mesh soft" /><div className="lx-w in">
        <div>
          <h1>Máy hỏng, mạng chậm, có Hili lo</h1>
          <p>Dịch vụ IT cho văn phòng tại TP.HCM. Hỗ trợ online qua điều khiển từ xa, cần thì kỹ thuật tới tận nơi.</p>
          <div className="lx-bs"><a className="lx-b p" href={zalo} target="_blank" rel="noreferrer">Nhắn Zalo tư vấn</a><a className="lx-b o" href={"tel:" + telRaw}><Phone size={18} /> {tel}</a></div>
          <ul className="lx-ok"><li><CheckCircle2 size={19} /> Từ xa và tận nơi</li><li><CheckCircle2 size={19} /> Trả theo số máy</li><li><CheckCircle2 size={19} /> Hoá đơn VAT</li></ul>
        </div>
        <div className="lx-art">
          <img className="lx-man" src="/landing/ky-thuat.webp" alt="Kỹ thuật viên Hilitek đeo tai nghe hỗ trợ khách qua máy tính" />
          <div className="lx-card lx-chat" aria-hidden="true"><span className="me">Máy in không in được</span><span>Dạ, bạn mở UltraViewer giúp mình nhé</span></div>
        </div>
      </div></section>

      <section className="lx-w lx-s">
        <div className="lx-c"><h2>Một đầu mối cho mọi thiết bị</h2></div>
        <div className="lx-bento">
          <div className="lx-t s7 n"><h3>Máy tính, phần mềm</h3><p>Lỗi Windows, Office, máy chậm: xử lý từ xa, bạn nhìn thấy từng thao tác.</p><div className="v"><RemoteWindow /></div></div>
          <div className="lx-t s5 bl"><h3>Mạng, Wi-Fi, máy chủ</h3><p>Phủ sóng, chia mạng, phân quyền thư mục.</p><div className="v"><NetMap /></div></div>
          <div className="lx-t s4 gr"><h3>Sao lưu dữ liệu</h3><p>Lịch tự động, kiểm tra định kỳ.</p><div className="v"><div className="lx-days" aria-hidden="true">{["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => <span key={d}><i><Database size={20} /></i>{d}</span>)}</div></div></div>
          <div className="lx-t s4"><h3>Email, Microsoft 365</h3><p>Hộp thư theo tên miền công ty.</p><div className="v"><div className="lx-card lx-mail" aria-hidden="true">{[["ketoan", "Phòng kế toán"], ["kinhdoanh", "Phòng kinh doanh"], ["hotro", "Chăm sóc khách"]].map(([a, b]) => <div key={a}><i><Mail size={18} /></i><span><b>{a}@tên-miền</b><small>{b}</small></span></div>)}</div></div></div>
          <div className="lx-t s4 ye"><h3>Bảo mật</h3><p>Diệt virus, vá lỗi, rà soát bản quyền.</p><div className="v"><ShieldCheck size={200} strokeWidth={1} color="#1E2A8A" fill="#fff" /></div></div>
          <div className="lx-t s6" style={{ minHeight: 320 }}><h3>Máy in, máy chấm công</h3><p>Cài đặt, chia sẻ cho cả phòng.</p><div className="v"><Printer size={170} strokeWidth={1} color="#1E2A8A" fill="#F7C600" /></div></div>
          <div className="lx-t s6 bl" style={{ minHeight: 320 }}><h3>Camera</h3><p>Kiểm tra, bảo trì, xem trên điện thoại.</p><div className="v"><Cctv size={170} strokeWidth={1} color="#1E2A8A" fill="#F7C600" /></div></div>
        </div>
      </section>

      <section className="lx-w lx-s">
        <div className="lx-c"><h2>Báo lỗi xong, việc còn lại để Hili</h2></div>
        <div className="lx-3">
          <div><div className="v"><span className="lx-bub">Wi-Fi tầng 2 chập chờn</span></div><h3>Bạn nhắn</h3><p>Zalo, gọi điện hoặc email.</p></div>
          <div><div className="v"><svg viewBox="0 0 200 130" width="230" aria-hidden="true"><rect x="8" y="6" width="184" height="106" rx="12" fill="#1E2A8A" /><rect x="18" y="16" width="164" height="86" rx="6" fill="#5F7BFF" /><path d="M92 40l38 32-17 3 9 18-10 5-9-19-11 11z" fill="#F7C600" /><rect x="70" y="118" width="60" height="8" rx="4" fill="#0B1230" /></svg></div><h3>Hili vào máy từ xa</h3><p>Chỉ khi bạn cho phép.</p></div>
          <div><div className="v"><MapPin size={140} strokeWidth={1.2} fill="#F7C600" /></div><h3>Cần thì tới tận nơi</h3><p>Phần cứng, mạng, máy in tại TP.HCM.</p></div>
        </div>
      </section>

      <section className="lx-w lx-s">
        <div className="lx-c"><h2>Chọn cách làm việc</h2><p>Báo giá theo số máy và nhu cầu thực tế.</p></div>
        <div className="lx-3">{PLANS.map((p) => <article key={p.t} className={"lx-pl" + (p.hot ? " k" : "")}><h3>{p.t}</h3><p>{p.sub}</p><ul>{p.f.map((x) => <li key={x}><Check size={19} />{x}</li>)}</ul><a className={"lx-b " + (p.hot ? "y" : "p")} href={zalo} target="_blank" rel="noreferrer">Nhận báo giá</a></article>)}</div>
      </section>

      <section className="lx-w lx-s">
        <div className="lx-c"><h2>Tuyển riêng hay thuê Hilitek?</h2></div>
        <div className="lx-vs">
          <div><h3>Tuyển nhân viên IT</h3><ul>{OWN.map((x) => <li key={x}><X className="x" size={21} />{x}</li>)}</ul></div>
          <div className="us"><h3>Thuê Hilitek</h3><ul>{US.map((x) => <li key={x}><Check size={21} />{x}</li>)}</ul></div>
        </div>
      </section>

      <LxFaq items={FAQ} />
      <LxEnd title="Văn phòng đang gặp lỗi gì?" text="Nhắn cho kỹ thuật Hili, kèm ảnh màn hình càng tốt." phone={tel} phoneRaw={telRaw} />
    </div>
  );
}
