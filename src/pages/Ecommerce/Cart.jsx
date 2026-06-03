import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import EcomHeader from "../../components/EcomHeader";
import { useCart } from "../../context/CartContext";
import Footer from "../../components/Footer";

const Cart = () => {
  const navigate = useNavigate();
  const { cart, decreaseQty, removeFromCart, increaseQty } = useCart();

  const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;
  const canonicalUrl = `${SITE_URL}/cart`;

  const pageTitle = "My Cart | Prospect Ecommerce";
  const pageDescription =
    "View items in your cart on Prospect Ecommerce. Update quantities, check discounts, and proceed to checkout securely.";

  const totalMRP = cart.reduce((sum, p) => sum + p.oldPrice * p.quantity, 0);
  const totalPrice = cart.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const discount = totalMRP - totalPrice;
  const tax = (totalPrice * 0.0).toFixed(2);
  const shipping = totalPrice < 1000 ? 99 : 0;
  const grandTotal = (totalPrice + shipping).toFixed(2);

  // ✅ Optional JSON-LD for internal UX (still noindex)
  const jsonLd = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
    };
  }, [pageTitle, pageDescription, canonicalUrl]);

  return (
    <section className=" pt-36">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* ✅ Private page - do not index */}
        <meta name="robots" content="noindex, nofollow" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />

        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <EcomHeader />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 font-[Open_Sans] pb-20 text-left">
        {/* Breadcrumb */}
        <p className="text-gray-600 text-sm md:text-md mb-5">
          <span
            className="cursor-pointer text-[#124734] hover:underline"
            onClick={() => navigate("/ecommerce-home")}
          >
            Home
          </span>{" "}
          &gt; My Cart
        </p>

        <h1 className="text-3xl font-bold mb-8 text-[#124734]">My Cart</h1>

        {/* Empty Cart */}
        {cart.length === 0 && (
          <div className="flex flex-col items-center justify-center w-full min-h-[50vh] pt-10 px-4 text-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/16379/16379166.png"
              alt="Empty Cart"
              className="w-32 md:w-40 opacity-90"
              loading="lazy"
              decoding="async"
            />

            <p className="text-gray-600 text-base md:text-lg mt-2">
              Your cart is empty.
            </p>

            <p className="text-gray-500 text-sm md:text-md">
              Start adding items to enjoy shopping!
            </p>

            <button
              onClick={() => navigate("/shop")}
              className="mt-6 px-6 md:px-8 py-3 bg-[#124734] text-white rounded-lg shadow hover:bg-[#0f3c2b]"
              type="button"
            >
              Start Shopping
            </button>
          </div>
        )}

        {/* CART CONTENT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
          {/* LEFT SIDE */}
          <div className="md:col-span-2 space-y-6">
            {cart.length > 0 && (
              <>
                <div className="hidden md:grid grid-cols-4 font-semibold text-[#124734] border-b pb-3 mb-4">
                  <p>Product</p>
                  <p>Price</p>
                  <p>Quantity</p>
                  <p>Subtotal</p>
                </div>
              </>
            )}

            {/* Cart Items */}
            {cart.length > 0 &&
              cart.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-2xl p-4 md:p-6 bg-[#A7E1B2]/20 shadow-md"
                >
                  {/* MOBILE LAYOUT */}
                  <div className="block md:hidden space-y-4">
                    {/* Image + remove */}
                    <div className="flex gap-4">
                      <div className="relative">
                        <img
                          src={item.img}
                          className="w-24 h-28 object-contain rounded-lg cursor-pointer"
                          loading="lazy"
                          decoding="async"
                          alt={item.title}
                          onClick={() =>
                            navigate(
                              `/product/${item.title.toLowerCase().replace(/ /g, "-")}`,
                              { state: item }
                            )
                          }
                        />

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="absolute -top-2 -right-2 bg-gray-300 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs"
                          type="button"
                          aria-label="Remove from cart"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="flex flex-col justify-center">
                        <p
                          className="font-semibold text-lg leading-tight cursor-pointer"
                          onClick={() =>
                            navigate(
                              `/product/${item.title.toLowerCase().replace(/ /g, "-")}`,
                              { state: item }
                            )
                          }
                        >
                          {item.title}
                        </p>

                        <p className="font-bold text-[#124734] mt-1">₹{item.price}</p>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Quantity</span>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => decreaseQty(item.id)}
                          className="px-3 py-1 bg-gray-200 rounded"
                          type="button"
                          aria-label="Decrease quantity"
                        >
                          –
                        </button>

                        <span className="text-lg">{item.quantity}</span>

                        <button
                          onClick={() => increaseQty(item.id)}
                          className="px-3 py-1 bg-gray-200 rounded"
                          type="button"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="flex justify-between font-semibold text-[#124734]">
                      <span>Subtotal</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  </div>

                  {/* DESKTOP LAYOUT */}
                  <div className="hidden md:grid grid-cols-4 items-center">
                    {/* PRODUCT COLUMN */}
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <img
                          src={item.img}
                          className="w-24 h-28 object-contain rounded-lg cursor-pointer"
                          loading="lazy"
                          decoding="async"
                          alt={item.title}
                          onClick={() =>
                            navigate(
                              `/product/${item.title.toLowerCase().replace(/ /g, "-")}`,
                              { state: item }
                            )
                          }
                        />

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="absolute -top-2 -right-2 bg-gray-300 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs"
                          type="button"
                          aria-label="Remove from cart"
                        >
                          ✕
                        </button>
                      </div>

                      <p
                        className="font-semibold text-[20px] mt-8 leading-tight cursor-pointer"
                        onClick={() =>
                          navigate(
                            `/product/${item.title.toLowerCase().replace(/ /g, "-")}`,
                            { state: item }
                          )
                        }
                      >
                        {item.title}
                      </p>
                    </div>

                    {/* PRICE */}
                    <p className="font-bold text-[#124734] text-lg">
                      ₹{item.price.toLocaleString()}
                    </p>

                    {/* QUANTITY */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => decreaseQty(item.id)}
                        className="px-3 py-1 bg-gray-200 rounded"
                        type="button"
                        aria-label="Decrease quantity"
                      >
                        –
                      </button>

                      <span className="text-lg">{item.quantity}</span>

                      <button
                        onClick={() => increaseQty(item.id)}
                        className="px-3 py-1 bg-gray-200 rounded"
                        type="button"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* SUBTOTAL */}
                    <p className="font-bold text-[#124734] text-xl">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}

            {/* BOTTOM BUTTON */}
            {cart.length > 0 && (
              <div className="flex justify-between items-center mt-8">
                <button
                  onClick={() => navigate("/shop")}
                  className="px-6 py-2 border border-black text-black rounded-full hover:bg-[#124734] hover:text-white transition"
                  type="button"
                >
                  Back to Store
                </button>
              </div>
            )}
          </div>

          {/* RIGHT SUMMARY */}
          {cart.length > 0 && (
            <div className="p-6 border rounded-xl shadow bg-[#A7E1B2] h-fit">
              <p className="flex justify-between text-lg mb-3">
                <span>Total MRP</span> <span>₹{totalMRP}</span>
              </p>

              <p className="flex justify-between text-lg mb-3">
                <span>Discount on MRP</span>{" "}
                <span className="text-green-600">-₹{discount}</span>
              </p>

              <p className="flex justify-between text-lg mb-3">
                <span>Tax</span> <span>₹{tax}</span>
              </p>

              <p className="flex justify-between text-lg mb-4">
                <span>Shipping Charges*</span>
                {shipping === 0 ? (
                  <span className="text-green-700">Free</span>
                ) : (
                  <span className="text-green-600">₹99</span>
                )}
              </p>

              <hr />

              <p className="flex justify-between text-xl font-bold mt-4">
                <span>Total Amount</span> <span>₹{grandTotal}</span>
              </p>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full mt-6 py-3 bg-[#124734] text-white rounded-lg text-lg"
                type="button"
              >
                Proceed To Checkout
              </button>

              <span className="text-sm mt-2 block">
                * Free delivery on order above ₹1000
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="pt-10">
        <Footer />
      </div>
    </section>
  );
};

export default Cart;
