import React, { useState } from "react";
import { FiMoreVertical } from "react-icons/fi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
} from "recharts";

export default function CustomerChart() {
  const [active, setActive] = useState("This week");

  const metrics = [
    { value: "25k", label: "Active Customers" },
    { value: "5.6k", label: "Repeat Customers" },
    { value: "250k", label: "Shop Visitor" },
    { value: "5.5%", label: "Conversion Rate" },
  ];

  // Dummy chart data
  const data = [
    { day: "Sun", value: 12000 },
    { day: "Mon", value: 30000 },
    { day: "Tue", value: 35000 },
    { day: "Wed", value: 25000 },
    { day: "Thu", value: 48000 },
    { day: "Fri", value: 32000 },
    { day: "Sat", value: 38000 },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6 border border-[#A7E1B2]">

      {/* Top Row */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-[#124734]">Customer Overview</h2>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActive("This week")}
            className={`px-4 py-1 text-sm rounded-md border ${
              active === "This week"
                ? "bg-[#124734] text-white border-[#124734]"
                : "bg-white border-gray-300"
            }`}
          >
            This week
          </button>

          <button
            onClick={() => setActive("Last week")}
            className={`px-4 py-1 text-sm rounded-md border ${
              active === "Last week"
                ? "bg-[#124734] text-white border-[#124734]"
                : "bg-white border-gray-300"
            }`}
          >
            Last week
          </button>

          <FiMoreVertical className="text-gray-600 cursor-pointer" />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        {metrics.map((item, index) => (
          <div key={index}>
            <h1 className="text-xl font-semibold text-[#124734]">{item.value}</h1>
            <p className="text-gray-500 text-sm">{item.label}</p>
          </div>
        ))}
      </div>

      {/* ⭐ Actual Chart (Replaces placeholder) */}
      {/* ⭐ Actual Chart (Replaces placeholder) */}
<div className="h-64 rounded-xl bg-gradient-to-b from-[#ECF5EE] to-white">
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
      
      {/* Gradient Area Under Line */}
      <defs>
        <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#124734" stopOpacity={0.3} />
          <stop offset="95%" stopColor="#124734" stopOpacity={0} />
        </linearGradient>
      </defs>

      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
      <XAxis dataKey="day" tick={{ fill: "#5B7065" }} />
      <YAxis tick={{ fill: "#5B7065" }} />

      <Tooltip
        contentStyle={{
          background: "white",
          borderRadius: "8px",
          border: "1px solid #A7E1B2",
        }}
      />

      <Line
        type="monotone"
        dataKey="value"
        stroke="#124734"
        strokeWidth={2}
        dot={{ r: 4, fill: "#124734" }}
        activeDot={{ r: 6, fill: "#124734" }}
      />

      <Area
        type="monotone"
        dataKey="value"
        stroke="none"
        fill="url(#colorGreen)"
      />
    </LineChart>
  </ResponsiveContainer>
</div>


    </div>
  );
}
