import React from "react";
import { useNavigate } from "react-router-dom";
import { FiShoppingCart, FiHeart } from "react-icons/fi";
import { FaShoppingCart, FaHeart } from "react-icons/fa";

import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

const ProductNoSlider = ({ products, columns = 3 }) => {
  const navigate = useNavigate();

  const { wishlist, toggleWishlist } = useWishlist();
  const { cart, addToCart } = useCart();

  return (
    <section className="px-6 pb-10 mt-0 pt-0 -mt-4">
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns} gap-8`}>
        {products.map((p) => (
          <div
            key={p.id}
            className="group relative border p-6 rounded-2xl shadow bg-[#A7E1B2]/30 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 h-[420px]"
          >
            {p.outOfStock && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs px-3 py-1 rounded">
                Out of Stock
              </span>
            )}

            <div className="relative">
              <img src={p.img} className="w-full h-56 object-contain mb-4" />

              {/* ⭐ FIXED – ICONS ALWAYS VISIBLE ON MOBILE */}
              <div className="absolute top-2 left-2 flex gap-2 
                opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">

                {/* CART BUTTON */}
                {!p.outOfStock && (
                  <button
                    onClick={() =>  
                      {const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) return navigate("/login");   // ✅ not logged in -> login page
                      const pid = String(p.id || p._id || "");
                    addToCart({ ...p, id: pid, quantity: 1 }, navigate);
                   }}
                    className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
                  >

                   {cart.some((item) => String(item.id) === String(p.id)) ? (
                      <FaShoppingCart size={20} className="text-green-600" />
                    ) : (
                      <FiShoppingCart size={20} className="text-[#124734]" />
                    )}

                  </button>
                )}

                {/* WISHLIST BUTTON */}
                <button
                  onClick={() => toggleWishlist(p,navigate)}
                  className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
                >
                  {wishlist.some((item) => item.id === p.id) ? (
                    <FaHeart size={20} className="text-green-500" />
                  ) : (
                    <FiHeart size={20} className="text-[#124734]" />
                  )}
                </button>

              </div>

              {/* ⭐ FIXED – VIEW DETAILS ALWAYS VISIBLE ON MOBILE */}
              <div className="absolute bottom-2 left-0 right-0 flex justify-center 
                opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                <button
                  onClick={() =>
                    navigate(`/product/${p.title.toLowerCase().replace(/ /g, "-")}`, {
                      state: p,
                    })
                  }
                  className="bg-[#27c060] text-white px-6 py-1 rounded-full text-sm shadow"
                >
                  View Details
                </button>
              </div>
            </div>

            {/* TITLE */}
            <p className="font-semibold text-center mt-3 text-lg">{p.title}</p>

            {/* STARS */}
            <div className="flex justify-center gap-1 text-yellow-500 my-2 text-xl">
              {"★".repeat(5)}
            </div>

            {/* PRICE */}
            <div className="text-center text-lg">
              <span className="line-through text-gray-400 text-sm">₹{p.oldPrice}</span>
              <span className="ml-2 font-bold text-[#124734]">₹{p.price}</span>
            </div>

            <p className="text-green-600 text-center text-sm font-semibold mt-1">
              Save – ₹{p.save}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductNoSlider;
