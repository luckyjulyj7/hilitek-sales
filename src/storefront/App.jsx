import React, { useEffect, useState } from "react";
import { useRoute, match } from "./router.js";
import { fetchCatalog } from "./lib/api.js";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import FloatingContact from "./components/FloatingContact.jsx";
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
import Contact from "./pages/Contact.jsx";

const EMPTY = { products: [], categories: [], brands: [] };

export default function App() {
  const route = useRoute();
  const [catalog, setCatalog] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCatalog()
      .then((c) => setCatalog({ ...EMPTY, ...c }))
      .catch((e) => setError(e.message || String(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!route.path.startsWith("/san-pham/")) window.scrollTo(0, 0);
  }, [route.path]);

  const productMatch = match("/san-pham/:slug", route.path);

  let page;
  if (productMatch) {
    page = <ProductDetail slug={productMatch.slug} navigate={route.navigate} catalog={catalog} />;
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
    <div className="min-h-full flex flex-col bg-paper text-ink">
      <Header route={route} navigate={route.navigate} />
      <main className="flex-1">
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
    </div>
  );
}
