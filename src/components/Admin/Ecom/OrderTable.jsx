import React, { useEffect, useMemo, useState } from "react";
import OrderRow from "./OrderRow";
import { api } from "../../../lib/api";

const prettyDate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
};

export default function OrderTable({ active, page, search, itemsPerPage = 10 }) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders/admin");
      const orders = res?.data?.orders || [];

      // ✅ Flatten: each item becomes a row
      const flat = [];
      for (const o of orders) {
        for (const it of o.items || []) {
          flat.push({
            rowId: it._id,
            orderId: o.orderId,
            product: it.title,
            img: it.img || "https://via.placeholder.com/40",
            date: prettyDate(o.createdAt),
            price: Number(it.price || 0) * Number(it.quantity || 1),
            status: it.status,
            productOwner: it.productOwner,
          });
        }
      }

      setRows(flat);
    } catch (e) {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // ✅ auto-refresh every 15 seconds for "day by day update"
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = (search || "").toLowerCase();

    return rows.filter((r) => {
      const matchesSearch =
        r.orderId.toLowerCase().includes(q) ||
        r.product.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      const st = String(r.status || "").toUpperCase();

      if (active === "All Orders") return true;
      if (active === "Completed") return st === "DELIVERED";
      if (active === "Pending") return ["ORDER_RECEIVED", "CONFIRMED", "ON_THE_WAY"].includes(st);
      if (active === "Cancelled") return ["CANCELED", "REJECTED"].includes(st);

      return true;
    });
  }, [rows, search, active]);

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filtered.slice(startIndex, endIndex);

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      {loading && <p className="text-sm text-gray-600 p-3">Loading orders...</p>}

      {!loading && (
        <table className="w-full">
          <thead>
            <tr className="bg-[#ECF5EE] text-left">
              <th className="p-3 text-center">No.</th>
              <th className="p-3 text-center">Order ID</th>
              <th className="p-3 text-center">Product</th>
              <th className="p-3 text-center">Date</th>
              <th className="p-3 text-center">Price</th>

              {/* ✅ Payment removed */}
              <th className="p-3 text-center">Type</th>
              <th className="p-3 text-center">Status</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((o, i) => (
              <OrderRow
                key={o.rowId}
                index={startIndex + i + 1}
                item={o}
              />
            ))}

            {!paginatedData.length && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
