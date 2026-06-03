import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";

import TeacherSidebar from "../../components/Teacher/TeacherSidebar";
import TeacherTopbar from "../../components/Teacher/TeacherTopbar";

import ChangePasswordForm from "../../components/Profile/ChangePasswordForm";

export default function TeacherChangePassword() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const canonicalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${location.pathname}`
      : location.pathname;

  const breadcrumbJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Teacher Dashboard",
          item:
            typeof window !== "undefined"
              ? `${window.location.origin}/teacher-dashboard`
              : "/teacher-dashboard",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Change Password",
          item: canonicalUrl,
        },
      ],
    }),
    [canonicalUrl]
  );

  const sidebarWidth = isCollapsed ? 80 : 256;

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* ✅ SEO */}
      <Helmet>
        <title>Change Password | Teacher Dashboard | ProspectEdu</title>
        <meta
          name="description"
          content="Change your teacher account password securely in the ProspectEdu teacher dashboard."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <TeacherSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1" style={{ marginLeft: sidebarWidth }}>
        {/* Topbar */}
        <div
          className="fixed top-0 bg-white shadow-sm z-[999] h-[64px]"
          style={{ left: sidebarWidth, right: 0 }}
        >
          <TeacherTopbar isCollapsed={isCollapsed} pageTitle="Change Password" />
        </div>

        {/* Sub-header */}
        <div
          className="sticky top-[64px] bg-[#F9FAFB] z-[998] border-b border-[#E6F4EC] px-6 py-3"
          style={{ left: sidebarWidth }}
        >
          <div className="w-full flex flex-col items-start">
            {/* Breadcrumb */}
            <p className="text-sm text-[#5B7065] mb-3 text-center w-full">
              <span
                className="cursor-pointer hover:text-[#009846] hover:underline"
                onClick={() => navigate("/teacher-dashboard")}
              >
                Home
              </span>{" "}
              / <span className="text-[#124734] font-medium">Change Password</span>
            </p>
          </div>
        </div>

        {/* Body */}
        <main className="flex-1 overflow-y-auto px-6 py-10" style={{ marginTop: "50px" }}>
          <ChangePasswordForm />
        </main>
      </div>
    </div>
  );
}
