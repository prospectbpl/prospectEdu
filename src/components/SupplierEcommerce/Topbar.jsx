import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart, FaUserCircle } from "react-icons/fa";
import { FiEdit2, FiLock, FiLogOut, FiChevronDown } from "react-icons/fi";

export default function SupplierTopbar({ pageTitle }) {
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // close dropdown on outside click
  useEffect(() => {
    const onDown = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // close on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const logout = () => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("user");
    setOpen(false);
    navigate("/ecommerce-home");
  };

  return (
    <header
      className="bg-white px-4 md:px-6 py-3 flex items-center justify-between shadow-sm w-full 
      sticky top-0 z-40"
    >
      {/* LEFT SECTION */}
      <div className="flex flex-col leading-tight">
        <h2 className="text-base md:text-lg font-semibold text-[#124734]">
          {pageTitle || "Your Dashboard Today"}
        </h2>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* STORE BUTTON */}
        <button
          onClick={() => (window.location.href = "/shop")}
          className="flex items-center gap-2 bg-[#A7E1B2]/30 px-3 md:px-4 py-2 
          rounded-md hover:bg-[#009846]/20 transition text-sm md:text-base"
        >
          <FaShoppingCart size={18} className="text-[#124734]" />
          <span className="font-semibold text-[#124734] hidden sm:inline">
            Store
          </span>
        </button>

        {/* PROFILE DROPDOWN */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((s) => !s)}
            className="flex items-center gap-2 p-2 bg-[#A7E1B2]/40 rounded-full hover:bg-[#A7E1B2] transition"
            aria-haspopup="menu"
            aria-expanded={open}
          >
            <FaUserCircle className="text-[#124734]" size={22} />
            <FiChevronDown className="text-[#124734] hidden sm:block" size={16} />
          </button>

          {open && (
            <div
              className="absolute right-0 mt-3 w-64 rounded-2xl bg-white shadow-xl border border-[#A7E1B2]/50 overflow-hidden"
              role="menu"
            >
              

              {/* Items */}
              <div className="py-2">
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/supplier/edit-profile");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#A7E1B2]/20 transition"
                  role="menuitem"
                >
                  <span className="w-9 h-9 rounded-xl bg-[#A7E1B2]/30 flex items-center justify-center">
                    <FiEdit2 className="text-[#124734]" />
                  </span>
                  <div className="leading-tight">
                    <p className="font-semibold text-[#124734]">Edit Profile</p>
                    <p className="text-xs text-gray-600">Update your info</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/supplier/change-password");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#A7E1B2]/20 transition"
                  role="menuitem"
                >
                  <span className="w-9 h-9 rounded-xl bg-[#A7E1B2]/30 flex items-center justify-center">
                    <FiLock className="text-[#124734]" />
                  </span>
                  <div className="leading-tight">
                    <p className="font-semibold text-[#124734]">Change Password</p>
                    <p className="text-xs text-gray-600">Secure your account</p>
                  </div>
                </button>

                <div className="my-2 border-t border-[#A7E1B2]/40" />

                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 transition"
                  role="menuitem"
                >
                  <span className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                    <FiLogOut className="text-red-700" />
                  </span>
                  <div className="leading-tight">
                    <p className="font-semibold text-red-700">Logout</p>
                  </div>
                </button>
              </div>

              
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
