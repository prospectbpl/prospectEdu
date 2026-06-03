import React, { useState } from "react";
import { useToast } from "../../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../../ui/ConfirmDialog";
import { api } from "../../../lib/api";

export default function AddAnnouncementForm() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("General");

  // ✅ recipients multi-select
  const [recipients, setRecipients] = useState(["student"]);

  const [confirmCancel, setConfirmCancel] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleRecipient = (value) => {
    setRecipients((prev) =>
      prev.includes(value)
        ? prev.filter((r) => r !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !desc) {
      showToast("Please fill all required fields!", "error");
      return;
    }

    if (recipients.length === 0) {
      showToast("Please select at least one recipient!", "error");
      return;
    }

    try {
      setLoading(true);

      await api.post("/announcements", {
        title,
        description: desc,
        recipients,
      });

      showToast("Announcement created successfully!", "success");
      navigate("/admin/announcements");
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Announcement not saved",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Title */}
        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Announcement Title"
            className="border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={4}
            placeholder="Enter announcement details..."
            className="border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        {/* Category (UI only) */}
        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2"
          >
            <option>General</option>
            <option>Exam</option>
            <option>Holiday</option>
            <option>Urgent</option>
          </select>
        </div>

        {/* Send To */}
        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-2">
            Send To *
          </label>

          <div className="flex gap-4">
            {["student", "teacher", "parent"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => toggleRecipient(r)}
                className={`px-4 py-2 rounded-lg border transition
                  ${
                    recipients.includes(r)
                      ? "bg-[#124734] text-white border-[#124734]"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#124734] text-white px-6 py-2 rounded-md hover:bg-[#0E3A2B] transition disabled:opacity-60"
          >
            {loading ? "Saving..." : "Publish Announcement"}
          </button>

          <button
            type="button"
            onClick={() => setConfirmCancel(true)}
            className="bg-red-400 text-white px-6 py-2 rounded-md hover:bg-red-500 transition"
          >
            Cancel
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={confirmCancel}
        title="Cancel Announcement?"
        message="Are you sure? All unsaved data will be lost."
        onConfirm={() => navigate("/admin/announcements")}
        onCancel={() => setConfirmCancel(false)}
      />
    </div>
  );
}
