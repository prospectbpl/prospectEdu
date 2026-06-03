import React from "react";
import { FiSearch } from "react-icons/fi";

export default function OrderTabs({ active, setActive, search, setSearch }) {
  const tabs = ["All Orders", "Completed", "Pending", "Cancelled"];

  return (
    <div className="flex items-center justify-between bg-white p-5 rounded-xl shadow mb-4 mt-4">

      {/* LEFT SIDE — TABS */}
      <div className="flex gap-4">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={`px-5 py-2.5 rounded-lg text-sm 
            ${
              active === t
                ? "bg-[#124734] text-white"
                : "bg-[#ECF5EE] text-[#124734]"
            } 
            transition`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* RIGHT SIDE — SEARCH BOX */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search order"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm w-72 
          focus:outline-none focus:ring-2 focus:ring-[#124734]"
        />

        {/* Search Icon */}
        <FiSearch
          size={18}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
        />
      </div>

    </div>
  );
}
