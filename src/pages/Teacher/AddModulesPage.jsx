import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import TeacherSidebar from "../../components/Teacher/TeacherSidebar";
import TeacherTopbar from "../../components/Teacher/TeacherTopbar";
import AddModulesForm from "../../components/Teacher/AddModulesForm";

export default function AddModulesPage() {
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
          name: "Create Course",
          item:
            typeof window !== "undefined"
              ? `${window.location.origin}/teacher/create-course`
              : "/teacher/create-course",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Add Modules",
          item: canonicalUrl,
        },
      ],
    }),
    [canonicalUrl]
  );

  const sidebarWidthPx = isCollapsed ? 80 : 256;

  // When the user finishes Step 2
  const handleSaveModules = (modules) => {
    console.log("Modules Data:", modules);
    navigate("/teacher/publish-course");
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* ✅ SEO (NO layout impact) */}
      <Helmet>
        <title>Add Modules | Teacher Dashboard | ProspectEdu</title>
        <meta
          name="description"
          content="Add modules to your course in the ProspectEdu teacher dashboard."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      {/* SIDEBAR */}
      <div
        className={`${
          isCollapsed ? "w-20" : "w-64"
        } fixed top-0 left-0 h-full z-40 transition-all duration-300`}
      >
        <TeacherSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* RIGHT MAIN AREA */}
      <div
        className="flex flex-col flex-1 transition-all duration-300"
        style={{
          marginLeft: sidebarWidthPx,
          width: `calc(100vw - ${sidebarWidthPx}px)`,
        }}
      >
        {/* TOPBAR */}
        <div
          className="fixed top-0 bg-white shadow-sm h-[64px] z-[999]"
          style={{ left: sidebarWidthPx, right: 0 }}
        >
          <TeacherTopbar pageTitle="Add Modules" isCollapsed={isCollapsed} />
        </div>

        {/* PAGE CONTENT */}
        <div className="px-8 pt-[90px] pb-12 overflow-y-auto">
          <div className="w-full text-left mb-6">
            {/* Breadcrumb */}
            <p className="text-sm text-[#5B7065] mb-2">
              <span
                className="cursor-pointer hover:text-[#009846]"
                onClick={() => navigate("/teacher/create-course")}
              >
                Create Course
              </span>{" "}
              / Add Modules
            </p>
          </div>

          {/* FORM COMPONENT */}
          <AddModulesForm onSave={handleSaveModules} />
        </div>
      </div>
    </div>
  );
}
