import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import ErrorToast from "../ui/ErrorToast.jsx";
import { authApi } from "../../services/auth";

export default function SignupForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const [toastError, setToastError] = useState("");
  const role = location.state?.role || "I'm a Learner";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    state: "",
    city: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const mapRoleToBackend = (uiRole) => {
    if (uiRole === "I'm an Admin") return "admin";
    if (uiRole === "I'm a Teacher") return "teacher";
    if (uiRole === "I'm a Learner") return "student";
    if (uiRole === "I'm a Parent/Organisation") return "parent";
    return "student";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 6 || formData.confirmPassword.length < 6) {
      setToastError("Password must be at least 6 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setToastError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const backendRole = mapRoleToBackend(role);

      const payload = {
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        state: formData.state,
        city: formData.city,
        role: backendRole,
      };

      const res = await authApi.register(payload);
      // ✅ NEW: Admin pending approval flow (same as teacher)
      if (backendRole === "admin" && res.data?.pendingApproval) {
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("user");

        setToastError(
          res.data?.message || "Your admin request is pending approval."
        );

        navigate("/login", { replace: true });
        return;
      }

      // ✅ NEW: Teacher pending approval flow
      if (backendRole === "teacher" && res.data?.pendingApproval) {
        // make sure nothing is stored
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("user");

        setToastError(
          res.data?.message || "Your teacher account is pending admin approval."
        );

        // send them to login page
        navigate("/login", { replace: true });
        return;
      }

      const { accessToken, user } = res.data;

      sessionStorage.setItem("accessToken", accessToken);
      sessionStorage.setItem("user", JSON.stringify(user));
      setToastError("");

      if (backendRole === "student") navigate("/student-dashboard");
      else if (backendRole === "teacher") navigate("/teacher-dashboard");
      else if (backendRole === "parent") navigate("/parent-dashboard");
      else if (backendRole === "admin") navigate("/admin-dashboard");
      else navigate("/");
        } catch (err) {
      const status = err.response?.status;
      const backendMsg = err.response?.data?.message;

      // ✅ If teacher tries login later and it's pending (403), your Login page should show backendMsg
      if (status === 409) {
        setToastError(backendMsg || "Email/Phone already registered");
      } else if (status === 422) {
        setToastError(backendMsg || "Invalid input");
      } else if (status === 403) {
        setToastError(backendMsg || "Access denied");
      } else {
        setToastError(backendMsg || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

return (
    <>
      {toastError && (
        <ErrorToast message={toastError} onClose={() => setToastError("")} />
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        aria-label="Signup form"
        autoComplete="on"
      >
      
      <fieldset className="space-y-4">
        <legend className="sr-only">Create your ProspectEdu account</legend>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[#124734] mb-1">
            Name *
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Please enter your name"
            required
            autoComplete="name"
            className="w-full border border-[#A7E1B2] rounded-md px-4 py-2 focus:outline-none focus:border-[#009846]"
          />
        </div>

        {/* Email + Phone */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#124734] mb-1">
              Email *
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Please enter your email"
              required
              autoComplete="email"
              className="w-full border border-[#A7E1B2] rounded-md px-4 py-2 focus:outline-none focus:border-[#009846]"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-[#124734] mb-1">
              Phone Number *
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Please enter your phone number"
              required
              inputMode="numeric"
              autoComplete="tel"
              className="w-full border border-[#A7E1B2] rounded-md px-4 py-2 focus:outline-none focus:border-[#009846]"
            />
          </div>
        </div>

        {/* Password + Confirm */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#124734] mb-1">
              Password *
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Please enter your new password"
              required
              autoComplete="new-password"
              className="w-full border border-[#A7E1B2] rounded-md px-4 py-2 focus:outline-none focus:border-[#009846]"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#124734] mb-1">
              Confirm Password *
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Please confirm your password"
              required
              autoComplete="new-password"
              className="w-full border border-[#A7E1B2] rounded-md px-4 py-2 focus:outline-none focus:border-[#009846]"
            />
          </div>
        </div>

        {/* State + City */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-[#124734] mb-1">
              State *
            </label>
            <input
              id="state"
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="Please enter state"
              required
              autoComplete="address-level1"
              className="w-full border border-[#A7E1B2] rounded-md px-4 py-2 focus:outline-none focus:border-[#009846]"
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-[#124734] mb-1">
              City *
            </label>
            <input
              id="city"
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Please enter city"
              required
              autoComplete="address-level2"
              className="w-full border border-[#A7E1B2] rounded-md px-4 py-2 focus:outline-none focus:border-[#009846]"
            />
          </div>
        </div>

        {/* Submit */}
        <button
  type="submit"
  disabled={loading}
  className={`w-full py-2 rounded-md transition ${
    loading
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-[#124734] hover:bg-[#009846] text-white"
  }`}
>
  {loading ? "Registering..." : "Register"}
</button>


        {/* Login Redirect */}
        <p className="text-center text-sm text-[#5B7065] mt-4">
          Have an account?{" "}
          <Link to="/login" className="text-[#009846] font-medium hover:underline">
            Login
          </Link>
        </p>
      </fieldset>
    </form>
    </>
  );
} 