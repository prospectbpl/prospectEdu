import React, { useEffect, useMemo, useState } from "react";
import ProductRow from "./ProductRow";
import { FiSearch, FiSliders, FiMoreHorizontal } from "react-icons/fi";
import { api } from "../../../../lib/api";

export default function ProductTable({ activeTab }) {
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ NEW: search text
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products/admin/supplier-products");
      setRaw(res?.data?.products || []);
    } catch (e) {
      setRaw([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const products = useMemo(() => {
    const items = raw.map((p) => ({
      _id: p._id,
      name: p.name,
      img: p.images?.[0] || "https://via.placeholder.com/40",
      category: p.category || "",
      isTrending: !!p.isTrending,
      createdAt: p.createdAt,
      price: p.offerPrice ?? p.price,
      outOfStock: !!p.outOfStock,
      supplierName:
        p.supplierId?.userId?.name ||
        p.supplierId?.ownerName ||
        p.supplierId?.shopName ||
        "—",
    }));

    // ✅ tab filter
    let filtered = items;
    if (activeTab === "Trending Products") {
      filtered = filtered.filter((x) => x.isTrending);
    }

    // ✅ search filter (name + category + supplier)
    const q = String(search || "").trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((x) => {
        const name = (x.name || "").toLowerCase();
        const cat = (x.category || "").toLowerCase();
        const sup = (x.supplierName || "").toLowerCase();
        return name.includes(q) || cat.includes(q) || sup.includes(q);
      });
    }

    return filtered;
  }, [raw, activeTab, search]);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      {/* Top bar with search + icons */}
      <div className="flex justify-between mb-4">
        <div className="flex gap-3">{/* Tabs handled above */}</div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search your product"
              className="border px-4 py-2 rounded-lg w-64"
              value={search} // ✅ NEW
              onChange={(e) => setSearch(e.target.value)} // ✅ NEW
            />
            <FiSearch className="absolute right-3 top-3 text-gray-600" />
          </div>

      
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#ECF5EE] text-left">
            <th className="p-3 text-center">No.</th>
            <th className="p-3">Product</th>
            <th className="p-3 text-center">Supplier</th>
            <th className="p-3 text-center">Category</th>
            <th className="p-3 text-center">Price</th>
            <th className="p-3 text-center">Trending</th>
            <th className="p-3 text-center">Created Date</th>
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td colSpan="7" className="p-6 text-center text-gray-500">
                Loading...
              </td>
            </tr>
          )}

          {!loading && products.length === 0 && (
            <tr>
              <td colSpan="7" className="p-6 text-center text-gray-500">
                No products found.
              </td>
            </tr>
          )}

          {!loading &&
            products.map((p, i) => (
              <ProductRow key={p._id} item={p} index={i + 1} onRefresh={load} />
            ))}
        </tbody>
      </table>
    </div>
  );
}
