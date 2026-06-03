import React from "react";

export default function CustomerStats() {
  return (
    <div className="flex flex-col gap-6 w-full">

      <div className="bg-white p-6 rounded-xl shadow border border-[#A7E1B2]">
        <p className="text-gray-600">Total Customers</p>
        <h1 className="text-3xl font-bold text-[#124734]">11,040</h1>
        <p className="text-sm text-green-500 mt-1">↑ 14.4% Last 7 days</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow border border-[#A7E1B2]">
        <p className="text-gray-600">New Customers</p>
        <h1 className="text-3xl font-bold text-[#124734]">2,370</h1>
        <p className="text-sm text-green-500 mt-1">↑ 20% Last 7 days</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow border border-[#A7E1B2]">
        <p className="text-gray-600">Visitor</p>
        <h1 className="text-3xl font-bold text-[#124734]">250k</h1>
        <p className="text-sm text-green-500 mt-1">↑ 20% Last 7 days</p>
      </div>

    </div>
  );
}
