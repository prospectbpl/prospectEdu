import React, { useMemo, useState } from "react";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";


const ProductSlider = ({ title, products, navigate }) => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { cart, addToCart } = useCart();

  // ✅ SAFETY: always work with a clean array
  const safeProducts = useMemo(() => {
    return Array.isArray(products) ? products.filter(Boolean) : [];
  }, [products]);

  const [start, setStart] = useState(0);
  const visibleCount = 5;

  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // ✅ SAFETY: prevent modulo by 0
  const next = () => {
    if (safeProducts.length === 0) return;
    setStart((p) => (p + 1) % safeProducts.length);
  };

  const prev = () => {
    if (safeProducts.length === 0) return;
    setStart((p) => (p - 1 + safeProducts.length) % safeProducts.length);
  };

  // ✅ SAFETY: visibleItems never contains undefined
  const visibleItems =
    safeProducts.length === 0
      ? []
      : Array.from({ length: Math.min(visibleCount, safeProducts.length) }).map(
          (_, i) => safeProducts[(start + i) % safeProducts.length]
        );

  return (
    <div className="max-w-7xl mx-auto px-4 mt-16 mb-20">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-white shadow-xl px-6 py-2 rounded-full text-[#124734] border z-50">
          {toastMsg}
        </div>
      )}

      {/* Title */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-[#2E2E2E]">{title}</h2>

        <div className="flex gap-3">
          <button
            onClick={prev}
            disabled={safeProducts.length === 0}
            className="w-10 h-10 flex items-center justify-center border rounded-full text-[#124734] text-2xl hover:bg-[#A7E1B2] disabled:opacity-50"
          >
            ←
          </button>
          <button
            onClick={next}
            disabled={safeProducts.length === 0}
            className="w-10 h-10 flex items-center justify-center border rounded-full text-[#124734] text-2xl hover:bg-[#A7E1B2] disabled:opacity-50"
          >
            →
          </button>
        </div>
      </div>

      {/* ✅ EMPTY STATE (keeps UI safe) */}
      {safeProducts.length === 0 ? (
        <div className="border border-gray-200 rounded-xl p-6 bg-white text-gray-600">
          No products available.
        </div>
      ) : (
        <>
          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {visibleItems.map((p) => (
              <div
                key={p?.id}
                className="group relative border border-gray-300 rounded-xl p-3 shadow-md hover:shadow-xl transition bg-[#A7E1B2]"
              >
                {(p?.outOfStock ?? false) && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs px-4 py-1 rounded-md shadow">
                    Out of Stock
                  </div>
                )}

                <div className="relative mt-4">
                  <img
                    src={p?.img}
                    alt={p?.title}
                    className="w-full h-40 object-contain rounded-md"
                  />

                  {/* ⭐ FIXED HOVER ICONS (Now visible on mobile/tablet) */}
                  <div
                    className="absolute top-2 left-2 flex gap-2 
                    opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition"
                  >
                    {/* Cart */}
                    {!(p?.outOfStock ?? false) && (
                      <button
                        onClick={() => {
                          const accessToken = sessionStorage.getItem("accessToken");
                            if (!accessToken) return navigate("/login");   // ✅ not logged in -> login page
                          // ✅ optional: if already in cart, avoid duplicate
                         const pid = String(p.id || p._id || "");
                          const exists = cart.some((item) => String(item.id) === pid);
                          if (exists) return showToast("Already in Cart");

                          addToCart(
                            {
                              ...p,
                              id: pid,
                              quantity: 1,
                            },
                            navigate
                          );

                          showToast("Added to Cart");

                        }}
                        className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
                      >
                        {cart.some((item) => item.id === p.id) ? (
                          <FaShoppingCart size={18} className="text-green-600" />
                        ) : ( 
                          <FiShoppingCart size={18} className="text-[#124734]" />
                        )}
                      </button>
                    )}

                    {/* Wishlist */}
                    <button
                      onClick={() => toggleWishlist(p,navigate)}
                      className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
                    >
                      {wishlist.some((item) => item.id === p.id) ? (
                        <FaHeart size={18} className="text-green-600" />
                      ) : (
                        <FiHeart size={18} className="text-[#124734]" />
                      )}
                    </button>
                  </div>

                  {/* ⭐ FIXED VIEW DETAILS BUTTON */}
                  <div
                    className="absolute bottom-2 left-0 right-0 flex justify-center 
                    opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition"
                  >
                    <button
                      onClick={() =>
                        navigate(`/product/${p.title.toLowerCase().replace(/ /g, "-")}`, {
                          state: p,
                        })
                      }
                      className="bg-[#27c060] text-white px-5 py-1 rounded-full text-sm shadow"
                    >
                      View Details
                    </button>
                  </div>
                </div>

                {/* Title */}
                <p className="mt-4 text-sm font-medium text-[#222] text-center">
                  {p?.title}
                </p>

                {/* Stars */}
                <div className="flex justify-center gap-1 text-yellow-500 text-lg mt-1">
                  {"★".repeat(5)}
                </div>

                {/* Price */}
                <div className="flex justify-center gap-2 mt-2">
                  <span className="line-through text-gray-500 text-sm">
                    ₹{p?.oldPrice}
                  </span>
                  <span className="font-semibold text-[#124734]">₹{p?.price}</span>
                  <span className="text-green-600 text-sm font-semibold">
                    Save – ₹{p?.save}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* View All */}
          <div className="flex justify-end mt-2">
            <button
              onClick={() => navigate(`/products/${title.toLowerCase().replace(/ /g, "-")}`)}
              className="text-[#124734] text-xl font-bold hover:underline"
            >
              View All
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductSlider;
