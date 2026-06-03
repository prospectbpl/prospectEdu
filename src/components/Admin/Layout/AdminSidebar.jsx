import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  CreditCard,
  ShoppingBag,
  Megaphone,
  Settings,
  LogOut,
  Boxes,
  Award,
  Trophy ,
  Inbox,
  PhoneCall,
  Briefcase,
  BookOpen,
  UserCog,
} from "lucide-react";

import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";

export default function AdminSidebar({ isCollapsed, setIsCollapsed }) {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (index) => {
    setOpenMenu(openMenu === index ? null : index);
  };

  const menu = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/admin-dashboard" },

    
    {
      title: "Students",
      icon: Users,
      children: [
        { label: "All Students", path: "/admin/students" },
      ],
    },

    {
      title: "Teachers",
      icon: GraduationCap,
      children: [
        { label: "All Teachers", path: "/admin/teachers" },
        { label: "Confirm Teacher", path: "/admin/confirmTeacher" },
      ],
    },

    {
      title: "Courses",
      icon: BookOpen,
      children: [
        { label: "All Courses", path: "/admin/courses" },
        { label: "Add Course", path: "/admin/courses/add" },
        { label: "Category", path: "/admin/courses/category" },
        {label: "Course Purchase List", path: "/admin/courses/purchaseList"},
      ],
    },

    {
      title: "Fees",
      icon: CreditCard,
      children: [
        { label: "Test Series Fees Collection", path: "/admin/fees/collection" },
      ],
    },
    { title: "Scholarship", icon: Award, path: "/admin/scholarship" },

    {
      title: "E-Commerce",
      icon: ShoppingBag,
      children: [
        { label: "Add Product", path: "/admin/ecom/products/add" },
        { label: "Purchase List", path: "/admin/ecom/products/purchase" },

        { label: "All Categories", path: "/admin/ecom/categories" },
        { label: "Supplier Approval", path: "/admin/ecom/suppliers" },


        { label: "All Orders", path: "/admin/ecom/orders" },
      ],
    },  
    

    {
      title: "Announcements",
      icon: Megaphone,
      children: [
        { label: "All Announcements", path: "/admin/announcements" },
        { label: "Create Announcement", path: "/admin/announcements/create" },
      ],
    },
    {
  title: "Career",
  icon: Briefcase,
  children: [
    { label: "Post Job", path: "/admin/career/jobs" },
    { label: "Applications", path: "/admin/career/applications" },
  ],
},

    
    { title: "Achievers", icon: Trophy, path: "/admin/achievers" },
    { title: "Doubts", icon: Inbox, path: "/admin/doubts" },
    { title: "Contacts", icon: PhoneCall, path: "/admin/contacts" },
    { title: "Donations", icon: CreditCard, path: "/admin/donations" },
    { title: "Confirm Admin", icon: UserCog, path: "/admin/confirm-admin" },
    { title: "Settings", icon: Settings, path: "/admin/settings" },
    
  ];

  return (
    <aside
      className={`bg-[#124734] text-white h-screen flex flex-col justify-between shadow-lg transition-all duration-300 
      overflow-y-auto scrollbar-thin scrollbar-thumb-[#0B2F23] scrollbar-track-[#124734] 
      ${isCollapsed ? "w-20" : "w-64"}`}
    >
      {/* LOGO */}
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
              Admin Panel
            </h2>
          )}
        </div>

        {/* MENU */}
        <nav
          className="mt-4 space-y-1 flex-1 overflow-y-auto 
          scrollbar-thin scrollbar-thumb-[#0B2F23] scrollbar-track-[#124734]"
        >
         {menu.map((item, index) => (
  <div key={index}>
    {/* IF ITEM HAS NO CHILDREN — USE NAVLINK */}
    {!item.children ? (
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          `flex items-center gap-3 px-6 py-3 w-full transition-all duration-200 
          ${isActive
            ? "bg-[#009846]/20 text-[#A7E1B2] border-l-4 border-[#009846]"
            : "text-[#E6F4EC] hover:bg-[#009846]/10 hover:text-[#A7E1B2]"}
          ${isCollapsed ? "justify-center" : ""}`
        }
      >
        <item.icon size={18} />
        {!isCollapsed && <span className="text-sm">{item.title}</span>}
      </NavLink>
    ) : (
      <>
        {/* IF ITEM HAS CHILDREN — USE BUTTON */}
        <button
          onClick={() => toggleMenu(index)}
          className={`flex items-center gap-3 px-6 py-3 w-full text-left transition-all duration-200 
          ${isCollapsed ? "justify-center" : ""}`}
        >
          <item.icon size={18} />
          {!isCollapsed && <span className="text-sm">{item.title}</span>}
        </button>

        {/* DROPDOWN CHILDREN */}
        {openMenu === index && !isCollapsed && (
          <div className="ml-10 mt-1 space-y-1">
            {item.children.map((child, idx) => (
              <NavLink
                key={idx}
                to={child.path}
                className={({ isActive }) =>
                  `block px-3 py-2 text-sm rounded transition-all duration-200 
                  ${isActive
                    ? "text-[#A7E1B2] bg-[#009846]/10"
                    : "text-[#E6F4EC] hover:text-[#A7E1B2] hover:bg-[#009846]/5"}`
                }
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </>
    )}
  </div>
))}

        </nav>
      </div>

      {/* COLLAPSE BUTTON */}
      <div className="p-4 border-t border-[#A7E1B2]/30 flex justify-center">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-full bg-[#009846]/80 hover:bg-[#009846] transition-all duration-300"
        >
          {isCollapsed ? "▶" : "◀"}
        </button>
      </div>
    </aside>
  );
}
