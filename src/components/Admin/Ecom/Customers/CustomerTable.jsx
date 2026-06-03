import React, { useState } from "react";
import CustomerRow from "./CustomerRow";
import customersData from "../../../../data/customers";

export default function CustomerTable({ search, setSearch, page, itemsPerPage = 10 }) {
  
  const [customers, setCustomers] = useState(customersData);

  // Filter
  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.customerId.toLowerCase().includes(search.toLowerCase())
  );

  // ⭐ Delete Handler
  const handleDelete = (id) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  // Pagination Logic
  const start = (page - 1) * itemsPerPage;
  const rows = filtered.slice(start, start + itemsPerPage);

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-[#A7E1B2]">

      {/* Search Bar */}
      <div className="flex justify-between mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search customer"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-64"
          />
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#ECF5EE]">
            <th className="p-3 text-center">Customer Id</th>
            <th className="p-3 text-center">Name</th>
            <th className="p-3 text-center">Phone</th>
            <th className="p-3 text-center">Order Count</th>
            <th className="p-3 text-center">Total Spend</th>
            <th className="p-3 text-center">Status</th>
            <th className="p-3 text-left">Action</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((c) => (
            <CustomerRow key={c.id} item={c} onDelete={handleDelete} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
