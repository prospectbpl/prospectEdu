import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";

import TeacherSidebar from "../../components/Teacher/TeacherSidebar";
import TeacherTopbar from "../../components/Teacher/TeacherTopbar";

export default function ViewSubmissionsPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarWidth = isCollapsed ? 80 : 256;

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
          name: "Assessments",
          item:
            typeof window !== "undefined"
              ? `${window.location.origin}/teacher-dashboard`
              : "/teacher-dashboard",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "View Submissions",
          item: canonicalUrl,
        },
      ],
    }),
    [canonicalUrl]
  );

  const submissions = [
    { name: "Riya Sharma", status: "Submitted", score: "-", date: "2025-01-10" },
    { name: "Aman Verma", status: "Pending", score: "-", date: "-" },
  ];

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* ✅ SEO (NO layout impact) */}
      <Helmet>
        <title>View Submissions | Teacher Dashboard | ProspectEdu</title>
        <meta
          name="description"
          content="View student submissions for assessments in the ProspectEdu teacher dashboard."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      {/* SIDEBAR */}
      <div
        className={`${isCollapsed ? "w-20" : "w-64"} fixed left-0 top-0 h-full transition-all`}
      >
        <TeacherSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-col flex-1" style={{ marginLeft: sidebarWidth }}>
        <TeacherTopbar pageTitle="Submissions" />

        <div className="px-8 pt-[20px] pb-10 overflow-y-auto">
          <div className="w-full flex flex-col items-start ">
            {/* Breadcrumb */}
            <p className="text-sm text-[#5B7065] mb-6">
              <span
                className="hover:text-[#009846] cursor-pointer hover:underline"
                onClick={() => navigate("/teacher-dashboard")}
              >
                Dashboard
              </span>
              {" / "}
              <span
                className="hover:text-[#009846] cursor-pointer hover:underline"
                onClick={() => navigate("/teacher/courses")}
              >
                Courses
              </span>
              {" / "}
              <span
                className="hover:text-[#009846] cursor-pointer hover:underline"
                onClick={() => navigate(-1)}
              >
                Assessments
              </span>
              {" / "}
              <span className="text-[#124734] font-medium">View Submissions</span>
            </p>
          </div>

          {/* Main Submissions Table */}
          <div className="bg-white border border-[#A7E1B2] p-6 rounded-xl shadow-sm max-w-5xl">
            <h2 className="text-2xl font-semibold text-[#124734] mb-5">Student Submissions</h2>

            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#E6F4EC] text-[#124734]">
                  <th className="p-3 border">Name</th>
                  <th className="p-3 border">Status</th>
                  <th className="p-3 border">Score</th>
                  <th className="p-3 border">Submitted At</th>
                </tr>
              </thead>

              <tbody>
                {submissions.map((s, i) => (
                  <tr key={i} className="text-[#5B7065] hover:bg-[#F9FAFB] transition">
                    <td className="p-3 border">{s.name}</td>
                    <td className="p-3 border">{s.status}</td>
                    <td className="p-3 border">{s.score}</td>
                    <td className="p-3 border">{s.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
