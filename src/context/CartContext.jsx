import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

const normalizeCartItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map((it) => ({
    id: String(it.productId?._id || it.productId || it._id || ""),
    title: it.title || it.productId?.name || "",
    img: it.img || it.productId?.images?.[0] || "",
    price: Number(it.price || it.productId?.offerPrice || it.productId?.price || 0),
    oldPrice: Number(it.oldPrice || it.productId?.price || 0),
    quantity: Number(it.quantity || 1),
  }));
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { token } = useAuth(); // if your AuthContext provides token

  // ✅ always read fresh token
  const getAccessToken = () => token || sessionStorage.getItem("accessToken") || "";

  const authConfig = () => {
    const t = getAccessToken();
    if (!t) return null;
    return { headers: { Authorization: `Bearer ${t}` } };
  };

  const loadCart = async () => {
    const cfg = authConfig();
    if (!cfg) {
      setCart([]);
      return;
    }
    try {
      const res = await api.get("/cart", cfg);
      setCart(normalizeCartItems(res?.data?.cart?.items || []));
    } catch (e) {
      setCart([]);
    }
  };

  // ✅ load on mount + whenever token changes
  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const addToCart = async (product) => {
    const cfg = authConfig();
    if (!cfg) return;

    const pid = String(product?.id || product?._id || "");
    if (!pid) return;

    const exists = cart.some((item) => String(item.id) === pid);
    if (exists) return;

    try {
      const res = await api.post(
        "/cart/items",
        { productId: pid, quantity: Number(product.quantity || 1) },
        cfg
      );
      setCart(normalizeCartItems(res?.data?.cart?.items || []));
    } catch (e) {
      await loadCart();
    }
  };

  const increaseQty = async (id) => {
    const cfg = authConfig();
    if (!cfg) return;

    const pid = String(id || "");
    const item = cart.find((x) => String(x.id) === pid);
    if (!item) return;

    const nextQty = Math.min(5, item.quantity + 1);

    const res = await api.patch(`/cart/items/${pid}`, { quantity: nextQty }, cfg);
    setCart(normalizeCartItems(res?.data?.cart?.items || []));
  };

  const decreaseQty = async (id) => {
    const cfg = authConfig();
    if (!cfg) return;

    const pid = String(id || "");
    const item = cart.find((x) => String(x.id) === pid);
    if (!item) return;

    const nextQty = Math.max(1, item.quantity - 1);

    const res = await api.patch(`/cart/items/${pid}`, { quantity: nextQty }, cfg);
    setCart(normalizeCartItems(res?.data?.cart?.items || []));
  };

  const removeFromCart = async (id) => {
    const cfg = authConfig();
    if (!cfg) return;

    const pid = String(id || "");
    const res = await api.delete(`/cart/items/${pid}`, cfg);
    setCart(normalizeCartItems(res?.data?.cart?.items || []));
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, decreaseQty, increaseQty, loadCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
