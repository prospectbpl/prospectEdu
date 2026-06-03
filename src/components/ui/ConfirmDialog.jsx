import { X } from "lucide-react";

export default function ConfirmDialog({ open, title, message, onCancel, onConfirm,confirmText, }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[5000]">
      <div className="bg-white w-[420px] rounded-xl shadow-xl p-6 border border-[#E6F4EC]">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[#124734]">{title}</h2>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded">
            <X size={18} />
          </button>
        </div>

        {/* Message */}
        <p className="text-sm text-[#5B7065] mb-6">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md bg-white border border-[#E6F4EC] text-[#124734] hover:bg-[#F3FFF7]"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
          >
           {confirmText|| "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
