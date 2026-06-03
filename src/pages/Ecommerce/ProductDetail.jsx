import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import EcomHeader from "../../components/EcomHeader";
import { FaFacebookF } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaWhatsapp } from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import Footer from "../../components/Footer";
import { api } from "../../lib/api"; // ✅ NEW (needed for notify api)

const ProductDetail = () => {
  const navigate = useNavigate();

  const currentUrl =
    typeof window !== "undefined" ? window.location.href : "";
  const canonicalUrl =
    typeof window !== "undefined" ? window.location.href.split("?")[0] : "";

  const { addToCart, cart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  const { state: product } = useLocation();

  React.useEffect(() => {
    const first = product?.images?.[0] || product?.img;
    setThumbnail(first);
  }, [product]);

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        currentUrl
      )}`,
      "_blank"
    );
  };

  const shareWhatsApp = () => {
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(currentUrl)}`,
      "_blank"
    );
  };

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        currentUrl
      )}&text=${encodeURIComponent(product.title)}`,
      "_blank"
    );
  };

  const [thumbnail, setThumbnail] = React.useState(product?.img);
  const [quantity, setQuantity] = React.useState(1);

  const [toast, setToast] = React.useState("");
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  if (!product) {
    return (
      <div className="pt-36 px-6 text-xl text-red-600">
        No product data found.
      </div>
    );
  }

  const images =
    product?.images && product.images.length > 0 ? product.images : [product.img];

  // ✅ NEW: Notify handler (no layout changes)
  const handleNotifyMe = async () => {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) return navigate("/login");

    try {
      const pid = String(product.id || product._id || "");
      if (!pid) return showToast("Product id missing");

      await api.post(`/products/${pid}/notify`);
      showToast("✅ You will be notified when the product is back in stock");
    } catch (e) {
      showToast(
        e?.response?.data?.message || "Failed to subscribe for notification"
      );
    }
  };

  // ✅ SEO: JSON-LD (Product + Breadcrumb)
  const productName = product?.title || "Product";
  const productDesc =
    (product?.description || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160) || `Buy ${productName} on ProspectEdu.`;

  const productImage = thumbnail || images?.[0] || product?.img || "";

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productName,
    description: product?.description || productDesc,
    image: images?.filter(Boolean) || (productImage ? [productImage] : []),
    category: product?.category || undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: String(product?.price ?? ""),
      availability: product?.outOfStock
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      url: canonicalUrl || currentUrl,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item:
          typeof window !== "undefined"
            ? `${window.location.origin}/ecommerce-home`
            : "/ecommerce-home",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: productName,
        item: canonicalUrl || currentUrl,
      },
    ],
  };

  return (
    <section className="pt-36">
      <Helmet>
        <title>{productName} | ProspectEdu Store</title>
        <meta name="description" content={productDesc} />
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}

        {/* Open Graph */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${productName} | ProspectEdu Store`} />
        <meta property="og:description" content={productDesc} />
        {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
        {productImage ? <meta property="og:image" content={productImage} /> : null}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${productName} | ProspectEdu Store`} />
        <meta name="twitter:description" content={productDesc} />
        {productImage ? <meta name="twitter:image" content={productImage} /> : null}

        <script type="application/ld+json">{JSON.stringify(productJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-white shadow-xl px-6 py-2 rounded-full text-[#124734] border z-[9999]">
          {toast}
        </div>
      )}

      <EcomHeader />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 pb-20 text-left">
        {/* Breadcrumb */}
        <p className="text-gray-600 mb-3 sm:mb-5 text-sm sm:text-base">
          <span
            className="cursor-pointer text-[#124734] hover:underline"
            onClick={() => navigate("/ecommerce-home")}
          >
            Home
          </span>{" "}
          &gt; {product.title}
        </p>

        <div className="flex flex-col md:flex-row gap-10 sm:gap-16 mt-4">
          {/* LEFT IMAGE SECTION */}
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Thumbnails */}
            <div className="flex sm:flex-col gap-3 order-2 sm:order-1 justify-center">
              {images.map((image, index) => (
                <div
                  key={index}
                  onClick={() => setThumbnail(image)}
                  className="border w-20 h-20 sm:w-24 sm:h-24 border-gray-300 rounded cursor-pointer"
                >
                  <img
                    src={image}
                    className="w-full h-full object-contain"
                    alt={`${productName} thumbnail ${index + 1}`}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ))}
            </div>

            {/* Main Image */}
            <div className="order-1 sm:order-2 border border-gray-300 w-full sm:w-80 md:w-96 rounded overflow-hidden mx-auto">
              <img
                src={thumbnail}
                className="w-full h-full object-contain"
                alt={`${productName} image`}
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>

          {/* RIGHT DETAILS */}
          <div className="w-full md:w-1/2">
            {/* Title + Heart */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl sm:text-3xl font-bold">{product.title}</h1>

              <button
                onClick={() => toggleWishlist(product, navigate)}
                className="p-2 rounded-full bg-[#A7E1B2]/40 hover:bg-[#A7E1B2] transition"
                aria-label={
                  wishlist.some((item) => item.id === product.id)
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
              >
                {wishlist.some((item) => item.id === product.id) ? (
                  <FaHeart className="text-[#124734] text-2xl" />
                ) : (
                  <FiHeart className="text-[#124734] text-2xl" />
                )}
              </button>
            </div>

            {/* Description */}
            <p className="text-gray-700 mt-2 text-sm sm:text-base">
              {product.description}
            </p>

            {/* Rating + Stock */}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <div className="flex items-center gap-1 text-yellow-500 text-lg">
                {"★".repeat(5)}
              </div>
              <p>(5)</p>

              {product.outOfStock ? (
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                  ✖ Out of stock
                </span>
              ) : (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  ✔ In stock
                </span>
              )}
            </div>

            {/* Price */}
            <div className="mt-6">
              <p className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                ₹{product.price}.00
                <span className="text-gray-400 line-through text-lg sm:text-xl">
                  ₹{product.oldPrice}.00
                </span>
              </p>

              <p className="text-gray-600 mt-2 text-sm sm:text-md">
                Inclusive of all taxes (Includes applicable duties)
              </p>
            </div>

            {/* Quantity */}
            <div className="mt-6 flex items-center gap-4">
              <p className="text-base sm:text-lg font-semibold">Quantity:</p>

              <input
                type="number"
                min="1"
                max="5"
                value={quantity}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "") return setQuantity("");
                  const n = Number(v);
                  if (n >= 1 && n <= 5) setQuantity(n);
                }}
                disabled={product.outOfStock}
                className={`w-20 px-3 py-2 rounded-lg border ${
                  product.outOfStock
                    ? "bg-gray-100 text-red-500 cursor-not-allowed"
                    : "bg-white border-[#124734]"
                }`}
                aria-label="Quantity"
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              {product.outOfStock ? (
                <button
                  onClick={handleNotifyMe} // ✅ changed only logic
                  className="w-full py-3 bg-red-200 text-red-700 rounded hover:bg-red-300"
                >
                  Notify Me 🔔
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      const accessToken = sessionStorage.getItem("accessToken");
                      if (!accessToken) return navigate("/login");

                      const pid = String(product.id || product._id || "");
                      const exists = cart.some((item) => String(item.id) === pid);

                      if (exists) return showToast("❗ Already in cart");

                      addToCart(
                        {
                          id: pid,
                          title: product.title || product.name || "",
                          img:
                            product.img ||
                            (product.images && product.images[0]) ||
                            "",
                          images: product.images || [],
                          price: product.price,
                          oldPrice: product.oldPrice,
                          outOfStock: product.outOfStock,
                          category: product.category,
                          description: product.description,
                          quantity,
                        },
                        navigate
                      );

                      showToast("✅ Added to cart");
                    }}
                    className="w-full py-3 bg-[#A7E1B2] text-gray-800 rounded hover:bg-gray-300"
                  >
                    Add to Cart
                  </button>

                  <button
                    onClick={() =>
                      navigate("/checkout", {
                        state: { product: { ...product, quantity } },
                      })
                    }
                    className="w-full py-3 bg-[#124734] text-white rounded hover:bg-[#124734]/90"
                  >
                    Buy Now
                  </button>
                </>
              )}
            </div>

            {/* Extra Info */}
            <div className="mt-8 space-y-3 text-sm sm:text-base">
              <p className="flex items-center gap-3 text-gray-700">
                <span className="text-xl">🏷️</span>
                Total price includes all taxes
              </p>

              <p className="flex items-center gap-3 text-gray-700">
                <span className="text-xl">🚚</span>
                Free shipping on orders above ₹1000
              </p>

              {/* Share */}
              <div className="flex items-center gap-4 mt-5">
                <span className="font-semibold">Share:</span>

                <button
                  onClick={shareFacebook}
                  className="w-10 h-10 flex items-center justify-center rounded-md bg-[#A7E1B2]"
                  aria-label="Share on Facebook"
                >
                  <FaFacebookF className="text-indigo-700" />
                </button>

                <button
                  onClick={shareTwitter}
                  className="w-10 h-10 flex items-center justify-center rounded-md bg-[#A7E1B2]"
                  aria-label="Share on Twitter"
                >
                  <FaXTwitter className="text-black" />
                </button>

                <button
                  onClick={shareWhatsApp}
                  className="w-10 h-10 flex items-center justify-center rounded-md bg-[#A7E1B2]"
                  aria-label="Share on WhatsApp"
                >
                  <FaWhatsapp className="text-green-600 text-xl" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-10">
        <Footer />
      </div>
    </section>
  );
};

export default ProductDetail;
