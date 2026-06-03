import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TeacherSidebar from "../../components/Teacher/TeacherSidebar";
import TeacherTopbar from "../../components/Teacher/TeacherTopbar";
import { quizzesApi } from "../../services/quizzes";
import { useToast } from "../../context/ToastContext";

export default function TeacherQuizDetailsPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 80 : 256;

  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  // ✅ SEO
  const canonicalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${location.pathname}`
      : location.pathname;

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

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
          name: "Quizzes",
          item:
            typeof window !== "undefined"
              ? `${window.location.origin}/teacher-dashboard`
              : "/teacher-dashboard",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Quiz Details",
          item: canonicalUrl,
        },
      ],
    }),
    [canonicalUrl]
  );

  const seoTitle = quiz?.title
    ? `${quiz.title} | Quiz Details | Teacher Dashboard | ProspectEdu`
    : "Quiz Details | Teacher Dashboard | ProspectEdu";

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await quizzesApi.getById(quizId);
        setQuiz(res.data.quiz);
      } catch (e) {
        console.log(e);
        showToast?.(e?.response?.data?.message || "Failed to load quiz", "error");
        setQuiz(null);
      } finally {
        setLoading(false);
      }
    };
    if (quizId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* ✅ SEO (NO layout impact) */}
      <Helmet>
        <title>{seoTitle}</title>
        <meta
          name="description"
          content="View quiz details including questions, marks, timer and correct answers in the ProspectEdu teacher dashboard."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <div
        className={`${isCollapsed ? "w-20" : "w-64"} fixed left-0 top-0 h-full transition-all`}
      >
        <TeacherSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      <div className="flex flex-col flex-1" style={{ marginLeft: sidebarWidth }}>
        <TeacherTopbar pageTitle="Quiz Details" />

        <div className="px-8 pt-[20px] pb-10 overflow-y-auto">
          {loading ? (
            <div className="text-[#5B7065]">Loading...</div>
          ) : !quiz ? (
            <div className="text-[#5B7065]">Quiz not found.</div>
          ) : (
            <div className="bg-white border border-[#A7E1B2] rounded-xl shadow-sm p-6 max-w-4xl">
              <h2 className="text-2xl font-semibold text-[#124734]">{quiz.title}</h2>
              <p className="text-sm text-[#5B7065] mt-1">
                Status: <span className="text-[#124734] font-medium">{quiz.status}</span>
                {"  "}•{"  "}
                Timer:{" "}
                <span className="text-[#124734] font-medium">{quiz.durationMinutes || 0} min</span>
                {"  "}•{"  "}
                Questions:{" "}
                <span className="text-[#124734] font-medium">{quiz.questions?.length || 0}</span>
              </p>

              {quiz.instructions ? (
                <p className="text-sm text-[#5B7065] mt-3">{quiz.instructions}</p>
              ) : null}

              <div className="mt-6 space-y-4">
                {(quiz.questions || []).map((q, idx) => (
                  <div key={q._id || idx} className="border border-[#E6F4EC] rounded-xl p-4">
                    <div className="text-[#124734] font-semibold">
                      Q{idx + 1}. {q.prompt}
                    </div>

                    <div className="text-sm text-[#5B7065] mt-1">
                      Marks: <span className="text-[#124734] font-medium">{q.marks}</span>
                    </div>

                    {q.type === "mcq" && Array.isArray(q.options) ? (
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`px-3 py-2 rounded-lg border ${
                              q.correctIndex === oIdx ? "border-[#009846]" : "border-[#E6F4EC]"
                            }`}
                          >
                            <span className="text-sm text-[#124734]">
                              {String.fromCharCode(65 + oIdx)}. {opt.text}
                            </span>
                            {q.correctIndex === oIdx ? (
                              <span className="ml-2 text-xs text-[#009846] font-semibold">
                                (Correct)
                              </span>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-[#5B7065] mt-3">Type: {q.type}</div>
                    )}
                  </div>
                ))}
              </div>

              <button onClick={() => navigate(-1)} className="mt-5 text-sm underline text-[#124734]">
                ← Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
