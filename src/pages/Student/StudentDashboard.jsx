// src/pages/Student/StudentDashboard.jsx
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import StudentSidebar from "../../components/Student/StudentSidebar";
import StudentTopbar from "../../components/Student/StudentTopbar";
import RecentActivity from "../../components/Student/RecentActivity";
import BannerCarousel from "../../components/Student/BannerCarousel";
import DashboardStats from "../../components/Student/DashboardStats";
import DashboardCharts from "../../components/Student/DashboardCharts";
import { useLocation } from "react-router-dom";
import { activityApi } from "../../services/activity";

// ✅ SEO helpers
function upsertMeta(name, content) {
  if (!content) return;
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel, href) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export default function StudentDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const sidebarWidthPx = isCollapsed ? 80 : 256;
  const location = useLocation();

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) return;

    const path = location.pathname;

    const lastPath = sessionStorage.getItem("lastActivityPath");
    if (lastPath === path) return;
    sessionStorage.setItem("lastActivityPath", path);

    const routeTitles = {
      "/student-dashboard": { type: "dashboard", title: "Dashboard" },
      "/student/all-courses": { type: "all-courses", title: "All Courses" },
      "/student/my-courses": { type: "my-courses", title: "My Courses" },
      "/student/orders": { type: "orders", title: "Orders" },
      "/student/doubts": { type: "doubts", title: "Doubts" },
      "/student/live-classes": { type: "live-classes", title: "Live Classes" },
      "/student/study-materials": { type: "study-materials", title: "Study Materials" },
      "/student/practice": { type: "practice", title: "Practice" },
      "/student/test-series": { type: "my-test-series", title: "My Test Series" },
      "/student/change-password": { type: "change-password", title: "Change Password" },
      "/student/edit-profile": { type: "edit-profile", title: "Edit Profile" },
    };

    const makeTitleFromPath = (p) => {
      const last = p.split("/").filter(Boolean).pop() || "Page";
      return last.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    };

    const exact = routeTitles[path];
    const key = Object.keys(routeTitles).find((k) => path.startsWith(k));
    const meta = exact || (key ? routeTitles[key] : { type: "navigation", title: makeTitleFromPath(path) });

    // ✅ Remove noisy console.log in production (no layout impact)
    // console.log("LOGGING ACTIVITY:", { type: meta.type, title: meta.title, route: path });

    activityApi
      .log({ type: meta.type, title: meta.title, route: path })
      .then(() => window.dispatchEvent(new Event("activity_refresh")))
      .catch((err) => {
        console.error("ACTIVITY LOG FAILED:", err?.response?.status, err?.response?.data);
      });
  }, [location.pathname]);

  // ✅ SEO: prevent indexing + add title/description/canonical (NO layout change)
  useEffect(() => {
    document.title = "Student Dashboard | ProspectEdu";
    upsertMeta("description", "ProspectEdu student dashboard to access courses, quizzes, practice and announcements.");
    upsertMeta("robots", "noindex, follow");
    upsertLink("canonical", window.location.href);
  }, []);

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${isCollapsed ? "w-20" : "w-64"} fixed top-0 left-0 h-full z-40 transition-all duration-300`}
        aria-label="Student navigation sidebar"
      >
        <StudentSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />
      </aside>

      {/* Main Section */}
      <div
        className="flex flex-col flex-1 h-screen transition-all duration-300"
        style={{
          marginLeft: isCollapsed ? 80 : 256,
          width: `calc(100vw - ${isCollapsed ? 80 : 256}px)`,
        }}
      >
        {/* Topbar */}
        <header className="fixed top-0 z-[999] bg-white shadow-sm h-[64px]" style={{ left: sidebarWidthPx, right: 0 }}>
          <StudentTopbar isCollapsed={isCollapsed} />
        </header>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden" style={{ marginTop: "64px", height: "calc(100vh - 64px)" }}>
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 md:px-6 py-4" aria-labelledby="student-dashboard-heading">
            <h1 id="student-dashboard-heading" className="sr-only">
              Student Dashboard
            </h1>

            <div className="mb-6 max-w-5xl mx-auto">
              <BannerCarousel />
            </div>

            <div className="mb-6">
              <DashboardStats />
            </div>

            <div className="mb-8">
              <DashboardCharts />
            </div>

            <div className="max-w-5xl mx-auto">
              <Outlet />
            </div>

            <div className="lg:hidden w-full mt-6">
              <RecentActivity />
            </div>
          </main>

          {/* Desktop Right Panel */}
          <aside className="hidden lg:flex flex-col w-80 border-l border-[#E6F4EC] bg-white shadow-sm overflow-y-auto shrink-0" aria-label="Recent student activity">
            <div className="p-4">
              <RecentActivity />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
