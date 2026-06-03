import React from "react";

export default function OrderStatusUpdate({ status, setStatus }) {
  const statuses = ["Pending", "Shipped", "Delivered", "Cancelled"];

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold text-[#124734] mb-4">
        Update Order Status
      </h2>

      <select
        className="border px-3 py-2 rounded w-full"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <button
        className="mt-4 bg-[#124734] text-white px-4 py-2 rounded hover:bg-[#0E3A2B]"
        onClick={() => alert("Status updated successfully!")}
      >
        Update Status
      </button>
    </div>
  );
}
