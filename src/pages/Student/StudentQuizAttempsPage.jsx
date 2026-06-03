import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

function fmtDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return "—";
  }
}

export default function StudentQuizAttemptsPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState([]);

  // ✅ SEO
  useEffect(() => {
    document.title = "My Quiz Attempts | ProspectEdu Student";
    upsertMeta("description", "View your previous quiz attempts and scores in ProspectEdu student dashboard.");
    upsertMeta("robots", "noindex, follow");
    upsertLink("canonical", window.location.href);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await quizzesApi.myAttempts(quizId);
        setAttempts(res.data.attempts || []);
      } catch (e) {
        console.log(e);
        showToast?.(e?.response?.data?.message || "Failed to load attempts", "error");
        setAttempts([]);
      } finally {
        setLoading(false);
      }
    };
    if (quizId) load();
  }, [quizId, showToast]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white border border-[#E6F4EC] rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-[#124734]">My Attempts</h1>
          <button
            onClick={() => navigate(`/student/quizzes/${quizId}/start`)}
            className="px-4 py-2 rounded-xl bg-[#009846] text-white hover:bg-[#0d3a28]"
          >
            Reattempt
          </button>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="text-[#5B7065]">Loading...</div>
          ) : attempts.length === 0 ? (
            <div className="text-[#5B7065]">No attempts yet.</div>
          ) : (
            <div className="space-y-3">
              {attempts.map((a) => (
                <div key={a._id} className="border border-[#E6F4EC] rounded-xl p-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[#124734] font-semibold">
                      {a.score} / {a.totalMarks}
                    </div>
                    <div className="text-xs text-[#5B7065] mt-1">
                      {fmtDate(a.submittedAt || a.createdAt)} • {a.timeTakenSeconds || 0}s
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/student/quizzes/${quizId}/start`)}
                    className="px-3 py-2 rounded-xl border border-[#A7E1B2] text-[#124734] hover:bg-[#F2FBF6]"
                  >
                    Attempt Again
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => navigate('/student/practice')} className="mt-4 text-sm underline text-[#124734]">
          ← Back
        </button>
      </div>
    </div>
  );
}
