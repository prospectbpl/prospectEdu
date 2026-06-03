import React, { useState } from "react";
import StatusBadge from "./StatusBadge";
import TransactionDetailsModal from "./TransactionDetailsModal"; // ⭐ import modal

export default function TransactionTable({ data, search, setSearch }) {
  const [openModal, setOpenModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);

  const handleView = (tx) => {
    setSelectedTx(tx);
    setOpenModal(true);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-[#A7E1B2]">

      {/* Search */}
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search payment history"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-64"
        />
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#ECF5EE]">
            <th className="p-3 text-center">Customer Id</th>
            <th className="p-3 text-center">Name</th>
            <th className="p-3 text-center">Date</th>
            <th className="p-3 text-center">Total</th>
            <th className="p-3 text-center">Method</th>
            <th className="p-3 text-center">Status</th>
            <th className="p-3 text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {data.map((t, i) => (
            <tr key={i} className="border-t hover:bg-gray-50">
              <td className="p-3">{t.id}</td>
              <td className="p-3">{t.name}</td>
              <td className="p-3">{t.date}</td>
              <td className="p-3">{t.total}</td>
              <td className="p-3">{t.method}</td>
              <td className="p-3"><StatusBadge status={t.status} /></td>

              {/* ⭐ VIEW DETAILS BUTTON OPENS MODAL */}
              <td
                className="p-3 text-[#124734] cursor-pointer"
                onClick={() => handleView(t)}
              >
                View Details
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ⭐ MODAL */}
      <TransactionDetailsModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        transaction={selectedTx}
      />

    </div>
  );
}
