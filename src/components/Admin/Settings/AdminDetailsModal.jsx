// src/components/Admin/Settings/AdminDetailsModal.jsx
import { X, ShieldCheck, ShieldOff } from "lucide-react";

export default function AdminDetailsModal({ admin, onClose }) {
  if (!admin) return null;

  const active = admin.isActive !== false;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999] p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-[#E6F4EC] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#124734] to-[#0E5A3C] text-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Admin Details</h2>
            <p className="text-white/80 text-sm mt-0.5">
              Full profile and status information
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-semibold text-[#124734]">
                {admin.fullName || admin.name}
              </div>
              <div className="text-sm text-[#5B7065]">{admin.email}</div>
            </div>

            <span
              className={`inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full border ${
                active
                  ? "bg-[#E6F4EC] text-[#124734] border-[#A7E1B2]"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {active ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
              {active ? "Active" : "Blocked"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Info label="Phone" value={admin.phone || "-"} />
            <Info label="Role" value={admin.role || "admin"} />
            <Info
              label="Last Login"
              value={admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : "-"}
            />
            <Info
              label="Joined"
              value={admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "-"}
            />
          </div>

          {admin.adminApproval?.status && (
            <div className="rounded-xl border border-[#E6F4EC] bg-[#F9FAFB] p-4">
              <div className="text-sm font-semibold text-[#124734]">
                Approval Status
              </div>
              <div className="text-sm text-[#5B7065] mt-1">
                Status:{" "}
                <span className="font-medium text-[#124734]">
                  {admin.adminApproval.status}
                </span>
              </div>
              {admin.adminApproval.note ? (
                <div className="text-sm text-[#5B7065] mt-1">
                  Note: {admin.adminApproval.note}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E6F4EC] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#009846] text-white hover:bg-[#007d39] transition text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl border border-[#E6F4EC] p-3">
      <div className="text-xs text-[#5B7065]">{label}</div>
      <div className="text-sm font-medium text-[#124734] mt-0.5">{value}</div>
    </div>
  );
}
