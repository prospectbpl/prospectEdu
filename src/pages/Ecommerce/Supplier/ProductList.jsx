import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import SupplierSidebar from "../../../components/SupplierEcommerce/Sidebar";
import SupplierTopbar from "../../../components/SupplierEcommerce/Topbar";
import { api } from "../../../lib/api";

export default function ProductList() {
  const location = useLocation();

  const canonicalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${location.pathname}`
      : location.pathname;

  const breadcrumbJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Supplier Dashboard",
          item:
            typeof window !== "undefined"
              ? `${window.location.origin}/supplier`
              : "/supplier",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Products",
          item: canonicalUrl,
        },
      ],
    }),
    [canonicalUrl]
  );

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products/mine");
      setProducts(res.data?.products || []);
    } catch (err) {
      console.log("FETCH ERROR:", err?.response?.status, err?.response?.data || err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeProduct = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setShowDeletePopup(false);
    } catch (err) {
      console.log("DELETE ERROR:", err?.response?.status, err?.response?.data || err.message);
    }
  };

  const toggleStock = async (product) => {
    try {
      const nextOutOfStock = !product.outOfStock;

      const res = await api.patch(`/products/${product._id}/stock`, {
        outOfStock: nextOutOfStock,
      });

      const updated = res.data?.product;
      if (!updated) return;

      setProducts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
    } catch (err) {
      console.log("TOGGLE ERROR:", err?.response?.status, err?.response?.data || err.message);
    }
  };

  const getFirstImage = (p) => {
    if (Array.isArray(p.images) && p.images.length > 0) return p.images[0];
    return "https://via.placeholder.com/120x120?text=No+Image";
  };

  useEffect(() => {
    const onProductsRefresh = () => fetchMyProducts();
    window.addEventListener("supplierProductsRefresh", onProductsRefresh);
    return () => window.removeEventListener("supplierProductsRefresh", onProductsRefresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex bg-[#F9FAFB] min-h-screen text-left">
      <Helmet>
        <title>Supplier Products | ProspectEdu</title>
        <meta name="description" content="Manage your products, stock status, and listings on ProspectEdu." />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <SupplierSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 
          ${isCollapsed ? "ml-20 md:ml-0" : "ml-64 md:ml-0"}
        `}
      >
        <SupplierTopbar pageTitle="Product List" />

        <div className="p-8">
          <h1 className="text-3xl font-bold text-[#124734] mb-6">All Products</h1>

          <div className="bg-white rounded-xl shadow-lg border border-[#A7E1B2]/40 overflow-hidden hidden md:block">
            <table className="w-full text-left">
              <thead className="bg-[#A7E1B2] text-[#124734]">
                <tr>
                  <th className="px-6 py-3 font-semibold">Product</th>
                  <th className="px-6 py-3 font-semibold">Category</th>
                  <th className="px-6 py-3 font-semibold">Price</th>
                  <th className="px-6 py-3 font-semibold">In Stock</th>
                  <th className="px-6 py-3 font-semibold">Remove</th>
                </tr>
              </thead>

              <tbody className="text-gray-700 text-sm">
                {loading && (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-gray-500 text-lg">
                      Loading...
                    </td>
                  </tr>
                )}

                {!loading && products.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-gray-500 text-lg">
                      No products added yet.
                    </td>
                  </tr>
                )}

                {!loading &&
                  products.map((p) => (
                    <tr key={p._id} className="border-t hover:bg-[#A7E1B2]/10 transition">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img
                          src={getFirstImage(p)}
                          className="w-16 h-16 object-contain border border-gray-300 rounded-lg p-1"
                          alt={p.name || "product"}
                          loading="lazy"
                          decoding="async"
                        />
                        <span className="text-lg font-semibold text-[#124734]">{p.name}</span>
                      </td>

                      <td className="px-6 py-4 text-lg  ">{p.category}</td>

                      <td className="px-6 py-4 font-semibold text-[#124734]">₹{p.offerPrice ?? p.price}</td>

                      <td className="px-6 py-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!p.outOfStock}
                            onChange={() => toggleStock(p)}
                            className="sr-only peer"
                          />
                          <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-600 transition"></div>
                          <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-6"></span>
                        </label>

                        <div className="text-xs mt-1 text-gray-500">
                          {p.outOfStock ? "Out of stock" : `In stock • Qty: ${p.quantity ?? 0}`}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setDeleteId(p._id);
                            setShowDeletePopup(true);
                          }}
                          className="text-[#124734] p-2 rounded-full shadow hover:scale-110 transition"
                          aria-label="Remove product"
                        >
                          <img
                            src="https://cdn-icons-png.flaticon.com/512/6861/6861362.png"
                            className="w-7 h-7 opacity-90"
                            alt="remove"
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

          <div className="md:hidden space-y-5 mt-5">
            {loading && (
              <div className="bg-white p-4 rounded-xl shadow border border-[#A7E1B2]/40">Loading...</div>
            )}

            {!loading &&
              products.map((p) => (
                <div
                  key={p._id}
                  className="bg-white p-4 rounded-xl shadow border border-[#A7E1B2]/40 flex gap-4"
                >
                  <img
                    src={getFirstImage(p)}
                    className="w-20 h-20 rounded-xl object-contain bg-[#A7E1B2]/20 p-2"
                    alt={p.name || "product"}
                    loading="lazy"
                    decoding="async"
                  />

                  <div className="flex-1">
                    <p className="font-semibold text-[#124734] text-lg leading-tight">{p.name}</p>

                    <p className="text-gray-500 text-sm">{p.category}</p>

                    <p className="text-[#124734] font-bold mt-1">₹{p.offerPrice ?? p.price}</p>

                    <p className="text-gray-600 text-sm mt-1">
                      Qty: <b>{p.quantity ?? 0}</b>
                    </p>

                    <div className="mt-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!p.outOfStock}
                          onChange={() => toggleStock(p)}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-600 transition"></div>
                        <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition duration-200 peer-checked:translate-x-6"></span>
                      </label>

                      <div className="text-xs mt-1 text-gray-500">{p.outOfStock ? "Out of stock" : "In stock"}</div>
                    </div>

                    <button
                      onClick={() => {
                        setDeleteId(p._id);
                        setShowDeletePopup(true);
                      }}
                      className="text-red-600 underline mt-3 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

            {!loading && products.length === 0 && (
              <div className="bg-white p-4 rounded-xl shadow border border-[#A7E1B2]/40 text-gray-500">
                No products added yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {showDeletePopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl w-[350px] text-center">
            <div className="text-red-500 text-3xl mb-3">⚠️</div>

            <p className="text-lg font-semibold mb-6">Are you sure you want to remove this product?</p>

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
