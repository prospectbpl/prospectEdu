import TeacherSidebar from "../../components/Teacher/TeacherSidebar";
import TeacherTopbar from "../../components/Teacher/TeacherTopbar";
import PublishCourseReview from "../../components/Teacher/PublishCourseReview";
import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function PublishCoursePage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarWidthPx = isCollapsed ? 80 : 256;

  // ✅ SEO
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
          name: "Publish Course",
          item: canonicalUrl,
        },
      ],
    }),
    [canonicalUrl]
  );

  // Dynamic data coming from AddModulesPage
  const courseData = location.state?.courseData || {};
  const modules = location.state?.modules || [];

  const handlePublish = (settings) => {
    const newCourse = {
      ...courseData,
      modules,
      settings,
      createdAt: new Date(),
    };

    // Store in localStorage (temp backend)
    const existing = JSON.parse(localStorage.getItem("teacherCourses") || "[]");
    existing.push(newCourse);
    localStorage.setItem("teacherCourses", JSON.stringify(existing));

    alert("Course Published!");
    navigate("/teacher/courses");
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* ✅ SEO (NO layout impact) */}
      <Helmet>
        <title>Publish Course | Teacher Dashboard | ProspectEdu</title>
        <meta
          name="description"
          content="Review and publish your course with modules and settings in the ProspectEdu teacher dashboard."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <div className={`${isCollapsed ? "w-20" : "w-64"} fixed top-0 left-0 h-full`}>
        <TeacherSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      <div className="flex flex-col flex-1" style={{ marginLeft: sidebarWidthPx }}>
        <TeacherTopbar pageTitle="Publish Course" />

        <div className="px-8 pt-[90px] pb-12 overflow-y-auto">
          <PublishCourseReview
            courseData={courseData}
            modules={modules}
            defaultSettings={{ live: true, doubts: true }}
            onPublish={handlePublish}
            onBack={() =>
              navigate("/teacher/add-modules", {
                state: { courseData },
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
