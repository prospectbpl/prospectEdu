import { useState } from "react";
import CourseDropdown from "../Student/ui/CourseDropdown";
import SearchBar from "../Student/ui/SearchBar";
import NotificationBell from "../Student/ui/NotificationBell";
import ProfileAvatar from "../Student/ui/ProfileAvatar";
import StoreButton from "../Student/ui/StoreButton";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function TeacherTopbar({ isCollapsed = false, pageTitle }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <header
        className="
          w-full bg-white px-4 sm:px-6 py-3 
          flex items-center justify-between 
          shadow-sm relative
        "
      >
        {/* LEFT SECTION */}
        <div className="flex flex-col leading-tight min-w-[180px]">
          <p className="text-sm text-[#5B7065] font-body">
            Hello <span className="font-semibold text-[#124734]">Teacher</span>, Welcome Back!
          </p>

          <h2 className="text-lg font-heading font-semibold text-[#124734] -mt-1">
            {pageTitle || "Your Dashboard Today"}
          </h2>
        </div>

        {/* DESKTOP CONTROLS */}
        <div className="hidden md:flex items-center gap-4">
          <CourseDropdown role="teacher" />
          <StoreButton />
          <NotificationBell onClick={() => navigate("/teacher/announcements")} />

          <ProfileAvatar role="teacher" />
        </div>

        {/* MOBILE HAMBURGER */}
        <button
          className="md:hidden text-[#124734]"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </header>

      {/* MOBILE MENU (Slide-down) */}
     {mobileMenuOpen && (
  <div className="md:hidden bg-white shadow-lg border-t border-[#E6F4EC] px-4 py-4 space-y-4 z-40 flex flex-col items-start">

          {/* Course Dropdown */}
          <div>
            <CourseDropdown role="teacher" />
          </div>

          {/* HIDE SearchBar ON MOBILE */}
          {/* <SearchBar /> — NOT included intentionally */}

          {/* Store Button */}
          <div>
            <StoreButton />
          </div>

          {/* Notifications */}
          <div>
            <NotificationBell onClick={() => navigate("/teacher/announcements")} />
          </div>

          {/* Profile Avatar */}
          <div className="inline-block">
            <ProfileAvatar role="teacher" />
          </div>
        </div>
      )}
    </>
  );
}
