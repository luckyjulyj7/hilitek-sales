import React, { useEffect, useState } from "react";
import { useRoute, match } from "./router.js";
import { fetchCatalog, fetchWebConfig } from "./lib/api.js";
import { applyWebConfig } from "./lib/applyWebConfig.js";
import { PAGES } from "./config.js";
import { CatalogCtx } from "./catalogContext.js";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import FloatingContact from "./components/FloatingContact.jsx";
import BottomNav from "./components/BottomNav.jsx";
import OrderConfirmModal from "./components/OrderConfirmModal.jsx";
import Home from "./pages/Home.jsx";
import Catalog from "./pages/Catalog.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Warranty from "./pages/Warranty.jsx";
import OrderLookup from "./pages/OrderLookup.jsx";
import BuildPC from "./pages/BuildPC.jsx";
import Policy from "./pages/Policy.jsx";
import PolicyPage from "./pages/PolicyPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import Contact from "./pages/Contact.jsx";

const EMPTY = { products: [], categories: [], brands: [] };

export default function App() {
  const route = useRoute();
  const [catalog, setCatalog] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [cfgTick, setCfgTick] = useState(0); // bump để ép render lại khi cấu hình web đổi

  // Đóng menu danh mục (drawer trái) mỗi khi chuyển trang.
  useEffect(() => { setDrawer(false); }, [route.path]);

  useEffect(() => {
    fetchCatalog()
      .then((c) => setCatalog({ ...EMPTY, ...c }))
      .catch((e) => setError(e.message || String(e)))
      .finally(() => setLoading(false));
  }, []);

  // Tự đồng bộ với app quản lý mỗi 60s: sản phẩm/giá + cấu hình web (menu, flash sale,
  // poster, mã giảm giá…). Chủ shop sửa bên quản lý → web khách tự cập nhật, không cần F5.
  useEffect(() => {
    const REFRESH_MS = 60000;
    let stopped = false;
    const iv = setInterval(async () => {
      if (document.hidden) return;
      try {
        const [cat, cfg] = await Promise.all([fetchCatalog(), fetchWebConfig()]);
        if (stopped) return;
        setCatalog({ ...EMPTY, ...cat });
        if (cfg && typeof cfg === "object") { applyWebConfig(cfg); setCfgTick((n) => n + 1); }
      } catch { /* mạng chập chờn — thử lại lần sau */ }
    }, REFRESH_MS);
    return () => { stopped = true; clearInterval(iv); };
  }, []);

  useEffect(() => {
    if (!route.path.startsWith("/san-pham/")) window.scrollTo(0, 0);
  }, [route.path]);

  const productMatch = match("/san-pham/:slug", route.path);
  const landingMatch = match("/trang/:slug", route.path);

  let page;
  if (productMatch) {
    page = <ProductDetail slug={productMatch.slug} navigate={route.navigate} catalog={catalog} />;
  } else if (landingMatch) {
    page = <LandingPage slug={landingMatch.slug} navigate={route.navigate} />;
  } else if (route.path === "/danh-muc") {
    page = <Catalog catalog={catalog} route={route} navigate={route.navigate} />;
  } else if (route.path === "/gio-hang") {
    page = <Cart navigate={route.navigate} />;
  } else if (route.path === "/dat-hang") {
    page = <Checkout navigate={route.navigate} />;
  } else if (route.path === "/bao-hanh") {
    page = <Warranty />;
  } else if (route.path === "/tra-cuu-don-hang") {
    page = <OrderLookup />;
  } else if (route.path === "/xay-dung-cau-hinh") {
    page = <BuildPC />;
  } else if (route.path === "/huong-dan-thanh-toan") {
    page = <PolicyPage pageKey="huong-dan-thanh-toan" />;
  } else if (route.path === "/chinh-sach-giao-hang") {
    page = <PolicyPage pageKey="chinh-sach-giao-hang" />;
  } else if (route.path === "/chinh-sach-bao-hanh") {
    page = <PolicyPage pageKey="chinh-sach-bao-hanh" />;
  } else if (route.path.startsWith("/") && PAGES[route.path.slice(1)]) {
    // Mọi trang chính sách khác trong PAGES (config.js) tự map route theo key — không cần khai từng cái.
    page = <PolicyPage pageKey={route.path.slice(1)} />;
  } else if (route.path === "/chinh-sach") {
    page = <Policy />;
  } else if (route.path === "/lien-he") {
    page = <Contact />;
  } else if (route.path === "/") {
    page = <Home catalog={catalog} navigate={route.navigate} />;
  } else {
    page = (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center font-sans">
        <h1 className="font-display text-3xl font-bold text-ink">Không tìm thấy trang</h1>
        <button onClick={() => route.navigate("/")} className="mt-4 text-navy font-semibold">Về trang chủ</button>
      </div>
    );
  }

  return (
    <CatalogCtx.Provider value={catalog}>
    <div className="min-h-full flex flex-col bg-paper text-ink" data-cfg={cfgTick}>
      <Header route={route} navigate={route.navigate} drawer={drawer} setDrawer={setDrawer} />
      <main className="flex-1 pb-[calc(env(safe-area-inset-bottom)+56px)] lg:pb-0">
        {error ? (
          <div className="mx-auto max-w-3xl px-4 py-20 text-center text-navy font-sans">
            Không tải được dữ liệu: {error}
          </div>
        ) : loading ? (
          <div className="mx-auto max-w-3xl px-4 py-20 text-center text-mute font-sans">Đang tải…</div>
        ) : (
          page
        )}
      </main>
      <Footer navigate={route.navigate} />
      <FloatingContact />
      <BottomNav route={route} navigate={route.navigate} onOpenCategories={() => setDrawer(true)} />
      <OrderConfirmModal navigate={route.navigate} />
    </div>
    </CatalogCtx.Provider>
  );
}
