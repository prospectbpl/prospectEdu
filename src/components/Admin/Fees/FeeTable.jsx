import React from "react";
import FeesTableRow from "./FeesTableRow";

export default function FeesTable({ search }) {
  const feesData = [
    {
      roll: "01",
      name: "Tiger Nixon",
      invoice: "#54605",
      type: "Library",
      payment: "Cash",
      status: "Paid",
      date: "2011/04/25",
      amount: "120$",
      receipt: "RCPT-1001",
    },
    {
      roll: "02",
      name: "Garrett Winters",
      invoice: "#54687",
      type: "Library",
      payment: "Credit Card",
      status: "Pending",
      date: "2011/07/25",
      amount: "120$",
      receipt: "RCPT-1002",
    },
    {
      roll: "07",
      name: "Herrod Chandler",
      invoice: "#98726",
      type: "Tuition",
      payment: "Credit Card",
      status: "Unpaid",
      date: "2012/08/06",
      amount: "120$",
      receipt: "RCPT-1003",
    },
  ];

  const filtered = feesData.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.invoice.includes(search)
  );

  return (
    <>
      <div className="overflow-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Roll No</th>
              <th className="p-3">Student Name</th>
              <th className="p-3">Invoice</th>
              <th className="p-3">Fees Type</th>
              <th className="p-3">Payment Type</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Receipt</th> {/* NEW COLUMN */}
            </tr>
          </thead>

          <tbody>
            {filtered.map((item, index) => (
              <FeesTableRow key={index} item={item} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <p>Showing {filtered.length} entries</p>

        <div className="flex gap-2">
          <button className="px-3 py-1 bg-gray-200 rounded">Previous</button>
          <button className="px-3 py-1 bg-green-600 text-white rounded">1</button>
          <button className="px-3 py-1 bg-gray-200 rounded">2</button>
          <button className="px-3 py-1 bg-gray-200 rounded">Next</button>
        </div>
      </div>
    </>
  );
}
