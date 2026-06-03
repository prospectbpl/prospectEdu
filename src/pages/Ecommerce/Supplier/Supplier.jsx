import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import SupplierSidebar from "../../../components/SupplierEcommerce/Sidebar";
import SupplierTopbar from "../../../components/SupplierEcommerce/Topbar";
import { api } from "../../../lib/api";

export default function Supplier() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ SEO: canonical URL
  const canonicalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${location.pathname}`
      : location.pathname;

  // ✅ SEO: breadcrumb schema
  const breadcrumbJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Supplier Dashboard",
          item: canonicalUrl,
        },
      ],
    }),
    [canonicalUrl]
  );

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [supplierProducts, setSupplierProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statsLoading, setStatsLoading] = useState(true);
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });

  const [bestSelling, setBestSelling] = useState(null);

  // ✅ HARD GUARD: if supplier is blocked/pending/rejected -> send to apply
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/suppliers/me/status");
        if (res?.data?.supplierStatus !== "approved") {
          navigate("/supplier/apply", { replace: true });
        }
      } catch {
        // if status check fails, safer to send apply page
        navigate("/supplier/apply", { replace: true });
      }
    })();
  }, [navigate]);

  const fetchSupplierProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products/mine");
      setSupplierProducts(res.data?.products || []);
    } catch (err) {
      console.log(err);
      setSupplierProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplierOrderStats = async () => {
    try {
      setStatsLoading(true);
      const res = await api.get("/orders/supplier/stats");
      const s = res?.data?.stats || {};
      setOrderStats({
        totalOrders: Number(s.totalOrders || 0),
        pendingOrders: Number(s.pendingOrders || 0),
        totalRevenue: Number(s.totalRevenue || 0),
      });
    } catch (err) {
      console.log(err);
      setOrderStats({ totalOrders: 0, pendingOrders: 0, totalRevenue: 0 });
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchBestSellingProduct = async () => {
    try {
      const res = await api.get("/orders/supplier");
      const orders = res?.data?.orders || [];

      const revenueMap = {};

      for (const o of orders) {
        for (const it of o.items || []) {
          const pid = it.productId;
          const revenue = Number(it.price || 0) * Number(it.quantity || 1);

          if (!revenueMap[pid]) {
            revenueMap[pid] = {
              productId: pid,
              title: it.title,
              img: it.img || "https://via.placeholder.com/120",
              category: it.category || "Product",
              revenue: 0,
            };
          }

          revenueMap[pid].revenue += revenue;
        }
      }

      const sorted = Object.values(revenueMap).sort((a, b) => b.revenue - a.revenue);
      setBestSelling(sorted[0] || null);
    } catch (err) {
      console.log("Best selling fetch error:", err);
      setBestSelling(null);
    }
  };

  useEffect(() => {
    fetchSupplierProducts();
    fetchSupplierOrderStats();
    fetchBestSellingProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh stats on events
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "supplierStatsRefresh") {
        fetchSupplierOrderStats();
        fetchBestSellingProduct();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onCustom = () => {
      fetchSupplierOrderStats();
      fetchBestSellingProduct();
    };
    window.addEventListener("supplierStatsRefresh", onCustom);
    return () => window.removeEventListener("supplierStatsRefresh", onCustom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onProductsRefresh = () => fetchSupplierProducts();
    window.addEventListener("supplierProductsRefresh", onProductsRefresh);
    return () => window.removeEventListener("supplierProductsRefresh", onProductsRefresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mappedProducts = supplierProducts.map((p) => ({
    id: p._id,
    title: p.name,
    category: p.categoryGroup || p.category || "Other",
    img:
      Array.isArray(p.images) && p.images.length > 0
        ? p.images[0]
        : "https://via.placeholder.com/120x120?text=No+Image",
    stock: p.outOfStock ? 0 : Number(p.quantity ?? 0),
  }));

  const totalOrders = statsLoading ? "..." : orderStats.totalOrders;
  const pendingOrders = statsLoading ? "..." : orderStats.pendingOrders;
  const totalRevenue = statsLoading ? "..." : orderStats.totalRevenue;

  const lowStockCount = mappedProducts.filter((p) => p.stock > 0 && p.stock < 5).length;
  const outOfStockCount = mappedProducts.filter((p) => p.stock === 0).length;

  return (
    <div className="flex bg-[#F9FAFB] min-h-screen text-left">
      {/* ✅ SEO (NO layout impact) */}
      <Helmet>
        <title>Supplier Dashboard | ProspectEdu</title>
        <meta
          name="description"
          content="Supplier dashboard analytics, best selling products, and stock overview on ProspectEdu."
        />
        <link rel="canonical" href={canonicalUrl} />
        {/* Dashboard/private page should not be indexed */}
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <SupplierSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 
          ${isCollapsed ? "ml-20" : "ml-64"} 
          md:ml-0
        `}
      >
        <SupplierTopbar pageTitle="Supplier Dashboard" />

        <div className="p-4 md:p-8 w-full">
          <h1 className="text-2xl md:text-3xl font-bold text-[#124734] mb-6 md:mb-8 text-center md:text-left">
            Analytics Overview
          </h1>

          <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
            <div className="bg-white shadow-md border border-[#A7E1B2]/40 p-4 md:p-6 rounded-xl">
              <p className="text-gray-600 text-sm md:text-base">Total Products</p>
              <h2 className="text-2xl md:text-3xl font-bold text-[#124734] mt-2">
                {loading ? "..." : mappedProducts.length}
              </h2>
            </div>

            <div className="bg-white shadow-md border border-[#A7E1B2]/40 p-4 md:p-6 rounded-xl">
              <p className="text-gray-600 text-sm md:text-base">Total Orders</p>
              <h2 className="text-2xl md:text-3xl font-bold text-[#124734] mt-2">{totalOrders}</h2>
            </div>

            <div className="bg-white shadow-md border border-[#A7E1B2]/40 p-4 md:p-6 rounded-xl">
              <p className="text-gray-600 text-sm md:text-base">Pending Orders</p>
              <h2 className="text-2xl md:text-3xl font-bold text-red-600 mt-2">{pendingOrders}</h2>
            </div>

            <div className="bg-white shadow-md border border-[#A7E1B2]/40 p-4 md:p-6 rounded-xl">
              <p className="text-gray-600 text-sm md:text-base">Total Revenue</p>
              <h2 className="text-2xl md:text-3xl font-bold text-[#124734] mt-2">₹{totalRevenue}</h2>
            </div>
          </div>

          <div className="bg-white border border-[#A7E1B2]/40 rounded-xl p-4 md:p-6 shadow-md mb-10">
            <h2 className="text-lg md:text-xl font-semibold text-[#124734] mb-4">Best Selling Product</h2>

            {!bestSelling ? (
              <p className="text-gray-500">No sales yet</p>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <img
                  src={bestSelling.img}
                  className="w-24 h-24 md:w-28 md:h-28 object-contain bg-[#A7E1B2]/20 p-2 rounded-xl"
                  alt={bestSelling.title ? `${bestSelling.title} image` : "Best selling product image"}
                  loading="lazy"
                  decoding="async"
                />

                <div>
                  <p className="text-lg font-bold text-[#124734]">{bestSelling.title}</p>
                  <p className="text-gray-600">{bestSelling.category}</p>
                  <p className="mt-1 text-green-700 font-semibold">Revenue Generated: ₹{bestSelling.revenue}</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-[#A7E1B2]/40 rounded-xl p-4 md:p-8 shadow-md mb-10">
            <h2 className="text-xl md:text-2xl font-semibold text-[#124734] mb-6">Stock Overview</h2>

            <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
              <div className="p-6 bg-[#E9F8EF] rounded-xl shadow">
                <p className="text-gray-600 text-sm md:text-base">Total Products</p>
                <h2 className="text-2xl md:text-3xl font-bold text-[#124734]">{mappedProducts.length}</h2>
              </div>

              <div className="p-6 bg-[#FFF6D9] rounded-xl shadow">
                <p className="text-gray-600 text-sm md:text-base">Low Stock Items</p>
                <h2 className="text-2xl md:text-3xl font-bold text-orange-600">{lowStockCount}</h2>
              </div>

              <div className="p-6 bg-[#FFE5E5] rounded-xl shadow">
                <p className="text-gray-600 text-sm md:text-base">Out of Stock</p>
                <h2 className="text-2xl md:text-3xl font-bold text-red-600">{outOfStockCount}</h2>
              </div>
            </div>

            <h3 className="text-lg md:text-xl font-semibold text-[#124734] mb-4">Product Stock Details</h3>

            <div className="border rounded-xl overflow-hidden">
              {mappedProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 border-b last:border-none hover:bg-[#A7E1B2]/10 transition"
                >
                  <div className="flex items-center gap-4 mb-3 sm:mb-0">
                    <img
                      src={p.img}
                      className="w-14 h-14 rounded-lg bg-[#A7E1B2]/20 p-2 object-contain"
                      alt={p.title ? `${p.title} image` : "Product image"}
                      loading="lazy"
                      decoding="async"
                    />
                    <div>
                      <p className="font-semibold text-[#124734]">{p.title}</p>
                      <p className="text-gray-600 text-sm">{p.category}</p>
                    </div>
                  </div>

                  <div className="text-sm md:text-base">
                    {p.stock === 0 ? (
                      <span className="px-3 py-1 rounded-full bg-red-200 text-red-800 font-semibold">Out of Stock</span>
                    ) : p.stock < 5 ? (
                      <span className="px-3 py-1 rounded-full bg-orange-200 text-orange-800 font-semibold">
                        Low Stock ({p.stock})
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-green-200 text-green-800 font-semibold">
                        In Stock ({p.stock})
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {!loading && mappedProducts.length === 0 && (
                <div className="p-6 text-center text-gray-500">No products added yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
