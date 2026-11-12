import React, { useEffect, useRef, useState } from "react";
import {
  ChevronRight, ChevronLeft, ShieldCheck, Check, ArrowLeft, Minus, Plus, MessageCircle,
  ShoppingCart, Zap, ZoomIn, X, Clock, Gift, ChevronDown, ChevronUp, Phone, PhoneCall, Truck, BadgeCheck,
  RefreshCw, CreditCard, PackageCheck, ClipboardCheck, Wallet, Landmark, Store, Bell,
} from "lucide-react";
import { fetchProduct } from "../lib/api.js";
import { formatVND, discountPercent, warrantyLabel, placeholderImage } from "../lib/format.js";
import { LOW_STOCK_THRESHOLD, SITE, MENU, PRODUCT_SIDEBAR, productGroups } from "../config.js";
import { href } from "../router.js";
import { useCart } from "../cart.jsx";
import TrustBar from "../components/TrustBar.jsx";
import { askStockAlert } from "../components/StockNotify.jsx";
import ProductCommitments from "../components/ProductCommitments.jsx";
import ProductShipping from "../components/ProductShipping.jsx";
import SocialLinks from "../components/SocialLinks.jsx";
import PosterSlot from "../components/PosterSlot.jsx";
import RichText from "../components/RichText.jsx";
import { HiliMark } from "../components/Logo.jsx";

// Cặp danh mục hay mua kèm: [sản phẩm đang xem, danh mục gợi ý].
const PAIRS = [
  [/bàn phím/i, /chuột|lót/i],
  [/chuột/i, /bàn phím|lót/i],
  [/màn hình/i, /arm|giá đỡ|bàn phím/i],
  [/ssd|ổ cứng/i, /ram/i],
  [/ram/i, /ssd/i],
  [/máy chơi game/i, /tay cầm|phụ kiện/i],
];

export default function ProductDetail({ slug, navigate, catalog }) {
  const { add, openOrder } = useCart();
  const [product, setProduct] = useState(undefined);
  const [imgIdx, setImgIdx] = useState(0);
  const ctaRef = useRef(null);
  const [zoom, setZoom] = useState(false);
  const [imgOrigin, setImgOrigin] = useState(null); // vị trí con trỏ để phóng to ảnh khi rê chuột — null = không rê
  const [imgHover, setImgHover] = useState(false); // đang rê chuột trên ảnh — tạm dừng tự chạy
  const [specOpen, setSpecOpen] = useState(false);
  const [specExpanded, setSpecExpanded] = useState(false);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [descOverflows, setDescOverflows] = useState(false);
  const descRef = useRef(null);
  // Bấm chọn phiên bản khác (màu sắc/kích cỡ) không nên "load lại cả trang" — giữ nguyên mọi thứ
  // đang xem, chỉ đổi ảnh lớn NGAY (đã có sẵn ảnh từng phiên bản từ variants[], không cần chờ
  // mạng) rồi âm thầm tải chi tiết phiên bản mới, không hiện màn "Đang tải…" gây chớp/giật.
  const switchingVariantRef = useRef(false);
  const [previewImg, setPreviewImg] = useState(null);
  // Nút chọn phiên bản (màu xanh dương) + nhãn "Màu sắc: ..." đọc theo `product.variantAttrs` —
  // nếu chỉ dựa vào đó thì phải chờ tải xong chi tiết phiên bản mới mới đổi màu (chậm hơn hẳn ảnh
  // lớn vốn đổi ngay). previewAttrs giữ lựa chọn vừa bấm để tô xanh + đổi nhãn NGAY, đồng bộ tốc
  // độ với ảnh — xoá khi tải xong (cùng lúc với previewImg, xem effect [slug] phía trên).
  const [previewAttrs, setPreviewAttrs] = useState(null);
  // Giá/tồn kho cũng đổi theo phiên bản — đã có sẵn trong variants[] (không cần chờ mạng) nên
  // hiện NGAY như ảnh/nhãn màu, tránh giá đỏ "đứng hình" vài trăm ms chờ tải xong.
  const [previewPrice, setPreviewPrice] = useState(null);
  const [previewStock, setPreviewStock] = useState(null);

  // Đo xem phần mô tả có dài quá DESC_MAX không -> mới hiện nút "Xem thêm".
  // Đo lại sau 500ms để bắt ảnh/video tải chậm làm nội dung cao thêm.
  useEffect(() => {
    const measure = () => {
      const el = descRef.current;
      if (el) setDescOverflows(el.scrollHeight > DESC_MAX + 24);
    };
    measure();
    const t = setTimeout(measure, 500);
    return () => clearTimeout(t);
  }, [product]);

  useEffect(() => {
    let alive = true;
    const switching = switchingVariantRef.current;
    switchingVariantRef.current = false;
    if (!switching) {
      // Vào 1 sản phẩm hoàn toàn khác — reset sạch, hiện "Đang tải…", cuộn lên đầu như cũ.
      setProduct(undefined);
      setImgIdx(0);
      setZoom(false);
      setImgOrigin(null);
      setImgHover(false);
      setSpecOpen(false);
      setSpecExpanded(false);
      setQty(1);
      setAdded(false);
      setDescExpanded(false);
      window.scrollTo(0, 0);
    } else {
      // Đổi phiên bản cùng nhóm — chỉ về lại ảnh đầu, KHÔNG xoá product/cuộn trang (previewImg
      // đã hiện đúng ảnh phiên bản mới ngay khi bấm, ở đây chỉ cần chờ tải nốt phần còn lại).
      setImgIdx(0);
    }
    fetchProduct(slug).then((p) => { if (alive) { setProduct(p); setPreviewImg(null); setPreviewAttrs(null); setPreviewPrice(null); setPreviewStock(null); } });
    return () => { alive = false; };
  }, [slug]);

  // SEO: đặt tiêu đề trang + thẻ mô tả theo cấu hình SEO của sản phẩm.
  useEffect(() => {
    if (!product) return;
    const baseTitle = "Hilitek";
    const title = ((product.seoTitle && product.seoTitle.trim())
      || (product.name ? `${product.name} | ${baseTitle}` : baseTitle)).replace(/HiliPC/g, baseTitle);
    const descText = (product.seoDesc && product.seoDesc.trim()) || product.shortDesc || "";
    const prevTitle = document.title;
    document.title = title;
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) { tag = document.createElement("meta"); tag.setAttribute("name", "description"); document.head.appendChild(tag); }
    const prevDesc = tag.getAttribute("content");
    if (descText) tag.setAttribute("content", descText.slice(0, 300));
    return () => {
      document.title = prevTitle;
      if (prevDesc != null) tag.setAttribute("content", prevDesc);
    };
  }, [product]);

  // Đang chờ chi tiết từ server: nếu sản phẩm này đã có trong danh sách vừa tải (tên, giá, ảnh, tồn
  // kho, thông số...) thì hiện NGAY từ đó, phần còn lại (mô tả dài, nút chọn phiên bản) bổ sung khi
  // tải xong — không để khách nhìn màn "Đang tải…" 1-2s. Bỏ qua sản phẩm nhiều phiên bản: thẻ trong
  // danh sách là bản gộp (giá thấp nhất/tổng tồn) nên khác với trang chi tiết, hiện tạm sẽ nhảy giá.
  const hint = product === undefined
    ? (catalog.products || []).find((x) => x.slug === slug && !(x.variantCount > 1)) || null
    : null;
  if (product === undefined && !hint)
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

  const p = product === undefined ? hint : product;
  const price = previewPrice != null ? previewPrice : p.price;
  const stock = previewStock != null ? previewStock : p.stock;
  const off = discountPercent(price, p.listPrice);
  const ownImgs = (p.images?.length ? p.images.map((im) => im.src || im) : [placeholderImage(p.brand, p.category)])
    .map((src) => ({ src, variantSlug: null }));
  // Ảnh nhỏ hiện đủ ảnh của MỌI phiên bản (giống Shopee) để khách lướt xem thoải mái. Ảnh của
  // CHÍNH phiên bản đang xem: bấm chỉ đổi ảnh lớn. Ảnh mượn từ phiên bản KHÁC (variantSlug khác
  // null): bấm sẽ chuyển thẳng sang đúng phiên bản đó (xem chỗ dùng pickProductVariant bên dưới).
  const otherVariantImgs = (p.variants || [])
    .filter((v) => v.slug !== p.slug && v.image)
    .map((v) => ({ src: v.image, variantSlug: v.slug }));
  const imgs = [...ownImgs, ...otherVariantImgs];
  const imgSrcs = imgs.map((im) => im.src);
  const low = stock > 0 && stock <= LOW_STOCK_THRESHOLD;
  const out = !stock;
  const groupName =
    productGroups(p)[0] ||
    MENU.find((g) => (g.subs || []).some((s) => s.name === p.category))?.group ||
    p.group;
  const related = (catalog.products || [])
    .filter((x) => x.category === p.category && x.slug !== p.slug && !(p.variantGroupId && x.variantGroupId === p.variantGroupId))
    .slice(0, 5);
  // "Gợi ý dùng cùng": món thường mua kèm, ưu tiên hàng có sẵn. Không có món phù hợp thì ẩn khối này.
  const pairRule = PAIRS.find(([own]) => own.test(`${p.category} ${p.name}`));
  const pairs = pairRule
    ? (catalog.products || []).filter((x) => pairRule[1].test(x.category) && x.stock > 0 && x.slug !== p.slug).slice(0, 5)
    : [];
  const descText = (p.description && p.description.trim()) || p.shortDesc || "";
  const promoLines = String(p.promo || "")
    .split("\n")
    .map((l) => l.trim().replace(/^[-+•*]\s*/, ""))
    .filter(Boolean);

  const doAdd = () => { add(p, qty, { preorder: out }); setAdded(true); };
  const doBuyNow = () => { add(p, qty, { preorder: out }); openOrder(p); };
  const prevImg = () => setImgIdx((i) => (i - 1 + imgs.length) % imgs.length);
  const nextImg = () => setImgIdx((i) => (i + 1) % imgs.length);
  // Bấm chọn phiên bản khác: hiện NGAY ảnh của phiên bản đó (đã có sẵn, không cần chờ mạng),
  // rồi mới âm thầm chuyển trang + tải chi tiết đầy đủ ở nền (xem effect [slug] phía trên).
  const pickProductVariant = (variant) => {
    if (!variant || !variant.slug || variant.slug === p.slug) return;
    switchingVariantRef.current = true;
    if (variant.image) setPreviewImg(variant.image);
    if (variant.attrs) setPreviewAttrs(variant.attrs);
    if (variant.price != null) setPreviewPrice(variant.price);
    if (variant.stock != null) setPreviewStock(variant.stock);
    // replace:true — đổi phiên bản KHÔNG đẩy thêm mốc lịch sử mới (thay thế mốc sản phẩm hiện tại),
    // để bấm Back thoát thẳng về trang trước khi vào sản phẩm, không phải lùi qua từng phiên bản.
    navigate(`/san-pham/${variant.slug}`, { replace: true });
  };

  const keySpecs = pickKeySpecs(p.specs || []);
  const warranty = warrantyLabel(p.warrantyMonths);
  const goSection = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - stickyOffset() - 56;
    window.scrollTo({ top, behavior: "smooth" });
  };
  const sections = [
    ["pd-mo-ta", "Mô tả"],
    ["pd-thong-so", `Thông số${p.specs?.length ? ` (${p.specs.length})` : ""}`],
    ["pd-mua-hang", "Đặt hàng & thanh toán"],
    ["pd-bao-hanh", "Bảo hành & đổi trả"],
  ];

  return (
    <div className="pd mx-auto max-w-[1500px] px-3 sm:px-4 pt-4 pb-10 font-sans">
      <StickyBuy anchor={ctaRef} p={p} price={price} out={out} img={imgs[0]?.src} onBuy={doBuyNow} onAdd={doAdd} />
      <nav className="flex items-center gap-1 text-[13px] text-mute mb-4 flex-wrap" aria-label="Đường dẫn">
        <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }} className="hover:text-navy">Trang chủ</a>
        <ChevronRight size={12} />
        <a href={href("/danh-muc", { group: groupName })} onClick={(e) => { e.preventDefault(); navigate(href("/danh-muc", { group: groupName }).slice(1)); }} className="hover:text-navy">{groupName}</a>
        <ChevronRight size={12} />
        <a href={href("/danh-muc", { cat: p.category })} onClick={(e) => { e.preventDefault(); navigate(href("/danh-muc", { cat: p.category }).slice(1)); }} className="hover:text-navy">{p.category}</a>
        <ChevronRight size={12} className="hidden sm:block" />
        <span className="hidden sm:block text-ink/70 truncate max-w-[320px]">{p.name}</span>
      </nav>

      {/* ===== Khối mua: ảnh | thông tin + mua | cam kết ===== */}
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,560px)_minmax(0,1fr)_300px] gap-5 lg:gap-8 items-start">
        <Gallery
          imgs={imgs}
          imgIdx={imgIdx}
          setImgIdx={setImgIdx}
          previewImg={previewImg}
          off={off}
          name={p.name}
          onZoom={() => setZoom(true)}
          onPickVariantImg={(slugV) => {
            const variant = (p.variants || []).find((v) => v.slug === slugV);
            if (variant) pickProductVariant(variant);
          }}
        />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">
            {p.brand && (
              <a href={href("/danh-muc", { q: p.brand })} onClick={(e) => { e.preventDefault(); navigate(href("/danh-muc", { q: p.brand }).slice(1)); }}
                className="font-semibold uppercase tracking-wide text-navy hover:underline">{p.brand}</a>
            )}
            {p.sku && <span className="text-mute">Mã: <span className="font-mono text-ink/80">{p.sku}</span></span>}
          </div>
          <h1 className="mt-1.5 font-display text-[23px] sm:text-[30px] font-bold text-ink leading-[1.2]">{p.name}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px]">
            <StockPill out={out} low={low} />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-050 px-2.5 py-1 font-medium text-navy"><ShieldCheck size={14} /> {warranty}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-050 px-2.5 py-1 font-medium text-navy"><BadgeCheck size={14} /> Chính hãng, có VAT</span>
          </div>

          {/* Giá */}
          <div className="mt-4 rounded-xl border border-line bg-white p-4 sm:p-5">
            <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
              <div className="font-display text-[34px] sm:text-[40px] font-bold text-sale leading-none">{formatVND(price)}</div>
              {off > 0 && (
                <>
                  <span className="text-[16px] text-mute line-through mb-0.5">{formatVND(p.listPrice)}</span>
                  <span className="mb-0.5 rounded bg-sale px-1.5 py-0.5 text-[13px] font-bold text-white">−{off}%</span>
                </>
              )}
            </div>
            <div className="mt-1.5 text-[13px] text-mute">
              Giá đã gồm VAT{off > 0 && <> · Tiết kiệm <b className="text-sale font-semibold">{formatVND(p.listPrice - price)}</b></>}
            </div>

            {p.variants?.length > 1 && <VariantPicker product={p} onPick={pickProductVariant} attrsOverride={previewAttrs} />}

            {promoLines.length > 0 && (
              <div className="mt-4 rounded-lg border border-[#E8730C]/40 bg-[#FFF6EE]">
                <div className="flex items-center gap-1.5 px-3 pt-2.5 text-[14px] font-bold text-[#B4540A]"><Gift size={15} /> Ưu đãi khi mua</div>
                <ul className="px-3 pb-2.5 pt-1.5 space-y-1 text-[14px] text-ink">
                  {promoLines.map((line, i) => (
                    <li key={i} className="flex gap-2"><Check size={15} className="mt-[3px] shrink-0 text-[#E8730C]" /><span>{line}</span></li>
                  ))}
                </ul>
              </div>
            )}

            {/* Số lượng + nút mua */}
            <div ref={ctaRef} className="mt-4 flex items-center gap-3">
              <span className="text-[14px] text-mute">Số lượng</span>
              <div className="inline-flex items-center rounded-lg border border-line">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-10 w-10 place-items-center text-mute hover:text-navy" aria-label="Giảm số lượng"><Minus size={15} /></button>
                <input value={qty} onChange={(e) => setQty(Math.max(1, Math.min(99, parseInt(e.target.value.replace(/\D/g, "")) || 1)))} className="w-10 text-center text-[15px] font-semibold outline-none" inputMode="numeric" aria-label="Số lượng" />
                <button onClick={() => setQty((q) => Math.min(99, q + 1))} className="grid h-10 w-10 place-items-center text-mute hover:text-navy" aria-label="Tăng số lượng"><Plus size={15} /></button>
              </div>
              {low && !out && <span className="text-[13px] font-medium text-[#B4540A]">Chỉ còn ít hàng</span>}
            </div>

            <div className="mt-3 grid grid-cols-[1fr_auto] sm:grid-cols-[1.4fr_1fr] gap-2">
              <button onClick={doBuyNow}
                className="hx-key y min-h-[56px] px-3 flex-col !gap-0 leading-tight">
                <span className="inline-flex items-center gap-1.5 text-[17px] font-bold">{out ? <><Clock size={17} /> ĐẶT TRƯỚC</> : <><Zap size={17} /> MUA NGAY</>}</span>
                <span className="text-[12px] font-normal font-sans text-ink/70">{out ? "Hili báo ngay khi hàng về" : "Giao tận nơi hoặc nhận tại cửa hàng"}</span>
              </button>
              {out ? (
                <button onClick={() => askStockAlert(p)} className="hx-key min-h-[56px] px-3 text-[15px]">
                  <Bell size={17} /><span className="hidden sm:inline">Báo khi có hàng</span>
                </button>
              ) : (
                <button onClick={doAdd} aria-label="Thêm vào giỏ" className="hx-key min-h-[56px] px-3 text-[15px]">
                  <ShoppingCart size={18} /><span className="hidden sm:inline">Thêm vào giỏ</span>
                </button>
              )}
            </div>

            {added && (
              <button onClick={() => navigate("/gio-hang")} className="mt-2 w-full rounded-lg bg-[#E3F4EA] text-[#17643A] font-semibold py-2.5 text-[14px] inline-flex items-center justify-center gap-1.5 hover:brightness-95">
                <Check size={15} /> Đã thêm vào giỏ. Xem giỏ hàng
              </button>
            )}

            <div className="mt-2 grid grid-cols-2 gap-2">
              <a href={`tel:${SITE.phoneRaw}`} className="min-h-[46px] rounded-lg border border-line px-2 flex items-center justify-center gap-2 text-[14px] text-ink hover:border-navy">
                <Phone size={16} className="text-navy" /><span className="leading-tight">Gọi đặt hàng<b className="block font-semibold text-navy">{SITE.phone}</b></span>
              </a>
              <a href={SITE.zaloHref} target="_blank" rel="noreferrer" className="min-h-[46px] rounded-lg border border-line px-2 flex items-center justify-center gap-2 text-[14px] text-ink hover:border-[#0068FF]">
                <MessageCircle size={16} className="text-[#0068FF]" /><span className="leading-tight">Tư vấn qua Zalo<b className="block font-semibold text-[#0068FF]">Trả lời nhanh</b></span>
              </a>
            </div>
          </div>

          {/* Thông số nổi bật */}
          {keySpecs.length > 0 && (
            <div className="mt-4 rounded-xl border border-line bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[16px] font-bold text-ink">Thông số nổi bật</h2>
                {p.specs.length > keySpecs.length && (
                  <button onClick={() => goSection("pd-thong-so")} className="text-[13px] font-semibold text-navy hover:underline inline-flex items-center gap-0.5">
                    Xem đủ {p.specs.length} thông số <ChevronRight size={14} />
                  </button>
                )}
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2">
                {keySpecs.map(([k, v], i) => (
                  <div key={i} className="rounded-lg bg-paper px-3 py-2">
                    <dt className="text-[12px] text-mute">{k}</dt>
                    <dd className="text-[14px] font-medium text-ink line-clamp-2">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Lợi ích mua hàng — ngắn, quét nhanh */}
          <ul className="mt-4 grid grid-cols-2 gap-2 text-[13px]">
            {[
              [Truck, "Giao toàn quốc", "Hoả tốc 2 giờ nội thành"],
              [PackageCheck, "Kiểm hàng khi nhận", "Mở hộp xem rồi mới trả tiền"],
              [RefreshCw, "Đổi mới 30 ngày", "Nếu lỗi do nhà sản xuất"],
              [CreditCard, "Thanh toán linh hoạt", "COD, chuyển khoản, thẻ, trả góp"],
            ].map(([Icon, t, s]) => (
              <li key={t} className="flex items-start gap-2.5 rounded-lg border border-line bg-white p-2.5">
                <Icon size={18} className="mt-0.5 shrink-0 text-navy" />
                <span className="leading-snug"><b className="block font-semibold text-ink">{t}</b><span className="text-mute">{s}</span></span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cột phải (màn rộng): cam kết + banner */}
        <div className="hidden xl:block space-y-4">
          <ProductCommitments compact />
          {PRODUCT_SIDEBAR.banner && <PosterSlot slot={PRODUCT_SIDEBAR.banner} navigate={navigate} zoom />}
        </div>
      </div>

      {/* ===== Thanh mục lục dính ===== */}
      <SectionNav sections={sections} onGo={goSection} />

      <div className="mt-4 grid xl:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
        <div className="min-w-0 space-y-6">
          {/* Mô tả */}
          <section id="pd-mo-ta" className="rounded-xl border border-line bg-white p-5 sm:p-7">
            <SectionTitle>Mô tả sản phẩm</SectionTitle>
            {descText ? (
              <>
                <div ref={descRef} className="relative overflow-hidden transition-[max-height] duration-300"
                  style={{ maxHeight: descExpanded ? 20000 : descOverflows ? DESC_MAX : "none" }}>
                  <div className="pd-desc"><RichText text={descText} /></div>
                  {!descExpanded && descOverflows && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white to-transparent" />}
                </div>
                {descOverflows && (
                  <button onClick={() => { if (descExpanded) goSection("pd-mo-ta"); setDescExpanded((v) => !v); }}
                    className="mt-3 mx-auto flex items-center justify-center gap-1.5 rounded-full border border-navy px-5 py-2 text-navy font-semibold text-[14px] hover:bg-navy-050">
                    {descExpanded ? <>Thu gọn <ChevronUp size={16} /></> : <>Đọc tiếp mô tả <ChevronDown size={16} /></>}
                  </button>
                )}
              </>
            ) : (
              <p className="text-mute text-[15px]">Hili đang cập nhật mô tả. Cần tư vấn ngay, gọi {SITE.phone} hoặc nhắn Zalo.</p>
            )}
          </section>

          {/* Thông số đầy đủ */}
          <section id="pd-thong-so" className="rounded-xl border border-line bg-white p-5 sm:p-7">
            <SectionTitle>Thông số kỹ thuật</SectionTitle>
            {p.specs?.length > 0 ? (
              <>
                <SpecTable rows={specExpanded ? p.specs : p.specs.slice(0, SPEC_PREVIEW)} />
                {p.specs.length > SPEC_PREVIEW && (
                  <button onClick={() => { if (specExpanded) goSection("pd-thong-so"); setSpecExpanded((v) => !v); }}
                    className="mt-3 mx-auto flex items-center justify-center gap-1.5 rounded-full border border-navy px-5 py-2 text-navy font-semibold text-[14px] hover:bg-navy-050">
                    {specExpanded ? <>Thu gọn <ChevronUp size={16} /></> : <>Xem thêm {p.specs.length - SPEC_PREVIEW} thông số <ChevronDown size={16} /></>}
                  </button>
                )}
              </>
            ) : (
              <p className="text-mute text-[15px]">Hili đang cập nhật thông số.</p>
            )}
          </section>

          <HowToBuy />
          <WarrantyReturn warranty={warranty} navigate={navigate} />
        </div>

        {/* Thẻ mua nhỏ dính bên phải khi đọc mô tả (màn rộng) */}
        <aside className="hidden xl:block sticky" style={{ top: stickyOffset() + 64 }}>
          <div className="rounded-xl border border-line bg-white p-4">
            <div className="flex gap-3">
              <img src={imgs[0]?.src} alt="" className="h-16 w-16 shrink-0 rounded-md border border-line object-contain bg-white" />
              <div className="min-w-0 text-[14px] font-medium text-ink line-clamp-3 leading-snug">{p.name}</div>
            </div>
            <div className="mt-3 font-display text-[26px] font-bold text-sale leading-none">{formatVND(price)}</div>
            {off > 0 && <div className="mt-1 text-[13px] text-mute"><span className="line-through">{formatVND(p.listPrice)}</span> · −{off}%</div>}
            <button onClick={doBuyNow} className="hx-key y mt-3 w-full min-h-[48px] text-[15px] font-bold">
              {out ? <><Clock size={16} /> ĐẶT TRƯỚC</> : <><Zap size={16} /> MUA NGAY</>}
            </button>
            {!out && (
              <button onClick={doAdd} className="hx-key mt-3 w-full min-h-[44px] text-[14px]">
                <ShoppingCart size={16} /> Thêm vào giỏ
              </button>
            )}
            <a href={`tel:${SITE.phoneRaw}`} className="mt-3 flex items-center justify-center gap-1.5 text-[14px] text-ink hover:text-navy">
              <Phone size={15} className="text-navy" /> Gọi <b className="font-semibold text-navy">{SITE.phone}</b>
            </a>
          </div>
        </aside>
      </div>

      {pairs.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-[22px] sm:text-[26px] font-bold text-ink mb-4 flex items-center gap-2.5"><HiliMark className="h-5 w-auto text-yellow" />Thường mua kèm</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            {pairs.map((r) => <RelatedCard key={r.id} p={r} onOpen={() => navigate(`/san-pham/${r.slug}`)} />)}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-[22px] sm:text-[26px] font-bold text-ink mb-4 flex items-center gap-2.5"><HiliMark className="h-5 w-auto text-yellow" />Sản phẩm tương tự</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            {related.map((r) => <RelatedCard key={r.id} p={r} onOpen={() => navigate(`/san-pham/${r.slug}`)} />)}
          </div>
        </section>
      )}

      <div className="mt-10"><TrustBar /></div>

      {zoom && <Lightbox images={imgSrcs} index={imgIdx} alt={p.name} onIndex={setImgIdx} onClose={() => setZoom(false)} />}
    </div>
  );
}

const SPEC_PREVIEW = 12;
const DESC_MAX = 620; // px — chiều cao mô tả khi chưa bấm "Đọc tiếp"

// Chiều cao header đang dính (màn rộng) — để thanh mục lục và thẻ mua nằm ngay dưới, không bị che.
function stickyOffset() {
  if (typeof window === "undefined" || window.innerWidth < 1024) return 0;
  const h = document.querySelector("header");
  return h ? h.getBoundingClientRect().height : 0;
}

// 6 thông số "đáng xem" nhất cho khối Thông số nổi bật: bỏ dòng khách không cần (tên, hãng, mã,
// bảo hành, tình trạng, ngành hàng...) và dòng quá dài.
function pickKeySpecs(specs) {
  const skip = /tên sản phẩm|thương hiệu|hãng sản xuất|^hãng$|bảo hành|tình trạng|ngành hàng|loại sản phẩm|danh mục|sku|mã sản phẩm|mã hàng|model|part\s*number|xuất xứ/i;
  return specs
    .filter(([k, v]) => k && v && !skip.test(k) && String(v).length <= 90 && !/^[A-Z0-9]+(-[A-Z0-9]+){2,}$/.test(v))
    .slice(0, 6)
    .map(([k, v]) => [k, String(v).split("\n")[0]]);
}

function StockPill({ out, low }) {
  const [cls, dot, text] = out
    ? ["bg-[#F1F2F6] text-ink", "bg-mute", "Tạm hết hàng"]
    : low ? ["bg-[#FFF3E6] text-[#B4540A]", "bg-[#E8730C]", "Còn ít hàng"]
    : ["bg-[#E3F4EA] text-[#17643A]", "bg-[#22A35A]", "Còn hàng"];
  return (
    <span className={"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold " + cls}>
      <span className={"h-2 w-2 rounded-full " + dot} />{text}
    </span>
  );
}

function SectionTitle({ children }) {
  return <h2 className="mb-4 font-display text-[21px] sm:text-[24px] font-bold text-ink flex items-center gap-2.5"><HiliMark className="h-5 w-auto shrink-0 text-yellow" />{children}</h2>;
}

/** Ảnh sản phẩm: ảnh lớn (giữ trọn ảnh, không cắt), vuốt trên điện thoại, dãy ảnh nhỏ cuộn ngang. */
function Gallery({ imgs, imgIdx, setImgIdx, previewImg, off, name, onZoom, onPickVariantImg }) {
  const [origin, setOrigin] = useState(null);
  const touch = useRef(null);
  const stripRef = useRef(null);
  const many = imgs.length > 1;
  const go = (d) => setImgIdx((i) => (i + d + imgs.length) % imgs.length);
  useEffect(() => {
    const strip = stripRef.current;
    const el = strip && strip.children[imgIdx];
    if (el) strip.scrollTo({ left: el.offsetLeft - strip.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
  }, [imgIdx]);
  return (
    <div className="min-w-0 lg:sticky" style={{ top: stickyOffset() + 16 }}>
      <div className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-white"
        onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touch.current == null || !many) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          touch.current = null;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        }}>
        {off > 0 && <span className="absolute top-3 left-3 z-10 rounded bg-sale px-2 py-0.5 text-[14px] font-bold text-white">−{off}%</span>}
        <button type="button" onClick={onZoom}
          onMouseMove={(e) => {
            if (window.matchMedia("(hover: none)").matches) return;
            const r = e.currentTarget.getBoundingClientRect();
            setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
          }}
          onMouseLeave={() => setOrigin(null)}
          className="block h-full w-full cursor-zoom-in" aria-label="Phóng to ảnh">
          <img src={previewImg || imgs[imgIdx]?.src} alt={name}
            className="h-full w-full object-contain transition-transform duration-300 ease-out"
            style={{ transform: origin ? "scale(1.9)" : "scale(1)", transformOrigin: origin || "center" }} />
        </button>
        {many && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Ảnh trước"
              className="absolute left-2 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full border border-line bg-white/95 shadow-card hover:bg-white">
              <ChevronLeft size={20} className="text-ink" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Ảnh sau"
              className="absolute right-2 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full border border-line bg-white/95 shadow-card hover:bg-white">
              <ChevronRight size={20} className="text-ink" />
            </button>
            <span className="absolute bottom-3 left-3 rounded-full bg-ink/70 px-2.5 py-1 text-[12px] font-medium text-white">{imgIdx + 1} / {imgs.length}</span>
          </>
        )}
        <span className="pointer-events-none absolute bottom-3 right-3 hidden items-center gap-1 rounded-full bg-ink/70 px-2.5 py-1 text-[12px] text-white sm:inline-flex">
          <ZoomIn size={13} /> Bấm để xem lớn
        </span>
      </div>
      {many && (
        <div ref={stripRef} className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
          {imgs.map((img, i) => (
            <button key={i} type="button"
              onClick={() => (img.variantSlug ? onPickVariantImg(img.variantSlug) : setImgIdx(i))}
              title={img.variantSlug ? "Xem phiên bản này" : `Ảnh ${i + 1}`}
              className={"h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg border-2 bg-white transition " + (!previewImg && i === imgIdx ? "border-navy" : "border-line hover:border-navy/40")}>
              <img src={img.src} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Thanh mục lục dính dưới header: bấm để nhảy tới phần cần xem, tự tô phần đang đọc. */
function SectionNav({ sections, onGo }) {
  const [active, setActive] = useState(sections[0][0]);
  const [top, setTop] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const off = stickyOffset();
      setTop(off);
      let cur = sections[0][0];
      for (const [id] of sections) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= off + window.innerHeight * 0.3) cur = id;
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, [sections.map((s) => s[0]).join()]);
  return (
    <div className="sticky z-30 -mx-3 sm:mx-0 mt-8 border-y border-line bg-white/95 backdrop-blur sm:rounded-xl sm:border" style={{ top }}>
      <div className="flex gap-1 overflow-x-auto px-2 py-1.5 [scrollbar-width:none]">
        {sections.map(([id, label]) => (
          <button key={id} onClick={() => onGo(id)}
            className={"shrink-0 rounded-lg px-3.5 py-2 text-[14px] font-semibold transition " + (active === id ? "bg-navy text-white" : "text-ink/75 hover:bg-navy-050 hover:text-navy")}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Hướng dẫn đặt hàng + thanh toán ngay trên trang sản phẩm — khách không phải đi tìm. */
function HowToBuy() {
  const steps = [
    [ShoppingCart, "Chọn sản phẩm", "Chọn phiên bản, số lượng rồi bấm Mua ngay hoặc Thêm vào giỏ."],
    [ClipboardCheck, "Điền thông tin", "Họ tên, số điện thoại, địa chỉ nhận hàng. Không cần tạo tài khoản."],
    [PhoneCall, "Hili gọi xác nhận", `Nhân viên gọi lại xác nhận đơn và phí giao trong giờ làm việc (${SITE.workingHours}).`],
    [PackageCheck, "Nhận hàng, kiểm tra", "Mở hộp kiểm tra sản phẩm, serial, phụ kiện rồi mới thanh toán."],
  ];
  const pays = [
    [Wallet, "Thanh toán khi nhận hàng (COD)", "Trả tiền mặt cho nhân viên giao hàng."],
    [Landmark, "Chuyển khoản ngân hàng", `${SITE.bank.name} · STK ${SITE.bank.accountNumber} · ${SITE.bank.holder}. Nội dung: Họ tên + SĐT.`],
    [Store, "Tại cửa hàng", `${SITE.address}. Tiền mặt hoặc quẹt thẻ, không phụ thu.`],
    [CreditCard, "Trả góp", "Qua thẻ tín dụng hoặc công ty tài chính. Gọi Hili để được tư vấn kỳ hạn."],
  ];
  return (
    <section id="pd-mua-hang" className="rounded-xl border border-line bg-white p-5 sm:p-7">
      <SectionTitle>Đặt hàng & thanh toán</SectionTitle>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(([Icon, t, s], i) => (
          <li key={t} className="relative rounded-lg bg-paper p-4">
            <span className="absolute right-3 top-3 font-display text-[22px] font-bold text-navy/15">0{i + 1}</span>
            <Icon size={22} className="text-navy" />
            <b className="mt-2 block text-[15px] text-ink">{t}</b>
            <span className="mt-1 block text-[14px] leading-snug text-mute">{s}</span>
          </li>
        ))}
      </ol>
      <h3 className="mt-6 mb-3 text-[16px] font-bold text-ink">Cách thanh toán</h3>
      <ul className="grid gap-3 sm:grid-cols-2">
        {pays.map(([Icon, t, s]) => (
          <li key={t} className="flex gap-3 rounded-lg border border-line p-3.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-navy-050"><Icon size={19} className="text-navy" /></span>
            <span className="min-w-0 text-[14px] leading-snug"><b className="block text-ink">{t}</b><span className="text-mute break-words">{s}</span></span>
          </li>
        ))}
      </ul>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 text-[14px] text-ink/80">
        {PRODUCT_SIDEBAR.shipping.map((line) => (
          <div key={line} className="flex gap-2"><Truck size={16} className="mt-0.5 shrink-0 text-navy" />{line}</div>
        ))}
      </div>
    </section>
  );
}

function WarrantyReturn({ warranty, navigate }) {
  const go = (path) => (e) => { e.preventDefault(); navigate(path); };
  const items = [
    [ShieldCheck, "Bảo hành", `${warranty}. Bảo hành tại Hilitek hoặc trung tâm của hãng, Hili hỗ trợ gửi giúp.`],
    [RefreshCw, "Đổi mới trong 30 ngày", "Sản phẩm lỗi do nhà sản xuất được đổi mới đúng loại. Giao sai, thiếu phụ kiện: đổi hoặc bổ sung trong 24 giờ."],
    [PackageCheck, "Đồng kiểm khi nhận", "Được mở hộp kiểm tra trước khi thanh toán. Hàng sai hoặc hư do vận chuyển: từ chối nhận, Hili đổi mới."],
  ];
  return (
    <section id="pd-bao-hanh" className="rounded-xl border border-line bg-white p-5 sm:p-7">
      <SectionTitle>Bảo hành & đổi trả</SectionTitle>
      <ul className="grid gap-3 md:grid-cols-3">
        {items.map(([Icon, t, s]) => (
          <li key={t} className="rounded-lg bg-paper p-4">
            <Icon size={22} className="text-navy" />
            <b className="mt-2 block text-[15px] text-ink">{t}</b>
            <span className="mt-1 block text-[14px] leading-snug text-mute">{s}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[14px] font-semibold text-navy">
        <a href="/chinh-sach-bao-hanh" onClick={go("/chinh-sach-bao-hanh")} className="hover:underline">Chính sách bảo hành ›</a>
        <a href="/chinh-sach-doi-tra" onClick={go("/chinh-sach-doi-tra")} className="hover:underline">Chính sách đổi trả ›</a>
        <a href="/chinh-sach-giao-hang" onClick={go("/chinh-sach-giao-hang")} className="hover:underline">Chính sách giao hàng ›</a>
        <a href="/bao-hanh" onClick={go("/bao-hanh")} className="hover:underline">Tra cứu bảo hành ›</a>
      </div>
    </section>
  );
}

/**
 * Nút chọn phiên bản (Màu sắc/Kích cỡ...) — mỗi thuộc tính 1 hàng nút. `onPick(variant)` do
 * trang cha xử lý: đổi ảnh lớn ngay lập tức rồi mới âm thầm chuyển trang (không "load lại"
 * trắng trang như điều hướng thường — xem pickProductVariant() ở ProductDetail).
 * Bấm 1 thuộc tính khi sản phẩm có ≥2 thuộc tính sẽ ưu tiên tìm đúng tổ hợp còn lại đang chọn,
 * không có tổ hợp đó thì lấy phiên bản đầu tiên khớp riêng thuộc tính vừa bấm.
 */
function VariantPicker({ product, onPick, attrsOverride }) {
  const variants = product.variants || [];
  const current = attrsOverride || product.variantAttrs || {};
  const keys = [];
  variants.forEach((v) => Object.keys(v.attrs || {}).forEach((k) => { if (!keys.includes(k)) keys.push(k); }));

  // Ảnh nhỏ trên nút chọn màu: lấy ảnh của phiên bản mang giá trị đó (chỉ thuộc tính đầu tiên — thường là Màu sắc).
  const swatch = (key, value) => {
    if (key !== keys[0]) return null;
    const v = variants.find((x) => x.attrs[key] === value && x.image);
    return v ? v.image : null;
  };
  const pickVariant = (key, value) => {
    const want = { ...current, [key]: value };
    const exact = variants.find((v) => keys.every((k) => (v.attrs[k] || "") === (want[k] || "")));
    const target = exact || variants.find((v) => (v.attrs[key] || "") === value);
    onPick(target);
  };

  return (
    <div className="mt-4 space-y-3">
      {keys.map((key) => {
        const values = [...new Set(variants.map((v) => v.attrs[key]).filter(Boolean))];
        return (
          <div key={key}>
            <div className="text-[13px] text-mute mb-1.5">{key}: <span className="text-ink font-medium">{current[key] || "—"}</span></div>
            <div className="flex flex-wrap gap-2">
              {values.map((val) => {
                const active = current[key] === val;
                const anyInStock = variants.some((v) => v.attrs[key] === val && v.stock > 0);
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => pickVariant(key, val)}
                    title={anyInStock ? undefined : "Hết hàng"}
                    className={
                      "min-h-[44px] min-w-[76px] rounded-lg px-2.5 py-1.5 border-2 text-[13px] leading-tight transition " +
                      (active ? "border-navy bg-navy-050 text-navy font-semibold" : "border-line bg-white text-ink hover:border-navy/50") +
                      (anyInStock ? "" : " opacity-60")
                    }
                  >
                    {swatch(key, val) && <img src={swatch(key, val)} alt="" loading="lazy" className="mx-auto mb-1 h-11 w-11 rounded object-contain bg-white" />}
                    {val}
                    {!anyInStock && <span className="block text-[11px] font-normal text-mute">Tạm hết</span>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Bảng thông số 2 cột: cột nhãn (nền xám) | cột giá trị. Dùng ở trang SP và trong popup. */
function SpecTable({ rows }) {
  return (
    <div className="border border-line rounded-lg overflow-hidden bg-white">
      <table className="w-full text-[14px]">
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
            {subtitle && <p className="text-[13px] text-mute mt-0.5 line-clamp-1">{subtitle}</p>}
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
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/80 text-[14px] font-mono">
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  );
}


function RelatedCard({ p, onOpen }) {
  return (
    <a href={`/san-pham/${p.slug}`} onClick={(e) => { e.preventDefault(); onOpen(); }} className="border border-line rounded-lg bg-white p-3 hover:shadow-card hover:border-navy/30">
      <img src={p.images?.[0]?.src || p.images?.[0] || placeholderImage(p.brand, p.category)} alt={p.name} className="w-full aspect-square object-cover rounded-md bg-navy-050" />
      <div className="mt-2 text-[13px] text-ink line-clamp-2 min-h-[34px]">{p.name}</div>
      <div className="mt-1 font-display text-[18px] font-bold text-navy">{formatVND(p.price)}</div>
    </a>
  );
}

/** Thanh mua dính đáy màn hình, chỉ hiện khi đã cuộn qua nút mua chính. Trên điện thoại nằm trên thanh menu dưới. */
function StickyBuy({ anchor, p, price, out, img, onBuy, onAdd }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const check = () => { const el = anchor.current; setShow(!!el && el.getBoundingClientRect().top < -120); };
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, [anchor]);
  return (
    <div className={"xl:hidden fixed left-0 right-0 bottom-[60px] lg:bottom-0 z-[55] bg-ink text-white transition-transform duration-500 " + (show ? "translate-y-0" : "translate-y-[calc(100%+60px)]")}>
      <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-3 sm:px-4 py-2">
        {img && <img src={img} alt="" className="hidden sm:block h-11 w-11 object-cover bg-white" />}
        <div className="hidden sm:block min-w-0 flex-1 truncate font-display text-[20px] font-bold">{p.name}</div>
        <div className="font-display text-[22px] font-bold text-yellow whitespace-nowrap">{formatVND(price)}</div>
        <div className="ml-auto flex shrink-0 gap-2 sm:ml-0">
          {out ? (
            <>
              <button onClick={() => askStockAlert(p)} className="min-h-[44px] px-3 border-[1.5px] border-white text-[14px] font-semibold">Báo khi có hàng</button>
              <button onClick={onBuy} className="min-h-[44px] px-3 bg-yellow text-[14px] font-semibold text-ink">Đặt trước</button>
            </>
          ) : (
            <button onClick={onAdd} className="min-h-[44px] px-4 bg-yellow text-[14px] font-semibold text-ink">Thêm vào giỏ</button>
          )}
        </div>
      </div>
    </div>
  );
}
