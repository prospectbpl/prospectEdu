// src/pages/Student/StudentTestDetails.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StudentSidebar from "../../components/Student/StudentSidebar";
import StudentTopbar from "../../components/Student/StudentTopbar";
import RefreshComponent from "../../components/RefreshComponent";
import { fetchMySeriesDetails } from "../../lib/testPurchaseApi";

// ✅ SEO helpers (no layout impact)
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

const fmtDateTime = (iso) => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-GB", {
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

const toMin = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

/**
 * IMPORTANT:
 * attempted must be derived from attempt.submitted (backend attaches it in /test-purchase/me/series/:seriesId)
 * so view report + filter + progress all depend on latest fetch after submission.
 */
function computeTestStatus(test, nowMs) {
  const start = test?.startAt ? new Date(test.startAt).getTime() : null;
  const end = test?.endAt ? new Date(test.endAt).getTime() : null;

  // ✅ strongest signal (backend sets attempt.submitted when student submits)
  const attempted = Boolean(test?.attempt?.submitted || test?.attempted);

  const explicit = (test?.status || "").toLowerCase();
  if (explicit === "live") return attempted ? "attempted" : "live";
  if (explicit === "upcoming") return attempted ? "attempted" : "upcoming";
  if (explicit === "ended") return attempted ? "attempted" : "unattempted";

  if (start && nowMs < start) return attempted ? "attempted" : "upcoming";
  if (start && (!end || nowMs <= end)) return attempted ? "attempted" : "live";
  if (end && nowMs > end) return attempted ? "attempted" : "unattempted";

  if (attempted) return "attempted";
  return "unattempted";
}

const badgeStyles = {
  live: "bg-red-50 text-red-700 border-red-200",
  upcoming: "bg-amber-50 text-amber-800 border-amber-200",
  attempted: "bg-emerald-50 text-emerald-800 border-emerald-200",
  unattempted: "bg-slate-50 text-slate-700 border-slate-200",
};

export default function StudentTestDetails() {
  const { id } = useParams(); // seriesId
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidthPx = isCollapsed ? 80 : 256;

  const [activeTab, setActiveTab] = useState("all"); // all|attempted|unattempted
  const [loading, setLoading] = useState(true);
  const [series, setSeries] = useState(null);

  // ✅ keep time in state so status updates without full reload
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 30_000); // update every 30s
    return () => clearInterval(t);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMySeriesDetails(id);
      setSeries(data || null);
    } catch (e) {
      console.error(e);
      setSeries(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // ✅ SEO (private student page => noindex)
  useEffect(() => {
    const title = series?.title ? `${series.title} | Test Series Details` : "Test Series Details";
    document.title = `${title} | ProspectEdu Student`;
    upsertMeta("description", "View your test series details, live tests, attempts and reports in ProspectEdu.");
    upsertMeta("robots", "noindex, follow");
    upsertLink("canonical", window.location.href);
  }, [series?.title]);

  // ✅ initial load
  useEffect(() => {
    load();
  }, [load]);

  /**
   * ✅ BIG FIX:
   * When student finishes test and comes back from /live page,
   * this page must re-fetch so attempted/filter/progress becomes correct.
   */
  useEffect(() => {
    const onFocus = () => load();
    const onVis = () => {
      if (document.visibilityState === "visible") load();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [load]);

  const testsWithStatus = useMemo(() => {
    const tests = Array.isArray(series?.tests) ? series.tests : [];
    return tests.map((t) => ({
      ...t,
      __status: computeTestStatus(t, nowMs),
      __isAttempted: Boolean(t?.attempt?.submitted || t?.attempted),
    }));
  }, [series, nowMs]);

  const counts = useMemo(() => {
    const total = testsWithStatus.length;
    const attempted = testsWithStatus.filter((t) => t.__isAttempted).length; // ✅ submitted only
    const unattempted = total - attempted;
    return { all: total, attempted, unattempted };
  }, [testsWithStatus]);

  const progressPct = useMemo(() => {
    const total = counts.all || 0;
    if (!total) return 0;
    return clamp(Math.round((counts.attempted / total) * 100), 0, 100);
  }, [counts]);

  const filtered = useMemo(() => {
    if (activeTab === "attempted") return testsWithStatus.filter((t) => t.__isAttempted);
    if (activeTab === "unattempted") return testsWithStatus.filter((t) => !t.__isAttempted);
    return testsWithStatus;
  }, [testsWithStatus, activeTab]);

  const seriesTitle = series?.title || "Test Series Details";
  const seriesType = series?.type || "—";
  const seriesLang = series?.language || "—";
  const totalTest = series?.totalTest ?? counts.all;
  const totalQ = series?.totalQuestion ?? "—";
  const questionType = series?.questionType || "—";
  const price = Number(series?.price || 0);

  const startLiveTest = (test) => {
    const tid = test?._id || test?.id;
    navigate(`/student/series/${id}/tests/${tid}/live`);
  };

  const viewReport = (test) => {
    const tid = test?._id || test?.id;
    navigate(`/student/series/${id}/tests/${tid}/report`);
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
          <StudentTopbar isCollapsed={isCollapsed} pageTitle="Test Series Details" />
        </header>

        <main className="flex-1 overflow-y-auto text-left" style={{ marginTop: 64, height: "calc(100vh - 64px)" }}>
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="text-sm text-[#5B7065]">
                Home / <span className="text-[#124734] font-medium">My Test Series</span> /{" "}
                <span className="text-[#124734] font-semibold">Details</span>
              </p>

              <div className="flex gap-2">
                <button
                  onClick={load}
                  className="text-sm font-medium px-4 py-2 rounded-full border border-[#CDE8D5] bg-white hover:bg-[#E6F4EC] text-[#124734] transition"
                >
                  ⟳ Refresh
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="text-sm font-medium px-4 py-2 rounded-full border border-[#CDE8D5] bg-white hover:bg-[#E6F4EC] text-[#124734] transition"
                >
                  ← Back
                </button>
              </div>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E6F4EC]">Loading...</div>
            ) : !series ? (
              <RefreshComponent message="Series not found or you don’t have access." />
            ) : (
              <>
                <div className="bg-white border border-[#E6F4EC] rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-6 md:p-8 bg-gradient-to-r from-[#A7E1B2] to-[#A7E1B2]/80">
                    <div className="flex flex-col md:flex-row md:items-center gap-5">
                      <div className="w-full md:w-[220px]">
                        <div className="bg-white rounded-2xl border border-[#CDE8D5] p-3 shadow-sm">
                          <img
                            src={series?.imageUrl || "/src/assets/test1.webp"}
                            alt={seriesTitle}
                            className="w-full h-36 object-contain"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-white text-[#124734] border-[#CDE8D5]">
                            {seriesType}
                          </span>
                          <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-white text-[#124734] border-[#CDE8D5]">
                            Language: {seriesLang}
                          </span>
                          <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-white text-[#124734] border-[#CDE8D5]">
                            Q.Type: {questionType}
                          </span>
                          <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-white text-[#124734] border-[#CDE8D5]">
                            Price: {price === 0 ? "Free" : `₹${price}`}
                          </span>
                        </div>

                        <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F2E22] leading-tight">
                          {seriesTitle}
                        </h1>

                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-white rounded-2xl border border-[#CDE8D5] p-4">
                            <p className="text-xs text-[#5B7065]">Total Tests</p>
                            <p className="text-xl font-bold text-[#124734]">{totalTest}</p>
                          </div>
                          <div className="bg-white rounded-2xl border border-[#CDE8D5] p-4">
                            <p className="text-xs text-[#5B7065]">Total Questions</p>
                            <p className="text-xl font-bold text-[#124734]">{totalQ}</p>
                          </div>
                          <div className="bg-white rounded-2xl border border-[#CDE8D5] p-4">
                            <p className="text-xs text-[#5B7065]">Attempted</p>
                            <p className="text-xl font-bold text-[#124734]">{counts.attempted}</p>
                          </div>
                          <div className="bg-white rounded-2xl border border-[#CDE8D5] p-4">
                            <p className="text-xs text-[#5B7065]">Unattempted</p>
                            <p className="text-xl font-bold text-[#124734]">{counts.unattempted}</p>
                          </div>
                        </div>

                        <div className="mt-5">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-[#124734]">Your Progress</p>
                            <p className="text-sm font-bold text-[#124734]">{progressPct}%</p>
                          </div>
                          <div className="h-3 w-full bg-white rounded-full border border-[#CDE8D5] overflow-hidden">
                            <div className="h-full bg-[#009846]" style={{ width: `${progressPct}%` }} />
                          </div>
                          <p className="text-xs text-[#5B7065] mt-2">
                            Attempt {counts.attempted} out of {counts.all} tests.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="mt-6 bg-white border border-[#E6F4EC] rounded-2xl shadow-sm">
                  <div className="px-4 md:px-6 pt-4">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: "all", label: `All (${counts.all})` },
                        { key: "attempted", label: `Attempted (${counts.attempted})` },
                        { key: "unattempted", label: `Unattempted (${counts.unattempted})` },
                      ].map((t) => (
                        <button
                          key={t.key}
                          onClick={() => setActiveTab(t.key)}
                          className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                            activeTab === t.key
                              ? "bg-[#009846] text-white border-[#009846]"
                              : "bg-white text-[#124734] border-[#CDE8D5] hover:bg-[#E6F4EC]"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="px-4 md:px-6 pb-6 pt-4">
                    {filtered.length === 0 ? (
                      <div className="bg-[#A7E1B2] border border-[#E6F4EC] rounded-2xl p-6">
                        <p className="text-sm text-[#5B7065]">No tests found in this section.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filtered.map((test) => {
                          const status = test.__status;
                          const badge = badgeStyles[status] || badgeStyles.unattempted;

                          const title = test?.title || test?.name || "Test";
                          const durationMin = toMin(test?.durationMinutes || 0);
                          const marks = test?.totalMarks ?? "—";
                          const questions = test?.totalQuestions ?? "—";

                          const isAttempted = test.__isAttempted;
                          const canAttempt = status === "live" || status === "unattempted";

                          return (
                            <div
                              key={test?._id || title}
                              className="bg-[#A7E1B2]/60 border border-[#E6F4EC] rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden"
                            >
                              <div className="p-5">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <h3 className="text-lg font-extrabold text-[#0F2E22]">{title}</h3>
                                  </div>

                                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${badge}`}>
                                    {isAttempted
                                      ? "ATTEMPTED"
                                      : status === "live"
                                      ? "LIVE NOW"
                                      : status === "upcoming"
                                      ? "UPCOMING"
                                      : "UNATTEMPTED"}
                                  </span>
                                </div>

                                <div className="mt-4 grid grid-cols-3 gap-2">
                                  <div className="bg-[#F9FAFB] border border-[#E6F4EC] rounded-xl p-3">
                                    <p className="text-[11px] text-[#5B7065]">Questions</p>
                                    <p className="text-base font-bold text-[#124734]">{questions}</p>
                                  </div>
                                  <div className="bg-[#F9FAFB] border border-[#E6F4EC] rounded-xl p-3">
                                    <p className="text-[11px] text-[#5B7065]">Marks</p>
                                    <p className="text-base font-bold text-[#124734]">{marks}</p>
                                  </div>
                                  <div className="bg-[#F9FAFB] border border-[#E6F4EC] rounded-xl p-3">
                                    <p className="text-[11px] text-[#5B7065]">Duration</p>
                                    <p className="text-base font-bold text-[#124734]">
                                      {durationMin ? `${durationMin} min` : "—"}
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-5 flex items-center justify-between gap-3">
                                  <div className="text-xs text-[#5B7065]">
                                    {isAttempted ? (
                                      <>
                                        Score: <b>{test?.attempt?.score ?? "—"}</b> / {test?.attempt?.totalMarks ?? "—"}
                                      </>
                                    ) : status === "upcoming" ? (
                                      "You can attempt when it becomes live."
                                    ) : status === "live" ? (
                                      "Attempt now before it ends."
                                    ) : (
                                      "Not attempted yet."
                                    )}
                                  </div>

                                  <div className="flex gap-2">
                                    {isAttempted ? (
                                      <button
                                        onClick={() => viewReport(test)}
                                        className="px-4 py-2 rounded-full text-sm font-semibold border border-[#124734] text-[#124734] hover:bg-[#E6F4EC] transition"
                                      >
                                        View Report
                                      </button>
                                    ) : (
                                      <button
                                        disabled={!canAttempt}
                                        onClick={() => startLiveTest(test)}
                                        className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                                          canAttempt
                                            ? "bg-[#009846] text-white hover:brightness-95"
                                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                        }`}
                                      >
                                        {status === "live" ? "Start Now" : "Attempt"}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 bg-white border border-[#E6F4EC] rounded-2xl shadow-sm p-6">
                  <h3 className="text-lg font-extrabold text-[#0F2E22] mb-3">Important Information</h3>
                  <ul className="text-sm text-[#5B7065] list-disc pl-5 space-y-2">
                    <li>Live tests can be attempted only within the live window (start/end time).</li>
                    <li>After submission, you can view your full report.</li>
                    <li>Make sure your internet connection is stable before starting an online test.</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
