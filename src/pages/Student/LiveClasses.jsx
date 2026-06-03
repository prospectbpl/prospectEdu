// src/pages/Student/LiveClasses.jsx
import { useState, useEffect } from "react";
import StudentSidebar from "../../components/Student/StudentSidebar";
import StudentTopbar from "../../components/Student/StudentTopbar";
import RefreshComponent from "../../components/RefreshComponent";
import { useNavigate } from "react-router-dom";

function upsertHeadMeta({ name, content }) {
  if (!content) return;
  let el = document.head.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
  return el;
}

export default function LiveClasses() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("ongoing");
  const navigate = useNavigate();

  const sidebarWidthPx = isCollapsed ? 80 : 256;

  const ongoingClasses = [];
  const upcomingClasses = [];
  const currentList = activeTab === "ongoing" ? ongoingClasses : upcomingClasses;

  // ✅ SEO: prevent indexing of private page + set title/description
  useEffect(() => {
    const prevTitle = document.title;
    document.title =
      activeTab === "ongoing"
        ? "Live Classes (Ongoing) | Student Dashboard"
        : "Live Classes (Upcoming) | Student Dashboard";

    const robots = upsertHeadMeta({ name: "robots", content: "noindex, follow" });
    const desc = upsertHeadMeta({
      name: "description",
      content: "View ongoing and upcoming live classes in your student dashboard.",
    });

    return () => {
      document.title = prevTitle;
      if (robots?.parentNode) robots.parentNode.removeChild(robots);
      if (desc?.parentNode) desc.parentNode.removeChild(desc);
    };
  }, [activeTab]);

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${isCollapsed ? "w-20" : "w-64"} fixed top-0 left-0 h-full z-40 transition-all duration-300`}
        aria-label="Student sidebar"
      >
        <StudentSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </aside>

      {/* Main Section */}
      <div
        className="flex flex-col flex-1 h-screen transition-all duration-300"
        style={{
          marginLeft: sidebarWidthPx,
          width: `calc(100vw - ${sidebarWidthPx}px)`,
        }}
      >
        {/* Topbar */}
        <header
          className="fixed top-0 z-[999] bg-white shadow-sm h-[64px]"
          style={{ left: sidebarWidthPx, right: 0 }}
        >
          <StudentTopbar isCollapsed={isCollapsed} pageTitle="Live Classes" />
        </header>

        {/* Sub-header */}
        <nav
          className="sticky top-[64px] bg-[#F9FAFB] z-[998] border-b border-[#E6F4EC] px-6 py-3"
          style={{ left: sidebarWidthPx }}
          aria-label="Live classes navigation"
        >
          <div className="w-full flex flex-col items-start">
            {/* Breadcrumb — UNCHANGED */}
            <p className="text-sm text-[#5B7065] mb-3">
              <span
                className="hover:underline hover:text-[#009846] cursor-pointer transition-colors"
                onClick={() => navigate("/student-dashboard")}
              >
                Home
              </span>{" "}
              / Live Class /{" "}
              <span className="text-[#124734] font-medium">
                {activeTab === "ongoing" ? "Ongoing Live Class" : "Upcoming Live Class"}
              </span>
            </p>

            {/* Tabs — UNCHANGED */}
            <div className="flex gap-6 border-b border-[#E6F4EC]">
              <button
                className={`pb-2 text-sm font-medium transition-colors duration-300 ${
                  activeTab === "ongoing"
                    ? "text-[#009846] border-b-2 border-[#009846]"
                    : "text-[#5B7065]"
                }`}
                onClick={() => setActiveTab("ongoing")}
              >
                Ongoing Live Class
              </button>

              <button
                className={`pb-2 text-sm font-medium transition-colors duration-300 ${
                  activeTab === "upcoming"
                    ? "text-[#009846] border-b-2 border-[#009846]"
                    : "text-[#5B7065]"
                }`}
                onClick={() => setActiveTab("upcoming")}
              >
                Upcoming Live Class
              </button>
            </div>
          </div>
        </nav>

        {/* Page Body */}
        <main
          className="flex-1 overflow-y-auto px-4 md:px-6 py-8"
          style={{ marginTop: "128px", height: "calc(100vh - 128px)" }}
          aria-labelledby="live-classes-heading"
        >
          {/* Hidden semantic heading */}
          <h1 id="live-classes-heading" className="sr-only">
            Student Live Classes
          </h1>

          <div className="w-full max-w-6xl mx-auto">
            {currentList.length === 0 ? (
              <RefreshComponent message="No live classes available." />
            ) : (
              <div>{/* Class cards go here later */}</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
