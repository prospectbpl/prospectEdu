import React, { useEffect, useState } from "react";
import logoImg from "../assets/logo.webp";
import {
  FiShoppingBag,
  FiHeart,
  FiShoppingCart,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { FaShoppingBag, FaHeart, FaShoppingCart } from "react-icons/fa";
import { IoSearch, IoPersonCircle } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";


const AUTH_KEY = "isLoggedIn";

/** ---------- Auth Helpers ---------- */
function readStoredUser() {
  const raw = sessionStorage.getItem("user") || localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function hasToken() {
  return !!(
    sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken")
  );
}

/** ---------- Product Helpers (works with many schemas) ---------- */
function getProductTitle(p) {
  return (p?.title || p?.name || p?.productName || "").toString();
}

function getProductId(p) {
  return (p?._id || p?.id || p?.productId || getProductTitle(p)).toString();
}

function getProductImage(p) {
  return (
    p?.thumbnail ||
    p?.image ||
    p?.img ||
    (Array.isArray(p?.images) ? p.images[0] : null) ||
    "https://via.placeholder.com/80?text=Prod"
  );
}

function slugify(str) {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}
function normalizeForDetail(p) {
  const price = Number(p?.price || 0);
  const offer = Number(p?.offerPrice || 0);
  const finalPrice = offer > 0 ? offer : price;

  return {
    id: p?._id || p?.id,
    _id: p?._id || p?.id,

    // ✅ ProductDetail mostly uses "title"
    title: p?.title || p?.name || p?.productName || "",
    name: p?.name || p?.title || "",

    description: p?.description || "",
    category: p?.category || p?.categoryName || "",

    // ✅ Images
    img:
      p?.thumbnail ||
      p?.image ||
      p?.img ||
      (Array.isArray(p?.images) ? p.images[0] : null) ||
      "https://via.placeholder.com/300x300?text=Product",

    images: Array.isArray(p?.images) ? p.images : [],

    // ✅ Pricing (same style as EcommerceHome mapping)
    oldPrice: price,
    price: finalPrice,
    offerPrice: offer,
    save: Math.max(0, price - finalPrice),

    outOfStock: Boolean(p?.outOfStock) || Number(p?.quantity || 0) <= 0,
    quantity: p?.quantity,
  };
}


const EcomHeader = () => {
  const navigate = useNavigate();

  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [openMenu, setOpenMenu] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);

  // ✅ Correct default: NOT logged in unless token+user exists
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const user = readStoredUser();
    const tokenOk = hasToken();
    const flag = localStorage.getItem(AUTH_KEY) === "true"; // optional compatibility
    return Boolean(user && tokenOk) || flag;
  });

  const [userName, setUserName] = useState("");

  // ✅ Products loaded from DB
  const [allProducts, setAllProducts] = useState([]);
  const [productsLoaded, setProductsLoaded] = useState(false);

  /**
   * ✅ IMPORTANT:
   * If your Vite proxy is configured, keep this:
   *   "/api/v1/products"
   *
   * If proxy is NOT configured, use full backend URL:
   *   "http://localhost:8080/api/v1/products"
   *   (change 8080 to your backend port)
   */
  // ✅ Products loaded from DB (for search)
useEffect(() => {
  let mounted = true;

  async function loadProducts() {
    try {
      // ✅ api.js will hit your backend baseURL correctly
      const res = await api.get("/products"); // means /api/v1/products if baseURL ends with /api/v1
      const data = res?.data;

      // supports: [] OR {products:[]} OR {data:[]} OR {items:[]} OR {data:{products:[]}}
      const list =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
          ? data.products
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.data?.products)
          ? data.data.products
          : [];

      if (!mounted) return;
      setAllProducts(list);
    } catch (e) {
      console.error("Header product load failed:", e);
      if (!mounted) return;
      setAllProducts([]);
    } finally {
      if (!mounted) return;
      setProductsLoaded(true);
    }
  }

  loadProducts();
  return () => {
    mounted = false;
  };
}, []);


  /** ---------- Search ---------- */
  const handleSearch = (value) => {
    setSearchQuery(value);

    const q = value.trim().toLowerCase();
    if (!q) {
      setSearchResults([]);
      return;
    }

    const results = allProducts.filter((p) => {
      const title = getProductTitle(p).toLowerCase();
      const category = (p?.category || p?.categoryName || "")
        .toString()
        .toLowerCase();
      const brand = (p?.brand || "").toString().toLowerCase();

      // You can add more fields if you want:
      const desc = (p?.description || "").toString().toLowerCase();

      return (
        title.includes(q) ||
        category.includes(q) ||
        brand.includes(q) ||
        desc.includes(q)
      );
    });

    setSearchResults(results);
  };

  /** ---------- Scrolling effect ---------- */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /** ---------- Sync auth status with storage + custom event ---------- */
  useEffect(() => {
    const syncAuth = () => {
      const user = readStoredUser();
      const tokenOk = hasToken();
      const loggedInNow = Boolean(user && tokenOk);

      setIsLoggedIn(loggedInNow);
      setUserName(user?.fullName || user?.name || "");
      if (!loggedInNow) setOpenMenu(false);
    };

    syncAuth();
    window.addEventListener("authChange", syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener("authChange", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  /** ---------- Logout ---------- */
  const doLogout = () => {
    localStorage.setItem(AUTH_KEY, "false");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    setIsLoggedIn(false);
    setUserName("");
    setShowLogoutPopup(false);
    setOpenMenu(false);

    window.dispatchEvent(new Event("authChange"));
    window.location.href = "/ecommerce-home";
  };

  /** ---------- Render Search Results (reusable) ---------- */
  const SearchDropdown = ({ isMobile = false }) => {
    if (!searchQuery) return null;

    return (
      <div
        className={`absolute left-0 right-0 bg-white shadow-xl rounded-lg mt-2 max-h-64 overflow-y-auto z-[9999] ${
          isMobile ? "" : ""
        }`}
      >
        {!productsLoaded ? (
          <p className="p-4 text-gray-500 text-sm">Loading products...</p>
        ) : searchResults.length === 0 ? (
          <p className="p-4 text-gray-500 text-sm">No product found</p>
        ) : (
          searchResults.map((p) => {
            const title = getProductTitle(p);
            const img = getProductImage(p);

            return (
              <div
                key={getProductId(p)}
                className="flex items-center gap-4 p-3 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  const normalized = normalizeForDetail(p);
                navigate(`/product/${slugify(normalized.title)}`, { state: normalized });

                  setSearchQuery("");
                  setSearchResults([]);
                  if (isMobile) setMobileMenu(false);
                }}
              >
                <img
                  src={img}
                  alt={title}
                  className="w-10 h-10 object-contain"
                />
                <div className="flex flex-col">
                  <p className="font-medium text-sm">{title}</p>
                  {(p?.category || p?.categoryName) && (
                    <p className="text-xs text-gray-500">
                      {(p?.category || p?.categoryName).toString()}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <header
      className={`w-full bg-white fixed top-0 left-0 z-50 shadow-md transition-all duration-300 
      ${isScrolled ? "py-1 shadow-lg" : "py-0"}`}
    >
      {!isScrolled && (
        <div className="w-full bg-[#124734] text-white text-center py-2 text-xs sm:text-sm font-medium">
          Welcome to the Store
        </div>
      )}

      <div
        className={`max-w-7xl mx-auto flex items-center justify-between 
        ${isScrolled ? "py-2 px-4" : "py-4 sm:py-6 px-3 sm:px-6"}`}
      >
        {/* LOGO */}
        <div
          className="flex items-center gap-2 sm:gap-3 cursor-pointer"
          onClick={() => navigate("/ecommerce-home")}
        >
          <img
            src={logoImg}
            alt="logo"
            className={`rounded-full transition-all duration-300
            ${isScrolled ? "w-10 h-10 sm:w-12 sm:h-12" : "w-12 h-12 sm:w-16 sm:h-16"}`}
          />
          <h1
            className={`font-bold text-[#124734] transition-all duration-300
            ${isScrolled ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"}`}
          >
            Prospect Store
          </h1>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          onClick={() => setMobileMenu(true)}
          className="text-3xl text-[#124734] sm:hidden"
        >
          <FiMenu />
        </button>

        {/* DESKTOP NAV */}
        <div className="hidden sm:flex items-center gap-6 text-[#124734] font-medium">
          {/* SEARCH */}
          <div className="relative w-64 md:w-100">
            <div className="flex items-center bg-[#A7E1B2] rounded-full shadow-lg py-2 px-4">
              <IoSearch size={20} className="text-[#124734]" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-transparent outline-none px-3"
              />
            </div>

            <SearchDropdown />
          </div>

          {/* USER MENU / LOGIN */}
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setOpenMenu(!openMenu)}
                className="flex items-center gap-1 bg-[#A7E1B2] px-4 py-2 rounded-full"
              >
                <IoPersonCircle size={22} />
                <span>{userName || "User"}</span>
                <span>▼</span>
              </button>

              {openMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border">
                  <button
                    onClick={() => navigate("/my-profile")}
                    className="w-full px-4 py-2 text-left hover:bg-[#A7E1B2]"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={() => navigate("/my-order")}
                    className="w-full px-4 py-2 text-left hover:bg-[#A7E1B2]"
                  >
                    My Orders
                  </button>
                  <button
                    onClick={() => setShowLogoutPopup(true)}
                    className="w-full px-4 py-2 text-left hover:bg-[#A7E1B2]"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login", { state: { from: "ecom-header" } })}
              className="flex items-center gap-2 bg-[#124734] text-white px-5 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Login
            </button>
          )}

          {/* SHOP */}
          <div
            onClick={() => navigate("/shop")}
            className="group flex items-center gap-2 cursor-pointer"
          >
            <FiShoppingBag className="group-hover:hidden" />
            <FaShoppingBag className="hidden group-hover:block text-[#1E5631]" />
            <span className="group-hover:text-[#1E5631]">Shop</span>
          </div>

          <div className="w-[2px] h-6 bg-gray-400"></div>

          {/* WISHLIST */}
          <div
            onClick={() => navigate("/wishlist")}
            className="group flex items-center gap-2 cursor-pointer"
          >
            <FiHeart className="group-hover:hidden" />
            <FaHeart className="hidden group-hover:block text-[#1E5631]" />
            <span className="group-hover:text-[#1E5631]">Wishlist</span>
          </div>

          <div className="w-[2px] h-6 bg-gray-400"></div>

          {/* CART */}
          <div
            onClick={() => navigate("/my-cart")}
            className="group flex items-center gap-2 cursor-pointer"
          >
            <FiShoppingCart className="group-hover:hidden" />
            <FaShoppingCart className="hidden group-hover:block text-[#1E5631]" />
            <span className="group-hover:text-[#1E5631]">My Cart</span>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenu && (
        <div className="fixed inset-0 bg-black/50 z-[9999]">
          <div className="absolute right-0 top-0 w-72 h-full bg-white shadow-xl p-6">
            <button
              onClick={() => setMobileMenu(false)}
              className="text-2xl text-[#124734] mb-6"
            >
              <FiX />
            </button>

            {/* MOBILE SEARCH */}
            <div className="relative mb-6">
              <div className="w-full bg-[#A7E1B2] flex items-center px-4 py-2 rounded-full">
                <IoSearch size={20} className="text-[#124734]" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="bg-transparent w-full outline-none ml-2"
                />
              </div>

              <SearchDropdown isMobile />
            </div>

            {/* MOBILE LINKS */}
            <div className="flex flex-col gap-5 text-[#124734] text-lg">
              <button onClick={() => navigate("/shop")}>Shop</button>
              <button onClick={() => navigate("/wishlist")}>Wishlist</button>
              <button onClick={() => navigate("/my-cart")}>My Cart</button>

              {isLoggedIn ? (
                <>
                  <button onClick={() => navigate("/my-profile")}>My Profile</button>
                  <button onClick={() => navigate("/my-order")}>My Orders</button>
                  <button onClick={() => setShowLogoutPopup(true)}>Logout</button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenu(false);
                    navigate("/login", { state: { from: "ecom-header" } });
                  }}
                  className="mt-2 bg-[#124734] text-white py-2 rounded-xl"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT POPUP */}
      {showLogoutPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-[300px] sm:w-[340px] text-center">
            <h2 className="text-xl font-bold text-[#124734] mb-3">
              Are you sure you want to logout?
            </h2>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowLogoutPopup(false)}
                className="flex-1 border border-[#124734] text-[#124734] py-2 rounded-xl hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={doLogout}
                className="flex-1 bg-[#124734] text-white py-2 rounded-xl hover:bg-[#0f3a23]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default EcomHeader;
