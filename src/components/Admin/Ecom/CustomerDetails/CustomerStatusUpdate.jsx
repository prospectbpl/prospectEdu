import React, { useState } from "react";
import { useToast } from "../../../../context/ToastContext";

export default function CustomerStatusUpdate({ customer }) {
  const { showToast } = useToast();
  const [status, setStatus] = useState(customer.status);

  const updateStatus = () => {
    showToast(`Status updated to ${status}`, "success");
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold text-[#124734] mb-4">
        Update Status
      </h2>

      <select
        className="border px-3 py-2 rounded w-full"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="Active">Active</option>
        <option value="VIP">VIP</option>
        <option value="Inactive">Inactive</option>
      </select>

      <button
        onClick={updateStatus}
        className="mt-4 bg-[#124734] text-white px-4 py-2 rounded hover:bg-[#0E3A2B]"
      >
        Update Status
      </button>
    </div>
  );
}
