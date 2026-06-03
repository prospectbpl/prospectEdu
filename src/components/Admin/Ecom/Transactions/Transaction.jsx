import React, { useState } from "react";
import TransactionTabs from "./TransactionTabs";
import TransactionTable from "./TransactionTable";

const allTransactions = [
  { id: "#CUST001", name: "John Doe", date: "01-01-2025", total: "$2,904", method: "CC", status: "Complete" },
  { id: "#CUST001", name: "John Doe", date: "01-01-2025", total: "$2,904", method: "PayPal", status: "Complete" },
  { id: "#CUST001", name: "John Doe", date: "01-01-2025", total: "$2,904", method: "Bank", status: "Complete" },
  { id: "#CUST001", name: "Jane Smith", date: "01-01-2025", total: "$2,904", method: "CC", status: "Canceled" },
  { id: "#CUST001", name: "Emily Davis", date: "01-01-2025", total: "$2,904", method: "PayPal", status: "Pending" },
];

export default function Transaction() {
  const [active, setActive] = useState("All order (240)");
  const [search, setSearch] = useState("");

  // ⭐ pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ⭐ FILTERING
  const filtered = allTransactions.filter((t) => {
    const matchTab =
      active === "All order (240)"
        ? true
        : active === "Completed"
        ? t.status === "Complete"
        : active === "Pending"
        ? t.status === "Pending"
        : active === "Cancelled"
        ? t.status === "Canceled"
        : true;

    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());

    return matchTab && matchSearch;
  });

  // ⭐ PAGINATION LOGIC
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <TransactionTabs 
        active={active} 
        setActive={(v) => {
          setActive(v);
          setCurrentPage(1); // reset page
        }} 
      />

      <TransactionTable
        data={paginatedData}
        search={search}
        setSearch={(v) => {
          setSearch(v);
          setCurrentPage(1); // reset page
        }}
        currentPage={currentPage}
        totalItems={filtered.length}
        itemsPerPage={itemsPerPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}
