import { X } from "lucide-react";

export default function StudentProfileModal({ student, onClose }) {
  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 relative border border-[#A7E1B2]">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[#124734] hover:text-red-500"
        >
          <X size={22} />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-[#124734] mb-4">
          Student Profile
        </h2>

        {/* Student Basic Info */}
        <div className="mb-4">
          <p className="text-lg font-medium text-[#124734]">{student.name}</p>
          <p className="text-sm text-[#5B7065]">{student.email}</p>
        </div>

        {/* Progress Section */}
        <div className="mb-5">
          <p className="font-medium text-[#124734]">Course Progress</p>
          <div className="w-full bg-[#E6F4EC] h-3 rounded-full mt-1">
            <div
              className="bg-[#009846] h-3 rounded-full"
              style={{ width: `${student.progress}%` }}
            ></div>
          </div>
          <span className="text-xs text-[#5B7065]">{student.progress}% completed</span>
        </div>

        {/* Last Active */}
        <div className="mb-5">
          <p className="font-medium text-[#124734]">Last Active</p>
          <p className="text-[#5B7065]">{student.lastActive}</p>
        </div>

        {/* Activity Timeline */}
        <div className="mb-5">
          <p className="font-medium text-[#124734] mb-2">Recent Activity</p>

          <ul className="text-sm text-[#5B7065] space-y-1">
            <li>📘 Watched lessons (example data)</li>
            <li>📝 Submitted Assignment 1</li>
            <li>❓ Attempted Quiz 1</li>
            <li>📅 Joined course recently</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <button className="px-4 py-2 rounded-md border border-[#A7E1B2] hover:bg-[#F3FAF6]">
            Download Report
          </button>

          <button className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">
            Remove Student
          </button>
        </div>

      </div>
    </div>
  );
}
