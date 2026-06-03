import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Film, Link2, PlayCircle, Search } from "lucide-react";

import StudentSidebar from "../../components/Student/StudentSidebar";
import StudentTopbar from "../../components/Student/StudentTopbar";
import RefreshComponent from "../../components/RefreshComponent";

import { courseContentApi } from "../../services/courseContent";
import { activityApi } from "../../services/activity";

function iconForType(type) {
  if (type === "video") return <Film size={16} />;
  if (type === "link") return <Link2 size={16} />;
  return <FileText size={16} />;
}

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

export default function StudentModuleLessonsPage() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidthPx = isCollapsed ? 80 : 256;

  const [loading, setLoading] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [q, setQ] = useState("");

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerSrc, setViewerSrc] = useState("");
  const [viewerTitle, setViewerTitle] = useState("");
  const [viewerKind, setViewerKind] = useState("file"); // "video" | "file" | "link"

  // ✅ SEO
  useEffect(() => {
    document.title = "Module Lessons | ProspectEdu Student";
    upsertMeta("description", "Open module lessons, videos, and files in your ProspectEdu student dashboard.");
    upsertMeta("robots", "noindex, follow");
    upsertLink("canonical", window.location.href);
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await courseContentApi.listLessons(moduleId);
        setLessons(res?.data?.lessons || []);
      } catch (e) {
        console.error(e);
        setLessons([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [moduleId]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return lessons;
    return lessons.filter((l) => String(l.title || "").toLowerCase().includes(s));
  }, [lessons, q]);

  const openLesson = async (l) => {
    try {
      // ✅ VIDEO
      await activityApi.markLessonWatched(l._id);

      if (String(l.type) === "video") {
        if (l.contentUrl) {
          setViewerKind("video");
          setViewerSrc(l.contentUrl);
          setViewerTitle(l.title);
          setViewerOpen(true);
          return;
        }

        const res = await courseContentApi.getLessonFileBlob(l._id);
        const blobUrl = URL.createObjectURL(res.data);

        setViewerKind("video");
        setViewerSrc(blobUrl);
        setViewerTitle(l.title);
        setViewerOpen(true);
        return;
      }

      // ✅ LINK
      if (String(l.type) === "link") {
        window.open(l.contentUrl, "_blank");
        return;
      }

      // ✅ FILES
      const res = await courseContentApi.getLessonFileBlob(l._id);
      const blobUrl = URL.createObjectURL(res.data);

      setViewerKind("file");
      setViewerSrc(blobUrl);
      setViewerTitle(l.title);
      setViewerOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  // ✅ cleanup blob URLs on close (no UI change)
  const closeViewer = () => {
    try {
      if (viewerSrc && viewerSrc.startsWith("blob:")) URL.revokeObjectURL(viewerSrc);
    } catch {
      // ignore
    }
    setViewerOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      <aside className={`${isCollapsed ? "w-20" : "w-64"} fixed top-0 left-0 h-full z-40 transition-all duration-300`}>
        <StudentSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </aside>

      <div
        className="flex flex-col flex-1 h-screen transition-all duration-300"
        style={{ marginLeft: sidebarWidthPx, width: `calc(100vw - ${sidebarWidthPx}px)` }}
      >
        <header className="fixed top-0 z-[999] bg-white shadow-sm h-[64px]" style={{ left: sidebarWidthPx, right: 0 }}>
          <StudentTopbar isCollapsed={isCollapsed} pageTitle="Module Content" />
        </header>

        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-6 text-left" style={{ marginTop: "70px" }}>
          <div className="w-full max-w-6xl mx-auto">
            <button
              onClick={() => navigate(`/student/courses/${courseId}/modules`)}
              className="inline-flex items-center gap-2 text-sm text-[#009846] hover:underline mb-4"
            >
              <ArrowLeft size={16} /> Back to Modules
            </button>

            <div className="bg-white rounded-2xl border border-[#E6F4EC] shadow-sm p-5 mb-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <h1 className="text-xl font-semibold text-[#124734]">Lessons</h1>
                  <p className="text-sm text-[#5B7065] mt-1">Click a lesson to watch video or open files.</p>
                </div>

                <div className="w-full md:w-[320px]">
                  <label className="text-xs text-[#5B7065]">Search lessons</label>
                  <div className="mt-1 flex items-center gap-2 bg-[#F9FAFB] border border-[#E6F4EC] rounded-xl px-3 py-2">
                    <Search size={16} className="text-[#5B7065]" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Type lesson name..."
                      className="w-full bg-transparent outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <p className="text-center text-[#5B7065] py-10">Loading lessons...</p>
            ) : filtered.length === 0 ? (
              <RefreshComponent message="No lessons found in this module." />
            ) : (
              <div className="bg-white rounded-2xl border border-[#E6F4EC] shadow-sm overflow-hidden">
                {filtered.map((l) => (
                  <button
                    key={l._id}
                    onClick={() => openLesson(l)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-[#F2FBF4] transition border-b border-[#E6F4EC] last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-[#ECF5EE] border border-[#A7E1B2] flex items-center justify-center text-[#124734]">
                        {iconForType(l.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#124734]">{l.title}</p>
                        <p className="text-xs text-[#5B7065]">
                          {String(l.type || "").toUpperCase()}
                          {l.durationMinutes ? ` • ${l.durationMinutes} min` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="text-[#009846] flex items-center gap-2 text-sm">
                      <PlayCircle size={18} />
                      Open
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </main>

        {viewerOpen && (
          <div className="fixed inset-0 z-[5000] bg-black/50 flex items-center justify-center p-3">
            <div className="bg-white w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl border border-[#E6F4EC]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#E6F4EC]">
                <p className="text-sm font-semibold text-[#124734] line-clamp-1">{viewerTitle}</p>
                <button
                  onClick={closeViewer}
                  className="text-sm px-3 py-1.5 rounded-lg border border-[#E6F4EC] hover:bg-[#F9FAFB]"
                >
                  Close
                </button>
              </div>

              <div className="h-[75vh] bg-black">
                {viewerKind === "video" ? (
                  <video src={viewerSrc} controls className="w-full h-full" />
                ) : (
                  <iframe title={viewerTitle} src={viewerSrc} className="w-full h-full bg-white" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
