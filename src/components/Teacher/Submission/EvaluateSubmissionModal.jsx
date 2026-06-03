import { X } from "lucide-react";
import { useState } from "react";

export default function EvaluateSubmissionModal({ submission, onClose }) {
  const [score, setScore] = useState("");
  const [remarks, setRemarks] = useState("");

  if (!submission) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-xl p-6 rounded-xl shadow-lg">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#124734]">
            Evaluate Submission
          </h2>

          <X 
            size={24} 
            className="cursor-pointer text-[#124734]" 
            onClick={onClose} 
          />
        </div>

        <p className="text-[#5B7065] mb-2">
          Student: <span className="font-medium text-[#124734]">{submission.student}</span>
        </p>

        <a
          href="#"
          className="text-[#009846] underline mb-4 block"
        >
          View Uploaded File
        </a>

        <input
          type="number"
          placeholder="Score"
          className="w-full border border-[#A7E1B2] px-3 py-2 rounded-md mb-3"
          value={score}
          onChange={(e) => setScore(e.target.value)}
        />

        <textarea
          placeholder="Remarks..."
          className="w-full border border-[#A7E1B2] px-3 py-2 rounded-md mb-4"
          rows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />

        <button className="w-full bg-[#009846] text-white py-2 rounded-md">
          Submit Evaluation
        </button>
      </div>
    </div>
  );
}
