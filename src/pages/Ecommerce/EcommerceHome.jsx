import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import EcomHeader from "../../components/EcomHeader";
import img1 from "../../assets/EcommerceHome-carousel/c1.webp";
import img2 from "../../assets/EcommerceHome-carousel/c1.webp";
import img3 from "../../assets/EcommerceHome-carousel/c1.webp";
import contact from "../../assets/contact.webp";
import ProductSlider from "../../components/EcommerceHomeSlider/ProductSlider";
import Footer from "../../components/Footer";
import { api } from "../../lib/api";
import { Helmet } from "react-helmet-async";

const Ecommerce = () => {
  const navigate = useNavigate();
  const images = [img1, img2, img3];
  const [current, setCurrent] = useState(0);

  const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;
  const canonicalUrl = `${SITE_URL}/ecommerce-home`;

  const pageTitle = "Prospect Ecommerce | Home";
  const pageDescription =
    "Shop trending products by category on Prospect Ecommerce. Browse categories, discover latest products, and order online.";

  // ✅ Admin categories
  const [categories, setCategories] = useState([]);

  // CATEGORY SLIDER STATES
  const [start, setStart] = useState(0);
  const visible = 5;

  const nextSlide = () => {
    if (!categories.length) return;
    setStart((prev) => (prev + 1) % categories.length);
  };

  const prevSlide = () => {
    if (!categories.length) return;
    setStart((prev) => (prev - 1 + categories.length) % categories.length);
  };

  const visibleCategories =
    categories.length > 0
      ? Array.from({ length: visible }).map(
          (_, i) => categories[(start + i) % categories.length]
        )
      : [];

  // ✅ Products from DB
  const [allProducts, setAllProducts] = useState([]);

  // Auto slide banner
  useEffect(() => {
    const slide = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(slide);
  }, []);

  const goToSlide = (index) => setCurrent(index);

  // ✅ Load categories (admin created)
  useEffect(() => {
    let mounted = true;

    const palette = [
      "#800040",
      "#004d4d",
      "#222c7a",
      "#001F54",
      "#7A0900",
      "#054C29",
      "#660000",
      "#005566",
    ];

    const loadCategories = async () => {
      try {
        const res = await api.get("/categories");
        const items = res?.data?.categories || [];

        const mapped = items.map((c, idx) => ({
          name: c.name,
          img: c.imageUrl,
          color: palette[idx % palette.length],
        }));

        if (!mounted) return;
        setCategories(mapped);
        setStart(0);
      } catch (e) {
        if (!mounted) return;
        setCategories([]);
        setStart(0);
      }
    };

    loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  // ✅ Load products
  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        const res = await api.get("/products");
        const products = res?.data?.products || [];
        if (!mounted) return;
        setAllProducts(products);
      } catch (e) {
        if (!mounted) return;
        setAllProducts([]);
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  // ✅ Map DB product -> ProductSlider format
  const mappedProducts = useMemo(() => {
    return (allProducts || []).map((p) => {
      const price = Number(p.price || 0);
      const offer = Number(p.offerPrice || 0);
      const oldPrice = price;
      const finalPrice = offer > 0 ? offer : price;

      return {
        id: p._id,
        title: p.name,
        description: p.description || "",
        img:
          (Array.isArray(p.images) && p.images[0]) ||
          "https://via.placeholder.com/300x300?text=Product",
        images: Array.isArray(p.images) ? p.images : [],
        oldPrice,
        price: finalPrice,
        save: Math.max(0, oldPrice - finalPrice),
        outOfStock: Boolean(p.outOfStock) || Number(p.quantity || 0) <= 0,
        category: (p.category || "").trim(),
        createdAt: p.createdAt,
        isTrending: !!p.isTrending,
      };
    });
  }, [allProducts]);

  // ✅ Trending
  const trendingProducts = useMemo(() => {
    return mappedProducts.filter((p) => p.isTrending === true);
  }, [mappedProducts]);

  // ✅ Exact category matching
  const normalize = (s) => String(s || "").trim().toLowerCase();

  const productsByCategory = useMemo(() => {
    const map = new Map();
    for (const p of mappedProducts) {
      const key = normalize(p.category);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(p);
    }
    return map;
  }, [mappedProducts]);

  const getProductsForCategory = (categoryName) => {
    return productsByCategory.get(normalize(categoryName)) || [];
  };

  // ✅ JSON-LD
  const jsonLd = useMemo(() => {
    const itemList = (trendingProducts || []).slice(0, 20).map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: p.title,
      url: `${SITE_URL}/product/${p.id}`,
    }));

    return [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: pageTitle,
        description: pageDescription,
        url: canonicalUrl,
      },
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Trending Products",
        itemListElement: itemList,
      },
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Prospect Ecommerce",
        url: SITE_URL,
      },
    ];
  }, [SITE_URL, canonicalUrl, pageTitle, pageDescription, trendingProducts]);

  return (
    <section className=" pt-36">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />

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

      <section className="max-w-7xl mx-auto px-4 mt-5 pb-20 text-left">
        {/* ---------- CAROUSEL ---------- */}
        <div className="relative w-full overflow-hidden rounded-2xl shadow-lg">
          <div
            className="flex transition-all duration-700"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt="banner"
                className="w-full h-[200px] sm:h-[300px] md:h-[350px] object-cover flex-shrink-0"
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>

          <div className="absolute bottom-4 w-full flex justify-center gap-3">
            {images.map((_, i) => (
              <div
                key={i}
                onClick={() => goToSlide(i)}
                className={`w-3 h-3 rounded-full cursor-pointer transition ${
                  current === i ? "bg-[#124734]" : "bg-gray-300"
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* ---------- CATEGORIES ---------- */}
        <div className="max-w-7xl mx-auto px-4 mt-10 mb-20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#2E2E2E]">
              Browse By Categories
            </h2>

            <div className="flex gap-3">
              <button
                onClick={prevSlide}
                className="w-10 h-10 flex items-center justify-center border rounded-full text-[#124734] text-2xl hover:bg-[#A7E1B2]"
                type="button"
                aria-label="Previous categories"
              >
                ←
              </button>

              <button
                onClick={nextSlide}
                className="w-10 h-10 flex items-center justify-center border rounded-full text-[#124734] text-2xl hover:bg-[#A7E1B2]"
                type="button"
                aria-label="Next categories"
              >
                →
              </button>
            </div>
          </div>

          {/* responsive grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {visibleCategories.map((cat, index) => (
              <div
                key={index}
                className="text-center cursor-pointer"
                onClick={() => navigate(`/shop?category=${cat.name}`)}
              >
                <div
                  className="mx-auto rounded-full flex items-center justify-center shadow-md
                  w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32"
                  style={{ backgroundColor: cat.color }}
                >
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <p className="mt-3 font-medium text-[#2E2E2E]">{cat.name}</p>
              </div>
            ))}
          </div>

          {/* View All */}
          <div className="flex justify-end mt-2">
            <button
              onClick={() => navigate("/categories")}
              className="text-[#124734] text-xl font-bold hover:underline"
              type="button"
            >
              View All
            </button>
          </div>
        </div>

        {/* ---------- PRODUCT SLIDERS ---------- */}
        <ProductSlider
          title="Trending Products"
          products={trendingProducts}
          navigate={navigate}
        />

        {categories.map((cat) => (
          <ProductSlider
            key={cat.name}
            title={`${cat.name} Products`}
            products={getProductsForCategory(cat.name)}
            navigate={navigate}
          />
        ))}

        {/* ---------- ASK QUESTIONS SECTION ---------- */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="bg-[#A7E1B2]/30 shadow-md rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between border">
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#124734] leading-snug">
                Ask Questions,{" "}
                <span className="text-gray-500">get help go beyond.</span>
              </h2>

              <p className="text-gray-600 mt-4 text-lg">
                Our experts can answer all your questions regarding Prospect
                Ecommerce Products.
              </p>

              <div className="mt-6">
                <p className="text-[#124734] font-semibold text-xl">Call us</p>
                <p className="text-[#124734] text-2xl font-bold mt-1 flex items-center gap-2">
                  📞 +91 9752812898
                </p>
              </div>
            </div>

            <div className="w-full md:w-1/2 flex justify-center mt-8 md:mt-0">
              <img
                src={contact}
                alt="Ask Questions"
                className="w-48 sm:w-60 md:w-80"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>

        {/* ---------- SUPPLIER BOX ---------- */}
        <div className="mt-10 mx-auto max-w-xl p-4 sm:p-6 rounded-2xl shadow-md border border-[#A7E1B2]/40 bg-white text-center">
          <h3 className="text-xl font-semibold text-[#124734] mb-2">
            Want to Sell Your Products?
          </h3>
          <p className="text-gray-600 mb-4">
            Join us as a supplier and grow your business with our platform.
          </p>

          <button
            onClick={() => {
              const accessToken = sessionStorage.getItem("accessToken");
              const user = JSON.parse(sessionStorage.getItem("user") || "null");

              if (!accessToken || !user) {
                return navigate("/login", { state: { from: "become-supplier" } });
              }

              if (user.role === "supplier") {
                return navigate("/supplier");
              }

              return navigate("/supplier/apply");
            }}
            className="px-7 py-3 bg-[#124734] text-white font-semibold rounded-xl shadow hover:bg-[#0f3928] transition"
            type="button"
          >
            Become a Supplier
          </button>
        </div>
      </section>

      <div className="pt-10">
        <Footer />
      </div>
    </section>
  );
};

export default Ecommerce;
