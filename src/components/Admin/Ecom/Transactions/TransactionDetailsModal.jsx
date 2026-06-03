import React from "react";

export default function TransactionDetailsModal({ open, onClose, transaction }) {
  if (!open || !transaction) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-[9999]">
      <div className="bg-white p-6 rounded-xl shadow-lg w-[380px] border border-[#A7E1B2]">

        <h2 className="text-lg font-semibold text-[#124734] mb-4">
          Transaction Details
        </h2>

        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>Customer ID:</strong> {transaction.id}</p>
          <p><strong>Name:</strong> {transaction.name}</p>
          <p><strong>Date:</strong> {transaction.date}</p>
          <p><strong>Total Amount:</strong> {transaction.total}</p>
          <p><strong>Payment Method:</strong> {transaction.method}</p>
          <p><strong>Status:</strong> {transaction.status}</p>
        </div>

        <div className="flex justify-end mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-[#124734] text-white hover:bg-[#0E3A2B]"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
