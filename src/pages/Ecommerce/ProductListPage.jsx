import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import EcomHeader from "../../components/EcomHeader";
import ProductNoSlider from "../../components/EcommerceHomeSlider/ProductNoSlider";
import Footer from "../../components/Footer";
import { api } from "../../lib/api";

const ProductListPage = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const canonicalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${location.pathname}`
      : location.pathname;

  // ✅ backend products mapped to same UI shape
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        const res = await api.get("/products"); // /api/v1/products
        const products = res?.data?.products || [];

        const mapped = products.map((p) => {
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
            customCategory: p.customCategory || "",
            createdAt: p.createdAt,
            isTrending: !!p.isTrending, // ✅ IMPORTANT (Trending)
          };
        });

        if (!mounted) return;
        setAllProducts(mapped);
      } catch (e) {
        console.error("Failed to load products:", e);
        if (!mounted) return;
        setAllProducts([]);
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const normalize = (s) => String(s || "").trim().toLowerCase();

  // ✅ type examples:
  // 1) trending-products  => show isTrending true
  // 2) it-books-products  => show category "IT Books"
  // 3) management-books-products => show category "Management Books"
  const products = useMemo(() => {
    if (!type) return [];

    // ✅ Trending View All (DB based)
    if (type === "trending-products") {
      return allProducts.filter((p) => p.isTrending === true);
    }

    // ✅ Generic: "<category-slug>-products"
    // ex: "it-books-products" => "it books" => match product.category
    if (type.endsWith("-products")) {
      const categorySlug = type.replace(/-products$/, ""); // "it-books"
      if (categorySlug === "trending") {
        return allProducts.filter((p) => p.isTrending === true);
      }

      const categoryNameGuess = categorySlug.replace(/-/g, " "); // "it books"
      return allProducts.filter(
        (p) => normalize(p.category) === normalize(categoryNameGuess)
      );
    }

    return [];
  }, [type, allProducts]);

  const pageTitle = useMemo(() => {
    if (!type) return "PRODUCTS";

    if (type === "trending-products") return "TRENDING PRODUCTS";

    if (type.endsWith("-products")) {
      const categorySlug = type.replace(/-products$/, "");
      const categoryNameGuess = categorySlug.replace(/-/g, " ");
      return `${categoryNameGuess}`.toUpperCase();
    }

    return type.replace(/-/g, " ").toUpperCase();
  }, [type]);

  // ✅ SEO helpers
  const humanTitle = useMemo(() => {
    const t = pageTitle.replace(/\s+/g, " ").trim();
    return t ? `${t} | ProspectEdu Store` : "Products | ProspectEdu Store";
  }, [pageTitle]);

  const metaDesc = useMemo(() => {
    const base =
      type === "trending-products"
        ? "Explore trending products on ProspectEdu Store with best offers and fast delivery."
        : `Browse ${pageTitle
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim()} products on ProspectEdu Store.`;
    return base.slice(0, 160);
  }, [type, pageTitle]);

  const breadcrumbJsonLd = useMemo(() => {
    return {
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
          name: pageTitle,
          item: canonicalUrl,
        },
      ],
    };
  }, [canonicalUrl, pageTitle]);

  const itemListJsonLd = useMemo(() => {
    // Limit JSON-LD size (SEO best practice)
    const top = (products || []).slice(0, 20);
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: pageTitle,
      itemListElement: top.map((p, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: p.title,
        url:
          typeof window !== "undefined"
            ? `${window.location.origin}/product/${p.id}`
            : `/product/${p.id}`,
      })),
    };
  }, [products, pageTitle]);

  return (
    <section className="pt-36">
      <Helmet>
        <title>{humanTitle}</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={canonicalUrl} />

        {/* OG */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={humanTitle} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:url" content={canonicalUrl} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={humanTitle} />
        <meta name="twitter:description" content={metaDesc} />

        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(itemListJsonLd)}</script>
      </Helmet>

      <EcomHeader />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 font-[Open_Sans] pb-20 text-left">
        {/* Breadcrumb */}
        <p className="text-gray-600 mb-4 sm:mb-5 text-sm sm:text-base">
          <span
            className="cursor-pointer text-[#124734] hover:underline"
            onClick={() => navigate("/ecommerce-home")}
          >
            Home
          </span>{" "}
          &gt; {type?.replace(/-/g, " ")}
        </p>

        {/* Page Title */}
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-[#124734]">
          {pageTitle} ({products.length} Products Found)
        </h2>

        {/* Product Grid */}
        <ProductNoSlider products={products} columns={4} />
      </div>

      <div className="pt-10">
        <Footer />
      </div>
    </section>
  );
};

export default ProductListPage;
