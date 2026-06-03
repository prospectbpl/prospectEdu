import { Search } from "lucide-react";

export default function DoubtSearchBar({ value, onChange }) {
  return (
    <div className="mb-3">
      <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2">
        <Search size={16} className="text-[#124734] mr-2" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search doubts..."
          className="outline-none text-sm w-full"
        />
      </div>
    </div>
  );
}
