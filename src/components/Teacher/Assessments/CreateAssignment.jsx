import { Upload } from "lucide-react";

export default function CreateAssignment() {
  return (
    <div className="bg-white border border-[#A7E1B2] p-6 rounded-xl shadow-sm max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-[#124734] mb-4">Create Assignment</h2>

      <input
        className="w-full border border-[#A7E1B2] px-3 py-2 rounded-md mb-3"
        placeholder="Assignment Title"
      />

      <textarea
        className="w-full border border-[#A7E1B2] px-3 py-2 rounded-md mb-3"
        placeholder="Instructions..."
        rows={4}
      />

      <label className="cursor-pointer bg-[#009846] text-white px-4 py-2 rounded-md flex items-center gap-2 mb-3">
        <Upload size={16} />
        Upload File
        <input type="file" hidden />
      </label>

      <input
        type="date"
        className="w-full border border-[#A7E1B2] px-3 py-2 rounded-md mb-4"
      />

      <button className="bg-[#124734] text-white px-6 py-2 rounded-md hover:bg-[#0f3a2a]">
        Create Assignment
      </button>
    </div>
  );
}
