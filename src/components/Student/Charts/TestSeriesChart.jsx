// src/components/Student/Charts/TestSeriesChart.jsx
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function TestSeriesChart() {
  const data = [
    { date: "8th Nov", tests: 2 },
    { date: "9th Nov", tests: 1 },
    { date: "10th Nov", tests: 0 },
    { date: "11th Nov", tests: 1 },
    { date: "12th Nov", tests: 3 },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h4 className="text-md font-semibold text-[#124734] mb-4">Test Series</h4>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="tests" fill="#009846" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
