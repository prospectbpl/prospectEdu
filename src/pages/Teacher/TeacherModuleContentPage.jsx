import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import TeacherSidebar from "../../components/Teacher/TeacherSidebar";
import TeacherTopbar from "../../components/Teacher/TeacherTopbar";

import { uploadsApi } from "../../services/uploads";
import { courseContentApi } from "../../services/courseContent";

export default function TeacherModuleContentPage() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ SEO
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
          name: "Teacher Dashboard",
          item:
            typeof window !== "undefined"
              ? `${window.location.origin}/teacher-dashboard`
              : "/teacher-dashboard",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Course",
          item:
            typeof window !== "undefined"
              ? `${window.location.origin}/teacher/course/${courseId}`
              : `/teacher/course/${courseId}`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Module Content",
          item: canonicalUrl,
        },
      ],
    }),
    [canonicalUrl, courseId]
  );

  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidthPx = isCollapsed ? 80 : 256;

  // (kept as-is to avoid layout/logic changes)
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerSrc, setViewerSrc] = useState("");
  const [viewerTitle, setViewerTitle] = useState("");

  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("video"); // "video" | "file"

  // ✅ Edit state
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editFileName, setEditFileName] = useState("");

  const openLesson = (lesson) => {
    // ✅ use your service helper (this points to /api/v1/content/lessons/:id/file)
    const fileUrl = courseContentApi.lessonFileUrl(lesson._id);

    // PDF -> open directly in new tab
    if (lesson.type === "pdf" || (lesson.mimeType || "").includes("pdf")) {
      window.open(fileUrl, "_blank", "noreferrer");
      return;
    }

    // DOC/DOCX -> Office viewer (needs a public URL)
    if (lesson.type === "doc" || (lesson.mimeType || "").includes("word")) {
      const officeUrl =
        "https://view.officeapps.live.com/op/embed.aspx?src=" + encodeURIComponent(fileUrl);

      window.open(officeUrl, "_blank", "noreferrer");
      return;
    }

    // video or other -> fallback
    window.open(lesson.contentUrl, "_blank", "noreferrer");
  };

  const load = async () => {
    try {
      setLoading(true);
      const res = await courseContentApi.teacherModulesWithLessons(courseId);
      const found = (res.data.modules || []).find((m) => String(m._id) === String(moduleId));
      setModule(found || null);
    } catch (e) {
      console.log(e);
      setModule(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId && moduleId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, moduleId]);

  const accept =
    mode === "video"
      ? "video/*"
      : "application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  const handleUpload = async () => {
    if (!title.trim()) return alert("Please enter a title");
    if (!file) return alert("Please choose a file");

    try {
      // 1) upload file
      const up = await uploadsApi.uploadLessonFile(file);

      // 2) determine type
      const isVideo = file.type.startsWith("video/");
      const ext = (file.name.split(".").pop() || "").toLowerCase();
      const type = isVideo ? "video" : ext === "pdf" ? "pdf" : "doc";

      // 3) create lesson
      await courseContentApi.createLesson(moduleId, {
        title: title.trim(),
        type,
        contentUrl: up.data.url,
        filePublicId: up.data.publicId,
        fileName: up.data.originalName,
        mimeType: up.data.mimeType,
        isPublished: true,
      });

      setTitle("");
      setFile(null);
      await load();
      alert("Uploaded!");
    } catch (e) {
      console.log(e);
      alert(e?.response?.data?.message || "Upload failed");
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!confirm("Delete this lesson?")) return;
    try {
      await courseContentApi.deleteLesson(lessonId);
      await load();
    } catch (e) {
      console.log(e);
      alert(e?.response?.data?.message || "Delete failed");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      await courseContentApi.updateLesson(editingId, {
        title: editTitle.trim(),
        fileName: editFileName.trim(),
      });

      setEditingId(null);
      setEditTitle("");
      setEditFileName("");
      await load();
    } catch (e) {
      console.log(e);
      alert(e?.response?.data?.message || "Update failed");
    }
  };

  // ✅ SEO title without layout changes
  const seoTitle = module?.title
    ? `${module.title} | Module Content | Teacher Dashboard | ProspectEdu`
    : "Module Content | Teacher Dashboard | ProspectEdu";

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* ✅ SEO (NO layout impact) */}
      <Helmet>
        <title>{seoTitle}</title>
        <meta
          name="description"
          content="Upload and manage module lessons (videos, PDFs, DOC files) in the ProspectEdu teacher dashboard."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      {/* SIDEBAR */}
      <div
        className={`${isCollapsed ? "w-20" : "w-64"} fixed top-0 left-0 h-full z-40 transition-all`}
      >
        <TeacherSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* RIGHT AREA */}
      <div className="flex flex-col flex-1 transition-all" style={{ marginLeft: sidebarWidthPx }}>
        {/* TOPBAR */}
        <div
          className="fixed top-0 bg-white shadow-sm h-[64px] z-[999]"
          style={{ left: sidebarWidthPx, right: 0 }}
        >
          <TeacherTopbar pageTitle="Module Content" />
        </div>

        {/* CONTENT */}
        <div className="px-6 pt-[80px] pb-10 overflow-y-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <p className="text-sm text-[#5B7065]">
              <span
                className="hover:text-[#009846] cursor-pointer hover:underline"
                onClick={() => navigate("/teacher-dashboard")}
              >
                Dashboard
              </span>{" "}
              /{" "}
              <span
                className="hover:text-[#009846] cursor-pointer hover:underline"
                onClick={() => navigate(`/teacher/course/${courseId}`)}
              >
                Course
              </span>{" "}
              / <span className="text-[#124734] font-medium">Module</span>
            </p>

            <h2 className="text-2xl font-semibold text-[#124734] mt-2">
              {loading ? "Loading..." : module?.title || "Module"}
            </h2>
          </div>

          {/* Loading states */}
          {loading ? (
            <div className="text-[#5B7065]">Loading module...</div>
          ) : !module ? (
            <div className="text-red-500">Module not found</div>
          ) : (
            <div className="space-y-6">
              {/* Upload section */}
              <div className="bg-white border border-[#E6F4EC] rounded-xl shadow-sm p-6">
                <div className="flex flex-wrap gap-3 mb-4">
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      mode === "video"
                        ? "bg-[#009846] text-white"
                        : "border border-[#A7E1B2] text-[#124734] hover:bg-[#F2FBF6]"
                    }`}
                    onClick={() => setMode("video")}
                  >
                    Upload Video
                  </button>

                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      mode === "file"
                        ? "bg-[#009846] text-white"
                        : "border border-[#A7E1B2] text-[#124734] hover:bg-[#F2FBF6]"
                    }`}
                    onClick={() => setMode("file")}
                  >
                    Upload File (PDF/DOC)
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    className="border border-[#A7E1B2] rounded-md p-2 outline-[#009846] md:col-span-2"
                    placeholder={mode === "video" ? "Video title" : "File title"}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />

                  <input
                    type="file"
                    accept={accept}
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="border border-[#A7E1B2] rounded-md p-2 bg-white"
                  />
                </div>

                <div className="mt-4">
                  <button
                    className="px-6 py-2 bg-[#124734] text-white rounded-md hover:bg-[#0f3b2b]"
                    onClick={handleUpload}
                  >
                    Upload
                  </button>
                </div>
              </div>

              {/* Lessons list */}
              <div className="bg-white border border-[#E6F4EC] rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-[#124734] mb-4">Lessons</h3>

                {module.lessons?.length ? (
                  <ul className="space-y-3">
                    {module.lessons.map((l) => (
                      <li
                        key={l._id}
                        className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-[#E6F4EC] rounded-lg p-4"
                      >
                        {/* Left */}
                        <div className="flex-1">
                          {editingId === l._id ? (
                            <div className="space-y-2">
                              <input
                                className="border border-[#A7E1B2] p-2 rounded w-full"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="Lesson title"
                              />
                              <input
                                className="border border-[#A7E1B2] p-2 rounded w-full"
                                value={editFileName}
                                onChange={(e) => setEditFileName(e.target.value)}
                                placeholder="Display file name"
                              />
                              <div className="flex gap-2">
                                <button
                                  className="text-sm px-3 py-1 rounded bg-green-600 text-white"
                                  onClick={handleSaveEdit}
                                >
                                  Save
                                </button>
                                <button
                                  className="text-sm px-3 py-1 rounded border"
                                  onClick={() => {
                                    setEditingId(null);
                                    setEditTitle("");
                                    setEditFileName("");
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="font-medium text-[#124734]">{l.title}</div>
                              <div className="text-xs text-[#5B7065] mt-1">{l.fileName || ""}</div>
                            </>
                          )}
                        </div>

                        {/* Right actions */}
                        <div className="flex items-center gap-3">
                          <button
                            className="text-sm underline text-[#124734]"
                            onClick={() => openLesson(l)}
                          >
                            {l.type === "video" ? "Play" : "Open"}
                          </button>

                          <button
                            className="text-sm text-blue-600"
                            onClick={() => {
                              setEditingId(l._id);
                              setEditTitle(l.title || "");
                              setEditFileName(l.fileName || "");
                            }}
                          >
                            Edit
                          </button>

                          <button
                            className="text-sm text-red-600"
                            onClick={() => handleDeleteLesson(l._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-[#5B7065]">No lessons yet.</div>
                )}
              </div>

              {/* Back button */}
              <div>
                <button className="text-sm text-[#124734] underline" onClick={() => navigate(-1)}>
                  ← Back to Modules
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
