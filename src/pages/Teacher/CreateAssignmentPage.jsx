import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Upload } from "lucide-react";
import { assignmentsApi } from "../../services/assignments";
import { useToast } from "../../context/ToastContext";

import TeacherSidebar from "../../components/Teacher/TeacherSidebar";
import TeacherTopbar from "../../components/Teacher/TeacherTopbar";

export default function CreateAssignmentPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [fileName, setFileName] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { courseId } = useParams();

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
          name: "Assessments",
          item:
            typeof window !== "undefined"
              ? `${window.location.origin}/teacher-dashboard`
              : "/teacher-dashboard",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Create Assignment",
          item: canonicalUrl,
        },
      ],
    }),
    [canonicalUrl]
  );

  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxMarks, setMaxMarks] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!courseId) return showToast("CourseId missing", "error");
    if (!title.trim()) return showToast("Title is required", "error");

    try {
      setSubmitting(true);

      // ✅ SEND AS FORMDATA (IMPORTANT)
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("instructions", instructions.trim());
      fd.append("dueDate", dueDate);
      fd.append("maxMarks", maxMarks);

      // ✅ attach file directly
      if (file) {
        fd.append("file", file);
      }

      // ✅ ONE request only
      await assignmentsApi.create(courseId, fd);

      showToast("Assignment created!", "success");
      navigate(-1);
    } catch (e) {
      console.log(e);
      showToast(e?.response?.data?.message || "Failed to create assignment", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const sidebarWidth = isCollapsed ? 80 : 256;

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* ✅ SEO (NO layout impact) */}
      <Helmet>
        <title>Create Assignment | Teacher Dashboard | ProspectEdu</title>
        <meta
          name="description"
          content="Create assignments for your course in the ProspectEdu teacher dashboard."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      {/* SIDEBAR */}
      <div className={`${isCollapsed ? "w-20" : "w-64"} fixed left-0 top-0 h-full transition-all`}>
        <TeacherSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* MAIN AREA */}
      <div className="flex flex-col flex-1" style={{ marginLeft: sidebarWidth }}>
        {/* TOPBAR */}
        <TeacherTopbar pageTitle="Create Assignment" />

        {/* PAGE CONTENT */}
        <div className="px-8 pt-[20px] pb-10 overflow-y-auto">
          <div className="w-full flex flex-col items-start ">
            {/* BREADCRUMB */}
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
              <span
                className="hover:text-[#009846] cursor-pointer hover:underline"
                onClick={() => navigate(-1)}
              >
                Assessments
              </span>
              {" / "}
              <span className="text-[#124734] font-medium">Create Assignment</span>
            </p>

            {/* MAIN CARD */}
            <div className="bg-white border border-[#A7E1B2] p-6 rounded-xl shadow-sm max-w-3xl">
              <h1 className="text-2xl font-semibold text-[#124734] mb-5">
                Create Assignment
              </h1>

              <input
                className="w-full border border-[#A7E1B2] px-3 py-2 rounded-md mb-4"
                placeholder="Assignment Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <textarea
                className="w-full border border-[#A7E1B2] px-3 py-2 rounded-md mb-4"
                placeholder="Instructions..."
                rows={4}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />

              <label className="cursor-pointer bg-[#009846] text-white px-4 py-2 rounded-md flex items-center gap-2 w-fit mb-3">
                <Upload size={16} />
                Upload File
                <input
                  type="file"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setFile(f || null);
                    setFileName(f?.name || "");
                  }}
                />
              </label>

              {fileName && <p className="text-sm text-[#124734] mb-3">📄 {fileName}</p>}

              <label className="text-[#124734] font-medium">Due Date</label>
              <input
                type="date"
                className="w-full border border-[#A7E1B2] px-3 py-2 rounded-md mb-4"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />

              <input
                type="number"
                className="w-full border border-[#A7E1B2] px-3 py-2 rounded-md mb-4"
                placeholder="Maximum Marks"
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
              />

              <button
                disabled={submitting}
                onClick={handleCreate}
                className={`bg-[#009846] text-white px-6 py-3 rounded-md w-full
                  ${submitting ? "opacity-60 cursor-not-allowed" : "hover:bg-[#0d3a28]"}`}
              >
                {submitting ? "Creating..." : "Create Assignment"}
              </button>

              <button
                type="button"
                onClick={() => navigate(`/teacher/assessment/assignments/${courseId}`)}
                className="mt-3 border border-[#A7E1B2] text-[#124734] px-6 py-3 rounded-md w-full hover:bg-[#F2FBF6]"
              >
                Show Assignments
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
