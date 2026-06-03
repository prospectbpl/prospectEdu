import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { useToast } from "../../../context/ToastContext";

function normalizePhone(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^0-9+]/g, "");
}

function isProbablyValidPhone(p) {
  const digits = String(p || "").replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

export default function AddChildModal({ onClose, onAdd }) {
  const { showToast } = useToast();
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const phoneClean = useMemo(() => normalizePhone(phone), [phone]);

  const submit = async () => {
    const p = normalizePhone(phone);

    if (!p || !isProbablyValidPhone(p)) {
      showToast("Please enter a valid phone number", "error");
      return;
    }

    try {
      setSaving(true);
      await onAdd(p); // ParentSettingsPage will call API + update list
      onClose();
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to add child", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-[#E6F4EC] shadow-xl p-6 w-full max-w-[520px]">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#124734]">Add New Child</h3>
            <p className="text-sm text-[#5B7065] mt-1">
              Enter the child&apos;s phone number to link them with this parent account.
            </p>
          </div>

          <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4">
          <label className="text-xs text-[#5B7065]">Child phone number</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-2 p-2 border border-[#E6F4EC] rounded-md w-full outline-[#009846]"
            placeholder="e.g. +91 98765 43210"
            inputMode="tel"
          />
          {!!phoneClean && (
            <p className="text-xs text-[#98A6A2] mt-2">
              We&apos;ll fetch the child&apos;s name &amp; email from the system.
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-white border border-[#E6F4EC]"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="px-4 py-2 rounded-md bg-[#009846] text-white hover:bg-[#0e3a29] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Adding..." : "Add Child"}
          </button>
        </div>
      </div>
    </div>
  );
}
