import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import StudentSidebar from "../../components/Student/StudentSidebar";
import StudentTopbar from "../../components/Student/StudentTopbar";
import RefreshComponent from "../../components/RefreshComponent";
import { getLiveAttempt, saveLiveAttempt, submitLiveAttempt } from "../../lib/liveTestApi";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Eraser,
  Send,
  Expand,
  Minimize,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";

/* =======================
   ✅ SEO helper functions
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

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

const fmtMMSS = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
};

export default function LiveTest() {
  const { seriesId, testId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  /* =======================
     ✅ SEO (NO layout change)
  ======================= */
  useEffect(() => {
    document.title = "Live Test | ProspectEdu Student";

    upsertMeta(
      "description",
      "Attempt your live test securely on ProspectEdu. This page is accessible only during the active test window."
    );

    // Student / exam page → MUST NOT be indexed
    upsertMeta("robots", "noindex, follow");

    upsertLink("canonical", window.location.href);
  }, []);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidthPx = isCollapsed ? 80 : 256;

  const [loading, setLoading] = useState(true);
  const [seriesTitle, setSeriesTitle] = useState("");
  const [testMeta, setTestMeta] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempt, setAttempt] = useState(null);

  const [activeIdx, setActiveIdx] = useState(0);
  const [toast, setToast] = useState(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isFull, setIsFull] = useState(false);

  const viewMode = searchParams.get("view");

  const autosaveRef = useRef(null);
  const tickRef = useRef(null);
  const submitOnceRef = useRef(false);

  const [nowTick, setNowTick] = useState(Date.now());

  /* ---- REST OF YOUR FILE IS UNCHANGED ---- */
  /* ---- NO JSX / layout touched ---- */



  const expiresAtMs = useMemo(() => {
    return attempt?.expiresAt ? new Date(attempt.expiresAt).getTime() : null;
  }, [attempt?.expiresAt]);

  const timeLeftMs = useMemo(() => {
    if (!expiresAtMs) return 0;
    return Math.max(0, expiresAtMs - nowTick);
  }, [expiresAtMs, nowTick]);

  const timeDanger = timeLeftMs <= 2 * 60 * 1000; // last 2 min

  const answers = attempt?.answers || [];

  const counts = useMemo(() => {
    const total = questions.length;
    let answered = 0;
    let review = 0;
    for (let i = 0; i < total; i++) {
      const a = answers[i];
      if (a?.selectedIndex !== null && a?.selectedIndex !== undefined) answered++;
      if (a?.review) review++;
    }
    const un = total - answered;
    return { total, answered, un, review };
  }, [answers, questions.length]);

  const currentQ = questions[activeIdx];
  const currentA = answers[activeIdx] || { selectedIndex: null, review: false };

  const load = async () => {
    setLoading(true);
    try {
      const data = await getLiveAttempt(seriesId, testId);
      setSeriesTitle(data?.seriesTitle || "Live Test");
      setTestMeta(data?.test || null);
      setQuestions(Array.isArray(data?.questions) ? data.questions : []);
      const rawAttempt = data?.attempt || null;
const qs = Array.isArray(data?.questions) ? data.questions : [];
const total = qs.length;

// ✅ normalize answers so nothing is pre-selected
let normAttempt = rawAttempt;

if (rawAttempt) {
  const arr = Array.isArray(rawAttempt.answers) ? [...rawAttempt.answers] : [];

  // ensure array length = questions length
  for (let i = 0; i < total; i++) {
    const a = arr[i] || {};

    // IMPORTANT:
    // If backend sends 0 by default, treat it as "not answered"
    // unless we are sure student actually selected something.
    // safest: convert undefined / null / NaN to null.
    const idx = a.selectedIndex;

    const fixedSelected =
      idx === undefined || idx === null || Number.isNaN(Number(idx)) ? null : Number(idx);

    arr[i] = {
      review: Boolean(a.review),
      selectedIndex: fixedSelected,
    };
  }

  normAttempt = { ...rawAttempt, answers: arr };
}

setAttempt(normAttempt);

      setActiveIdx(0);
    } catch (e) {
      console.error(e);
      setSeriesTitle("");
      setTestMeta(null);
      setQuestions([]);
      setAttempt(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    return () => {
      if (autosaveRef.current) clearInterval(autosaveRef.current);
      if (tickRef.current) clearInterval(tickRef.current);
    };
    // eslint-disable-next-line
  }, [seriesId, testId]);

  // ✅ FIX: Hooks MUST be before any return.
  // If already submitted, don't allow re-attempt
  useEffect(() => {
    if (!attempt) return;
    if (attempt?.submitted) {
      navigate(`/studen-ttest-learning/${seriesId}`, { replace: true });
    }
  }, [attempt?.submitted, seriesId, navigate]);

  // Timer tick (accurate)
  useEffect(() => {
    if (!attempt?.expiresAt) return;
    if (attempt?.submitted) return;

    if (tickRef.current) clearInterval(tickRef.current);

    tickRef.current = setInterval(() => {
      setNowTick(Date.now());
    }, 1000);

    return () => clearInterval(tickRef.current);
  }, [attempt?.expiresAt, attempt?.submitted]);

  // Auto submit if time ends (only once)
  useEffect(() => {
    if (!attempt?.expiresAt) return;
    if (attempt?.submitted) return;
    if (timeLeftMs > 0) return;

    if (submitOnceRef.current) return;
    submitOnceRef.current = true;

    handleSubmit(true);
    // eslint-disable-next-line
  }, [timeLeftMs, attempt?.expiresAt, attempt?.submitted]);

  // Autosave every 10s
  useEffect(() => {
    if (!attempt?.attemptId) return;
    if (autosaveRef.current) clearInterval(autosaveRef.current);
    autosaveRef.current = setInterval(() => {
      handleSave(false);
    }, 10000);
    return () => clearInterval(autosaveRef.current);
    // eslint-disable-next-line
  }, [attempt?.attemptId, answers]);

  const setAnswer = (idx) => {
    setAttempt((prev) => {
      const next = { ...prev };
      const arr = Array.isArray(next.answers) ? [...next.answers] : [];
      arr[activeIdx] = { ...(arr[activeIdx] || {}), selectedIndex: idx };
      next.answers = arr;
      return next;
    });
  };

  const clearAnswer = () => {
    setAttempt((prev) => {
      const next = { ...prev };
      const arr = Array.isArray(next.answers) ? [...next.answers] : [];
      arr[activeIdx] = { ...(arr[activeIdx] || {}), selectedIndex: null };
      next.answers = arr;
      return next;
    });
  };

  const toggleReview = () => {
    setAttempt((prev) => {
      const next = { ...prev };
      const arr = Array.isArray(next.answers) ? [...next.answers] : [];
      arr[activeIdx] = { ...(arr[activeIdx] || {}), review: !arr[activeIdx]?.review };
      next.answers = arr;
      return next;
    });
  };

  const handleSave = async (showToast = true) => {
    if (!attempt?.attemptId) return;
    try {
      setSaving(true);
      await saveLiveAttempt(attempt.attemptId, attempt.answers || []);
      if (showToast) setToast({ type: "ok", msg: "Saved" });
    } catch (e) {
      console.error(e);
      if (showToast) setToast({ type: "err", msg: "Auto-save failed" });
    } finally {
      setSaving(false);
      if (showToast) setTimeout(() => setToast(null), 1500);
    }
  };

  const handleSubmit = async (auto = false) => {
    if (!attempt?.attemptId) return;
    try {
      setSubmitting(true);
      await handleSave(false);
      const res = await submitLiveAttempt(attempt.attemptId);

      setToast({
        type: "ok",
        msg: auto ? "Time up! Test submitted." : "Test submitted successfully.",
      });

      setSubmitOpen(false);

      // ✅ Redirect after submit (choose what you want)
      // Option A: Go back to test details
      setTimeout(() => {
        navigate(`/student-test-learning/${seriesId}`);
      }, 900);

      // Option B: If you create a result page later:
      // navigate(`/student/test-result/${attempt.attemptId}`);

      console.log("SUBMIT RESULT:", res);
    } catch (e) {
      console.error(e);
      setToast({ type: "err", msg: e?.response?.data?.message || "Submit failed" });
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(null), 2500);
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFull(true);
      } else {
        await document.exitFullscreen();
        setIsFull(false);
      }
    } catch {
      // ignore
    }
  };

  const goto = (i) => setActiveIdx(clamp(i, 0, questions.length - 1));

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F9FAFB]">
        <div className="m-auto bg-white p-6 rounded-2xl shadow-sm border border-[#E6F4EC]">
          Loading Live Test...
        </div>
      </div>
    );
  }

  if (!attempt || !testMeta || questions.length === 0) {
    return <RefreshComponent message="Live test not found or no questions available." />;
  }

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      <aside
        className={`${isCollapsed ? "w-20" : "w-64"} fixed top-0 left-0 h-full z-40 transition-all duration-300`}
      >
        <StudentSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </aside>

      <div
        className="flex flex-col flex-1 h-screen transition-all duration-300"
        style={{ marginLeft: sidebarWidthPx, width: `calc(100vw - ${sidebarWidthPx}px)` }}
      >
        <header
          className="fixed top-0 z-[999] bg-white shadow-sm h-[64px]"
          style={{ left: sidebarWidthPx, right: 0 }}
        >
          <StudentTopbar isCollapsed={isCollapsed} pageTitle="Live Test" />
        </header>

        <main className="flex-1 overflow-y-auto text-left" style={{ marginTop: 64 }}>
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            {/* Top Bar */}
            <div className="bg-white border border-[#E6F4EC] rounded-2xl shadow-sm overflow-hidden mb-5">
              <div className="p-5 md:p-6 bg-gradient-to-r from-[#E6F4EC] to-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-sm text-[#5B7065]">
                      {seriesTitle} /{" "}
                      <span className="text-[#124734] font-semibold">{testMeta?.name || "Test"}</span>
                    </p>
                    <h1 className="text-xl md:text-2xl font-extrabold text-[#124734] mt-1">MCQ Live Test</h1>
                    <p className="text-xs text-[#5B7065] mt-1">
                      Questions: <b>{questions.length}</b> • Total Marks:{" "}
                      <b>{testMeta?.totalMarks ?? "—"}</b> • Duration: <b>{testMeta?.durationMinutes || 0} min</b>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border font-bold ${
                        timeDanger
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-white text-[#124734] border-[#CDE8D5]"
                      }`}
                      title="Time Left"
                    >
                      <Clock size={18} />
                      {fmtMMSS(timeLeftMs)}
                    </div>

                    <button
                      onClick={() => navigate(-1)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#CDE8D5] bg-white hover:bg-[#E6F4EC] text-[#124734] font-semibold"
                    >
                      <ChevronLeft size={18} /> Back
                    </button>

                    <button
                      onClick={toggleFullscreen}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#CDE8D5] bg-white hover:bg-[#E6F4EC] text-[#124734] font-semibold"
                    >
                      {isFull ? <Minimize size={18} /> : <Expand size={18} />}
                      {isFull ? "Exit" : "Full"}
                    </button>

                    <button
                      onClick={() => setSubmitOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#009846] text-white font-semibold hover:brightness-95 shadow"
                    >
                      <Send size={18} /> Submit
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress chips */}
              <div className="px-5 py-4 border-t border-[#E6F4EC] bg-white">
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold border bg-white text-[#124734] border-[#CDE8D5]">
                    Answered: {counts.answered}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold border bg-white text-[#124734] border-[#CDE8D5]">
                    Unanswered: {counts.un}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold border bg-amber-50 text-amber-800 border-amber-200">
                    Marked: {counts.review}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-800 border-emerald-200">
                    Autosave: {saving ? "Saving..." : "On"}
                  </span>
                </div>
              </div>
            </div>

            {toast && (
              <div
                className={`mb-4 rounded-2xl border p-4 flex items-center gap-3 ${
                  toast.type === "ok"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {toast.type === "ok" ? <CheckCircle2 /> : <AlertTriangle />}
                <p className="font-semibold">{toast.msg}</p>
              </div>
            )}

            {/* Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Question Area */}
              <div className="lg:col-span-8">
                <div className="bg-white border border-[#E6F4EC] rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-[#E6F4EC] bg-gradient-to-r from-[#E6F4EC] to-white">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-lg font-extrabold text-[#124734]">
                        Question {activeIdx + 1}{" "}
                        <span className="text-sm text-[#5B7065] font-semibold">/ {questions.length}</span>
                      </h2>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleReview}
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold ${
                            currentA?.review
                              ? "bg-amber-50 border-amber-200 text-amber-800"
                              : "bg-white border-[#CDE8D5] text-[#124734] hover:bg-[#E6F4EC]"
                          }`}
                        >
                          <Flag size={16} /> {currentA?.review ? "Marked" : "Mark"}
                        </button>

                        <button
                          onClick={clearAnswer}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold"
                        >
                          <Eraser size={16} /> Clear
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-base font-semibold text-[#0F2E22] leading-relaxed">{currentQ?.q}</p>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(currentQ?.options || []).map((opt, i) => {
                        const selected = currentA?.selectedIndex === i;
                        return (
                          <button
                            key={i}
                            onClick={() => setAnswer(i)}
                            className={`text-left p-4 rounded-2xl border transition shadow-sm ${
                              selected ? "border-[#009846] bg-[#E6F4EC]" : "border-[#E6F4EC] bg-white hover:bg-[#F9FAFB]"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold ${
                                  selected
                                    ? "bg-[#009846] text-white"
                                    : "bg-[#F9FAFB] text-[#124734] border border-[#E6F4EC]"
                                }`}
                              >
                                {["A", "B", "C", "D"][i]}
                              </div>
                              <div className="flex-1">
                                <p className={`font-semibold ${selected ? "text-[#124734]" : "text-[#0F2E22]"}`}>
                                  {opt}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <button
                        onClick={() => goto(activeIdx - 1)}
                        disabled={activeIdx === 0}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold border ${
                          activeIdx === 0
                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                            : "bg-white text-[#124734] border-[#CDE8D5] hover:bg-[#E6F4EC]"
                        }`}
                      >
                        <ChevronLeft size={18} /> Previous
                      </button>

                      <button
                        onClick={() => goto(activeIdx + 1)}
                        disabled={activeIdx === questions.length - 1}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold border ${
                          activeIdx === questions.length - 1
                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                            : "bg-white text-[#124734] border-[#CDE8D5] hover:bg-[#E6F4EC]"
                        }`}
                      >
                        Next <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Palette */}
              <div className="lg:col-span-4">
                <div className="bg-white border border-[#E6F4EC] rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-[#E6F4EC] bg-gradient-to-r from-[#E6F4EC] to-white">
                    <h3 className="text-lg font-extrabold text-[#124734]">Question Palette</h3>
                    <p className="text-xs text-[#5B7065] mt-1">Click a number to jump quickly.</p>
                  </div>

                  <div className="p-5">
                    <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-6 gap-2">
                      {questions.map((_, i) => {
                        const a = answers[i];
                        const isActive = i === activeIdx;
                        const isAnswered = a?.selectedIndex !== null && a?.selectedIndex !== undefined;
                        const isReview = !!a?.review;

                        let cls = "bg-white border-[#E6F4EC] text-[#124734] hover:bg-[#F9FAFB]";
                        if (isAnswered) cls = "bg-[#E6F4EC] border-[#009846] text-[#124734]";
                        if (isReview) cls = "bg-amber-50 border-amber-200 text-amber-800";
                        if (isActive) cls = "bg-[#009846] border-[#009846] text-white";

                        return (
                          <button
                            key={i}
                            onClick={() => goto(i)}
                            className={`h-10 rounded-xl border font-extrabold transition ${cls}`}
                            title={
                              isActive ? "Current" : isReview ? "Marked for review" : isAnswered ? "Answered" : "Unanswered"
                            }
                          >
                            {i + 1}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded border bg-white border-[#E6F4EC]" />
                        Unanswered
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded border bg-[#E6F4EC] border-[#009846]" />
                        Answered
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded border bg-amber-50 border-amber-200" />
                        Marked
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded border bg-[#009846] border-[#009846]" />
                        Current
                      </div>
                    </div>

                    <div className="mt-5 flex gap-2">
                      <button
                        onClick={() => handleSave(true)}
                        className="flex-1 px-4 py-2 rounded-xl border border-[#CDE8D5] bg-white hover:bg-[#E6F4EC] text-[#124734] font-semibold"
                      >
                        Save Now
                      </button>
                      <button
                        onClick={() => setSubmitOpen(true)}
                        className="flex-1 px-4 py-2 rounded-xl bg-[#009846] text-white font-semibold hover:brightness-95"
                      >
                        Submit
                      </button>
                    </div>

                    <p className="text-xs text-[#5B7065] mt-3">Note: Your answers auto-save every 10 seconds.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ SUBMIT MODAL (COMPLETED) */}
            {submitOpen && (
              <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-5 border-b border-[#E6F4EC] bg-gradient-to-r from-[#E6F4EC] to-white flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-extrabold text-[#124734]">Submit Test?</h3>
                      <p className="text-sm text-[#5B7065] mt-1">
                        Answered <b>{counts.answered}</b> / {counts.total} • Marked <b>{counts.review}</b> • Unanswered{" "}
                        <b>{counts.un}</b>
                      </p>
                    </div>
                    <button onClick={() => setSubmitOpen(false)} className="p-2 rounded-xl hover:bg-white/70">
                      <X />
                    </button>
                  </div>

                  <div className="p-5">
                    {counts.un > 0 ? (
                      <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
                        <AlertTriangle className="text-amber-700 mt-0.5" />
                        <div className="text-sm text-amber-800">
                          <p className="font-bold">You still have {counts.un} unanswered questions.</p>
                          <p className="mt-1">You can submit now, or go back and complete them.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">
                        <CheckCircle2 className="text-emerald-700 mt-0.5" />
                        <div className="text-sm text-emerald-800">
                          <p className="font-bold">All questions are answered.</p>
                          <p className="mt-1">You are ready to submit.</p>
                        </div>
                      </div>
                    )}

                    <div className="bg-[#F9FAFB] border border-[#E6F4EC] rounded-2xl p-4">
                      <p className="text-sm font-bold text-[#124734] mb-3">Quick Overview</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[240px] overflow-y-auto pr-2">
                        {questions.map((_, i) => {
                          const a = answers[i];
                          const answered = a?.selectedIndex !== null && a?.selectedIndex !== undefined;
                          const marked = !!a?.review;

                          let pill = "bg-white border-[#E6F4EC] text-[#124734]";
                          let label = "Unanswered";
                          if (answered) {
                            pill = "bg-[#E6F4EC] border-[#009846] text-[#124734]";
                            label = "Answered";
                          }
                          if (marked) {
                            pill = "bg-amber-50 border-amber-200 text-amber-800";
                            label = answered ? "Answered + Marked" : "Marked";
                          }

                          return (
                            <button
                              key={i}
                              onClick={() => {
                                setSubmitOpen(false);
                                goto(i);
                              }}
                              className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-sm font-semibold hover:brightness-95 transition ${pill}`}
                              title="Click to jump"
                            >
                              <span>Q{i + 1}</span>
                              <span className="text-xs font-bold">{label}</span>
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-xs text-[#5B7065] mt-3">Tip: Click any question to jump to it.</p>
                    </div>
                  </div>

                  <div className="p-5 border-t border-[#E6F4EC] flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <button
                      onClick={() => setSubmitOpen(false)}
                      className="px-4 py-2 rounded-xl border border-[#CDE8D5] bg-white hover:bg-[#E6F4EC] text-[#124734] font-semibold"
                    >
                      Continue Test
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(true)}
                        disabled={saving || submitting}
                        className={`px-4 py-2 rounded-xl border font-semibold ${
                          saving || submitting
                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                            : "bg-white text-[#124734] border-[#CDE8D5] hover:bg-[#E6F4EC]"
                        }`}
                      >
                        Save
                      </button>

                      <button
                        onClick={() => handleSubmit(false)}
                        disabled={submitting}
                        className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl font-semibold shadow ${
                          submitting ? "bg-gray-300 text-gray-600" : "bg-[#009846] text-white hover:brightness-95"
                        }`}
                      >
                        <Send size={18} />
                        {submitting ? "Submitting..." : "Submit Final"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* ✅ END MODAL */}
          </div>
        </main>
      </div>
    </div>
  );
}
