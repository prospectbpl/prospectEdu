import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import StudentSidebar from "../../components/Student/StudentSidebar";
import StudentTopbar from "../../components/Student/StudentTopbar";
import CourseCard from "../Courses/CourseCard";
import { publicCoursesApi } from "../../services/publicCourses";
import { publicCategoriesApi } from "../../services/publicCategories";

function upsertMeta(name, content) {
  const key = `meta[name="${name}"]`;
  let tag = document.head.querySelector(key);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
  return () => {
    // remove only if it was created for this SPA page
    // keep it simple: don't remove to prevent flicker between navigations
  };
}

function upsertLink(rel, href) {
  const key = `link[rel="${rel}"]`;
  let tag = document.head.querySelector(key);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
}

export default function AllCourses() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);

  const [coursesByCategory, setCoursesByCategory] = useState({ all: [] });

  const navigate = useNavigate();
  const sidebarWidthPx = isCollapsed ? 80 : 256;
  const [categories, setCategories] = useState([]);

  // ✅ SEO (private page => noindex)
  useEffect(() => {
    document.title = "All Courses | Student Dashboard | ProspectEdu";
    upsertMeta(
      "description",
      "Browse all available courses in your ProspectEdu student dashboard. Filter by category and explore course options."
    );

    // keep noindex for student/private pages
    upsertMeta("robots", "noindex, follow");

    // canonical (best-effort for SPA)
    const canonicalUrl = `${window.location.origin}${window.location.pathname}`;
    upsertLink("canonical", canonicalUrl);
  }, []);

  // ================= FETCH COURSES =================
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);

        const mapToUI = (courses) =>
          courses.map((c) => ({
            _id: c._id,
            slug: c.slug,
            title: c.title,
            image: c.img,
            mode: c.short,
            startDate: c.date,
            price: c.price,
          }));

        // 1) Fetch categories from API
        const catRes = await publicCategoriesApi.list();
        const catList = catRes.data.categories || catRes.data.data || [];

        const normalizedCats = catList
          .map((cat) => ({
            slug: (cat.slug || cat.key || cat.name || "").toLowerCase(),
            name: cat.name || cat.title || cat.slug || "Category",
          }))
          .filter((c) => c.slug);

        setCategories(normalizedCats);

        // 2) Fetch ALL courses
        const allRes = await publicCoursesApi.listAll();

        // 3) Fetch courses for each category dynamically
        const categoryCalls = await Promise.all(
          normalizedCats.map((c) => publicCoursesApi.listByCategory(c.slug))
        );

        // 4) Build state object
        const next = { all: mapToUI(allRes.data.courses || []) };

        normalizedCats.forEach((c, idx) => {
          const res = categoryCalls[idx];
          next[c.slug] = mapToUI(res.data.courses || []);
        });

        setCoursesByCategory(next);
      } catch (err) {
        console.error("Failed to load courses", err);
        setCoursesByCategory({ all: [] });
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <StudentSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      </aside>

      {/* Main */}
      <div
        className="flex flex-col flex-1 h-screen transition-all duration-300"
        style={{
          marginLeft: sidebarWidthPx,
          width: `calc(100vw - ${sidebarWidthPx}px)`,
        }}
      >
        {/* Topbar */}
        <header
          className="fixed top-0 bg-white shadow-sm z-[999] h-[64px]"
          style={{ left: sidebarWidthPx, right: 0 }}
        >
          <StudentTopbar pageTitle="All Courses" />
        </header>

        {/* Sub-header */}
        <nav
          className="sticky top-[64px] bg-[#F9FAFB] border-b border-[#E6F4EC] px-6 py-3 z-[998]"
          aria-label="Student courses navigation"
        >
          {/* Breadcrumb */}
          <div className="w-full flex flex-col items-start ">
            <p className="text-sm text-[#5B7065] mb-3">
              <span
                onClick={() => navigate("/student-dashboard")}
                className="cursor-pointer hover:text-[#009846] hover:underline"
              >
                Home
              </span>{" "}
              / <span className="text-[#124734] font-medium">All Courses</span>
            </p>
          </div>

          {/* Tabs */}
          <div
            className="flex flex-wrap gap-4 border-b border-[#E6F4EC]"
            role="tablist"
            aria-label="Course category filters"
          >
            {[
              ["all", "All Courses"],
              ...categories.map((c) => [c.slug, `${c.name} Courses`]),
            ].map(([id, label]) => (
              <button
                key={id}
                role="tab"
                aria-selected={activeTab === id}
                aria-controls={`panel-${id}`}
                id={`tab-${id}`}
                onClick={() => setActiveTab(id)}
                className={`pb-2 text-sm font-medium transition ${
                  activeTab === id
                    ? "text-[#009846] border-b-2 border-[#009846]"
                    : "text-[#5B7065]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <main
          className="flex-1 overflow-y-auto px-6"
          style={{ marginTop: "80px" }}
          aria-labelledby="all-courses-h1"
        >
          {/* Hidden H1 for SEO semantics (no layout change) */}
          <h1 id="all-courses-h1" className="sr-only">
            All Courses
          </h1>

          <section
            id={`panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
          >
            {loading ? (
              <p className="text-center text-[#5B7065] py-10">
                Loading courses...
              </p>
            ) : coursesByCategory[activeTab]?.length === 0 ? (
              <p className="text-center text-[#5B7065] py-10">
                No courses available.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {coursesByCategory[activeTab].map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
