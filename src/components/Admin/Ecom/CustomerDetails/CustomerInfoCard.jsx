import React from "react";

export default function CustomerInfoCard({ customer }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold text-[#124734] mb-4">Customer Info</h2>

      <div className="space-y-2 text-sm">
        <p><strong>Name:</strong> {customer.name}</p>
        <p><strong>Customer ID:</strong> {customer.customerId}</p>
        <p><strong>Phone:</strong> {customer.phone}</p>
        <p><strong>Email:</strong> {customer.email || "N/A"}</p>
        <p><strong>Address:</strong> {customer.address || "N/A"}</p>
        <p><strong>Joined:</strong> {customer.joinedDate || "N/A"}</p>
      </div>

      <div className="border-t mt-4 pt-4 text-sm">
        <p><strong>Total Orders:</strong> {customer.orderCount}</p>
        <p><strong>Completed Orders:</strong> {customer.completedOrder}</p>
        <p><strong>Cancelled Orders:</strong> {customer.cancelledOrder}</p>
        <p><strong>Total Spend:</strong> ₹{customer.totalSpend}</p>
      </div>
    </div>
  );
}
