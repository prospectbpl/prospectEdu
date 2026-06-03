import { useState , useEffect} from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import DropdownMenu from "./DropdownMenu";
import logo from "../../assets/logo.png.webp";
import { Link } from "react-router-dom";
import { publicCategoriesApi } from "../../services/publicCategories";
export default function Navbar() {
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [courseCategories, setCourseCategories] = useState([]);


  const toggleMenu = (menu) =>
    setActiveMenu(activeMenu === menu ? null : menu);
useEffect(() => {
  const fetchCategories = async () => {
    try {
      const res = await publicCategoriesApi.list();
      setCourseCategories(res.data.categories || []);
    } catch (err) {
      console.error("Failed to load course categories", err);
      setCourseCategories([]); // fallback
    }
  };

  fetchCategories();
}, []);


  // ------------------ UPDATED LINKS WITH CUSTOM ROUTES ------------------
  const links = [
    { label: "Home", to: "/" },

   {
  label: "Courses",
  dropdown: courseCategories.map((cat) => ({
    label: cat.name,
  to: `/categories/${cat.name.trim().toLowerCase()}`,
  })),
},
   
    {
      label: "Test & Learning", to:"/test-learning "
     
    },

    {
      label: "Scholarship", to:"/scholarship"
     
    },
     
    { label: "Research", to: "/research-report" },
    { label: "E-commerce", to: "/ecommerce-home" },
    { label: "Donation", to: "/donate" },

    {
      label: "More",
      dropdown: [
        { label: "Parent Company", to: "/parent-company" },
        { label: "Ask-Doubt", to: "/ask-doubt" },
        { label: "Blog", to: "/blog" },
        { label: "About Us", to: "/about-us" },
        { label: "News", to: "/news" },
        { label: "Contact Us", to: "/contact-us" },
        { label: "Achievers", to: "/achievers" },
      ],
    },
  ];

  return (
    <header className="w-full bg-[#FFFFFF] shadow-sm sticky top-0 z-50">
      <div className="flex items-center justify-between px-8 py-3 max-w-7xl mx-auto">

        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logo}
            alt="ProspectEdu Logo"
            className="h-10 w-auto object-contain"
          />
          <h1 className="text-xl font-heading font-semibold text-[#124734] whitespace-nowrap">
            ProspectEdu
          </h1>
        </Link>

        {/* ----------- DESKTOP MENU ----------- */}
        <nav className="hidden lg:flex items-center justify-center gap-6 font-medium text-[#124734] font-body">
          {links.map((item) =>
            item.dropdown ? (
              <div key={item.label} className="relative group">
                {/* Parent Button */}
                <button
                  onClick={() => toggleMenu(item.label)}
                  className="flex items-center gap-1 whitespace-nowrap hover:text-[#009846] transition"
                >
                  {item.label} <ChevronDown size={15} />
                </button>

                {/* Dropdown */}
                {activeMenu === item.label && (
                  <DropdownMenu items={item.dropdown} />
                )}
              </div>
            ) : (
              <Link
                key={item.label}
                to={item.to}
                className="whitespace-nowrap hover:text-[#009846] transition"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Desktop Login */}
        <Link
          to="/login"
          className="hidden lg:block border border-[#009846] text-[#009846] rounded-full px-5 py-2 font-medium hover:bg-[#009846] hover:text-white transition-all duration-300 whitespace-nowrap"
        >
          Login
        </Link>

        {/* ----------- MOBILE MENU ICON ----------- */}
        <div className="flex items-center gap-4 lg:hidden">
          <Link
            to="/login"
            className="border border-[#009846] text-[#009846] rounded-full px-4 py-1.5 text-sm font-medium hover:bg-[#009846] hover:text-white transition"
          >
            Login
          </Link>

          <button
            className="text-[#124734]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* ----------- MOBILE MENU ----------- */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-[#A7E1B2] shadow-sm px-6 py-4 space-y-3">

          {links.map((item) => (
            <div key={item.label}>
              {!item.dropdown ? (
                <Link
                  to={item.to}
                  className="block py-2 text-[#124734] font-medium"
                >
                  {item.label}
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className="flex justify-between items-center w-full py-2 font-medium text-[#124734]"
                  >
                    {item.label}
                    <ChevronDown
                      size={18}
                      className={`transition ${
                        activeMenu === item.label ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Mobile Dropdown */}
                  {activeMenu === item.label && (
                    <div className="ml-4 mt-2 space-y-2">
                      {item.dropdown.map((d, i) => (
                        <Link
                          key={i}
                          to={d.to}
                          className="block text-sm text-[#5B7065] hover:text-[#009846] transition"
                        >
                          {d.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
