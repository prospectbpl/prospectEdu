import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TeacherSidebar from "../../components/Teacher/TeacherSidebar";
import TeacherTopbar from "../../components/Teacher/TeacherTopbar";
import { quizzesApi } from "../../services/quizzes";
import { useToast } from "../../context/ToastContext";

export default function TeacherQuizzesPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 80 : 256;

  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

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
          name: "Course Quizzes",
          item: canonicalUrl,
        },
      ],
    }),
    [canonicalUrl]
  );

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      const res = await quizzesApi.listByCourse(courseId);
      setQuizzes(res.data.quizzes || []);
    } catch (e) {
      console.log(e);
      showToast?.(e?.response?.data?.message || "Failed to load quizzes", "error");
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const handleDelete = async (quizId) => {
    if (!confirm("Delete this quiz?")) return;
    try {
      await quizzesApi.remove(quizId);
      showToast?.("Quiz deleted", "success");
      load();
    } catch (e) {
      console.log(e);
      showToast?.(e?.response?.data?.message || "Delete failed", "error");
    }
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* ✅ SEO (NO layout impact) */}
      <Helmet>
        <title>Quizzes | Teacher Dashboard | ProspectEdu</title>
        <meta
          name="description"
          content="Manage quizzes created for a course in the ProspectEdu teacher dashboard."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <div className={`${isCollapsed ? "w-20" : "w-64"} fixed left-0 top-0 h-full transition-all`}>
        <TeacherSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      <div className="flex flex-col flex-1" style={{ marginLeft: sidebarWidth }}>
        <TeacherTopbar pageTitle="Quizzes" />

        <div className="px-8 pt-[20px] pb-10 overflow-y-auto">
          <div className="w-full flex flex-col items-start ">
            <p className="text-sm text-[#5B7065] mb-6">
              <span
                className="hover:text-[#009846] cursor-pointer hover:underline"
                onClick={() => navigate("/teacher-dashboard")}
              >
                Dashboard
              </span>{" "}
              /{" "}
              <span
                className="hover:text-[#009846] cursor-pointer hover:underline"
                onClick={() => navigate("/teacher-dashboard")}
              >
                Courses
              </span>{" "}
              / <span className="text-[#124734] font-medium">Quizzes</span>
            </p>
          </div>

          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-semibold text-[#124734]">My Quizzes</h2>
              <p className="text-sm text-[#5B7065] mt-1">Quizzes created for this course</p>
            </div>

            <button
              onClick={() => navigate(`/teacher/assessment/quiz/${courseId}`)}
              className="bg-[#009846] text-white px-5 py-2 rounded-md hover:bg-[#0d3a28]"
            >
              + Create Quiz
            </button>
          </div>

          <div className="bg-white border border-[#A7E1B2] rounded-xl shadow-sm p-6">
            {loading ? (
              <div className="text-[#5B7065]">Loading...</div>
            ) : quizzes.length === 0 ? (
              <div className="text-[#5B7065]">No quizzes created yet.</div>
            ) : (
              <div className="space-y-4">
                {quizzes.map((q) => (
                  <div
                    key={q._id}
                    className="border border-[#E6F4EC] rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div>
                      <div className="text-lg font-semibold text-[#124734]">{q.title}</div>
                      <div className="text-sm text-[#5B7065] mt-1">
                        Status: <span className="text-[#124734] font-medium">{q.status}</span>
                        {"  "}•{"  "}
                        Timer:{" "}
                        <span className="text-[#124734] font-medium">
                          {q.durationMinutes || 0} min
                        </span>
                        {"  "}•{"  "}
                        Questions:{" "}
                        <span className="text-[#124734] font-medium">
                          {q.questions?.length || 0}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(`/teacher/assessment/quizzes/view/${q._id}`)}
                        className="px-4 py-2 rounded-md border border-[#A7E1B2] text-[#124734] hover:bg-[#F2FBF6]"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(q._id)}
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

          <button onClick={() => navigate(-1)} className="mt-5 text-sm underline text-[#124734]">
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
