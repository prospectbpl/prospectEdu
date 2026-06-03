import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useParams } from "react-router-dom";
import ParentSidebar from "../../components/Parent/ParentSidebar";
import ParentTopbar from "../../components/Parent/ParentTopbar";
import Breadcrumb from "../../components/Breadcrumb";
import { getStudentDetails } from "../../services/student.service";

export default function StudentDetailsPage() {
  const { id } = useParams(); // ✅ matches route
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
          name: "Parent Dashboard",
          item:
            typeof window !== "undefined"
              ? `${window.location.origin}/parent`
              : "/parent",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "My Students",
          item:
            typeof window !== "undefined"
              ? `${window.location.origin}/parent/students`
              : "/parent/students",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Student Profile",
          item: canonicalUrl,
        },
      ],
    }),
    [canonicalUrl]
  );

  const [data, setData] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 80 : 256;

  useEffect(() => {
    if (!id) return;
    getStudentDetails(id).then(setData).catch(() => setData(null));
  }, [id]);

  if (!data) {
    return (
      <div className="flex h-screen bg-[#F7FBF8]">
        {/* ✅ SEO even during loading */}
        <Helmet>
          <title>Student Profile | Parent Dashboard | ProspectEdu</title>
          <meta
            name="description"
            content="View student profile details, performance, enrollments and activity in ProspectEdu parent dashboard."
          />
          <link rel="canonical" href={canonicalUrl} />
          <meta name="robots" content="noindex, nofollow" />
          <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
        </Helmet>

        <div className="m-auto text-[#5B7065]">Loading student profile…</div>
      </div>
    );
  }

  const { student, performance, courses, recentActivity } = data;

  return (
    <div className="flex h-screen bg-[#F7FBF8] overflow-hidden">
      {/* ✅ SEO */}
      <Helmet>
        <title>{student?.fullName ? `${student.fullName} | Student Profile | ProspectEdu` : "Student Profile | ProspectEdu"}</title>
        <meta
          name="description"
          content="View student profile details, performance, enrollments and recent activity in ProspectEdu parent dashboard."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      {/* SIDEBAR */}
      <div
        className="fixed left-0 top-0 h-full transition-all duration-300 z-40"
        style={{ width: sidebarWidth }}
      >
        <ParentSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>
      

      {/* MAIN */}
      <div
        className="flex-1 flex flex-col transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        <ParentTopbar pageTitle="Student Profile" showStudentSwitcher={false} />

        <Breadcrumb
        items={[
          { label: "Dashboard", to: "/parent-dashboard" },
          { label: "My Students", to: "/parent/students" },
          { label: "Student Profile" },
        ]}
      />

        <div className="p-6 overflow-y-auto space-y-6">
          {/* STUDENT HEADER */}
          <div className="bg-white border border-[#E6F4EC] rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-[#124734]">{student.fullName}</h2>
            <p className="text-sm text-[#5B7065] mt-1">{student.email}</p>
            <p className="text-sm text-[#5B7065]">{student.phone}</p>

            {!student.isActive && (
              <span className="inline-block mt-3 px-3 py-1 text-xs rounded-full bg-red-100 text-red-600 font-medium">
                Student Blocked
              </span>
            )}
          </div>

          {/* PERFORMANCE */}
          <div>
            <h3 className="text-lg font-semibold text-[#124734] mb-3">Overall Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Attendance" value={`${performance.attendance}%`} />
              <StatCard label="Progress" value={`${performance.progress}%`} />
              <StatCard label="Assignments" value={`${performance.assignmentAvg}%`} />
              <StatCard label="Quizzes" value={`${performance.quizAvg}%`} />
            </div>
          </div>

          {/* COURSES */}
          <div>
            <h3 className="text-lg font-semibold text-[#124734] mb-3">Enrolled Courses</h3>
            {courses.length === 0 ? (
              <div className="bg-white border border-[#E6F4EC] rounded-xl p-4 text-sm text-[#5B7065]">
                No active enrollments.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course) => (
                  <div
                    key={course._id}
                    className="bg-white border border-[#E6F4EC] rounded-xl p-4 shadow-sm hover:shadow-md transition"
                  >
                    <p className="font-medium text-[#124734]">{course.title}</p>
                    <p className="text-xs text-[#5B7065] mt-1">
                      Enrolled on {new Date(course.enrolledAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RECENT ACTIVITY */}
          {recentActivity?.length > 0 && (
            <div className="bg-white border border-[#E6F4EC] rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[#124734] mb-4">Recent Activity</h3>
              <ul className="space-y-3">
                {recentActivity.map((a, i) => (
                  <li key={i} className="text-sm text-[#5B7065]">
                    <span className="font-medium text-[#124734]">{a.label}</span> – {a.value}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ========================= */
/* SMALL REUSABLE COMPONENT */
/* ========================= */
function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-[#E6F4EC] rounded-xl p-4 text-center shadow-sm">
      <p className="text-xs text-[#5B7065]">{label}</p>
      <p className="text-xl font-semibold text-[#124734] mt-1">{value}</p>
    </div>
  );
}
