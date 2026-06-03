import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Timer } from "lucide-react";

import StudentSidebar from "../../components/Student/StudentSidebar";
import StudentTopbar from "../../components/Student/StudentTopbar";
import { quizzesApi } from "../../services/quizzes";
import { useToast } from "../../context/ToastContext";

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

export default function StudentQuizStartPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidthPx = isCollapsed ? 80 : 256;

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // ✅ SEO (quiz/exam page should NOT be indexed)
  useEffect(() => {
    document.title = "Quiz | ProspectEdu Student";
    upsertMeta("description", "Attempt your quiz in ProspectEdu student dashboard.");
    upsertMeta("robots", "noindex, follow");
    upsertLink("canonical", window.location.href);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await quizzesApi.play(quizId);
        const q = res.data.quiz;
        setQuiz(q);

        const totalSeconds = Math.max(0, Number(q.durationMinutes || 0) * 60);
        setSecondsLeft(totalSeconds);
      } catch (e) {
        console.log(e);
        showToast?.(e?.response?.data?.message || "Failed to load quiz", "error");
        setQuiz(null);
      } finally {
        setLoading(false);
      }
    };
    if (quizId) load();
  }, [quizId, showToast]);

  const totalSeconds = useMemo(() => Math.max(0, Number(quiz?.durationMinutes || 0) * 60), [quiz]);

  useEffect(() => {
    if (!quiz) return;
    if (totalSeconds <= 0) return;
    if (secondsLeft <= 0) return;

    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [quiz, secondsLeft, totalSeconds]);

  useEffect(() => {
    if (!quiz) return;
    if (totalSeconds <= 0) return;
    if (secondsLeft === 0) handleSubmit(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, quiz, totalSeconds]);

  const pick = (questionId, selectedIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: selectedIndex }));
  };

  const formatTime = (s) => {
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    return `${mm}:${String(ss).padStart(2, "0")}`;
  };

  const handleSubmit = async (auto = false) => {
    if (!quiz || submitting) return;

    try {
      setSubmitting(true);

      const payload = {
        answers: (quiz.questions || []).map((q) => ({
          questionId: q._id,
          selectedIndex: Number(answers?.[q._id] ?? -1),
        })),
        timeTakenSeconds: totalSeconds > 0 ? totalSeconds - secondsLeft : 0,
      };

      const res = await quizzesApi.submitAttempt(quizId, payload);

      showToast?.(auto ? "Time up! Submitted." : "Submitted!", "success");
      navigate(`/student/quizzes/${quizId}/result`, { state: { attempt: res.data.attempt, quizTitle: quiz.title } });
    } catch (e) {
      console.log(e);
      showToast?.(e?.response?.data?.message || "Submit failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      <aside className={`${isCollapsed ? "w-20" : "w-64"} fixed top-0 left-0 h-full z-40 transition-all duration-300`}>
        <StudentSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </aside>

      <div className="flex flex-col flex-1 h-screen transition-all duration-300" style={{ marginLeft: sidebarWidthPx }}>
        <header className="fixed top-0 z-[999] bg-white shadow-sm h-[64px]" style={{ left: sidebarWidthPx, right: 0 }}>
          <StudentTopbar isCollapsed={isCollapsed} pageTitle="Quiz" />
        </header>

        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-8" style={{ marginTop: "64px" }}>
          <div className="w-full max-w-4xl mx-auto">
            {loading ? (
              <div className="bg-white border border-[#E6F4EC] rounded-2xl p-6 text-[#5B7065]">Loading...</div>
            ) : !quiz ? (
              <div className="bg-white border border-[#E6F4EC] rounded-2xl p-6 text-[#5B7065]">Quiz not found.</div>
            ) : (
              <div className="bg-white border border-[#E6F4EC] rounded-2xl shadow-sm p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-xl font-semibold text-[#124734]">{quiz.title}</h1>
                    {quiz.instructions ? <p className="text-sm text-[#5B7065] mt-1">{quiz.instructions}</p> : null}
                  </div>

                  {totalSeconds > 0 ? (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#A7E1B2] text-[#124734]">
                      <Timer size={16} />
                      <span className="font-semibold">{formatTime(secondsLeft)}</span>
                    </div>
                  ) : null}
                </div>

                <div className="mt-6 space-y-4">
                  {(quiz.questions || []).map((q, idx) => (
                    <div key={q._id} className="border border-[#E6F4EC] rounded-xl p-4">
                      <div className="text-[#124734] font-semibold">
                        Q{idx + 1}. {q.prompt}
                      </div>

                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {(q.options || []).map((opt, oIdx) => {
                          const checked = Number(answers?.[q._id]) === oIdx;
                          return (
                            <button
                              type="button"
                              key={oIdx}
                              onClick={() => pick(q._id, oIdx)}
                              className={`text-left px-3 py-2 rounded-lg border transition ${
                                checked ? "border-[#009846] bg-[#ECF5EE]" : "border-[#E6F4EC] hover:bg-[#F9FAFB]"
                              }`}
                            >
                              <span className="text-sm text-[#124734]">
                                {String.fromCharCode(65 + oIdx)}. {opt.text}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  disabled={submitting}
                  onClick={() => handleSubmit(false)}
                  className={`mt-6 w-full px-4 py-3 rounded-xl bg-[#009846] text-white hover:bg-[#0d3a28] ${
                    submitting ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  {submitting ? "Submitting..." : "Submit Quiz"}
                </button>

                <button onClick={() => navigate(-1)} className="mt-4 text-sm underline text-[#124734]">
                  ← Exit
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
