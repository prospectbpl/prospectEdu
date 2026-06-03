import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import AdminSidebar from "../../../components/Admin/Layout/AdminSidebar";
import AdminTopbar from "../../../components/Admin/Layout/AdminTopbar";
import Breadcrumb from "../../../components/Breadcrumb";
import { api } from "../../../lib/api";

export default function EcomProductList() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const pageTitle = "Admin Products | ProspectEdu Admin";
  const pageDescription =
    "Manage admin products, stock status, trending status, and remove products in ProspectEdu Admin.";

  const canonicalUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname =
      typeof window !== "undefined" ? window.location.pathname : "";
    return origin && pathname ? `${origin}${pathname}` : "";
  }, []);

  const fetchAdminProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products/admin/mine");
      setProducts(res.data?.products || []);
    } catch (err) {
      console.log(
        "FETCH ERROR:",
        err?.response?.status,
        err?.response?.data || err.message
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeProduct = async (id) => {
    try {
      await api.delete(`/products/admin/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setShowDeletePopup(false);
    } catch (err) {
      console.log(
        "DELETE ERROR:",
        err?.response?.status,
        err?.response?.data || err.message
      );
    }
  };

  const toggleStock = async (product) => {
    try {
      const nextOutOfStock = !product.outOfStock;

      const res = await api.patch(`/products/${product._id}/stock-admin`, {
        outOfStock: nextOutOfStock,
      });

      const updated = res.data?.product;
      if (!updated) return;

      setProducts((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );
    } catch (err) {
      console.log(
        "STOCK TOGGLE ERROR:",
        err?.response?.status,
        err?.response?.data || err.message
      );
    }
  };

  const toggleTrending = async (product) => {
    try {
      const nextTrending = !product.isTrending;

      const res = await api.patch(`/products/${product._id}/trending`, {
        isTrending: nextTrending,
      });

      const updated = res.data?.product;
      if (!updated) return;

      setProducts((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );
    } catch (err) {
      console.log(
        "TRENDING TOGGLE ERROR:",
        err?.response?.status,
        err?.response?.data || err.message
      );
    }
  };

  const getFirstImage = (p) => {
    if (Array.isArray(p.images) && p.images.length > 0) return p.images[0];
    return "https://via.placeholder.com/120x120?text=No+Image";
  };

  const sidebarWidth = isCollapsed ? 80 : 256;

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] overflow-hidden">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}

        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Helmet>

      {/* FIXED SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-screen bg-[#124734] transition-all duration-300 z-40 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <AdminSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      </div>
      
      {/* MAIN CONTENT AREA */}
      <main
        className="flex-1 flex flex-col"
        style={{ marginLeft: sidebarWidth }}
        aria-label="Admin products page"
      >
        
        {/* Hidden H1 for SEO (no layout change) */}
        <h1 className="sr-only">Admin Products</h1>

        {/* FIXED TOPBAR */}
        <div
          className="fixed top-0 bg-white shadow-sm z-[999] h-[64px]"
          style={{ left: sidebarWidth, right: 0 }}
        >
          <AdminTopbar isCollapsed={isCollapsed} pageTitle="Product List" />
        </div>
        

        {/* PAGE CONTENT */}
        <div className="p-8 mt-[80px]">
          <div className="ml=-3"> 
           <Breadcrumb
        items={[
          { label: "Dashboard", to: "/admin-dashboard" },
          { label: "Admin Products" },
        ]}
      />
        </div>
          {/* Keeping your visible H1 exactly as-is (layout unchanged) */}
          <h1 className="text-3xl font-bold text-[#124734] mb-6">
            Admin Products
          </h1>

          {/* TABLE CARD */}
          <div className="bg-white rounded-xl shadow-lg border border-[#A7E1B2]/40 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#A7E1B2] text-[#124734]">
                <tr>
                  <th className="px-6 py-3 font-semibold">Product</th>
                  <th className="px-6 py-3 font-semibold">Category</th>
                  <th className="px-6 py-3 font-semibold">Price</th>
                  <th className="px-6 py-3 font-semibold">In Stock</th>
                  <th className="px-6 py-3 font-semibold">Trending</th>
                  <th className="px-6 py-3 font-semibold">Remove</th>
                </tr>
              </thead>

              <tbody className="text-gray-700 text-sm">
                {loading && (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-10 text-gray-500 text-lg"
                      aria-live="polite"
                    >
                      Loading...
                    </td>
                  </tr>
                )}

                {!loading && products.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-10 text-gray-500 text-lg"
                      aria-live="polite"
                    >
                      No products added yet.
                    </td>
                  </tr>
                )}

                {!loading &&
                  products.map((p) => (
                    <tr
                      key={p._id}
                      className="border-t hover:bg-[#A7E1B2]/10 transition"
                    >
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img
                          src={getFirstImage(p)}
                          className="w-16 h-16 object-contain border border-gray-300 rounded-lg p-1"
                          alt={p.name ? `${p.name} product image` : "Product image"}
                          width={64}
                          height={64}
                          loading="lazy"
                          decoding="async"
                        />
                        <span className="font-medium text-[#124734]">
                          {p.name}
                        </span>
                      </td>

                      <td className="px-6 py-4">{p.category}</td>

                      <td className="px-6 py-4 font-semibold text-[#124734]">
                        ₹{p.offerPrice ?? p.price}
                      </td>

                      {/* ✅ In Stock Toggle */}
                      <td className="px-6 py-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!p.outOfStock}
                            onChange={() => toggleStock(p)}
                            className="sr-only peer"
                            aria-label={`Toggle stock for ${p.name}`}
                          />
                          <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-600 transition"></div>
                          <span className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-6"></span>
                        </label>
                        <div className="text-xs mt-1 text-gray-500">
                          {p.outOfStock ? "Out of stock" : "In stock"}
                        </div>
                      </td>

                      {/* ✅ Trending Toggle */}
                      <td className="px-6 py-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!p.isTrending}
                            onChange={() => toggleTrending(p)}
                            className="sr-only peer"
                            aria-label={`Toggle trending for ${p.name}`}
                          />
                          <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-[#124734] transition"></div>
                          <span className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-6"></span>
                        </label>
                        <div className="text-xs mt-1 text-gray-500">
                          {p.isTrending ? "Trending" : "Not trending"}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-left">
                        <button
                          onClick={() => {
                            setDeleteId(p._id);
                            setShowDeletePopup(true);
                          }}
                          className="text-[#124734] p-2 rounded-full shadow hover:scale-110 transition"
                          aria-label={`Remove ${p.name}`}
                        >
                          <img
                            src="https://cdn-icons-png.flaticon.com/512/6861/6861362.png"
                            alt="Delete product"
                            className="w-7 h-7 opacity-90 hover:opacity-100"
                            width={28}
                            height={28}
                            loading="lazy"
                            decoding="async"
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* DELETE POPUP */}
      {showDeletePopup && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]"
          role="dialog"
          aria-modal="true"
          aria-label="Remove product confirmation"
        >
          <div className="bg-white p-8 rounded-xl shadow-xl w-[350px] text-center">
            <div className="text-red-500 text-3xl mb-3">⚠</div>

            <p className="text-lg font-semibold mb-6">
              Are you sure you want to remove this product?
            </p>

            <div className="flex justify-between gap-4">
              <button
                onClick={() => setShowDeletePopup(false)}
                className="w-full border px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={() => removeProduct(deleteId)}
                className="w-full bg-[#124734] text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
