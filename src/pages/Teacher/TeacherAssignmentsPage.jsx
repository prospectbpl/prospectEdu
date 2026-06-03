import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TeacherSidebar from "../../components/Teacher/TeacherSidebar";
import TeacherTopbar from "../../components/Teacher/TeacherTopbar";
import { assignmentsApi } from "../../services/assignments";
import { useToast } from "../../context/ToastContext";

export default function TeacherAssignmentsPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 80 : 256;

  const navigate = useNavigate();
  const { state } = useLocation();
  const { courseId } = useParams();

  const { showToast } = useToast();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;

  const canonicalUrl = useMemo(() => {
    // keep canonical stable even if courseId changes
    return courseId
      ? `${SITE_URL}/teacher/assignments/${encodeURIComponent(courseId)}`
      : `${SITE_URL}/teacher/assignments`;
  }, [SITE_URL, courseId]);

  const pageTitle = courseId
    ? "Teacher Assignments | ProspectEdu"
    : "Teacher Assignments | ProspectEdu";

  const pageDescription = courseId
    ? "Manage and review assignments created for your course in ProspectEdu."
    : "Manage and review your assignments in ProspectEdu.";

  const load = async () => {
    if (!courseId) {
      setAssignments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await assignmentsApi.listByCourse(courseId);
      setAssignments(res.data.assignments || []);
    } catch (e) {
      console.log(e);
      showToast?.(e?.response?.data?.message || "Failed to load assignments", "error");
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const handleDelete = async (assignmentId) => {
    if (!confirm("Delete this assignment?")) return;
    try {
      await assignmentsApi.remove(assignmentId);
      showToast?.("Assignment deleted", "success");
      await load();
    } catch (e) {
      console.log(e);
      showToast?.(e?.response?.data?.message || "Delete failed", "error");
    }
  };

  const openAttachment = async (assignmentId) => {
    try {
      const res = await assignmentsApi.getFileBlob(assignmentId);
      const mime = res.headers?.["content-type"] || "application/octet-stream";
      const blob = new Blob([res.data], { type: mime });

      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.log(e);
      showToast?.("Failed to open attachment", "error");
    }
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* ✅ Private dashboard page */}
        <meta name="robots" content="noindex, nofollow" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Helmet>

      <h1 className="sr-only">Teacher Assignments</h1>

      {/* SIDEBAR */}
      <div className={`${isCollapsed ? "w-20" : "w-64"} fixed left-0 top-0 h-full transition-all`}>
        <TeacherSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* MAIN */}
      <div className="flex flex-col flex-1" style={{ marginLeft: sidebarWidth }}>
        <TeacherTopbar pageTitle="Assignments" />

        <main className="px-8 pt-[20px] pb-10 overflow-y-auto">
          {/* Breadcrumb */}
          <div className="w-full flex flex-col items-start ">
            <p className="text-sm text-[#5B7065] mb-6">
              <span
                className="hover:text-[#009846] cursor-pointer hover:underline"
                onClick={() => navigate("/teacher-dashboard")}
              >
                Dashboard
              </span>
              {" / "}
              <span
                className="hover:text-[#009846] cursor-pointer hover:underline"
                onClick={() => navigate("/teacher-dashboard")}
              >
                Courses
              </span>
              {" / "}
              <span className="text-[#124734] font-medium">Assignments</span>
            </p>
          </div>

          {/* Header row */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-semibold text-[#124734]">My Assignments</h2>
              <p className="text-sm text-[#5B7065] mt-1">
                {courseId ? "Assignments created for this course" : "Course not selected"}
              </p>
            </div>

            <button
              onClick={() => navigate(`/teacher/assessment/assignment/${courseId}`)}
              className="bg-[#009846] text-white px-5 py-2 rounded-md hover:bg-[#0d3a28]"
            >
              + Create Assignment
            </button>
          </div>

          {/* Content */}
          <div className="bg-white border border-[#A7E1B2] rounded-xl shadow-sm p-6">
            {loading ? (
              <div className="text-[#5B7065]">Loading...</div>
            ) : !courseId ? (
              <div className="text-[#5B7065]">CourseId missing. Go back and open from a course.</div>
            ) : assignments.length === 0 ? (
              <div className="text-[#5B7065]">No assignments created yet.</div>
            ) : (
              <div className="space-y-4">
                {assignments.map((a) => (
                  <div
                    key={a._id}
                    className="border border-[#E6F4EC] rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div>
                      <div className="text-lg font-semibold text-[#124734]">{a.title}</div>
                      <div className="text-sm text-[#5B7065] mt-1">
                        Due:{" "}
                        <span className="text-[#124734] font-medium">{a.dueDate?.slice(0, 10)}</span>
                        {"  "}•{"  "}
                        Max Marks: <span className="text-[#124734] font-medium">{a.maxMarks}</span>
                      </div>

                      {a.instructions ? (
                        <div className="text-sm text-[#5B7065] mt-2">{a.instructions}</div>
                      ) : null}

                      {a.fileUrl ? (
                        <button
                          onClick={() => openAttachment(a._id)}
                          className="inline-block text-sm text-[#009846] hover:underline mt-2 text-left"
                          type="button"
                        >
                          View Attachment ({a.fileName || "file"})
                        </button>
                      ) : null}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleDelete(a._id)}
                        className="px-4 py-2 rounded-md border border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Back button */}
          <button onClick={() => navigate(-1)} className="mt-5 text-sm underline text-[#124734]">
            ← Back
          </button>
        </main>
      </div>
    </div>
  );
}
