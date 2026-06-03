import { useEffect, useMemo, useState } from "react";
import { api } from "../../../lib/api";
import TestSeriesFeesTableRow from "./TestSeriesFeesTableRow";

const prettyDate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { year: "numeric", month: "2-digit", day: "2-digit" });
  } catch {
    return "";
  }
};

export default function TestSeriesFeesTable({ search }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ load purchases from backend
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // ✅ You must add backend route: GET /api/v1/test-purchase/admin/all
        const res = await api.get("/test-purchase/admin/all");
        setItems(Array.isArray(res?.data?.data) ? res.data.data : []);
      } catch (e) {
        console.error(e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ✅ map purchases into table format (like your feesData)
  const mapped = useMemo(() => {
    return items.map((p, idx) => {
      const studentName =
        p?.user?.name || p?.user?.fullName || p?.user?.email || "Student";

      const seriesTitle = p?.testSeries?.title || "Test Series";

      const invoice = `#TS-${String(p?._id || "").slice(-6).toUpperCase()}`;
      const receipt = p?.transactionId || `TXN-${String(p?._id || "").slice(-8)}`;

      return {
        roll: String(idx + 1).padStart(2, "0"),
        name: studentName,
        invoice,
        type: seriesTitle, // ✅ instead of fees type, show series title
        payment: p?.provider || "MANUAL",
        status: p?.status || "PAID",
        date: prettyDate(p?.createdAt),
        amount: `₹${Number(p?.amount || p?.price || p?.testSeries?.price || 0)}`,
        receipt,
      };
    });
  }, [items]);

  const filtered = useMemo(() => {
    const s = String(search || "").toLowerCase().trim();
    if (!s) return mapped;

    return mapped.filter(
      (item) =>
        item.name.toLowerCase().includes(s) ||
        item.invoice.toLowerCase().includes(s) ||
        item.type.toLowerCase().includes(s) ||
        item.receipt.toLowerCase().includes(s)
    );
  }, [mapped, search]);

  if (loading) {
    return <div className="p-4 text-gray-500">Loading purchases...</div>;
  }

  return (
    <>
      <div className="overflow-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">S.No</th>
              <th className="p-3">Student</th>
              <th className="p-3">Invoice</th>
              <th className="p-3">Test Series</th>
              <th className="p-3">Payment Type</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Txn / Receipt</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((item, index) => (
              <TestSeriesFeesTableRow key={index} item={item} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination (same UI, static for now like your fees table) */}
      <div className="flex justify-between items-center mt-4">
        <p>Showing {filtered.length} entries</p>

        <div className="flex gap-2">
          <button className="px-3 py-1 bg-gray-200 rounded">Previous</button>
          <button className="px-3 py-1 bg-green-600 text-white rounded">1</button>
          <button className="px-3 py-1 bg-gray-200 rounded">2</button>
          <button className="px-3 py-1 bg-gray-200 rounded">Next</button>
        </div>
      </div>
    </>
  );
}
