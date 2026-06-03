// src/pages/Parent/ParentStudentsPage.jsx
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import ParentSidebar from "../../components/Parent/ParentSidebar";
import ParentTopbar from "../../components/Parent/ParentTopbar";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { parentsApi } from "../../services/parents";
import { useToast } from "../../context/ToastContext";
import Breadcrumb from "../../components/Breadcrumb";

function clampPct(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export default function ParentStudentsPage() {
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
          item: canonicalUrl,
        },
      ],
    }),
    [canonicalUrl]
  );

  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 80 : 256;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  async function load() {
    try {
      setLoading(true);
      const { data } = await parentsApi.getMyStudentsOverview();
      setStudents(Array.isArray(data?.students) ? data.students : []);
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to load students", "error");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = String(search || "").trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => String(s?.fullName || "").toLowerCase().includes(q));
  }, [students, search]);

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* ✅ SEO */}
      <Helmet>
        <title>My Students | Parent Dashboard | ProspectEdu</title>
        <meta
          name="description"
          content="View linked students and access student profiles from the parent dashboard in ProspectEdu."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      {/* SIDEBAR */}
      <div
        className="fixed top-0 left-0 h-full transition-all duration-300"
        style={{ width: sidebarWidth }}
      >
        <ParentSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col" style={{ marginLeft: sidebarWidth }}>
        <ParentTopbar pageTitle="My Students" showStudentSwitcher={false} />
        <Breadcrumb
        items={[
          { label: "Dashboard", to: "/parent-dashboard" },
          { label: "My Students" },
        ]}
      />

        {/* CONTENT */}
        <div className="px-6 pt-5 pb-10 overflow-y-auto">
          {/* Search */}
          <div className="max-w-7xl mx-auto mb-6">
            <div className="bg-white border border-[#E6F4EC] rounded-2xl shadow-sm px-4 py-3 flex items-center gap-2">
              <Search size={18} className="text-[#5B7065]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student name..."
                className="w-full outline-none text-sm text-[#124734]"
              />
            </div>
          </div>

          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="p-6 bg-white border border-[#E6F4EC] rounded-2xl text-[#5B7065]">
                Loading students...
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-6 bg-white border border-[#E6F4EC] rounded-2xl text-[#5B7065]">
                No linked students found. Add a child from Settings → Manage Children.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((s) => {
                  const attendance = clampPct(s?.attendance ?? 0);
                  const progress = clampPct(s?.progress ?? 0);
                  const blocked = !s?.isActive;

                  return (
                    <div
                      key={s._id}
                      className="bg-white p-5 rounded-2xl border border-[#E6F4EC] shadow-sm hover:shadow-md transition"
                    >
                      {/* Name + status */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-[#124734]">
                            {s?.fullName || "—"}
                          </h3>
                          {blocked ? (
                            <p className="mt-1 text-xs font-medium text-red-700 bg-red-50 border border-red-100 inline-flex px-2 py-1 rounded-full">
                              Student is blocked
                            </p>
                          ) : (
                            <p className="mt-1 text-xs font-medium text-[#0B4F9E] bg-[#E8F3FF] border border-[#CFE6FF] inline-flex px-2 py-1 rounded-full">
                              Active
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Attendance + Progress only */}
                      <div className="mt-4 space-y-4">
                        <div className="bg-[#F8FFF8] border border-[#E6F4EC] rounded-xl p-3">
                          <div className="text-xs text-[#5B7065]">Attendance</div>
                          <div className="text-xl font-semibold text-[#124734] mt-1">
                            {attendance}%
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-xs text-[#5B7065] mb-2">
                            <span>Progress</span>
                            <span className="font-medium text-[#124734]">{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#009846] rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        {/* View Profile only if not blocked */}
                        {!blocked && (
                          <button
                            className="w-full bg-[#124734] text-white py-2 rounded-xl text-sm hover:bg-[#0e3a29]"
                            onClick={() => navigate(`/parent/students/${s._id}`)}
                          >
                            View Profile
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
