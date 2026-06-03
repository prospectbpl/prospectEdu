import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import AdminSidebar from "../../components/Admin/Layout/AdminSidebar";
import AdminTopbar from "../../components/Admin/Layout/AdminTopbar";
import AdminStatsGrid from "../../components/Admin/Dashboard/AdminStatsGrid";
import ProfessorsList from "../../components/Admin/Dashboard/ProfessorsList";
import StudentList from "../../components/Admin/Dashboard/StudentList";
import { adminDashboardApi } from "../../services/adminDashboard";
import { useToast } from "../../context/ToastContext";

export default function AdminDashboardPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidthPx = isCollapsed ? 80 : 256;
  const { showToast } = useToast();

  const [raw, setRaw] = useState(null);
  const [loading, setLoading] = useState(true);

  const canonicalUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    return origin && pathname ? `${origin}${pathname}` : "";
  }, []);

  const pageTitle = "Admin Dashboard | ProspectEdu";
  const pageDescription =
    "ProspectEdu Admin Dashboard overview including student count, courses, and fees collection insights.";

  const formatINR = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
      Number(n || 0)
    );

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await adminDashboardApi.getStats();
        setRaw(res.data);
      } catch (e) {
        console.log(e);
        showToast?.(e?.response?.data?.message || "Failed to load dashboard stats", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const s = raw?.stats;

    const pct = (n) => `${Math.max(Number(n || 0), 0)}%`;
    const growthText = (g, fallback = "Last 30 days") =>
      g?.percentage !== undefined
        ? `${g.percentage}% change in ${g.days || 30} days`
        : fallback;

    return [
      {
        key: "totalStudents",
        title: "Total Students",
        value: loading ? "…" : String(s?.totalStudents ?? 0),
        progress: pct(s?.studentGrowth?.percentage),
        barColor: "#1D5C3F",
        text: growthText(s?.studentGrowth, "All students"),
      },
      {
        key: "newStudents",
        title: "New Students",
        value: loading ? "…" : String(s?.newStudentsLast30Days ?? 0),
        progress: pct(s?.newStudentGrowth?.percentage),
        barColor: "#E53935",
        text: growthText(s?.newStudentGrowth, "Last 30 days"),
      },
      {
        key: "totalCourses",
        title: "Total Courses",
        value: loading ? "…" : String(s?.totalCourses ?? 0),
        progress: pct(s?.courseGrowth?.percentage),
        barColor: "#8BC34A",
        text: growthText(s?.courseGrowth, "All courses"),
      },
      {
        key: "fees",
        title: "Fees Collection",
        value: loading ? "…" : formatINR(s?.feesCollectedInr ?? 0),
        progress: pct(s?.feesGrowth?.percentage),
        barColor: "#4CAF50",
        text: growthText(s?.feesGrowth, "Total collected"),
      },
    ];
  }, [raw, loading]);

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
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

      <h1 className="sr-only">Admin Dashboard</h1>

      <div className={`${isCollapsed ? "w-20" : "w-64"} fixed top-0 left-0 h-full z-40 transition-all duration-300`}>
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      <main
        className="flex flex-col flex-1 h-screen transition-all duration-300"
        style={{ marginLeft: sidebarWidthPx, width: `calc(100vw - ${sidebarWidthPx}px)` }}
        aria-label="Admin dashboard page"
      >
        <div className="fixed top-0 bg-white shadow-sm h-[64px] z-[999] transition-all duration-300" style={{ left: sidebarWidthPx, right: 0 }}>
          <AdminTopbar pageTitle="Dashboard" />
        </div>

        <div className="px-6 pt-[90px] pb-10 overflow-y-auto space-y-10">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <AdminStatsGrid stats={stats} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
            <ProfessorsList />
            <StudentList />
          </div>
        </div>
      </main>
    </div>
  );
}
