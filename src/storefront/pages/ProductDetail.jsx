import React, { useEffect, useState } from "react";
import {
  ChevronRight, ChevronLeft, ShieldCheck, Hash, Check, ArrowLeft, Minus, Plus, MessageCircle,
  ShoppingCart, Zap, ZoomIn, X, Clock,
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
  const [zoom, setZoom] = useState(false);
  const [specOpen, setSpecOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let alive = true;
    setProduct(undefined);
    setImgIdx(0);
    setZoom(false);
    setSpecOpen(false);
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
    MENU.find((g) => (g.subs || []).some((s) => s.name === p.category))?.group ||
    p.group;
  const related = (catalog.products || []).filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 5);
  const descText = (p.description && p.description.trim()) || p.shortDesc || "";

  const doAdd = () => { add(p, qty, { preorder: out }); setAdded(true); };
  const doBuyNow = () => { add(p, qty, { preorder: out }); navigate("/dat-hang"); };
  const prevImg = () => setImgIdx((i) => (i - 1 + imgs.length) % imgs.length);
  const nextImg = () => setImgIdx((i) => (i + 1) % imgs.length);

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
          <div className="group relative aspect-square bg-white border border-line rounded-lg overflow-hidden">
            {off > 0 && (
              <span className="absolute top-3 left-3 z-10 bg-yellow text-ink text-[13px] font-bold px-2 py-0.5 rounded font-mono">−{off}%</span>
            )}
            <button
              type="button"
              onClick={() => setZoom(true)}
              className="block w-full h-full cursor-zoom-in"
              aria-label="Phóng to ảnh"
            >
              <img src={imgs[imgIdx]} alt={p.name} className="w-full h-full object-cover" />
            </button>
            <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1 bg-ink/70 text-white text-[11px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
              <ZoomIn size={13} /> Phóng to
            </span>
            {imgs.length > 1 && (
              <>
                <button type="button" onClick={prevImg} aria-label="Ảnh trước"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border border-line rounded-full p-1.5 shadow-card">
                  <ChevronLeft size={18} className="text-ink" />
                </button>
                <button type="button" onClick={nextImg} aria-label="Ảnh sau"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border border-line rounded-full p-1.5 shadow-card">
                  <ChevronRight size={18} className="text-ink" />
                </button>
              </>
            )}
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
              {out ? <span className="text-[#E8730C] font-semibold">Tạm hết hàng — có thể đặt trước, Hilitek báo khi có hàng</span>
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

            {/* Thứ tự: Đặt hàng -> Thêm vào giỏ -> Chat Zalo. Hết hàng vẫn cho ĐẶT TRƯỚC. */}
            <button
              onClick={doBuyNow}
              className={"mt-4 w-full rounded-md font-display font-bold py-3 text-[15px] tracking-wide flex items-center justify-center gap-2 transition text-white " + (out ? "bg-[#E8730C] hover:brightness-110" : "bg-navy hover:bg-navy-600")}
            >
              {out ? <><Clock size={17} /> ĐẶT TRƯỚC</> : <><Zap size={17} /> ĐẶT HÀNG</>}
            </button>

            <button
              onClick={doAdd}
              className="mt-2 w-full rounded-md font-display font-bold py-3 text-[15px] tracking-wide flex items-center justify-center gap-2 transition bg-yellow text-ink hover:bg-yellow-300"
            >
              <ShoppingCart size={17} /> THÊM VÀO GIỎ
            </button>

            {added && (
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
              <PosterSlot slot={PRODUCT_SIDEBAR.banner} navigate={navigate} zoom className="lg:sticky lg:top-[150px]" />
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
            <>
              <SpecTable rows={p.specs.slice(0, SPEC_PREVIEW)} />
              {p.specs.length > SPEC_PREVIEW && (
                <button
                  onClick={() => setSpecOpen(true)}
                  className="mt-2 w-full inline-flex items-center justify-center gap-1.5 rounded-md border border-line bg-paper text-navy font-semibold text-[13px] py-2.5 hover:bg-navy-050"
                >
                  <Plus size={15} /> Xem thêm {p.specs.length - SPEC_PREVIEW} thông số
                </button>
              )}
            </>
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

      {zoom && (
        <Lightbox
          images={imgs}
          index={imgIdx}
          alt={p.name}
          onIndex={setImgIdx}
          onClose={() => setZoom(false)}
        />
      )}

      {specOpen && p.specs?.length > 0 && (
        <SpecModal title="Thông số kỹ thuật" subtitle={p.name} rows={p.specs} onClose={() => setSpecOpen(false)} />
      )}
    </div>
  );
}

const SPEC_PREVIEW = 8;

/** Bảng thông số 2 cột: cột nhãn (nền xám) | cột giá trị. Dùng ở trang SP và trong popup. */
function SpecTable({ rows }) {
  return (
    <div className="border border-line rounded-lg overflow-hidden bg-white">
      <table className="w-full text-[13px]">
        <tbody>
          {rows.map(([k, v], i) => (
            <tr key={i} className="border-b border-line last:border-0 align-top">
              <td className="w-[40%] px-3.5 py-2.5 text-mute bg-paper font-medium">{k}</td>
              <td className="px-3.5 py-2.5 text-ink whitespace-pre-line">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Popup phóng to toàn bộ bảng thông số (Esc / bấm nền để đóng). */
function SpecModal({ title, subtitle, rows, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, []);
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl w-full max-w-[680px] my-6 shadow-menu" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 px-5 py-3.5 border-b border-line">
          <div>
            <h3 className="font-display text-lg font-bold text-ink leading-tight">{title}</h3>
            {subtitle && <p className="text-[12.5px] text-mute mt-0.5 line-clamp-1">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Đóng" className="text-mute hover:text-ink p-1 -mr-1 shrink-0"><X size={22} /></button>
        </div>
        <div className="p-4 sm:p-5 max-h-[76vh] overflow-y-auto">
          <SpecTable rows={rows} />
        </div>
      </div>
    </div>
  );
}

/** Ảnh phóng to toàn màn hình + nút ‹ › chuyển ảnh (Esc / bấm nền để đóng). */
function Lightbox({ images, index, alt, onIndex, onClose }) {
  const many = images.length > 1;
  const prev = (e) => { e?.stopPropagation(); onIndex((index - 1 + images.length) % images.length); };
  const next = (e) => { e?.stopPropagation(); onIndex((index + 1) % images.length); };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && many) prev();
      else if (e.key === "ArrowRight" && many) next();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [index, many]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 sm:p-10"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button onClick={onClose} aria-label="Đóng" className="absolute top-4 right-4 text-white/80 hover:text-white p-2">
        <X size={28} />
      </button>

      {many && (
        <button onClick={prev} aria-label="Ảnh trước" className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2">
          <ChevronLeft size={28} />
        </button>
      )}

      <img
        src={images[index]}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-h-full max-w-full object-contain select-none"
      />

      {many && (
        <button onClick={next} aria-label="Ảnh sau" className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2">
          <ChevronRight size={28} />
        </button>
      )}

      {many && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/80 text-[13px] font-mono">
          {index + 1} / {images.length}
        </div>
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
