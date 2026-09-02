import React, { useEffect, useState } from "react";
import {
  ChevronRight, ShieldCheck, Hash, Check, ArrowLeft, Minus, Plus, MessageCircle, ShoppingCart, Zap,
} from "lucide-react";
import { fetchProduct } from "../lib/api.js";
import { formatVND, discountPercent, warrantyLabel, placeholderImage } from "../lib/format.js";
import { LOW_STOCK_THRESHOLD, SITE, MENU, PRODUCT_SIDEBAR, productGroups } from "../config.js";
import { href } from "../router.js";
import { useCart } from "../cart.jsx";
import TrustBar from "../components/TrustBar.jsx";
import ProductCommitments from "../components/ProductCommitments.jsx";
import ProductShipping from "../components/ProductShipping.jsx";
import SocialLinks from "../components/SocialLinks.jsx";
import PosterSlot from "../components/PosterSlot.jsx";

export default function ProductDetail({ slug, navigate, catalog }) {
  const { add } = useCart();
  const [product, setProduct] = useState(undefined);
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let alive = true;
    setProduct(undefined);
    setImgIdx(0);
    setQty(1);
    setAdded(false);
    fetchProduct(slug).then((p) => alive && setProduct(p));
    window.scrollTo(0, 0);
    return () => { alive = false; };
  }, [slug]);

  if (product === undefined)
    return <div className="mx-auto max-w-[1500px] px-4 py-20 text-center text-mute">Đang tải…</div>;

  if (product === null)
    return (
      <div className="mx-auto max-w-[1500px] px-4 py-20 text-center">
        <p className="text-mute">Không tìm thấy sản phẩm này.</p>
        <button onClick={() => navigate("/danh-muc")} className="mt-4 inline-flex items-center gap-2 text-navy font-semibold">
          <ArrowLeft size={16} /> Về danh sách sản phẩm
        </button>
      </div>
    );

  const p = product;
  const off = discountPercent(p.price, p.listPrice);
  const imgs = p.images?.length ? p.images.map((im) => im.src || im) : [placeholderImage(p.brand, p.category)];
  const low = p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD;
  const out = !p.stock;
  const groupName =
    productGroups(p)[0] ||
    MENU.find((g) =>
      (g.subs || []).some(
        (s) => s.cat === p.category || (s.children || []).some((c) => c.type === "cat" && c.value === p.category)
      )
    )?.group ||
    p.group;
  const related = (catalog.products || []).filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 5);
  const descText = (p.description && p.description.trim()) || p.shortDesc || "";

  const doAdd = () => { add(p, qty); setAdded(true); };
  const doBuyNow = () => { add(p, qty); navigate("/dat-hang"); };

  return (
    <div className="mx-auto max-w-[1500px] px-3 sm:px-4 py-6 font-sans">
      <nav className="flex items-center gap-1 text-[12.5px] text-mute mb-5 flex-wrap">
        <a href="#/" onClick={(e) => { e.preventDefault(); navigate("/"); }} className="hover:text-navy">Trang chủ</a>
        <ChevronRight size={12} />
        <a href={href("/danh-muc", { group: groupName })} onClick={(e) => { e.preventDefault(); navigate(href("/danh-muc", { group: groupName }).slice(1)); }} className="hover:text-navy">{groupName}</a>
        <ChevronRight size={12} />
        <a href={href("/danh-muc", { cat: p.category })} onClick={(e) => { e.preventDefault(); navigate(href("/danh-muc", { cat: p.category }).slice(1)); }} className="hover:text-navy">{p.category}</a>
        <ChevronRight size={12} />
        <span className="text-ink/70 truncate max-w-[240px]">{p.name}</span>
      </nav>

      {/* ===== Trên: ảnh + thông tin/mua + sidebar tuỳ chỉnh ===== */}
      <div className="grid lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)_300px] gap-6 lg:gap-8 items-start">
        {/* Ảnh */}
        <div>
          <div className="relative aspect-square bg-white border border-line rounded-lg overflow-hidden">
            {off > 0 && (
              <span className="absolute top-3 left-3 z-10 bg-yellow text-ink text-[13px] font-bold px-2 py-0.5 rounded font-mono">−{off}%</span>
            )}
            <img src={imgs[imgIdx]} alt={p.name} className="w-full h-full object-cover" />
          </div>
          {imgs.length > 1 && (
            <div className="mt-3 flex gap-2 flex-wrap">
              {imgs.map((src, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={"w-16 h-16 border rounded-md overflow-hidden " + (i === imgIdx ? "border-navy" : "border-line")}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Thông tin + mua */}
        <div className="min-w-0">
          <div className="font-mono text-[12px] uppercase tracking-wide text-navy font-semibold">{p.brand}</div>
          <h1 className="mt-1 font-display text-2xl sm:text-[28px] font-bold text-ink leading-tight">{p.name}</h1>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-mute">
            <span className="font-mono">{p.sku}</span>
            <span className="inline-flex items-center gap-1"><ShieldCheck size={14} className="text-navy" /> {warrantyLabel(p.warrantyMonths)}</span>
            {p.hasSerial && <span className="inline-flex items-center gap-1"><Hash size={14} className="text-navy" /> Có số serial riêng</span>}
          </div>

          {p.specChips?.length > 0 && (
            <div className="mt-4 border-l-[3px] border-yellow bg-navy-050 rounded-r-md px-4 py-2.5 text-[13px] font-mono text-ink/80">
              {p.specChips.join("  ·  ")}
            </div>
          )}

          <div className="mt-4 border border-line rounded-lg bg-white p-4 shadow-card">
            {/* Giá: font "Bai Jamjuree" theo mẫu Mai Anh PC — giá gạch nhỏ trên, giá bán to dưới */}
            <div className="font-price">
              {off > 0 && (
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="text-mute line-through">{formatVND(p.listPrice)}</span>
                  <span className="font-semibold text-[#D0021B]">Tiết kiệm {formatVND(p.listPrice - p.price)}</span>
                </div>
              )}
              <div className="text-[32px] sm:text-[38px] font-bold text-sale leading-none mt-0.5">{formatVND(p.price)}</div>
            </div>
            <div className="mt-1 text-[12px] text-mute">Đã bao gồm VAT</div>

            <div className="my-3 border-t border-line" />

            <div className="text-[13px] text-ink">
              {out ? <span className="text-navy font-semibold">Tạm hết hàng</span>
                : low ? <span>Còn <b>{p.stock}</b> sản phẩm — sắp hết</span>
                : <span>Còn <b>{p.stock}</b> sản phẩm</span>}
            </div>

            <div className="mt-3 flex items-center gap-3">
              <span className="text-[13px] text-mute">Số lượng</span>
              <div className="inline-flex items-center border border-line rounded-md">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-2 py-1.5 text-mute hover:text-navy" aria-label="Giảm"><Minus size={14} /></button>
                <input value={qty} onChange={(e) => setQty(Math.max(1, Math.min(99, parseInt(e.target.value.replace(/\D/g, "")) || 1)))} className="w-10 text-center text-[14px] font-mono outline-none" inputMode="numeric" />
                <button onClick={() => setQty((q) => Math.min(99, q + 1))} className="px-2 py-1.5 text-mute hover:text-navy" aria-label="Tăng"><Plus size={14} /></button>
              </div>
            </div>

            {/* Thứ tự: Đặt hàng -> Thêm vào giỏ -> Chat Zalo */}
            <button
              onClick={doBuyNow}
              disabled={out}
              className={"mt-4 w-full rounded-md font-display font-bold py-3 text-[15px] tracking-wide flex items-center justify-center gap-2 transition " + (out ? "bg-line text-mute cursor-not-allowed" : "bg-navy text-white hover:bg-navy-600")}
            >
              <Zap size={17} /> {out ? "HẾT HÀNG" : "ĐẶT HÀNG"}
            </button>

            <button
              onClick={doAdd}
              disabled={out}
              className={"mt-2 w-full rounded-md font-display font-bold py-3 text-[15px] tracking-wide flex items-center justify-center gap-2 transition " + (out ? "bg-line text-mute cursor-not-allowed" : "bg-yellow text-ink hover:bg-yellow-300")}
            >
              <ShoppingCart size={17} /> THÊM VÀO GIỎ
            </button>

            {added && !out && (
              <button onClick={() => navigate("/gio-hang")} className="mt-2 w-full rounded-md border border-navy text-navy font-semibold py-2 text-[13.5px] inline-flex items-center justify-center gap-1.5 hover:bg-navy-050">
                <Check size={14} /> Đã thêm — Xem giỏ hàng
              </button>
            )}

            <a
              href={SITE.zaloHref}
              target="_blank"
              rel="noreferrer"
              className="mt-2 w-full rounded-md bg-[#0068FF] text-white font-display font-bold py-3 text-[15px] tracking-wide flex items-center justify-center gap-2 hover:brightness-110 animate-zalo"
            >
              <MessageCircle size={18} /> CHAT ZALO NGAY
            </a>
          </div>

          <ProductShipping className="mt-4" />
          <div className="mt-4 border border-line rounded-lg bg-white p-4">
            <SocialLinks />
          </div>
        </div>

        {/* Sidebar phải: banner dọc tuỳ chỉnh + khối cam kết ngay dưới banner */}
        <div className="space-y-4">
          {PRODUCT_SIDEBAR.banner && (
            <div className="hidden lg:block">
              <PosterSlot slot={PRODUCT_SIDEBAR.banner} navigate={navigate} className="lg:sticky lg:top-[150px]" />
            </div>
          )}
          <ProductCommitments />
        </div>
      </div>

      {/* ===== Mô tả (2/3) + Thông số kỹ thuật (1/3) ===== */}
      <div className="mt-10 grid lg:grid-cols-[2fr_1fr] gap-6 items-start">
        <section>
          <h2 className="font-display text-xl font-bold text-ink mb-3 border-l-4 border-yellow pl-3">Mô tả sản phẩm</h2>
          <div className="border border-line rounded-lg bg-white p-5 sm:p-6">
            {descText
              ? <RichText text={descText} />
              : <p className="text-mute text-[14px]">Chưa có mô tả cho sản phẩm này.</p>}
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-ink mb-3 border-l-4 border-yellow pl-3">Thông số kỹ thuật</h2>
          {p.specs?.length > 0 ? (
            <table className="w-full text-[13.5px] border border-line rounded-lg overflow-hidden">
              <tbody>
                {p.specs.map(([k, v], i) => (
                  <tr key={i} className={i % 2 ? "bg-white" : "bg-paper"}>
                    <td className="px-4 py-2.5 text-mute align-top">{k}</td>
                    <td className="px-4 py-2.5 text-ink font-medium">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="border border-line rounded-lg bg-white p-5 text-mute text-[14px]">Đang cập nhật.</div>
          )}
        </section>
      </div>

      <div className="mt-10">
        <TrustBar />
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-xl font-bold text-ink mb-4 border-l-4 border-yellow pl-3">Sản phẩm cùng nhóm</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            {related.map((r) => (
              <RelatedCard key={r.id} p={r} onOpen={() => navigate(`/san-pham/${r.slug}`)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/** Render mô tả: dòng trống = đoạn mới; nhóm dòng "- " = danh sách gạch đầu dòng. */
function RichText({ text }) {
  const lines = String(text).replace(/\r/g, "").split("\n");
  const blocks = [];
  let para = [];
  let list = [];
  const flushPara = () => { if (para.length) { blocks.push({ type: "p", text: para.join(" ") }); para = []; } };
  const flushList = () => { if (list.length) { blocks.push({ type: "ul", items: list }); list = []; } };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushPara(); flushList(); continue; }
    if (line.startsWith("- ")) { flushPara(); list.push(line.slice(2)); }
    else { flushList(); para.push(line); }
  }
  flushPara(); flushList();

  return (
    <div className="space-y-3 text-[14.5px] text-ink/80 leading-relaxed">
      {blocks.map((b, i) =>
        b.type === "ul" ? (
          <ul key={i} className="list-disc pl-5 space-y-1">
            {b.items.map((it, j) => <li key={j}>{it}</li>)}
          </ul>
        ) : (
          <p key={i}>{b.text}</p>
        )
      )}
    </div>
  );
}

function RelatedCard({ p, onOpen }) {
  return (
    <a href={`#/san-pham/${p.slug}`} onClick={(e) => { e.preventDefault(); onOpen(); }} className="border border-line rounded-lg bg-white p-3 hover:shadow-card hover:border-navy/30">
      <img src={p.images?.[0]?.src || p.images?.[0] || placeholderImage(p.brand, p.category)} alt={p.name} className="w-full aspect-square object-cover rounded-md bg-navy-050" />
      <div className="mt-2 text-[12.5px] text-ink line-clamp-2 min-h-[34px]">{p.name}</div>
      <div className="mt-1 font-mono text-[14px] font-bold text-sale">{formatVND(p.price)}</div>
    </a>
  );
}
