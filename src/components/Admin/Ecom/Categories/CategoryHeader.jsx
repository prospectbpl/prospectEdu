import React from "react";
import { FiMoreHorizontal } from "react-icons/fi";

export default function CategoryHeader({ onAddCategory, onEditCategory }) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-xl font-semibold text-[#124734]">Discover</h1>

      <div className="flex items-center gap-3">
        
        <button
          className="bg-[#124734] text-white px-4 py-2 rounded-md"
          onClick={onAddCategory}
        >
          Add Category
        </button>

        {/* ⭐ OPEN EDIT CATEGORY MODAL */}
        <button
          className="bg-[#124734] text-white px-4 py-2 rounded-md"
          onClick={onEditCategory}
        >
          Edit Category
        </button>

      </div>
    </div>
  );
}
