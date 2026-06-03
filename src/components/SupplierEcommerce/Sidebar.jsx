import React, { useState } from "react";
import { NavLink } from "react-router-dom";

// Icons
import { FaBoxOpen, FaListAlt, FaShoppingBag } from "react-icons/fa";

export default function SupplierSidebar({ isCollapsed, setIsCollapsed }) {
  const [openMenu] = useState(null);

  // Supplier menu items
  const menu = [
    { title: "Add Product", icon: FaBoxOpen, path: "/supplier/add-product" },
    { title: "Product List", icon: FaListAlt, path: "/supplier/product-list" },
    { title: "Orders", icon: FaShoppingBag, path: "/supplier/orders" },
  ];

  return (
    <aside
      className={`
        bg-[#124734] text-white min-h-screen h-auto flex flex-col justify-between shadow-lg 
        transition-all duration-300 
        fixed md:static top-0 left-0 z-50 md:z-auto
        overflow-y-auto
        
        ${isCollapsed ? "w-20" : "w-64"}
      `}
    >
      {/* LOGO */}
      <div>
        <NavLink
  to="/supplier"
  className={`
    flex items-center gap-3 px-6 py-6 border-b border-[#A7E1B2]/40 
    cursor-pointer
    ${isCollapsed ? "justify-center" : "justify-start"}
  `}
>
  <img
    src="/src/assets/logo.webp"
    className="h-10 w-10 rounded-full"
  />

  {!isCollapsed && (
    <h2 className="text-xl font-semibold text-[#A7E1B2] whitespace-nowrap">
      Supplier Panel
    </h2>
  )}
</NavLink>


        {/* MENU */}
        <nav className="mt-4 space-y-1">
          {menu.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `
                  flex items-center gap-3 px-6 py-3 transition-all duration-200 
                  ${isActive
                    ? "bg-[#009846]/20 text-[#A7E1B2] border-l-4 border-[#009846]"
                    : "text-[#E6F4EC] hover:bg-[#009846]/10 hover:text-[#A7E1B2]"
                  }
                  ${isCollapsed ? "justify-center" : ""}
                `
              }
            >
              <item.icon size={20} />

              {!isCollapsed && <span>{item.title}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* COLLAPSE BUTTON */}
      <div className="p-4 border-t border-[#A7E1B2]/30 flex justify-center">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-full bg-[#009846]/80 hover:bg-[#009846] transition"
        >
          {isCollapsed ? "▶" : "◀"}
        </button>
      </div>
    </aside>
  );
}
