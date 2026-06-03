import React from "react";

export default function AdminStatsGrid({ stats = [] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {stats.map((item) => (
        <div
          key={item.key}
          className="bg-white rounded-2xl shadow-md p-6 h-[160px] flex flex-col justify-between"
        >
          <h3 className="text-lg font-semibold text-[#124734]">{item.title}</h3>

          <p className="text-3xl font-bold text-[#124734]">{item.value}</p>

          <div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div
                className="h-full rounded-full"
                style={{
                  width: item.progress || "0%",
                  backgroundColor: item.barColor || "#1D5C3F",
                }}
              />
            </div>

            {item.text ? (
              <p className="text-sm text-gray-600 mt-2">{item.text}</p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
