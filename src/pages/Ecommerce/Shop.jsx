import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import EcomHeader from "../../components/EcomHeader";
import ProductNoSlider from "../../components/EcommerceHomeSlider/ProductNoSlider";
import Footer from "../../components/Footer";
import { api } from "../../lib/api";

const Shop = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const initialCategory = urlParams.get("category");

  const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;
  const canonicalUrl = `${SITE_URL}/shop${initialCategory ? `?category=${encodeURIComponent(initialCategory)}` : ""}`;

  const pageTitle = initialCategory
    ? `${initialCategory} Products | Shop | Prospect Ecommerce`
    : "Shop All Products | Prospect Ecommerce";

  const pageDescription = initialCategory
    ? `Browse ${initialCategory} products on Prospect Ecommerce. Filter by category, price and sort easily.`
    : "Browse all products on Prospect Ecommerce. Filter by category, price and sort easily.";

  // ✅ same as backend predefined + Other
  const [categories, setCategories] = useState(["Other"]);

  const [selectedCategories, setSelectedCategories] = useState(
    initialCategory ? [initialCategory] : []
  );

  const [priceRange, setPriceRange] = useState([1, 5000]);
  const [sortOption, setSortOption] = useState("Latest");

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/categories");
        const items = res?.data?.categories || [];
        const names = items.map((c) => c.name);

        if (!mounted) return;
        setCategories([...names, "Other"]);
      } catch {
        if (mounted) setCategories(["Other"]);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/products");

        const products = (res?.data?.products || []).map((p) => {
          const price = Number(p.price || 0);
          const offer = Number(p.offerPrice || 0);

          const oldPrice = price;
          const finalPrice = offer > 0 ? offer : price;

          return {
            id: p._id,
            title: p.name,
            img:
              (p.images && p.images[0]) ||
              "https://via.placeholder.com/300x300?text=Product",
            images: Array.isArray(p.images) ? p.images : [],
            oldPrice: oldPrice,
            price: finalPrice,
            save: Math.max(0, oldPrice - finalPrice),
            outOfStock: Boolean(p.outOfStock) || Number(p.quantity || 0) <= 0,
            category: (p.category || "").trim(),
            customCategory: p.customCategory || "",
            description: p.description || "",
          };
        });

        if (mounted) setAllProducts(products);
      } catch (e) {
        console.error("Failed to load products:", e);
        if (mounted) setAllProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const toggleCategory = (cat) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const filtered = useMemo(() => {
    let list = allProducts.filter((p) => {
      const matchCategory =
        selectedCategories.length === 0 ||
        selectedCategories.some(
          (cat) => (p.category || "").toLowerCase() === cat.toLowerCase()
        );

      const matchPrice = Number(p.price || 0) <= priceRange[1];
      return matchCategory && matchPrice;
    });

    if (sortOption === "HighToLow") {
      list = [...list].sort((a, b) => b.price - a.price);
    }
    if (sortOption === "LowToHigh") {
      list = [...list].sort((a, b) => a.price - b.price);
    }

    return list;
  }, [allProducts, selectedCategories, priceRange, sortOption]);

  const jsonLd = useMemo(() => {
    const items = (filtered || []).slice(0, 50).map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: p.title,
      url: `${SITE_URL}/product/${p.id}`,
    }));

    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: items,
      },
    };
  }, [filtered, SITE_URL, pageTitle, pageDescription, canonicalUrl]);

  return (
    <section className="pt-36">
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 text-left pb-20">
        <p className="text-gray-600 text-sm sm:text-md mb-4 sm:mb-5">
          <span
            className="cursor-pointer text-[#124734] hover:underline"
            onClick={() => navigate("/ecommerce-home")}
          >
            Home
          </span>{" "}
          &gt; Shop
        </p>

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#124734]">
            All Products
          </h1>

          <select
            className="border px-3 py-2 rounded-lg w-full sm:w-auto"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="Latest">Latest</option>
            <option value="HighToLow">Price: High to Low</option>
            <option value="LowToHigh">Price: Low to High</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border rounded-xl p-4 sm:p-6 shadow bg-[#A7E1B2] h-fit md:sticky md:top-36">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Category</h2>

            <div className="space-y-2">
              {categories.map((cat) => (
                <label key={cat} className="flex gap-2 items-center text-sm sm:text-base">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    className="accent-[#124734]"
                  />
                  {cat}
                </label>
              ))}
            </div>

            <h2 className="text-lg sm:text-xl font-bold mt-6 mb-2">Price</h2>

            <input
              type="range"
              min="1"
              max="5000"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([1, Number(e.target.value)])}
              className="w-full accent-[#124734]"
            />

            <p className="mt-2 font-semibold text-sm sm:text-base">
              ₹1 – ₹{priceRange[1]}
            </p>
          </div>

          <div className="md:col-span-3">
            {loading ? (
              <div className="p-6 text-[#124734] font-semibold">Loading products...</div>
            ) : (
              <ProductNoSlider products={filtered} columns={3} />
            )}
          </div>
        </div>
      </div>

      <div className="pt-10">
        <Footer />
      </div>
    </section>
  );
};

export default Shop;
