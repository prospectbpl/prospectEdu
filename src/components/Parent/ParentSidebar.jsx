import {
  LayoutDashboard,
  Users2,
  BarChart3,
  MessageSquare,
  Bell,
  CreditCard,
  Settings,
  LogOut,
  ArrowLeft,
  ArrowRight,
  FileText,
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";

export default function ParentSidebar({ isCollapsed, setIsCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/parent-dashboard",
    },
    {
      label: "My Students",
      icon: Users2,
      path: "/parent/students",
    },
    {
      label: "Messages",
      icon: MessageSquare,
      path: "/parent/messages",
    },
    {
      label: "Announcements",
      icon: Bell,
      path: "/parent/announcements",
    },
    {
      label: "Payments",
      icon: CreditCard,
      path: "/parent/payments",
    },
     {
      label: "Individual Reports",
      icon: FileText,
      path: "/parent/reports-certifications",
    },
    {
      label: "Settings",
      icon: Settings,
      path: "/parent/settings",
    },

  ];

  return (
    <aside
      className={`bg-[#124734] text-white h-screen flex flex-col justify-between shadow-lg transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo Section */}
      <div>
        <div
          className={`flex items-center gap-3 px-6 py-6 border-b border-[#A7E1B2]/40 transition-all duration-300 ${
            isCollapsed ? "justify-center" : "justify-start"
          }`}
        >
          <img
            src="/src/assets/logo.png.webp"
            alt="ProspectEdu Logo"
            className="h-10 w-10 rounded-full object-cover border border-[#A7E1B2]/50"
          />

          {!isCollapsed && (
            <h2 className="text-xl font-heading font-semibold text-[#A7E1B2]">
              ProspectEdu
            </h2>
          )}
        </div>

        {/* Menu Items */}
        <nav className="mt-4 space-y-1 flex-1 overflow-y-auto">
          {menu.map(({ label, icon: Icon, path }) => {
            const active = location.pathname.startsWith(path);

            return (
              <div
                key={label}
                onClick={() => navigate(path)}
                className={`flex items-center gap-3 px-6 py-3 cursor-pointer transition-all duration-200 font-body ${
                  active
                    ? "bg-[#009846]/20 text-[#A7E1B2] border-l-4 border-[#009846]"
                    : "text-[#E6F4EC] hover:bg-[#009846]/10 hover:text-[#A7E1B2]"
                } ${isCollapsed ? "justify-center" : ""}`}
              >
                <Icon size={18} />
                {!isCollapsed && <span className="text-sm">{label}</span>}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Collapse Button */}
      <div className="p-4 border-t border-[#A7E1B2]/30 flex justify-center">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-full bg-[#009846]/80 hover:bg-[#009846] transition-all duration-300"
        >
          {isCollapsed ? (
            <ArrowRight size={20} color="#fff" />
          ) : (
            <ArrowLeft size={20} color="#fff" />
          )}
        </button>
      </div>
    </aside>
  );
}
