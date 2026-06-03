import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { authApi } from "../../services/auth";

export default function ChangePasswordForm() {
  const [show, setShow] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const { showToast } = useToast();

  const [passwords, setPasswords] = useState({
    old: "",
    new: "",
    confirm: "",
  });

  const [loading, setLoading] = useState(false);

  const toggle = (field) =>
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  const handleChange = (field, value) =>
    setPasswords((p) => ({ ...p, [field]: value }));

  const handleSubmit = async () => {
    if (loading) return;

    if (!passwords.old || !passwords.new || !passwords.confirm) {
      showToast("Please fill all fields", "error");
      return;
    }

    if (passwords.new !== passwords.confirm) {
      showToast("New passwords do not match", "error");
      return;
    }

    if (passwords.new.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    try {
      setLoading(true);

      await authApi.changePassword({
        oldPassword: passwords.old,
        newPassword: passwords.new,
        confirmPassword: passwords.confirm,
      });

      showToast(
        "Password updated successfully! Please login again.",
        "success"
      );

      // 🔐 logout user (backend already cleared refresh token)
      sessionStorage.removeItem("accessToken");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);

    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Failed to update password. Please try again.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
      setPasswords({ old: "", new: "", confirm: "" });
    }
  };

  return (
    <div className="bg-white border border-[#E6F4EC] rounded-xl shadow-sm p-6 sm:p-8 w-full sm:max-w-3xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-heading text-[#124734] mb-2">
        Change Password
      </h2>
      <p className="text-sm text-[#5B7065] mb-6">
        Update your account password
      </p>

      <div className="space-y-6">

        {/* OLD PASSWORD */}
        <PasswordInput
          label="Old Password"
          value={passwords.old}
          show={show.old}
          onToggle={() => toggle("old")}
          onChange={(v) => handleChange("old", v)}
        />

        {/* NEW PASSWORD */}
        <PasswordInput
          label="New Password"
          value={passwords.new}
          show={show.new}
          onToggle={() => toggle("new")}
          onChange={(v) => handleChange("new", v)}
        />

        {/* CONFIRM PASSWORD */}
        <PasswordInput
          label="Confirm New Password"
          value={passwords.confirm}
          show={show.confirm}
          onToggle={() => toggle("confirm")}
          onChange={(v) => handleChange("confirm", v)}
        />

        <button
          disabled={loading}
          onClick={handleSubmit}
          className={`
            mt-6 px-6 py-3 rounded-md text-white font-medium
            ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#009846] hover:bg-[#007d39]"}
          `}
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>
    </div>
  );
}

/* 🔁 Reusable Password Input */
function PasswordInput({ label, value, show, onToggle, onChange }) {
  return (
    <div>
      <label className="block text-sm mb-1 text-[#124734]">
        * {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-[#A7E1B2] rounded-lg px-4 py-2"
        />
        <span
          className="absolute right-3 top-2.5 cursor-pointer text-[#5B7065]"
          onClick={onToggle}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </span>
      </div>
    </div>
  );
}
