export default function LogoutModal({ open, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[3000]">
      <div className="bg-white p-6 rounded-xl shadow-lg w-[380px]">
        <p className="text-lg font-semibold text-[#124734] mb-6">
          Are You Sure You Want To Logout?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-[#124734]"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-5 py-2 bg-[#009846] hover:bg-[#007d39] transition text-white rounded-md"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
