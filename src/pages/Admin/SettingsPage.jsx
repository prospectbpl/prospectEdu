// src/pages/Admin/SettingsPage.jsx
import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/Admin/Layout/AdminSidebar";
import AdminTopbar from "../../components/Admin/Layout/AdminTopbar";
import Breadcrumb from "../../components/Breadcrumb";
import AdminManagement from "../../components/Admin/Settings/AdminManagement";
import { authApi } from "../../services/auth";

export default function SettingsPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const [me, setMe] = useState(null);

  const sidebarWidth = isCollapsed ? 80 : 256;

  const canonicalUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname =
      typeof window !== "undefined" ? window.location.pathname : "";
    return origin && pathname ? `${origin}${pathname}` : "";
  }, []);

  const pageTitle = "Settings | ProspectEdu Admin";
  const pageDescription =
    "Manage your admin profile settings and admin management options in ProspectEdu Admin.";

  useEffect(() => {
    (async () => {
      try {
        const res = await authApi.me();
        setMe(res.data?.user || res.data);
      } catch (e) {
        console.log("Failed to load profile:", e?.response?.data || e.message);
      }
    })();
  }, []);

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}

        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Helmet>

      {/* Hidden H1 for SEO (no layout change) */}
      <h1 className="sr-only">Settings</h1>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-[#124734] transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <AdminSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      </div>

      {/* Main */}
      <main
        className="flex flex-col flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
        aria-label="Settings admin page"
      >
        {/* Topbar */}
        <div
          className="fixed top-0 bg-white shadow-sm z-[999] h-[64px]"
          style={{ left: sidebarWidth, right: 0 }}
        >
          <AdminTopbar isCollapsed={isCollapsed} pageTitle="Settings" />
        </div>
        

        {/* Subheader */}
        <div
          className="sticky top-[64px] bg-[#F9FAFB] border-b border-[#E6F4EC] px-6 py-4 z-[998]"
          style={{ left: sidebarWidth }}
        >
          <p className="text-sm text-[#5B7065]">
            <span
              className="cursor-pointer hover:text-[#009846] hover:underline"
              onClick={() => navigate("/admin-dashboard")}
            >
              Home
            </span>{" "}
            / <span className="text-[#124734] font-medium">Settings</span>
          </p>
        </div>

        {/* BODY */}
        {/* ✅ pt-10 ensures the My Profile title is fully visible under the sticky header */}
        <div className="flex-1 overflow-y-auto px-6 py-6 pt-10">
          {/* My Profile */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#DDF3E6] mb-6 overflow-hidden">
            {/* Green Header Strip */}
            <div className="px-6 py-10 bg-gradient-to-r from-[#124734] to-[#009846]">
              <h3 className="text-lg font-semibold text-white">My Profile</h3>
              <p className="text-xs text-white/80 mt-1">
                Your account details and access role
              </p>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <Info label="Name" value={me?.fullName || me?.name || "—"} />
                <Info label="Email" value={me?.email || "—"} />
                <Info label="Phone" value={me?.phone || "—"} />
                <Info label="Role" value={me?.role || "Admin"} />
              </div>
            </div>
          </div>

          {/* Admin Management */}
          <AdminManagement />
        </div>
      </main>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl border border-[#DDF3E6] p-4 bg-[#F4FBF7]">
      <div className="text-xs text-[#5B7065]">{label}</div>
      <div className="text-sm font-semibold text-[#124734] mt-1">{value}</div>
    </div>
  );
}
