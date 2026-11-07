import React, { useEffect, useState } from "react";
import { fetchProduct } from "../lib/api.js";
import { isGameProduct } from "../config.js";
import ProductDetail from "./ProductDetail.jsx";
import GameProduct from "./GameProduct.jsx";

/** Máy chơi game mở trang bán tối riêng, sản phẩm khác giữ trang sản phẩm thường. */
export default function ProductRoute({ slug, navigate, catalog }) {
  const [p, setP] = useState(undefined);
  useEffect(() => {
    let alive = true;
    fetchProduct(slug).then((x) => { if (alive) setP(x); }).catch(() => { if (alive) setP(null); });
    return () => { alive = false; };
  }, [slug]);

  const hint = (catalog.products || []).find((x) => x.slug === slug);
  if (p && isGameProduct(p)) {
    return <GameProduct key={p.variantGroupId || p.id} p={p} navigate={navigate} catalog={catalog} />;
  }
  // Chưa tải xong mà danh sách báo là máy game thì chờ, tránh chớp trang sáng.
  if (p === undefined && hint && isGameProduct(hint)) return <div className="min-h-[70vh] bg-[#07091A]" />;
  return <ProductDetail slug={slug} navigate={navigate} catalog={catalog} />;
}
