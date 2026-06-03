import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TeacherSidebar from "../../components/Teacher/TeacherSidebar";
import TeacherTopbar from "../../components/Teacher/TeacherTopbar";
import RefreshComponent from "../../components/RefreshComponent";
import { fetchTeacherSeriesById } from "../../lib/testSeriesApi";
import { fetchSeriesTests } from "../../lib/seriesTestsApi";
import { fetchTestQuestions, saveTestQuestionsBulk } from "../../lib/testQuestionsApi";
import { Save, ChevronLeft, CheckCircle, AlertTriangle } from "lucide-react";

const makeEmptyMCQ = () => ({
  q: "",
  options: ["", "", "", ""],
  correctIndex: 0,
  marks: 1,
  explanation: "",
});

export default function TeacherTestQuestions() {
  const { id, testId } = useParams(); // seriesId, testId
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidthPx = isCollapsed ? 80 : 256;

  // ✅ SEO
  const canonicalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${location.pathname}`
      : location.pathname;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [series, setSeries] = useState(null);
  const [test, setTest] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [toast, setToast] = useState(null); // {type:'ok'|'err', msg:''}

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
          name: "Test & Learning",
          item:
            typeof window !== "undefined"
              ? `${window.location.origin}/teacher-dashboard`
              : "/teacher-dashboard",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Add Questions",
          item: canonicalUrl,
        },
      ],
    }),
    [canonicalUrl]
  );

  const seoTitle = useMemo(() => {
    const s = series?.title || "Test Series";
    const t = test?.name || "Test";
    return `${s} • ${t} | Add Questions | Teacher Dashboard | ProspectEdu`;
  }, [series?.title, test?.name]);

  const load = async () => {
    setLoading(true);
    try {
      // ✅ teacher series
      const s = await fetchTeacherSeriesById(id);
      setSeries(s || null);

      // ✅ find test
      const list = await fetchSeriesTests(id);
      const t = (Array.isArray(list) ? list : []).find(
        (x) => String(x?._id || x?.id) === String(testId)
      );

      // ✅ FIX: set test
      setTest(t || null);

      if (!t) {
        setQuestions([]);
        return;
      }

      // ✅ existing questions
      const existing = await fetchTestQuestions(id, testId);
      const existingArr = Array.isArray(existing) ? existing : [];

      // ✅ exact length = totalQuestions
      const targetLen = Math.max(0, Number(t.totalQuestions || 0));

      // normalize existing
      let merged = existingArr.map((q) => ({
        q: q?.q || "",
        options: Array.isArray(q?.options)
          ? [...q.options, "", "", "", ""].slice(0, 4)
          : ["", "", "", ""],
        correctIndex: Number.isFinite(Number(q?.correctIndex)) ? Number(q.correctIndex) : 0,
        marks: Number.isFinite(Number(q?.marks)) ? Number(q.marks) : 1,
        explanation: q?.explanation || "",
      }));

      while (merged.length < targetLen) merged.push(makeEmptyMCQ());
      if (merged.length > targetLen) merged = merged.slice(0, targetLen);

      setQuestions(merged);
    } catch (e) {
      console.error(e);
      setSeries(null);
      setTest(null);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id, testId]);

  const updateQ = (idx, key, value) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });
  };

  const updateOption = (idx, optIdx, value) => {
    setQuestions((prev) => {
      const next = [...prev];
      const q = { ...next[idx] };
      const opts = Array.isArray(q.options) ? [...q.options] : ["", "", "", ""];
      opts[optIdx] = value;
      q.options = opts;
      next[idx] = q;
      return next;
    });
  };

  const validate = () => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!String(q.q || "").trim())
        return { ok: false, msg: `Question ${i + 1}: Question text is required` };
      const opts = q.options || [];
      if (opts.some((o) => !String(o || "").trim()))
        return { ok: false, msg: `Question ${i + 1}: All 4 options are required` };
      const ci = Number(q.correctIndex);
      if (!(ci >= 0 && ci <= 3))
        return { ok: false, msg: `Question ${i + 1}: Correct answer invalid` };
    }
    return { ok: true };
  };

  const onSave = async () => {
    const v = validate();
    if (!v.ok) {
      setToast({ type: "err", msg: v.msg });
      return;
    }

    try {
      setSaving(true);
      await saveTestQuestionsBulk(id, testId, questions);
      setToast({ type: "ok", msg: "Questions saved successfully" });
    } catch (e) {
      console.error(e);
      setToast({ type: "err", msg: e?.response?.data?.message || "Save failed" });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 2500);
    }
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* ✅ SEO (NO layout impact) */}
      <Helmet>
        <title>{seoTitle}</title>
        <meta
          name="description"
          content="Add and manage MCQ questions for a test series in the ProspectEdu teacher dashboard."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <aside
        className={`${
          isCollapsed ? "w-20" : "w-64"
        } fixed top-0 left-0 h-full z-40 transition-all duration-300`}
      >
        <TeacherSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </aside>

      <div
        className="flex flex-col flex-1 h-screen transition-all duration-300 text-left"
        style={{ marginLeft: sidebarWidthPx, width: `calc(100vw - ${sidebarWidthPx}px)` }}
      >
        <header
          className="fixed top-0 z-[999] bg-white shadow-sm h-[64px]"
          style={{ left: sidebarWidthPx, right: 0 }}
        >
          <TeacherTopbar isCollapsed={isCollapsed} pageTitle="Add Questions" />
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-8" style={{ marginTop: "64px" }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <p className="text-sm text-[#5B7065]">
                  Teacher / <span className="text-[#124734] font-semibold">Test & Learning</span> /{" "}
                  <span className="text-[#124734] font-bold">Questions</span>
                </p>

                <h1 className="text-2xl font-extrabold text-[#124734] mt-2">
                  {series?.title || "Test Series"} • {test?.name || "Test"}
                </h1>

                <p className="text-sm text-[#5B7065] mt-1">
                  Type: <b>MCQ</b> • Total Questions: <b>{questions.length}</b>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#CDE8D5] bg-white text-[#124734] font-semibold hover:bg-[#E6F4EC]"
                >
                  <ChevronLeft size={18} /> Back
                </button>

                <button
                  onClick={onSave}
                  disabled={saving || loading || !test}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold shadow ${
                    saving ? "bg-gray-300 text-gray-600" : "bg-[#009846] text-white hover:opacity-95"
                  }`}
                >
                  <Save size={18} />
                  {saving ? "Saving..." : "Save Questions"}
                </button>
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
                {toast.type === "ok" ? <CheckCircle /> : <AlertTriangle />}
                <p className="font-semibold">{toast.msg}</p>
              </div>
            )}

            {loading ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E6F4EC]">
                Loading...
              </div>
            ) : !series || !test ? (
              <RefreshComponent message="Series/Test not found." />
            ) : questions.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 shadow-sm border border-[#E6F4EC] text-center">
                <p className="text-[#124734] font-semibold text-lg">No questions</p>
                <p className="text-[#5B7065] mt-1">Set Total Questions in test and reopen.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl shadow-sm border border-[#E6F4EC] overflow-hidden"
                  >
                    <div className="p-5 border-b border-[#E6F4EC] bg-gradient-to-r from-[#E6F4EC] to-white">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-extrabold text-[#124734]">
                          Question {idx + 1}
                        </h3>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-3 py-1 rounded-full border bg-white text-[#124734] border-[#CDE8D5]">
                            MCQ
                          </span>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#5B7065] font-semibold">Marks</span>
                            <input
                              type="number"
                              min="0"
                              value={q.marks ?? 1}
                              onChange={(e) => updateQ(idx, "marks", e.target.value)}
                              className="w-20 border rounded-xl px-3 py-2"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5">
                      <label className="text-sm font-semibold text-[#124734]">Question *</label>
                      <textarea
                        value={q.q}
                        onChange={(e) => updateQ(idx, "q", e.target.value)}
                        className="mt-1 w-full border rounded-2xl px-4 py-3 min-h-[90px] outline-none focus:ring-2 focus:ring-[#009846]/20"
                        placeholder="Write the question..."
                      />

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {["A", "B", "C", "D"].map((label, optIdx) => (
                          <div
                            key={optIdx}
                            className="bg-[#F9FAFB] border border-[#E6F4EC] rounded-2xl p-4"
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-bold text-[#124734]">Option {label}</p>
                              <label className="text-xs text-[#5B7065] font-semibold flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`correct-${idx}`}
                                  checked={Number(q.correctIndex) === optIdx}
                                  onChange={() => updateQ(idx, "correctIndex", optIdx)}
                                />
                                Correct
                              </label>
                            </div>
                            <input
                              value={q.options?.[optIdx] ?? ""}
                              onChange={(e) => updateOption(idx, optIdx, e.target.value)}
                              className="mt-2 w-full border rounded-xl px-3 py-2"
                              placeholder={`Enter option ${label}`}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="mt-4">
                        <label className="text-sm font-semibold text-[#124734]">
                          Explanation (optional)
                        </label>
                        <textarea
                          value={q.explanation ?? ""}
                          onChange={(e) => updateQ(idx, "explanation", e.target.value)}
                          className="mt-1 w-full border rounded-2xl px-4 py-3 min-h-[70px] outline-none focus:ring-2 focus:ring-[#009846]/20"
                          placeholder="Explain why this answer is correct..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
