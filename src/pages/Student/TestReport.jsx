import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StudentSidebar from "../../components/Student/StudentSidebar";
import StudentTopbar from "../../components/Student/StudentTopbar";
import RefreshComponent from "../../components/RefreshComponent";
import { getTestReport } from "../../lib/liveTestApi";

const fmtDateTime = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(iso);
  }
};

const pct = (a, b) => {
  const A = Number(a) || 0;
  const B = Number(b) || 0;
  if (!B) return 0;
  return Math.max(0, Math.min(100, Math.round((A / B) * 100)));
};

/* =======================
   ✅ SEO helper functions
   (NO layout impact)
======================= */
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

export default function TestReport() {
  const { seriesId, testId } = useParams();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidthPx = isCollapsed ? 80 : 256;

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getTestReport(seriesId, testId);
        setReport(data || null);
      } catch (e) {
        console.error(e);
        setReport(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [seriesId, testId]);

  // ✅ SEO: title + description + noindex (private) + canonical
  useEffect(() => {
    const seriesTitle = report?.series?.title || "Test Series";
    const testName = report?.test?.name || "Test";
    document.title = `Test Report - ${testName} | ${seriesTitle} | ProspectEdu Student`;

    upsertMeta(
      "description",
      "View your test score, accuracy, and detailed question review in the ProspectEdu student dashboard."
    );

    // Student/private results should not appear in Google
    upsertMeta("robots", "noindex, follow");

    upsertLink("canonical", window.location.href);
  }, [report?.series?.title, report?.test?.name]);

  const scorePct = useMemo(() => {
    return pct(report?.attempt?.score, report?.test?.totalMarks);
  }, [report]);

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F9FAFB]">
        <div className="m-auto bg-white p-6 rounded-2xl shadow-sm border border-[#E6F4EC]">
          Loading report...
        </div>
      </div>
    );
  }

  if (!report) return <RefreshComponent message="Report not found (maybe test not submitted yet)." />;

  const { series, test, attempt, stats, review } = report;

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
          <StudentTopbar isCollapsed={isCollapsed} pageTitle="Test Report" />
        </header>

        <main className="flex-1 overflow-y-auto text-left" style={{ marginTop: 64, height: "calc(100vh - 64px)" }}>
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
            {/* Header Card */}
            <div className="bg-white border border-[#E6F4EC] rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-[#A7E1B2] to-[#A7E1B2]/60">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-sm text-[#5B7065]">
                      {series?.title} / <span className="text-[#124734] font-semibold">{test?.name}</span>
                    </p>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-[#124734] mt-1">Result Summary</h1>
                    <p className="text-xs text-[#5B7065] mt-2">
                      Submitted: <b>{fmtDateTime(attempt?.submittedAt)}</b> • Questions: <b>{test?.totalQuestions}</b> • Total Marks:{" "}
                      <b>{test?.totalMarks}</b>
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(-1)}
                      className="px-4 py-2 rounded-full border border-[#CDE8D5] bg-white hover:bg-[#E6F4EC] text-[#124734] font-semibold"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => navigate(`/student-test-learning/${seriesId}`)}
                      className="px-4 py-2 rounded-full bg-[#009846] text-white font-semibold hover:brightness-95"
                    >
                      Go to Series
                    </button>
                  </div>
                </div>
              </div>

              {/* Score */}
              <div className="p-6 border-t border-[#E6F4EC]">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-[#F9FAFB] border border-[#E6F4EC] rounded-2xl p-5">
                    <p className="text-xs text-[#5B7065]">Score</p>
                    <p className="text-2xl font-extrabold text-[#124734]">
                      {attempt?.score} / {test?.totalMarks}
                    </p>
                    <div className="mt-3 h-3 w-full bg-white rounded-full border border-[#CDE8D5] overflow-hidden">
                      <div className="h-full bg-[#009846]" style={{ width: `${scorePct}%` }} />
                    </div>
                    <p className="text-xs text-[#5B7065] mt-2">{scorePct}%</p>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                    <p className="text-xs text-emerald-700">Correct</p>
                    <p className="text-2xl font-extrabold text-emerald-800">{stats?.correct}</p>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                    <p className="text-xs text-red-700">Wrong</p>
                    <p className="text-2xl font-extrabold text-red-800">{stats?.wrong}</p>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                    <p className="text-xs text-amber-700">Skipped</p>
                    <p className="text-2xl font-extrabold text-amber-800">{stats?.skipped}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-[#E6F4EC] rounded-2xl p-5">
                    <p className="text-sm font-extrabold text-[#124734]">Accuracy</p>
                    <p className="text-xs text-[#5B7065] mt-1">Correct / (Correct + Wrong)</p>
                    <div className="mt-3 h-3 w-full bg-[#F9FAFB] rounded-full border border-[#E6F4EC] overflow-hidden">
                      <div className="h-full bg-[#124734]" style={{ width: `${attempt?.accuracy ?? 0}%` }} />
                    </div>
                    <p className="text-sm font-bold text-[#124734] mt-2">{attempt?.accuracy ?? 0}%</p>
                  </div>

                  <div className="bg-white border border-[#E6F4EC] rounded-2xl p-5">
                    <p className="text-sm font-extrabold text-[#124734]">Marked for Review</p>
                    <p className="text-xs text-[#5B7065] mt-1">Questions you flagged during the test</p>
                    <p className="text-2xl font-extrabold text-[#124734] mt-3">{stats?.marked ?? 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Review */}
            <div className="mt-6 bg-white border border-[#E6F4EC] rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[#E6F4EC] bg-gradient-to-r from-[#A7E1B2]/60 to-[#A7E1B2]/30">
                <h2 className="text-xl font-extrabold text-[#124734]">Question Review</h2>
                <p className="text-xs text-[#5B7065] mt-1">See your answer vs the correct answer.</p>
              </div>

              <div className="p-6 space-y-4">
                {(review || []).map((r) => {
                  const chosen = r.chosenIndex;
                  const correct = r.correctIndex;

                  let statusPill = "bg-amber-50 border-amber-200 text-amber-800";
                  let label = "Skipped";
                  if (r.isCorrect) {
                    statusPill = "bg-emerald-50 border-emerald-200 text-emerald-800";
                    label = "Correct";
                  } else if (!r.isSkipped) {
                    statusPill = "bg-red-50 border-red-200 text-red-800";
                    label = "Wrong";
                  }

                  return (
                    <div key={r.index} className="border border-[#E6F4EC] rounded-2xl p-5 bg-[#F9FAFB]">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-extrabold text-[#124734]">
                            Q{r.index}. <span className="font-semibold text-[#0F2E22]">{r.q}</span>
                          </p>
                          <p className="text-xs text-[#5B7065] mt-1">Marks: {r.marks}</p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusPill}`}>{label}</span>
                          {r.marked && (
                            <span className="text-xs font-bold px-3 py-1 rounded-full border bg-white border-[#CDE8D5] text-[#124734]">
                              Marked
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(r.options || []).map((opt, i) => {
                          const isChosen = chosen === i;
                          const isCorrect = correct === i;

                          let cls = "bg-white border-[#E6F4EC] text-[#0F2E22]";
                          if (isCorrect) cls = "bg-emerald-50 border-emerald-200 text-emerald-800";
                          if (isChosen && !isCorrect) cls = "bg-red-50 border-red-200 text-red-800";

                          return (
                            <div key={i} className={`rounded-2xl border p-4 ${cls}`}>
                              <p className="text-sm font-semibold">
                                {["A", "B", "C", "D"][i]}. {opt}
                              </p>
                              <div className="mt-2 flex gap-2">
                                {isCorrect && (
                                  <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-white border border-emerald-200">
                                    Correct
                                  </span>
                                )}
                                {isChosen && (
                                  <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-white border border-[#CDE8D5]">
                                    Your Choice
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {r.explanation ? (
                        <div className="mt-4 bg-white border border-[#E6F4EC] rounded-2xl p-4">
                          <p className="text-xs font-bold text-[#124734]">Explanation</p>
                          <p className="text-sm text-[#0F2E22] mt-1">{r.explanation}</p>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
