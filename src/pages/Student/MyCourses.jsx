// src/pages/Student/MyCourses.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StudentSidebar from "../../components/Student/StudentSidebar";
import StudentTopbar from "../../components/Student/StudentTopbar";
import RefreshComponent from "../../components/RefreshComponent";
import { api } from "../../lib/api";
import CourseCard from "../Courses/CourseCard";

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

export default function MyCourses() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();

  const sidebarWidthPx = isCollapsed ? 80 : 256;

  // ✅ DATA STATE (no UI change)
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ SEO: prevent indexing of private page + set title/description
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "My Courses | Student Dashboard";

    const robots = upsertHeadMeta({ name: "robots", content: "noindex, follow" });
    const desc = upsertHeadMeta({
      name: "description",
      content: "View and access all courses you are enrolled in.",
    });

    return () => {
      document.title = prevTitle;
      if (robots?.parentNode) robots.parentNode.removeChild(robots);
      if (desc?.parentNode) desc.parentNode.removeChild(desc);
    };
  }, []);

  // ✅ FETCH MY COURSES (enrollments)
  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        setLoading(true);

        // must be logged in
        const token = sessionStorage.getItem("accessToken");
        if (!token) {
          setCourses([]);
          return;
        }

        // Backend route: GET /api/v1/courses/me/enrollments
        const res = await api.get("/courses/me/enrollments");

        // Support multiple possible response shapes
        const rows = res?.data?.courses || res?.data?.enrollments || [];

        // Normalize so UI can later render cards if you add them
        const mapped = rows
          .map((row) => row?.course || row?.courseId || row)
          .filter(Boolean)
          .map((c) => ({
            _id: c._id,
            slug: c.slug,
            title: c.title,
            img: c.img,
            short: c.short,
            date: c.date,
            price: c.price,
          }));

        setCourses(mapped);
      } catch (err) {
        console.error("Failed to load enrolled courses", err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, []);

  // ✅ NO UI change: keep same variables
  const currentList = courses;

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
          <StudentTopbar isCollapsed={isCollapsed} pageTitle="My Courses" />
        </header>

        {/* Sub-header (breadcrumb + tabs) */}
        <nav
          className="sticky top-[64px] bg-[#F9FAFB] z-[998] border-b border-[#E6F4EC] py-3"
          style={{ left: sidebarWidthPx }}
          aria-label="My courses navigation"
        >
          <div className="w-full flex flex-col items-start pl-5">
            {/* Breadcrumb — UNCHANGED */}
            <p className="text-sm text-[#5B7065] mb-2">
              <span
                className="hover:underline hover:text-[#009846] cursor-pointer transition-colors"
                onClick={() => navigate("/student-dashboard")}
              >
                Home
              </span>{" "}
              / My Courses /{" "}
              <span className="text-[#124734] font-medium">
                {activeTab === "all"
                  ? "All"
                  : activeTab === "recent"
                  ? "Recently Added"
                  : activeTab === "ongoing"
                  ? "My Ongoing"
                  : "Expiring Soon"}
              </span>
            </p>

            {/* Tabs — UNCHANGED */}
            <div className="flex gap-6 border-b border-[#E6F4EC]">
              <button
                className={`pb-2 text-sm font-medium transition-colors duration-300 ${
                  activeTab === "all"
                    ? "text-[#009846] border-b-2 border-[#009846]"
                    : "text-[#5B7065]"
                }`}
                onClick={() => setActiveTab("all")}
              >
                All
              </button>

              <button
                className={`pb-2 text-sm font-medium transition-colors duration-300 ${
                  activeTab === "recent"
                    ? "text-[#009846] border-b-2 border-[#009846]"
                    : "text-[#5B7065]"
                }`}
                onClick={() => setActiveTab("recent")}
              >
                Recently Added
              </button>

              <button
                className={`pb-2 text-sm font-medium transition-colors duration-300 ${
                  activeTab === "ongoing"
                    ? "text-[#009846] border-b-2 border-[#009846]"
                    : "text-[#5B7065]"
                }`}
                onClick={() => setActiveTab("ongoing")}
              >
                My Ongoing
              </button>

              <button
                className={`pb-2 text-sm font-medium transition-colors duration-300 ${
                  activeTab === "expiring"
                    ? "text-[#009846] border-b-2 border-[#009846]"
                    : "text-[#5B7065]"
                }`}
                onClick={() => setActiveTab("expiring")}
              >
                Expiring Soon
              </button>
            </div>
          </div>
        </nav>

        {/* Body */}
        <main
          className="flex-1 overflow-y-auto px-4 md:px-6 py-8"
          style={{ marginTop: "70px", height: "calc(100vh - 128px)" }}
          aria-labelledby="my-courses-heading"
        >
          {/* Hidden semantic heading */}
          <h1 id="my-courses-heading" className="sr-only">
            Student Enrolled Courses
          </h1>

          <div className="w-full max-w-6xl mx-auto">
            {loading ? (
              <p className="text-center text-[#5B7065] py-10">Loading...</p>
            ) : currentList.length === 0 ? (
              <RefreshComponent message="You haven't purchased any courses!" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentList.map((course) => (
                  <CourseCard
                    key={course._id}
                    course={{
                      _id: course._id,
                      slug: course.slug,
                      title: course.title,
                      image: course.img, // ✅ important mapping
                      mode: course.short,
                      startDate: course.date,
                      price: course.price,
                      isPurchased: true, // ✅ MyCourses always purchased
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
