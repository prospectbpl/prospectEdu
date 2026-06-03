import { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import StoreButton from "../Student/ui/StoreButton";
import NotificationBell from "../Student/ui/NotificationBell";
import ProfileAvatar from "../Student/ui/ProfileAvatar";

export default function ParentTopbar({
  pageTitle = "Dashboard",
  students = [],
  selectedStudent,
  onSelectStudent,
  showStudentSwitcher = true,
}) {
  const navigate = useNavigate();

  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const studentRef = useRef(null);

  // Close student dropdown on outside click
  useEffect(() => {
    const close = (e) => {
      if (studentRef.current && !studentRef.current.contains(e.target)) {
        setStudentDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <>
      {/* TOPBAR */}
      <header className="w-full h-[64px] bg-white shadow-sm flex items-center justify-between px-4 sm:px-6 sticky top-0 z-[9999] relative">

        {/* LEFT — Title */}
        <div>
          <p className="text-sm text-[#5B7065]">
            Welcome back,{" "}
            <span className="text-[#124734] font-semibold">Parent!</span>
          </p>
          <h2 className="text-lg font-semibold text-[#124734] -mt-1">
            {pageTitle}
          </h2>
        </div>

        {/* RIGHT CONTROLS (DESKTOP) */}
        <div className="hidden md:flex items-center gap-4">

          

          <StoreButton />
          <NotificationBell
            onClick={() => navigate("/parent/announcements")}
          />
          <ProfileAvatar role="parent" />
        </div>

        {/* MOBILE HAMBURGER BUTTON */}
        <button
          className="md:hidden text-[#124734]"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu size={26} />
        </button>
      </header>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[2000] md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* MOBILE MENU DRAWER */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-xl p-5 z-[2001] transform transition-transform duration-300 md:hidden
          ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-[#124734]"
          onClick={() => setMobileMenuOpen(false)}
        >
          <X size={26} />
        </button>

        <h2 className="text-lg font-semibold text-[#124734] mb-6 mt-6">
          Menu
        </h2>

        <div className="space-y-5 flex flex-col items-start">

          {/* STUDENT SWITCHER (mobile full width) */}
          {showStudentSwitcher && (
            <div className="w-full">
              <p className="text-sm text-[#124734] font-medium mb-1">
                Select Student
              </p>

              <select
                value={selectedStudent?.id || ""}
                onChange={(e) => {
                  const s = students.find((x) => x.id === e.target.value);
                  if (s) onSelectStudent(s);
                }}
                className="w-full border px-3 py-2 rounded-md text-sm"
              >
                <option value="">Choose Student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Store */}
          <StoreButton />

          {/* Notifications */}
          <NotificationBell
            onClick={() => {
              navigate("/parent/announcements");
              setMobileMenuOpen(false);
            }}
          />

          {/* Profile */}
          <ProfileAvatar role="parent" />
        </div>
      </div>
    </>
  );
}
