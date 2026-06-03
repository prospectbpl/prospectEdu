import React, { useState } from "react";
import { X } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import doubtImg from "../../assets/doubt.webp";
import { api } from "../../lib/api";

export default function AskDoubtModal({ open, onClose, onSuccess }) {
  const { showToast } = useToast();

  const [doubtType, setDoubtType] = useState("General");
  const [subject, setSubject] = useState("");
  const [question, setQuestion] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim()) return showToast("Please write your doubt", "error");

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("doubtType", doubtType);
      fd.append("subject", subject);
      fd.append("question", question);
      if (file) fd.append("file", file);

      await api.post("/support-tickets", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showToast("Your doubt has been submitted successfully!", "success");
      setQuestion("");
      setSubject("");
      setFile(null);

      onSuccess?.();
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to submit doubt", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden relative border border-[#E6F4EC]">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#5B7065] hover:text-[#124734] transition">
          <X size={26} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="hidden md:flex flex-col items-center justify-center bg-[#F2FAF5] p-10">
            <h2 className="text-2xl font-heading font-semibold text-[#124734] mb-6">Get Your Query Cleared!</h2>
            <img src={doubtImg} alt="ask-doubt" className="w-72 mb-8" />
            <div className="text-center">
              <p className="text-lg font-semibold text-[#124734] mb-2">Reach out to us</p>
              <p className="text-sm text-[#5B7065] mb-4">Get your question Answered</p>
              <div className="space-y-3">
                <button className="flex items-center gap-2 mx-auto px-4 py-2 rounded-full bg-[#E6F4EC] text-[#124734] hover:bg-[#D4EFE0] transition">
                  📞 +91 9752812898
                </button>
                <button className="flex items-center gap-2 mx-auto px-4 py-2 rounded-full bg-[#E6F4EC] text-[#124734] hover:bg-[#D4EFE0] transition">
                  ✉ prospectbpl@gmail.com
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-10">
            <h2 className="text-3xl font-heading font-semibold text-[#124734] mb-4">We are here to solve your Query</h2>

            <label className="text-sm font-medium text-[#124734]">* Enquiry Type</label>
            <select
              value={doubtType}
              onChange={(e) => setDoubtType(e.target.value)}
              className="w-full border border-[#CDE8D5] rounded-lg px-3 py-2 mt-1 mb-4 outline-none focus:border-[#009846] focus:ring-1 focus:ring-[#009846]"
              required
            >
              <option value="General">General Enquiry</option>
              <option value="Batch">Batch Related</option>
              <option value="Technical">Technical Issue</option>
            </select>

            <label className="text-sm font-medium text-[#124734]">Subject (optional)</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-[#CDE8D5] rounded-lg px-3 py-2 mt-1 mb-4 outline-none focus:border-[#009846] focus:ring-1 focus:ring-[#009846]"
              placeholder="e.g. DP / Physics / Fee / App issue"
            />

            <label className="text-sm font-medium text-[#124734]">* Query in words</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full border border-[#CDE8D5] rounded-lg px-3 py-2 mt-1 mb-4 outline-none focus:border-[#009846] focus:ring-1 focus:ring-[#009846]"
              rows={4}
              placeholder="Write your query here..."
              required
            />

            <p className="text-xs text-[#5B7065] mb-1">Attachment (optional): image/pdf</p>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mb-5"
            />

            <button
              type="submit"
              disabled={loading}
              className="bg-[#009846] text-white px-6 py-3 rounded-lg shadow-md hover:bg-[#007d39] transition w-full md:w-auto disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Your Query"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
