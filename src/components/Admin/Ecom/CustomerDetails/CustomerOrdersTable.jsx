import React from "react";

export default function CustomerOrdersTable({ customer }) {

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-6">
      <h2 className="text-lg font-semibold text-[#124734] mb-4">
        Recent Orders
      </h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#ECF5EE]">
            <th className="p-3">Order ID</th>
            <th className="p-3">Date</th>
            <th className="p-3">Amount</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>

        <tbody>
          {customer.orders?.length ? (
            customer.orders.map((o) => (
              <tr key={o.orderId} className="border-t">
                <td className="p-3">{o.orderId}</td>
                <td className="p-3">{o.date}</td>
                <td className="p-3">₹{o.total}</td>
                <td className="p-3">{o.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="p-4 text-center text-gray-500">
                No orders found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
