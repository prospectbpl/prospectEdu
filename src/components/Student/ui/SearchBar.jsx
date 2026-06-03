import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="relative">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B7065]"
      />
      <input
        type="text"
        placeholder="Search"
        className="pl-9 pr-4 py-2 rounded-md border border-[#124734]/30 focus:outline-none focus:ring-1 focus:ring-[#009846] text-sm"
      />
    </div>
  );
}