import React, { useEffect, useMemo } from "react";
import { ArrowRight, Gamepad2 } from "lucide-react";
import { SITE } from "../config.js";
import ProductCard from "../components/ProductCard.jsx";
import NeedForm from "../components/NeedForm.jsx";

export const HANDHELD_PATH = "/may-choi-game-cam-tay";
const GROUP = "Máy chơi game cầm tay";
const WRAP = "mx-auto max-w-[1500px] px-3 sm:px-4";

const TIERS = [
  { id: "retro", name: "Retro", note: "Dưới 3 triệu", for: "Nhỏ gọn, chơi lại game tuổi thơ.", play: "Game cổ 8-bit tới PS1", size: "3,5 tới 5 inch", line: "Anbernic, Miyoo, Trimui", match: /anbernic|miyoo|trimui|powkiddy|retro/i },
  { id: "android", name: "Android", note: "3 tới 12 triệu", for: "Chơi game mobile và giả lập mượt hơn.", play: "Game Android, giả lập tới PS2", size: "5 tới 7 inch", line: "Retroid, Mangmi, AYN", match: /retroid|mangmi|ayn|odin|android/i },
  { id: "pc", name: "PC cầm tay", note: "Từ 12 triệu", for: "Máy tính chơi game thu nhỏ, mang đi được.", play: "Game PC trên Steam, Xbox", size: "7 tới 9 inch", line: "Steam Deck, ROG Ally, Legion Go", match: /steam deck|rog|ally|legion|claw|onexplayer|gpd|ayaneo/i },
];

const FAQ = [
  ["Nên mua dòng nào cho người mới?", "Nếu chỉ muốn chơi lại game tuổi thơ, dòng Retro là đủ. Muốn chơi game PC bản quyền thì chọn PC cầm tay. Bạn nói game hay chơi, Hili gợi ý máy phù hợp."],
  ["Máy Android khác máy Retro thế nào?", "Máy Android mạnh hơn, chơi được game trên kho ứng dụng và giả lập các máy đời sau. Máy Retro gọn và rẻ hơn, tập trung vào game cổ."],
  ["Mua tại Hilitek có hoá đơn không?", "Có. Hilitek xuất đủ hoá đơn VAT và bảo hành theo serial."],
  ["Hàng chưa có sẵn thì sao?", "Bạn nhắn Hili mẫu đang cần, Hili báo khi có hàng hoặc nhận đặt trước."],
];

export default function Handheld({ catalog, navigate }) {
  const items = useMemo(
    () => (catalog.products || []).filter((p) => (p.categories || []).includes(GROUP) || p.category === GROUP),
    [catalog.products],
  );

  useEffect(() => {
    const prev = document.title;
    document.title = "Máy chơi game cầm tay chính hãng | Hilitek";
    return () => { document.title = prev; };
  }, []);

  const jump = (id) => (e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  return (
    <div className="font-sans">
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="absolute -right-[6%] -top-1/2 h-[200%] w-2/3" style={{ background: "radial-gradient(closest-side,#2C3FD0,transparent)" }} />
        <Gamepad2 size={420} strokeWidth={0.7} className="absolute -bottom-20 right-[4%] hidden text-white/10 md:block" />
        <div className={WRAP + " relative py-10 sm:py-14"}>
          <h1 className="font-display text-[44px] sm:text-[72px] font-bold leading-[1.02]">Máy chơi game <span className="text-yellow">cầm tay</span></h1>
          <p className="mt-3 max-w-[34em] text-[16px] text-white/85">Từ máy Retro vài triệu tới PC cầm tay chơi game bản quyền. Chọn theo ngân sách, Hili tư vấn trước khi mua.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {TIERS.map((t) => (
              <a key={t.id} href={`#${t.id}`} onClick={jump(t.id)} className="inline-flex min-h-[44px] items-center rounded-lg bg-white/15 px-4 font-semibold hover:bg-white/25">{t.name}</a>
            ))}
            <a href={SITE.zaloHref} target="_blank" rel="noreferrer" className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-yellow px-4 font-semibold text-ink hover:brightness-95">Hỏi Hili qua Zalo <ArrowRight size={16} /></a>
          </div>
        </div>
      </section>

      <section className={WRAP + " pt-8"}>
        <h2 className="mb-3 font-display text-[30px] sm:text-[38px] font-bold text-ink">Ba dòng máy, chọn theo ngân sách</h2>
        <div className="grid gap-2 md:grid-cols-3">
          {TIERS.map((t) => (
            <article key={t.id} id={t.id} className="flex scroll-mt-44 flex-col rounded-2xl bg-white p-5 text-ink">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-display text-[28px] font-bold leading-tight">{t.name}</h3>
                <span className="shrink-0 rounded-md bg-yellow px-2 py-1 text-[14px] font-semibold">{t.note}</span>
              </div>
              <p className="mt-1 text-[15px] text-ink/75">{t.for}</p>
              <dl className="mt-3 flex-1 divide-y divide-line text-[15px]">
                <div className="flex justify-between gap-3 py-2"><dt className="shrink-0 text-mute">Chơi được</dt><dd className="text-right font-medium">{t.play}</dd></div>
                <div className="flex justify-between gap-3 py-2"><dt className="shrink-0 text-mute">Màn hình</dt><dd className="text-right font-medium">{t.size}</dd></div>
                <div className="flex justify-between gap-3 py-2"><dt className="shrink-0 text-mute">Hãng</dt><dd className="text-right font-medium">{t.line}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      {/* Sản phẩm tự hiện khi chủ shop gán vào nhóm "Máy chơi game cầm tay" trong app quản lý */}
      <section className={WRAP + " pt-8"}>
        <h2 className="mb-3 font-display text-[30px] sm:text-[38px] font-bold text-ink">Sản phẩm</h2>
        {items.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {items.map((p) => <ProductCard key={p.id} product={p} onOpen={(slug) => navigate(`san-pham/${slug}`)} />)}
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-6 text-ink">
            <p className="font-display text-[24px] font-bold">Hili đang cập nhật máy lên web</p>
            <p className="mt-1 text-[15px] text-ink/75">Bạn cần mẫu nào, nhắn Hili để hỏi hàng và giá ngay.</p>
            <a href={SITE.zaloHref} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-[46px] items-center gap-2 rounded-lg bg-ink px-4 font-semibold text-white hover:bg-navy">Hỏi hàng qua Zalo <ArrowRight size={16} /></a>
          </div>
        )}
      </section>

      <section className={WRAP + " pt-8"}>
        <h2 className="mb-3 font-display text-[30px] sm:text-[38px] font-bold text-ink">Câu hỏi thường gặp</h2>
        <div className="grid gap-2 md:grid-cols-2">
          {FAQ.map(([q, a]) => (
            <div key={q} className="rounded-2xl bg-white p-5 text-ink">
              <h3 className="font-display text-[20px] font-bold leading-snug">{q}</h3>
              <p className="mt-1 text-[15px] text-ink/80">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={WRAP + " pt-8 pb-8"}>
        <NeedForm title="Chưa biết chọn máy nào? Nói Hili nghe" placeholder="Máy chơi Pokémon, mang đi làm" budgetHint="5 triệu" />
      </section>
    </div>
  );
}
