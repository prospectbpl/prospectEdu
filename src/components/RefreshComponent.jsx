// src/components/RefreshComponent.jsx
import { RotateCw } from "lucide-react";

export default function RefreshComponent({ message, onRefresh }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 bg-[#F9FAFB] rounded-lg">
      {/* Illustration */}
      <div className="mb-6">
        <img
          src="/src/assets/empty-state.webp"
          alt="Empty State"
          className="w-40 h-40 mx-auto"
        />
      </div>

      {/* Message */}
      <p className="text-sm text-[#5B7065] mb-4">
        {message || "No data available at the moment."}
      </p>

      {/* Refresh Button */}
      <button
        onClick={onRefresh}
        className="flex items-center gap-2 bg-[#009846] hover:bg-[#007b39] text-white font-medium px-5 py-2.5 rounded-md transition-all duration-300"
      >
        <RotateCw size={18} />
        Refresh
      </button>
    </div>
  );
}
