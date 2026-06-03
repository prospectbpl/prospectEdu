import React from "react";

export default function CategoryTabs({ active, setActive }) {
  const tabs = ["All Products", "Trending Products"];

  return (
    <div className="flex gap-3 bg-white p-3 rounded-xl shadow mb-4">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => setActive(t)}
          className={`px-4 py-2 rounded-lg text-sm 
          ${
            active === t
              ? "bg-[#124734] text-white"
              : "bg-[#ECF5EE] text-[#124734]"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
