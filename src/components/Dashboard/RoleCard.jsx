import { ChevronRight } from "lucide-react";

export default function RoleCard({ title, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-6 py-4 rounded-md font-medium flex justify-between items-center
      transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md"
      style={{
        backgroundColor: color,
      }}
    >
      <span className="text-[#124734]">{title}</span>
      <ChevronRight
        size={18}
        className="text-[#124734] transition-transform duration-300 group-hover:translate-x-1"
      />
    </button>
  );
}

