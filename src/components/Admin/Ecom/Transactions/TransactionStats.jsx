import React from "react";

export default function TransactionStats() {
  const stats = [
    { title: "Total Revenue", value: "$15,045", change: "+14.4%", positive: true },
    { title: "Completed Transactions", value: "3,150", change: "+20%", positive: true },
    { title: "Pending Transactions", value: "150", change: "85%", positive: true },
    { title: "Failed Transactions", value: "75", change: "15%", positive: false },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 w-fit">
      {stats.map((s, i) => (
        <div
          key={i}
          className="bg-white p-5 rounded-xl shadow border border-[#A7E1B2] 
                     h-[160px] w-[280px]"
        >
          <p className="text-gray-600 text-sm">{s.title}</p>
          <h2 className="text-2xl font-bold text-[#124734] mt-1">{s.value}</h2>

          <p
            className={`text-sm mt-1 ${
              s.positive ? "text-green-600" : "text-red-500"
            }`}
          >
            {s.change} Last 7 days
          </p>
        </div>
      ))}
    </div>
  );
}
