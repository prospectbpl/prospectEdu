import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { Search, Save, Loader2, RefreshCcw } from "lucide-react";
import Breadcrumb from "../../components/Breadcrumb";
import TeacherSidebar from "../../components/Teacher/TeacherSidebar";
import TeacherTopbar from "../../components/Teacher/TeacherTopbar";
import { performanceApi } from "../../services/performance";

function clampUI(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function initials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] || "S") + (parts[1]?.[0] || "");
}

function Field({ value, onChange }) {
  return (
    <input
      type="number"
      min={0}
      max={100}
      value={value}
      onChange={(e) => onChange(clampUI(e.target.value))}
      className="w-20 rounded-xl border border-[#A7E1B2] bg-white px-2 py-1.5 text-sm text-[#124734] outline-none focus:ring-2 focus:ring-[#A7E1B2]"
    />
  );
}

function safeDate(d) {
  try {
    if (!d) return "—";
    return new Date(d).toLocaleString();
  } catch {
    return "—";
  }
}

export default function StudentsPerformancePage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 80 : 256;

  // ✅ SEO
  const location = useLocation();
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
          name: "Students Overall Performance",
          item: canonicalUrl,
        },
      ],
    }),
    [canonicalUrl]
  );

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r) => {
      const s = r.student || {};
      return (
        String(s.fullName || "").toLowerCase().includes(q) ||
        String(s.email || "").toLowerCase().includes(q) ||
        String(s.phone || "").toLowerCase().includes(q)
      );
    });
  }, [rows, query]);

  const metrics = useMemo(() => {
    const avg = (arr) => {
      const nums = arr.map(Number).filter(Number.isFinite);
      if (!nums.length) return 0;
      return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
    };

    return {
      avgAssignment: avg(rows.map((r) => r.performance?.assignmentAvg ?? 0)),
      avgQuiz: avg(rows.map((r) => r.performance?.quizAvg ?? 0)),
      avgAttendance: avg(rows.map((r) => r.performance?.attendance ?? 0)),
      avgProgress: avg(rows.map((r) => r.performance?.progress ?? 0)),
      count: rows.length,
    };
  }, [rows]);

  async function load() {
    try {
      setError("");
      setLoading(true);
      const res = await performanceApi.teacherOverallStudents();
      setRows(res?.data?.rows || []);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to load students.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateLocal(studentId, patch) {
    setRows((prev) =>
      prev.map((r) =>
        String(r.student?._id) !== String(studentId)
          ? r
          : { ...r, performance: { ...(r.performance || {}), ...patch } }
      )
    );
  }

  async function saveRow(studentId) {
    const row = rows.find((r) => String(r.student?._id) === String(studentId));
    if (!row) return;

    const payload = {
      assignmentAvg: clampUI(row.performance?.assignmentAvg ?? 0),
      quizAvg: clampUI(row.performance?.quizAvg ?? 0),
      attendance: clampUI(row.performance?.attendance ?? 0),
      progress: clampUI(row.performance?.progress ?? 0),
    };

    try {
      setSavingId(studentId);
      setError("");
      const res = await performanceApi.updateOverallStudent(studentId, payload);
      const p = res?.data?.performance;
      if (p) updateLocal(studentId, p);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to save.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* ✅ SEO (NO layout impact) */}
      <Helmet>
        <title>Students Performance | Teacher Dashboard | ProspectEdu</title>
        <meta
          name="description"
          content="View and update overall student performance metrics including attendance, progress, quizzes and assignments in the ProspectEdu teacher dashboard."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      {/* SIDEBAR */}
      <div
        className="fixed left-0 top-0 h-full transition-all duration-300"
        style={{ width: sidebarWidth }}
      >
        <TeacherSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* MAIN */}
      <div
        className="flex flex-col flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        <TeacherTopbar pageTitle="Students · Overall Performance" />
          <Breadcrumb
        items={[
          { label: "Dashboard", to: "/teacher-dashboard" },
          { label: "Student Overall Performance" },
        ]}
      />
        <div className="p-6 overflow-y-auto max-h-screen">
           
          <h2 className="text-lg font-semibold text-[#124734] text-left">Overall Report Card</h2>
          <p className="text-sm text-[#5B7065] mt-1 text-left">
            Update Assignment Avg, Quiz Avg, Attendance, Progress (0–100).
          </p>

          {/* METRICS */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 my-6">
            {[
              { label: "Avg Assignment", value: `${metrics.avgAssignment}%` },
              { label: "Avg Quiz", value: `${metrics.avgQuiz}%` },
              { label: "Avg Attendance", value: `${metrics.avgAttendance}%` },
              { label: "Avg Progress", value: `${metrics.avgProgress}%` },
              { label: "Students", value: metrics.count },
            ].map((c) => (
              <div
                key={c.label}
                className="p-4 rounded-2xl border border-[#A7E1B2] bg-white shadow-sm"
              >
                <div className="text-xs text-[#5B7065]">{c.label}</div>
                <div className="text-xl font-semibold text-[#124734] mt-1">{c.value}</div>
              </div>
            ))}
          </div>

          {/* TABLE */}
          <div className="bg-white border border-[#A7E1B2] rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-[#F9FAFB] text-sm text-[#5B7065]">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Assignment Avg</th>
                  <th className="px-4 py-3">Quiz Avg</th>
                  <th className="px-4 py-3">Attendance</th>
                  <th className="px-4 py-3">Progress</th>
                  <th className="px-4 py-3 text-right">Save</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((r) => {
                  const s = r.student || {};
                  const p = r.performance || {};
                  const isSaving = savingId === s._id;

                  return (
                    <tr key={s._id} className="border-t border-[#A7E1B2]">
                      <td className="px-4 py-3 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#A7E1B2] text-[#124734] flex items-center justify-center font-semibold">
                          {initials(s.fullName)}
                        </div>
                        <span className="font-medium text-[#124734]">{s.fullName || "—"}</span>
                      </td>

                      <td className="px-4 py-3 text-[#124734]">{s.email || "—"}</td>
                      <td className="px-4 py-3 text-[#124734]">{s.phone || "—"}</td>

                      <td className="px-4 py-3">
                        <Field
                          value={p.assignmentAvg ?? 0}
                          onChange={(v) => updateLocal(s._id, { assignmentAvg: v })}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Field
                          value={p.quizAvg ?? 0}
                          onChange={(v) => updateLocal(s._id, { quizAvg: v })}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Field
                          value={p.attendance ?? 0}
                          onChange={(v) => updateLocal(s._id, { attendance: v })}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Field
                          value={p.progress ?? 0}
                          onChange={(v) => updateLocal(s._id, { progress: v })}
                        />
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => saveRow(s._id)}
                          disabled={isSaving}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#009846] text-white hover:bg-[#00803B] disabled:opacity-60"
                        >
                          {isSaving ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <Save size={16} />
                          )}
                          Save
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-[#5B7065]">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* OPTIONAL: quick reload button already imported in file (kept) */}
        </div>
      </div>
    </div>
  );
}
