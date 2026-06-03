// src/components/Student/Charts/ActivityChart.jsx
import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function ActivityChart() {
  const data = [
    { name: "Completed", value: 70 },
    { name: "Pending", value: 30 },
  ];
  const COLORS = ["#009846", "#E6E8FA"];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h4 className="text-md font-semibold text-[#124734] mb-4">Activity</h4>
      <div className="flex justify-center items-center h-[220px]">
        <ResponsiveContainer width="80%" height="80%">
          <PieChart>
            <Pie data={data} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
