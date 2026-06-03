import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "../../components/Admin/Layout/AdminSidebar";
import AdminTopbar from "../../components/Admin/Layout/AdminTopbar";
import CourseDetail from "../../components/Admin/Courses/CourseDetail";

export default function AdminCourseDetailPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { courseId } = useParams();
  const navigate = useNavigate();

  const sidebarWidth = isCollapsed ? 80 : 256;

  const canonicalUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    return origin && pathname ? `${origin}${pathname}` : "";
  }, []);

  const pageTitle = "Course Details | ProspectEdu Admin";
  const pageDescription =
    "View and manage course details, content, pricing, and settings in ProspectEdu Admin.";

  return (
    <div className="flex bg-[#F9FAFB] h-screen overflow-hidden">
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

      <h1 className="sr-only">Course Details</h1>

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-full transition-all ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* MAIN */}
      <main
        className="flex-1 flex flex-col transition-all"
        style={{ marginLeft: sidebarWidth, width: `calc(100vw - ${sidebarWidth}px)` }}
        aria-label="Course details admin page"
      >
        {/* TOPBAR */}
        <div
          className="fixed top-0 bg-white shadow-sm h-[64px] flex items-center z-[999]"
          style={{ left: sidebarWidth, right: 0 }}
        >
          <AdminTopbar pageTitle="Course Details" />
        </div>

        {/* CONTENT */}
        <div className="px-6 pt-[90px] pb-10 overflow-y-auto">
          <div className="w-full flex flex-col items-start ">
            <div className="text-gray-600 text-sm mb-4">
              <span className="cursor-pointer hover:text-[#124734]" onClick={() => navigate("/admin-dashboard")}>
                Dashboard
              </span>
              {" / "}
              <span className="cursor-pointer hover:text-[#124734]" onClick={() => navigate("/admin/courses")}>
                Courses
              </span>
              {" / "}
              <span className="text-[#124734] font-semibold">Course Details</span>
            </div>
          </div>

          <CourseDetail courseId={courseId} />
        </div>
      </main>
    </div>
  );
}
