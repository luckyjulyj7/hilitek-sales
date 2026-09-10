import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { playAddToCart } from "./lib/sound.js";

/**
 * Giỏ hàng — lưu ở localStorage của trình duyệt khách (mỗi máy một giỏ, không
 * đồng bộ, không cần đăng nhập). Khi làm API đặt hàng, `checkout()` sẽ POST
 * `items` + thông tin khách lên `/api/web/orders`.
 */

const KEY = "hilitek-store:cart-v1";
const CartCtx = createContext(null);

function read() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
function write(items) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* bỏ qua khi localStorage bị chặn */
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(read);
  // Tăng mỗi lần thêm hàng — Header lắng nghe để rung nút giỏ + kêu "ting".
  const [bump, setBump] = useState(0);
  // Sản phẩm đang hiện trong popup xác nhận "Đặt hàng" (null = đóng).
  const [orderItem, setOrderItem] = useState(null);

  useEffect(() => write(items), [items]);

  const api = useMemo(() => {
    const add = (product, qty = 1, opts = {}) => {
      const preorder = !!opts.preorder;
      if (!opts.silent) {
        setBump((n) => n + 1);
        playAddToCart();
      }
      setItems((cur) => {
        const i = cur.findIndex((x) => x.id === product.id);
        if (i >= 0) {
          const next = [...cur];
          next[i] = {
            ...next[i],
            qty: Math.min(99, next[i].qty + qty),
            preorder: next[i].preorder || preorder,
          };
          return next;
        }
        return [
          ...cur,
          {
            id: product.id,
            slug: product.slug,
            name: product.name,
            sku: product.sku,
            price: product.price,
            listPrice: product.listPrice,
            brand: product.brand,
            specChips: (product.specChips || []).slice(0, 3),
            qty: Math.max(1, qty),
            preorder,
          },
        ];
      });
    };
    const setQty = (id, qty) =>
      setItems((cur) =>
        cur
          .map((x) => (x.id === id ? { ...x, qty: Math.max(0, Math.min(99, Math.floor(qty) || 0)) } : x))
          .filter((x) => x.qty > 0)
      );
    // Tăng/giảm số lượng theo bước (giữ tối thiểu 1) — dùng cho popup "Đặt hàng".
    const changeQty = (id, delta) =>
      setItems((cur) =>
        cur.map((x) => (x.id === id ? { ...x, qty: Math.max(1, Math.min(99, x.qty + delta)) } : x))
      );
    const remove = (id) => setItems((cur) => cur.filter((x) => x.id !== id));
    const clear = () => setItems([]);
    // Popup xác nhận đặt hàng — mở kèm sản phẩm, đóng = null.
    const openOrder = (product) => setOrderItem(product || null);
    const closeOrder = () => setOrderItem(null);
    return { add, setQty, changeQty, remove, clear, openOrder, closeOrder };
  }, []);

  const count = items.reduce((s, x) => s + x.qty, 0);
  const subtotal = items.reduce((s, x) => s + x.qty * x.price, 0);

  return (
    <CartCtx.Provider value={{ items, count, subtotal, bump, orderItem, ...api }}>{children}</CartCtx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart phải nằm trong <CartProvider>");
  return ctx;
}
