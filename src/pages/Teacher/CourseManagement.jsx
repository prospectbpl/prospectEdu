import { useMemo, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import TeacherSidebar from "../../components/Teacher/TeacherSidebar";
import TeacherTopbar from "../../components/Teacher/TeacherTopbar";

import CourseOverviewTab from "../../components/Teacher/CourseManagementPage/CourseOverviewTab";

import Modules from "../../components/Teacher/Modules";
import AssessmentDashboard from "../../components/Teacher/Assessments/AssessmentDashboard";
import StudentsPage from "../../components/Teacher/StudentsPage";

import { coursesApi } from "../../services/courses";

export default function CourseManagementPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const canonicalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${location.pathname}`
      : location.pathname;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [course, setCourse] = useState(null);
  const sidebarWidth = isCollapsed ? 80 : 256;

  // ✅ SEO: breadcrumb
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
          name: "Course Management",
          item: canonicalUrl,
        },
      ],
    }),
    [canonicalUrl]
  );

  // ✅ Load course from backend
  useEffect(() => {
    const load = async () => {
      try {
        if (!courseId || courseId.length !== 24) {
          setCourse(null);
          return;
        }
        const res = await coursesApi.getTeacherCourseById(courseId);
        setCourse(res.data.course);
      } catch (e) {
        console.log(e);
        setCourse(null);
      }
    };

    if (courseId) load();
  }, [courseId]);

  // ✅ SEO: dynamic title
  const seoTitle = course?.title
    ? `${course.title} | Course Management | Teacher Dashboard | ProspectEdu`
    : "Course Management | Teacher Dashboard | ProspectEdu";

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* ✅ SEO */}
      <Helmet>
        <title>{seoTitle}</title>
        <meta
          name="description"
          content="Manage course overview, modules, assessments and students in the ProspectEdu teacher dashboard."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      {/* SIDEBAR */}
      <div className={`${isCollapsed ? "w-20" : "w-64"} fixed left-0 h-full transition-all`}>
        <TeacherSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-col flex-1" style={{ marginLeft: sidebarWidth }}>
        <TeacherTopbar pageTitle="Course Management" />

        <div className="px-8 pt-[10px] pb-10 overflow-y-auto">
          {/* BREADCRUMB */}
          <p className="text-sm text-[#5B7065] mb-3">
            <span
              className="hover:text-[#009846] cursor-pointer hover:underline"
              onClick={() => navigate("/teacher-dashboard")}
            >
              Dashboard
            </span>{" "}
            /{" "}
            <span
              className="hover:text-[#009846] cursor-pointer hover:underline"
              onClick={() => navigate("/teacher-dashboard")}
            >
              Courses
            </span>{" "}
            /{" "}
            <span className="text-[#124734] font-medium">
              {course?.title || "Untitled Course"}
            </span>
          </p>

          {/* HEADER TITLE */}
          <h2 className="text-2xl font-semibold text-[#124734] mb-5">
            Managing Course: {course?.title || "Untitled"}
          </h2>

          {/* TABS */}
          <div className="flex gap-6 border-b pb-2 mb-6 text-[#124734] font-medium">
            <button
              onClick={() => setActiveTab("overview")}
              className={`${activeTab === "overview" && "border-b-2 border-[#009846]"}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("modules")}
              className={`${activeTab === "modules" && "border-b-2 border-[#009846]"}`}
            >
              Modules
            </button>
            <button
              onClick={() => setActiveTab("assessments")}
              className={`${activeTab === "assessments" && "border-b-2 border-[#009846]"}`}
            >
              Assessments
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`${activeTab === "students" && "border-b-2 border-[#009846]"}`}
            >
              Students
            </button>
          </div>

          {/* TAB CONTENT */}
          {activeTab === "overview" && <CourseOverviewTab course={course} />}
          {activeTab === "modules" && <Modules course={course} />}
          {activeTab === "assessments" && <AssessmentDashboard course={course} />}
          {activeTab === "students" && <StudentsPage courseId={courseId} />}
        </div>
      </div>
    </div>
  );
}
