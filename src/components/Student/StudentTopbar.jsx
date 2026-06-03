// src/components/Student/StudentTopbar.jsx
import { useState} from "react";
import CourseDropdown from "./ui/CourseDropdown";
import StoreButton from "./ui/StoreButton";
import NotificationBell from "./ui/NotificationBell";
import ProfileAvatar from "./ui/ProfileAvatar";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";


export default function StudentTopbar({ isCollapsed = false, pageTitle }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 const navigate = useNavigate();

  return (
    <>
      <header
        className="
          w-full bg-white px-4 sm:px-6 py-3 
          flex items-center justify-between 
          relative
        "
      >
        {/* LEFT — Title/Greeting */}
        <div className="min-w-[180px]">
          {pageTitle ? (
            <h2 className="text-lg font-heading font-semibold text-[#124734]">
              {pageTitle}
            </h2>
          ) : (
            <>
              <p className="text-sm text-[#5B7065] font-body">
                Hello , Welcome Back!
              </p>
              <h2 className="text-lg font-heading font-semibold text-[#124734]">
                Your Dashboard Today
              </h2>
            </>
          )}
        </div>

        {/* DESKTOP RIGHT CONTROLS */}
        <div className="hidden md:flex items-center gap-4">
          <CourseDropdown />
          <StoreButton />
          <NotificationBell onClick={() => navigate("/student/announcements")} />
          <ProfileAvatar />
        </div>

        {/* MOBILE HAMBURGER BUTTON */}
        <button
          className="md:hidden text-[#124734]"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </header>

      {/* MOBILE DROPDOWN MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg border-t border-[#E6F4EC] px-4 py-4 space-y-4 z-40 flex flex-col items-start">


          {/* Course Dropdown */}
          <div>
            <CourseDropdown />
          </div>

          {/* Hiding SearchBar on mobile (DO NOT RENDER IT) */}

          {/* Store Button */}
          <div>
            <StoreButton />
          </div>

          {/* Notifications */}
          <div>
            <NotificationBell onClick={() => navigate("/student/announcements")} />
          </div>

          {/* Profile */}
         <div className="inline-block">
  <ProfileAvatar />
</div>

        </div>
      )}
    </>
  );
}

