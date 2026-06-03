import React from "react";

export default function TransactionTabs({ active, setActive }) {
  const tabs = ["All order (240)", "Completed", "Pending", "Cancelled"];

  return (
    <div className="flex items-center gap-3 mb-4">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => setActive(t)}
          className={`px-4 py-2 rounded-md text-sm border 
            ${active === t ? "bg-[#124734] text-white border-[#124734]" : "bg-white"}`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
