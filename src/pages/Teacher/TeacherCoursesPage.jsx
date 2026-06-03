import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import TeacherSidebar from "../../components/Teacher/TeacherSidebar";
import TeacherTopbar from "../../components/Teacher/TeacherTopbar";
import CourseCard from "../../components/Teacher/CourseCard";
import { useNavigate } from "react-router-dom";
import { coursesApi } from "../../services/courses";
import Breadcrumb from "../../components/Breadcrumb";

export default function TeacherCoursesPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const sidebarWidthPx = isCollapsed ? 80 : 256;

  const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;
  const canonicalUrl = `${SITE_URL}/teacher/courses`;

  const pageTitle = "Teacher Courses | ProspectEdu";
  const pageDescription =
    "View and manage courses assigned to you as a teacher in ProspectEdu.";

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await coursesApi.teacherMyCourses();
        setCourses(res.data.courses || []);
      } catch (err) {
        console.log(err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* ✅ Private dashboard page */}
        <meta name="robots" content="noindex, nofollow" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Helmet>

      <h1 className="sr-only">Teacher Courses</h1>

      {/* SIDEBAR */}
      <div className={`${isCollapsed ? "w-20" : "w-64"} fixed top-0 left-0 h-full z-40 transition-all`}>
        <TeacherSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* RIGHT AREA */}
      <div className="flex flex-col flex-1 transition-all" style={{ marginLeft: sidebarWidthPx }}>
        {/* Topbar */}
        <div className="fixed top-0 bg-white shadow-sm h-[64px] z-[999]" style={{ left: sidebarWidthPx, right: 0 }}>
          <TeacherTopbar pageTitle="My Courses" />
        </div>

        {/* CONTENT */}
        <main className="px-6 pt-[80px] pb-10 overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
                <Breadcrumb
        items={[
          { label: "Dashboard", to: "/teacher-dashboard" },
          { label: "Courses" },
        ]}
      />

              <h2 className="text-2xl font-semibold text-[#124734]">My Courses</h2>
            </div>
          </div>

          {/* Loading / Empty / Grid */}
          {loading ? (
            <div className="text-[#5B7065]">Loading courses...</div>
          ) : courses.length === 0 ? (
            <div className="text-[#5B7065]">No courses assigned to you yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} id={course._id} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
