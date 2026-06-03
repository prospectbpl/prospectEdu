// src/pages/Admin/ChangePassword.jsx
import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/Admin/Layout/AdminSidebar";
import AdminTopbar from "../../components/Admin/Layout/AdminTopbar";
import ChangePasswordForm from "../../components/Profile/ChangePasswordForm";
import { useToast } from "../../context/ToastContext";

export default function AdminChangePassword() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const sidebarWidth = isCollapsed ? 80 : 256;

  const canonicalUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    return origin && pathname ? `${origin}${pathname}` : "";
  }, []);

  const pageTitle = "Change Password | ProspectEdu Admin";
  const pageDescription =
    "Change your admin account password securely in ProspectEdu.";

  const handlePasswordChangeSuccess = () => {
    showToast("Password updated successfully!", "success");
  };

  const handlePasswordChangeError = () => {
    showToast("Failed to update password. Try again.", "error");
  };

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

      <h1 className="sr-only">Change Password</h1>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-[#124734] transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1" style={{ marginLeft: sidebarWidth }}>
        {/* Topbar */}
        <div
          className="fixed top-0 bg-white shadow-sm z-[999] h-[64px]"
          style={{ left: sidebarWidth, right: 0 }}
        >
          <AdminTopbar isCollapsed={isCollapsed} pageTitle="Change Password" />
        </div>

        {/* Sub-header */}
        <div
          className="sticky top-[64px] bg-[#F9FAFB] z-[998] border-b border-[#E6F4EC] px-6 py-3"
          style={{ left: sidebarWidth }}
        >
          <div className="w-full flex flex-col items-start">
            {/* Breadcrumb */}
            <p className="text-sm text-[#5B7065] mb-3">
              <span
                className="cursor-pointer hover:text-[#009846] hover:underline"
                onClick={() => navigate("/admin-dashboard")}
              >
                Home
              </span>{" "}
              / <span className="text-[#124734] font-medium">Change Password</span>
            </p>
          </div>
        </div>

        {/* Body */}
        <main
          className="flex-1 overflow-y-auto px-6 py-10"
          style={{ marginTop: "50px" }}
          aria-label="Change password admin page"
        >
          <ChangePasswordForm
            onSuccess={handlePasswordChangeSuccess}
            onError={handlePasswordChangeError}
          />
        </main>
      </div>
    </div>
  );
}
