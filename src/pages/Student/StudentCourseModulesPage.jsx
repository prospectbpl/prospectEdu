import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BookOpen, ChevronRight, Clock, Film, FileText, Search } from "lucide-react";

import StudentSidebar from "../../components/Student/StudentSidebar";
import StudentTopbar from "../../components/Student/StudentTopbar";
import RefreshComponent from "../../components/RefreshComponent";

import { courseContentApi } from "../../services/courseContent";

function minutesToHuman(m) {
  const mm = Number(m || 0);
  if (mm <= 0) return "—";
  const h = Math.floor(mm / 60);
  const r = mm % 60;
  return h > 0 ? `${h}h ${r}m` : `${r}m`;
}

// ✅ SEO helpers (no layout impact)
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

export default function StudentCourseModulesPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidthPx = isCollapsed ? 80 : 256;

  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [q, setQ] = useState("");

  const toCloudinaryThumb = (url, w = 480) => {
    if (!url || !url.includes("res.cloudinary.com") || url.includes("/upload/") === false) return url;
    return url.replace("/upload/", `/upload/f_auto,q_auto,w_${w},c_fill,dpr_auto/`);
  };

  // ✅ SEO (student private page: noindex)
  useEffect(() => {
    const titleBase = course?.title ? `${course.title} Modules` : "Course Modules";
    document.title = `${titleBase} | ProspectEdu Student`;

    upsertMeta("description", "Browse course modules and lessons in your ProspectEdu student dashboard.");
    upsertMeta("robots", "noindex, follow");
    upsertLink("canonical", window.location.href);
  }, [course?.title]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await courseContentApi.studentModulesOverview(courseId);
        setCourse(res?.data?.course || null);
        setModules(res?.data?.modules || []);
      } catch (e) {
        console.error(e);
        setCourse(null);
        setModules([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [courseId]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return modules;
    return modules.filter((m) => {
      const t = String(m.title || "").toLowerCase();
      const d = String(m.description || "").toLowerCase();
      return t.includes(s) || d.includes(s);
    });
  }, [modules, q]);

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isCollapsed ? "w-20" : "w-64"} fixed top-0 left-0 h-full z-40 transition-all duration-300`}>
        <StudentSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </aside>

      {/* Main */}
      <div
        className="flex flex-col flex-1 h-screen transition-all duration-300"
        style={{ marginLeft: sidebarWidthPx, width: `calc(100vw - ${sidebarWidthPx}px)` }}
      >
        {/* Topbar */}
        <header className="fixed top-0 z-[999] bg-white shadow-sm h-[64px]" style={{ left: sidebarWidthPx, right: 0 }}>
          <StudentTopbar isCollapsed={isCollapsed} pageTitle="Course Modules" />
        </header>

        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-6" style={{ marginTop: "70px" }}>
          <div className="w-full max-w-6xl mx-auto text-left">
            {/* Breadcrumb */}
            <div className="text-sm text-[#5B7065] mb-4">
              <span className="hover:underline hover:text-[#009846] cursor-pointer" onClick={() => navigate("/student-dashboard")}>
                Home
              </span>{" "}
              /{" "}
              <span className="hover:underline hover:text-[#009846] cursor-pointer" onClick={() => navigate("/student/my-courses")}>
                My Courses
              </span>{" "}
              / <span className="text-[#124734] font-medium">{course?.title || "Modules"}</span>
            </div>

            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-[#E6F4EC] shadow-sm p-5 mb-6">
              <div className="flex flex-col md:flex-row gap-5 items-start md:items-center">
                <div className="w-full md:w-[160px] bg-[#ECF5EE] border border-[#A7E1B2] rounded-xl p-3 flex justify-center">
                  {course?.img ? (
                    <img
                      src={toCloudinaryThumb(course?.img, 480)}
                      srcSet={[
                        `${toCloudinaryThumb(course?.img, 320)} 320w`,
                        `${toCloudinaryThumb(course?.img, 480)} 480w`,
                        `${toCloudinaryThumb(course?.img, 768)} 768w`,
                      ].join(", ")}
                      sizes="(max-width: 640px) 320px, (max-width: 1024px) 480px, 768px"
                      alt={course?.title || "Course image"}
                      className="w-100 h-30 object-contain rounded-xl"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-40 rounded-xl bg-[#F2FBF4] border border-[#E6F4EC] flex items-center justify-center text-sm text-[#5B7065]">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 text-[#124734]">
                    <BookOpen size={18} />
                    <h1 className="text-xl font-semibold">{course?.title || "Course"}</h1>
                  </div>
                  <p className="text-sm text-[#5B7065] mt-1 line-clamp-2">{course?.short || ""}</p>

                  <div className="flex flex-wrap gap-3 mt-3 text-xs text-[#5B7065]">
                    <span className="px-3 py-1 rounded-full bg-[#F2FBF4] border border-[#E6F4EC]">
                      Category: <span className="text-[#124734] font-medium">{course?.category || "—"}</span>
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#F2FBF4] border border-[#E6F4EC]">
                      Start: <span className="text-[#124734] font-medium">{course?.date || "—"}</span>
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#F2FBF4] border border-[#E6F4EC]">
                      Modules: <span className="text-[#124734] font-medium">{modules.length}</span>
                    </span>
                  </div>
                </div>

                {/* Search */}
                <div className="w-full md:w-[280px]">
                  <label className="text-xs text-[#5B7065]">Search modules</label>
                  <div className="mt-1 flex items-center gap-2 bg-[#F9FAFB] border border-[#E6F4EC] rounded-xl px-3 py-2">
                    <Search size={16} className="text-[#5B7065]" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Type title or description..."
                      className="w-full bg-transparent outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            {loading ? (
              <p className="text-center text-[#5B7065] py-10">Loading modules...</p>
            ) : filtered.length === 0 ? (
              <RefreshComponent message="No modules found for this course." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filtered.map((m) => (
                  <button
                    key={m._id}
                    onClick={() => navigate(`/student/courses/${courseId}/modules/${m._id}`)}
                    className="text-left group bg-white rounded-2xl border border-[#E6F4EC] shadow-sm hover:shadow-md transition p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-semibold text-[#124734] group-hover:text-[#009846] transition">
                          {m.title}
                        </h3>
                        <p className="text-sm text-[#5B7065] mt-1 line-clamp-2">{m.description || "—"}</p>

                        <div className="flex flex-wrap gap-2 mt-3 text-xs text-[#5B7065]">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F2FBF4] border border-[#E6F4EC]">
                            <Clock size={14} /> {minutesToHuman(m?.stats?.totalMinutes)}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F2FBF4] border border-[#E6F4EC]">
                            <Film size={14} /> {m?.stats?.videos ?? 0} videos
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F2FBF4] border border-[#E6F4EC]">
                            <FileText size={14} /> {m?.stats?.files ?? 0} files
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-[#F2FBF4] border border-[#E6F4EC]">
                            {m?.stats?.lessonCount ?? 0} lessons
                          </span>
                        </div>
                      </div>

                      <div className="mt-1 text-[#5B7065] group-hover:text-[#009846] transition">
                        <ChevronRight />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
