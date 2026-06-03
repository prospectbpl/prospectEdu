import { useState } from "react";
import { Download, Eye } from "lucide-react";

export default function SubmissionListPage({ assignment, onBack, onEvaluate }) {
  // Example submissions (replace later with DB/localStorage)
  const submissions = [
    {
      id: 1,
      name: "Riya Sharma",
      status: "Submitted",
      score: "-",
      submittedAt: "2025-01-10",
      fileUrl: "/sample.pdf",
    },
    {
      id: 2,
      name: "Aman Verma",
      status: "Pending",
      score: "-",
      submittedAt: "-",
      fileUrl: null,
    },
    {
      id: 3,
      name: "Kunal Patel",
      status: "Evaluated",
      score: "18/20",
      submittedAt: "2025-01-09",
      fileUrl: "/sample.pdf",
    },
  ];

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [previewFile, setPreviewFile] = useState(null);

  // Apply both search + filter
  const filteredList = submissions
    .filter((s) =>
      filter === "All" ? true : s.status === filter
    )
    .filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="bg-white p-6 rounded-xl border border-[#A7E1B2] shadow-sm">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#124734]">
          Submissions – {assignment.title}
        </h2>

        <button
          onClick={onBack}
          className="text-[#009846] underline hover:text-[#007a37]"
        >
          ← Back
        </button>
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex gap-3 mb-4">
        {["All", "Submitted", "Pending", "Evaluated"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-md border text-sm ${
              filter === f
                ? "bg-[#009846] text-white border-[#009846]"
                : "border-[#A7E1B2] text-[#124734]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search student..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-[#A7E1B2] px-3 py-2 rounded-md mb-5"
      />

      {/* TABLE */}
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#E6F4EC] text-[#124734]">
            <th className="p-3 border">Name</th>
            <th className="p-3 border">Status</th>
            <th className="p-3 border">Score</th>
            <th className="p-3 border">Submitted At</th>
            <th className="p-3 border text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredList.map((s) => (
            <tr key={s.id} className="text-[#5B7065] hover:bg-[#F9FAFB]">
              <td className="p-3 border">{s.name}</td>
              <td className="p-3 border">{s.status}</td>
              <td className="p-3 border">{s.score}</td>
              <td className="p-3 border">{s.submittedAt}</td>

              <td className="p-3 border flex gap-4 justify-center">

                {/* VIEW BUTTON */}
                {s.fileUrl && (
                  <button
                    className="text-[#124734] hover:text-[#009846] flex items-center gap-1"
                    onClick={() => setPreviewFile(s.fileUrl)}
                  >
                    <Eye size={16} /> View
                  </button>
                )}

                {/* DOWNLOAD BUTTON */}
                {s.fileUrl ? (
                  <a
                    href={s.fileUrl}
                    download
                    className="flex items-center gap-1 text-[#124734] hover:text-[#009846]"
                  >
                    <Download size={16} /> Download
                  </a>
                ) : (
                  <span className="text-gray-400">No File</span>
                )}

                {/* EVALUATE BUTTON */}
                {s.status === "Submitted" && (
                  <button
                    onClick={() => onEvaluate(s)}
                    className="text-[#009846] underline"
                  >
                    Evaluate
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* EMPTY STATE */}
      {filteredList.length === 0 && (
        <p className="text-center mt-4 text-[#5B7065]">
          No submissions found.
        </p>
      )}

      {/* FILE PREVIEW MODAL */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white w-[85%] h-[85%] p-4 rounded-lg relative shadow-lg">

            {/* Close button */}
            <button
              onClick={() => setPreviewFile(null)}
              className="absolute top-3 right-3 text-red-500 text-xl"
            >
              ✕
            </button>

            {/* Preview iframe */}
            <iframe
              src={previewFile}
              className="w-full h-full rounded"
              title="File Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
}
