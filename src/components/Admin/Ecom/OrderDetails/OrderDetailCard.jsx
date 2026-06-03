import React from "react";

export default function OrderDetailCard({ order }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold text-[#124734] mb-4">
        Customer Information
      </h2>

      <div className="space-y-3 text-sm">
        <p><strong>Name:</strong> {order.customerName}</p>
        <p><strong>Email:</strong> {order.email}</p>
        <p><strong>Phone:</strong> {order.phone}</p>
        <p><strong>Address:</strong></p>
        <p className="text-gray-600">{order.address}</p>
      </div>
    </div>
  );
}
