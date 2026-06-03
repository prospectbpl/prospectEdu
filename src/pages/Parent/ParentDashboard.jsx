import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import ParentSidebar from "../../components/Parent/ParentSidebar";
import ParentTopbar from "../../components/Parent/ParentTopbar";
import { parentsApi } from "../../services/parents";

export default function ParentDashboard() {
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
          item: canonicalUrl,
        },
      ],
    }),
    [canonicalUrl]
  );

  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 80 : 256;

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const { data } = await parentsApi.getMyStudentsOverview();
        setStudents(data?.students || []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="flex h-screen bg-[#F7FBF8] overflow-hidden">
      {/* ✅ SEO (NO layout impact) */}
      <Helmet>
        <title>Parent Dashboard | ProspectEdu</title>
        <meta
          name="description"
          content="Parent dashboard to view linked students overview, attendance, progress and access student profiles in ProspectEdu."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      {/* SIDEBAR */}
      <div
        className="fixed left-0 top-0 h-full transition-all duration-300"
        style={{ width: sidebarWidth }}
      >
        <ParentSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* MAIN */}
      <div
        className="flex flex-col flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        <ParentTopbar pageTitle="Dashboard" showStudentSwitcher={false} />

        <div className="p-6 overflow-y-auto">
          <h1 className="text-xl font-semibold text-[#124734] mb-4">
            Linked Students Overview
          </h1>

          <div className="bg-white border border-[#E6F4EC] rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#F1FAF4] text-sm text-[#5B7065]">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Attendance</th>
                  <th className="px-4 py-3">Progress</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-[#5B7065]">
                      Loading students…
                    </td>
                  </tr>
                )}

                {!loading && students.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-[#5B7065]">
                      No students linked yet.
                    </td>
                  </tr>
                )}

                {!loading &&
                  students.map((s) => (
                    <tr
                      key={s._id}
                      className="border-t border-[#E6F4EC] hover:bg-[#F9FFFB]"
                    >
                      <td className="px-4 py-3 font-medium text-[#124734]">{s.fullName}</td>

                      <td className="px-4 py-3">{s.attendance}%</td>

                      <td className="px-4 py-3">{s.progress}%</td>

                      <td className="px-4 py-3">
                        {s.isActive ? (
                          <span className="text-green-600 text-sm font-medium">Active</span>
                        ) : (
                          <span className="text-red-500 text-sm font-medium">Blocked</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {s.isActive ? (
                          <Link
                            to={`/parent/students/${s._id}`}
                            className="px-3 py-1.5 text-sm bg-[#009846] text-white rounded-md hover:bg-[#007a38]"
                          >
                            View Profile
                          </Link>
                        ) : (
                          <span className="text-xs text-[#98A6A2]">Not available</span>
                        )}
                      </td>
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
