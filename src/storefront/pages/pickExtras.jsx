import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { ERAS, MODELS, TIERS, hhImage } from "../data/handhelds.js";

/** Bàn phím: gõ êm hay có khấc. */
function Switches() {
  return (
    <section className="lx-w lx-s">
      <div className="lx-c"><h2>Gõ êm hay gõ có khấc?</h2></div>
      <div className="pk-sw">
        <div className="lx-t bl"><h3>TONE: êm, nhẹ</h3><p>Nhấn thẳng một mạch. Hợp phòng làm việc chung.</p><svg viewBox="0 0 400 170" aria-hidden="true"><path d="M20 150C150 130 250 90 380 40" fill="none" stroke="#1E2A8A" strokeWidth="9" strokeLinecap="round" /></svg></div>
        <div className="lx-t ye"><h3>CLOUDY: có khấc</h3><p>Cảm nhận rõ lúc phím nhận. Hợp người gõ nhiều chữ.</p><svg viewBox="0 0 400 170" aria-hidden="true"><path d="M20 150C70 130 100 40 140 40S200 110 240 110 330 60 380 40" fill="none" stroke="#0B1230" strokeWidth="9" strokeLinecap="round" /></svg></div>
      </div>
    </section>
  );
}

/** Bàn phím: đặt cạnh AKKO. */
function Versus({ P, price }) {
  return (
    <section className="lx-w lx-s">
      <div className="lx-c"><h2>Đặt cạnh AKKO cùng cỡ</h2><p>Hilitek không bán AKKO. Thông số theo công bố của hãng, ảnh: AKKO.</p></div>
      <div className="pk-vs">{P.versus.map((v) => (
        <div key={v.size} className="pk-v"><h3>{v.size}</h3>
          {[v.a, v.b].map((k, i) => (
            <div key={k.name} className={"r" + (i ? "" : " own")}>
              <img src={k.img} alt={k.name} loading="lazy" />
              <div><b>{k.name}</b><div className="bat"><i style={{ width: `${k.mah / 40}%` }} /></div><small>Pin {k.mah.toLocaleString("vi-VN")} mAh</small><em>{k.slug ? price(k.slug) : k.note}</em></div>
            </div>
          ))}
        </div>
      ))}</div>
    </section>
  );
}

/** Chữ "a" vẽ bằng điểm ảnh, hai mật độ: 82 ppi (Full HD) và 109 ppi (2K) ở 27 inch. */
function PixelLetter({ n, color }) {
  const cells = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const u = (x + 0.5) / n - 0.5, v = (y + 0.5) / n - 0.5;
    const ring = Math.hypot(u + 0.04, v);
    if ((ring < 0.36 && ring > 0.19) || (u > 0.2 && u < 0.37 && Math.abs(v) < 0.37)) cells.push(<rect key={x + "-" + y} x={x * 240 / n + 0.6} y={y * 240 / n + 0.6} width={240 / n - 1.2} height={240 / n - 1.2} fill={color} />);
  }
  return <svg viewBox="0 0 240 240" aria-hidden="true">{cells}</svg>;
}
function Sharp() {
  return (
    <section className="lx-w lx-s">
      <div className="lx-c"><h2>Nhìn gần, chữ nét đến đâu?</h2><p>Cùng màn 27 inch, 2K có nhiều điểm ảnh hơn nên nét chữ mịn hơn. Hình phóng to để minh hoạ.</p></div>
      <div className="pk-sw px">
        <div className="lx-t ye"><h3>Full HD</h3><p>82 điểm ảnh mỗi inch. Nhẹ card, dễ đạt FPS cao.</p><PixelLetter n={18} color="#0B1230" /></div>
        <div className="lx-t bl"><h3>2K</h3><p>109 điểm ảnh mỗi inch. Chữ mịn, chia đôi màn thoải mái.</p><PixelLetter n={24} color="#1E2A8A" /></div>
      </div>
    </section>
  );
}
function Refresh({ P }) {
  const L = [...P.items].sort((a, b) => a.hz - b.hz);
  return (
    <section className="lx-w lx-s"><div className="lx-fine pk-hz">
      <div><h2>Tần số quét càng cao, hình càng mượt</h2><p>Chỉ thấy rõ khi card đồ hoạ đẩy được FPS tương ứng.</p></div>
      <div className="bars">{L.map((x) => <div key={x.id} className={x.size.startsWith("2K") ? "k2" : ""}><span>{x.name}</span><i style={{ width: `${x.hz / 2.8}%` }}><b>{x.hz}Hz</b></i></div>)}
        <small><em />2K <em className="f" />Full HD</small></div>
    </div></section>
  );
}
function Panels() {
  return (
    <section className="lx-w lx-s">
      <div className="lx-c"><h2>IPS hay VA?</h2></div>
      <div className="pk-sw">
        <div className="lx-t" style={{ background: "linear-gradient(135deg,#FF8A7A,#F7C600 35%,#4FD1A5 65%,#5B73FF)" }}><h3>IPS: màu chuẩn</h3><p style={{ color: "#0B1230" }}>Góc nhìn rộng. Hợp làm ảnh, xem phim, văn phòng.</p></div>
        <div className="lx-t n" style={{ background: "radial-gradient(90px 90px at 72% 78%,#FFF3BF,#F7C600 18%,transparent 70%),#03050F" }}><h3>VA: đen sâu</h3><p>Tương phản cao, hay có tần số quét cao với giá tốt. Hợp chơi game.</p></div>
      </div>
    </section>
  );
}

/** Máy game: chọn game muốn chơi. */
function Eras({ go }) {
  const [id, setId] = useState("ps1");
  const e = ERAS.find((x) => x.id === id) || ERAS[0];
  const t = TIERS.find((x) => x.id === e.tier);
  return (
    <section className="lx-w lx-s">
      <div className="lx-c"><h2>Bạn muốn chơi gì?</h2></div>
      <div className="pk-eras">{ERAS.map((x) => <button key={x.id} type="button" aria-pressed={x.id === e.id} onClick={() => setId(x.id)}>{x.label}</button>)}</div>
      <div className="pk-era" aria-live="polite">
        <div><small>Nên chọn</small><h3>{t?.name}</h3><p>{e.text}</p><a className="lx-b p" href="/may-choi-game-cam-tay" onClick={go("/may-choi-game-cam-tay")}>Xem các máy <ArrowRight size={17} /></a></div>
        <div className="g">{e.picks.map((s) => MODELS.find((m) => m.slug === s)).filter((m) => m && !m.hidden).map((m) => <figure key={m.slug} className={m.photo ? "ph" : ""}><img src={hhImage(m)} alt={m.name} loading="lazy" /><figcaption>{m.name}</figcaption></figure>)}</div>
      </div>
    </section>
  );
}
/** Máy game: cỡ màn hình vẽ đúng tỉ lệ đường chéo. */
function Sizes() {
  const L = [["Retro", 3.5, 4 / 3, "#F7C600"], ["Android", 6, 16 / 9, "#1E2A8A"], ["PC cầm tay", 8, 16 / 10, "#0B1230"]];
  return (
    <section className="lx-w lx-s">
      <div className="lx-c"><h2>Màn hình to cỡ nào?</h2><p>Vẽ theo đúng tỉ lệ với nhau, lấy một cỡ thường gặp của mỗi dòng.</p></div>
      <div className="pk-size">{L.map(([n, d, r, c]) => { const h = d / Math.hypot(r, 1); return <div key={n}><i style={{ width: `${h * r * 4.6}cqw`, aspectRatio: String(r), background: c, color: c === "#F7C600" ? "#0B1230" : "#fff" }}>{String(d).replace(".", ",")}"</i><b>{n}</b></div>; })}</div>
    </section>
  );
}

export const EXTRAS = { switches: Switches, versus: Versus, sharp: Sharp, refresh: Refresh, panels: Panels, eras: Eras, sizes: Sizes };
