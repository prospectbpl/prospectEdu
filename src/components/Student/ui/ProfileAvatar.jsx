import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import LogoutModal from "../../Profile/LogoutModal";
import { activityApi } from "../../../services/activity";
import { authApi } from "../../../services/auth"; 
export default function ProfileAvatar({ role = "student" }) {
  const [open, setOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [me, setMe] = useState({ fullName: "", phone: "" });

  const buttonRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const close = (e) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  useEffect(() => {
  (async () => {
    try {
      const token = sessionStorage.getItem("accessToken");
      if (!token) return;

      const res = await authApi.me(token);

      // adjust depending on response shape:
      const user = res?.data?.user || res?.data || {};

      setMe({
        fullName: user.fullName || "",
        phone: user.phone || "",
      });
    } catch (err) {
      console.error("Failed to load user:", err?.response?.data || err.message);
    }
  })();
}, []);
useEffect(() => {
  const refresh = async () => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) return;
    const res = await authApi.me(token);
    const user = res?.data?.user || res?.data || {};
    setMe({ fullName: user.fullName || "", phone: user.phone || "" });
  };

  window.addEventListener("profile_refresh", refresh);
  return () => window.removeEventListener("profile_refresh", refresh);
}, []);


  const [coords, setCoords] = useState({ top: 0, left: 0 });

const toggle = () => {
  if (buttonRef.current) {
    const rect = buttonRef.current.getBoundingClientRect();

    let leftPosition = rect.right + window.scrollX - 224;

    // ⭐ Fix for collapsed sidebar OR being near the left edge
    if (rect.left < 120) {
      leftPosition = rect.left; // align dropdown directly below avatar
    }

    // ⭐ Mobile fix — prevent overflow
    if (window.innerWidth < 500) {
      leftPosition = Math.min(
        window.innerWidth - 240,
        Math.max(10, rect.left)
      );
    }

    setCoords({
      top: rect.bottom + window.scrollY + 8,
      left: leftPosition,
    });
  }

  setOpen((v) => !v);
};

const handleNavigate = async (path, title) => {
  // ✅ Only students should log activity
  if (role === "student") {
    try {
      const token = sessionStorage.getItem("accessToken");
      if (token) {
        await activityApi.log({
          type: path,                 // unique
          title: title || "Profile",  // readable
          route: path,
        });

        // refresh RecentActivity in same tab
        window.dispatchEvent(new Event("activity_refresh"));
      }
    } catch (e) {
      console.error(
        "ProfileAvatar activity log failed:",
        e?.response?.status,
        e?.response?.data
      );
    }
  }

  navigate(path);
  setOpen(false);
};


  // 🔥 MENU LIST BASED ON ROLE
  const MENU_ITEMS =
    role === "teacher"
      ? [
          { label: "Edit Profile", path: "/teacher/edit-profile" },
          { label: "Change Password", path: "/teacher/change-password" },
          { label: "Doubts", path: "/teacher/queries/doubts" },
        ]
      : role === "parent"
      ? [
          { label: "Edit Profile", path: "/parent/settings" },
          { label: "Payments", path: "/parent/payments" },
          { label: "Change Password", path: "/parent/change-password" },
        ]
      : role === "admin"
      ? [
          { label: "Change Password", path: "/admin/change-password" },
        ]
      : [
          // STUDENT
          { label: "Edit Profile", path: "/student/edit-profile" },
          { label: "Change Password", path: "/student/change-password" },
          { label: "Doubts", path: "/student/doubts" },
        ];

  // 🔥 PROFILE CARD CLICK DESTINATION
  const PROFILE_REDIRECT =
    role === "teacher"
      ? "/teacher-dashboard"
      : role === "parent"
      ? "/parent-dashboard"
      : role === "admin"
      ? "/admin-dashboard"
      : "/student-dashboard";

  return (
    <>
      {/* Avatar */}
      <div ref={buttonRef}>
        <div
          onClick={toggle}
          className="p-[2px] rounded-full bg-[#A7E1B2]/40 hover:bg-[#009846]/30 cursor-pointer transition inline-block"
        >
          <img
            src="/src/assets/profile.webp"
            alt="User Avatar"
            className="h-8 w-8 rounded-full object-cover"
          />
        </div>
      </div>

      {/* Dropdown */}
      {open &&
        createPortal(
          <div
            className="w-56 bg-white border border-[#A7E1B2]/30 shadow-lg rounded-lg overflow-hidden"
            style={{
              position: "absolute",
              top: coords.top,
              left: coords.left,
              zIndex: 2000,
            }}
          >
            {/* PROFILE HEADER */}
            <div
              onMouseDown={() => handleNavigate(PROFILE_REDIRECT, "Profile")}
              className="px-4 py-3 border-b border-[#A7E1B2]/30 hover:bg-[#F9FAFB] cursor-pointer transition"
            >
<p className="font-semibold text-[#124734]">{me.fullName || "—"}</p>
<p className="text-sm text-[#5B7065]">
  {me.phone ? `+91 ${me.phone}` : "—"}
</p>

            </div>

            {/* MENU LIST */}
            <ul className="text-sm text-[#124734]">
              {MENU_ITEMS.map((item, idx) => (
                <li
                  key={idx}
                  onMouseDown={() => handleNavigate(item.path, item.label)}
                  className="px-4 py-2 hover:bg-[#A7E1B2]/20 cursor-pointer transition"
                >
                  {item.label}
                </li>
              ))}

              {/* Logout */}
              <li
                onMouseDown={() => {
                  setOpen(false);
                  setShowLogout(true);
                }}
                className="px-4 py-2 hover:bg-[#009846]/20 text-[#D64545] cursor-pointer font-medium transition"
              >
                Logout
              </li>
            </ul>
          </div>,
          document.body
        )}

      {/* Logout Modal */}
      <LogoutModal
        open={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={() => {
          setShowLogout(false);
          navigate("/");
        }}
      />
    </>
  );
}
