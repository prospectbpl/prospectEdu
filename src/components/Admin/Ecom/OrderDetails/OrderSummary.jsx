import React from "react";

export default function OrderSummary({ order }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold text-[#124734] mb-4">Order Summary</h2>

      <div className="space-y-3 text-sm">
        <p><strong>Order ID:</strong> {order.orderId}</p>
        <p><strong>Date:</strong> {order.date}</p>
        <p><strong>Product:</strong> {order.product}</p>
        <p><strong>Price:</strong> ${order.price}</p>

        <p><strong>Payment:</strong> {order.payment}</p>
        <p><strong>Status:</strong> {order.status}</p>
      </div>
    </div>
  );
}
