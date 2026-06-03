import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { token } = useAuth(); // ✅ CORRECT PLACE

  // ✅ Load wishlist whenever token changes (login/logout)
  useEffect(() => {
    if (!token) {
      setWishlist([]);
      return;
    }

    const loadWishlist = async () => {
      try {
        const res = await api.get("/wishlist");
        const items = res?.data?.wishlist?.items || [];

        const mapped = items.map((it) => ({
          id: String(it.productId),
          title: it.title,
          img: it.img || "https://via.placeholder.com/300x300?text=Product",
          price: Number(it.price || 0),
          oldPrice: Number(it.oldPrice || 0),
          save: Number(it.save || 0),
          outOfStock: Boolean(it.outOfStock),
          images: it.img ? [it.img] : [],
        }));

        setWishlist(mapped);
      } catch (err) {
        console.error("Failed to load wishlist:", err);
        setWishlist([]);
      }
    };

    loadWishlist();
  }, [token]); // 🔥 THIS IS THE KEY FIX

  const toggleWishlist = async (product, navigate) => {
    if (!token) {
      navigate?.("/login");
      return;
    }

    const pid = String(product?.id || "");
    if (!pid) return;

    const exists = wishlist.some((item) => item.id === pid);

    try {
      if (exists) {
        await api.delete(`/wishlist/items/${pid}`);
        setWishlist((prev) => prev.filter((item) => item.id !== pid));
      } else {
        await api.post("/wishlist/items", { productId: pid });
        setWishlist((prev) => [...prev, { ...product, id: pid }]);
      }
    } catch (err) {
      console.error("Wishlist toggle failed:", err);
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, setWishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
