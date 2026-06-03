import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TeacherSidebar from "../../components/Teacher/TeacherSidebar";
import TeacherTopbar from "../../components/Teacher/TeacherTopbar";
import RefreshComponent from "../../components/RefreshComponent";
import { fetchTeacherSeriesById } from "../../lib/testSeriesApi";
import {
  addSeriesTest,
  deleteSeriesTest,
  updateSeriesTest,
  fetchSeriesTests,
} from "../../lib/seriesTestsApi";
import { Plus, Pencil, Trash2, X, Search } from "lucide-react";

const emptyTest = {
  name: "",
  totalQuestions: "",
  totalMarks: "",
  durationMinutes: "",
};

export default function TeacherSeriesTests() {
  const { id } = useParams(); // seriesId
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidthPx = isCollapsed ? 80 : 256;

  // ✅ SEO
  const canonicalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${location.pathname}`
      : location.pathname;

  const [series, setSeries] = useState(null);
  const [tests, setTests] = useState([]);
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
          name: "Test & Learning",
          item:
            typeof window !== "undefined"
              ? `${window.location.origin}/teacher-dashboard`
              : "/teacher-dashboard",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Manage Series Tests",
          item: canonicalUrl,
        },
      ],
    }),
    [canonicalUrl]
  );

  const seoTitle = series?.title
    ? `${series.title} | Manage Series Tests | Teacher Dashboard | ProspectEdu`
    : "Manage Series Tests | Teacher Dashboard | ProspectEdu";

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [activeTestId, setActiveTestId] = useState(null);
  const [form, setForm] = useState(emptyTest);

  const [search, setSearch] = useState("");

  const visibleTests = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tests;
    return tests.filter((t) => String(t.name || "").toLowerCase().includes(q));
  }, [tests, search]);

  const load = async () => {
    setLoading(true);
    try {
      const s = await fetchTeacherSeriesById(id);
      setSeries(s || null);

      const list = await fetchSeriesTests(id);
      setTests(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
      setSeries(null);
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  const openCreate = () => {
    setMode("create");
    setActiveTestId(null);
    setForm(emptyTest);
    setOpen(true);
  };

  const openEdit = (t) => {
    setMode("edit");
    setActiveTestId(t._id);
    setForm({
      name: t.name || "",
      totalQuestions: t.totalQuestions ?? "",
      totalMarks: t.totalMarks ?? "",
      durationMinutes: t.durationMinutes ?? "",
    });
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setMode("create");
    setActiveTestId(null);
    setForm(emptyTest);
  };

  const submit = async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      totalQuestions: form.totalQuestions === "" ? 0 : Number(form.totalQuestions),
      totalMarks: form.totalMarks === "" ? 0 : Number(form.totalMarks),
      durationMinutes: form.durationMinutes === "" ? 0 : Number(form.durationMinutes),
    };

    try {
      if (mode === "create") {
        await addSeriesTest(id, payload);
      } else {
        await updateSeriesTest(id, activeTestId, payload);
      }
      await load();
      closeModal();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed. Check console.");
      console.error(err);
    }
  };

  const onDelete = async (testId) => {
    if (!confirm("Delete this test?")) return;
    try {
      await deleteSeriesTest(id, testId);
      await load();
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* ✅ SEO (NO layout impact) */}
      <Helmet>
        <title>{seoTitle}</title>
        <meta
          name="description"
          content="Create, edit and manage tests under a test series in the ProspectEdu teacher dashboard."
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
          <TeacherTopbar isCollapsed={isCollapsed} pageTitle="Manage Series Tests" />
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-8" style={{ marginTop: "64px" }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <p className="text-sm text-[#5B7065]">
                  Teacher / <span className="text-[#124734] font-semibold">Test & Learning</span> /{" "}
                  <span className="text-[#124734] font-bold">Manage Tests</span>
                </p>
                <h1 className="text-2xl font-extrabold text-[#124734] mt-2">
                  {series?.title || "Test Series"}
                </h1>
                <p className="text-sm text-[#5B7065] mt-1">
                  Add tests under this series . Total: <b>{tests.length}</b>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 rounded-xl border border-[#CDE8D5] bg-white text-[#124734] font-semibold hover:bg-[#E6F4EC]"
                >
                  ← Back
                </button>
                <button
                  onClick={openCreate}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#009846] text-white font-semibold shadow hover:opacity-95"
                >
                  <Plus size={18} /> Add Test
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-5">
              <div className="relative w-full sm:w-[320px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B7065]" size={18} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search test by name..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#CDE8D5] bg-white outline-none focus:ring-2 focus:ring-[#009846]/20"
                />
              </div>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E6F4EC]">Loading...</div>
            ) : !series ? (
              <RefreshComponent message="Series not found." />
            ) : tests.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 shadow-sm border border-[#E6F4EC] text-center">
                <p className="text-[#124734] font-semibold text-lg">No tests yet</p>
                <p className="text-[#5B7065] mt-1">Click “Add Test” to create the first test.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {visibleTests.map((t, idx) => (
                  <div
                    key={t._id}
                    className="bg-white rounded-2xl shadow-sm border border-[#E6F4EC] overflow-hidden hover:shadow-md transition"
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs text-[#5B7065] font-semibold">Test #{idx + 1}</p>
                          <h3 className="text-lg font-extrabold text-[#124734] mt-1">{t.name}</h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              navigate(`/teacher/series-tests/${id}/tests/${t._id}/questions`)
                            }
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[#009846] text-[#009846] hover:bg-[#E6F4EC] font-semibold"
                          >
                            Add Questions
                          </button>
                          <button
                            onClick={() => openEdit(t)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[#CDE8D5] text-[#124734] hover:bg-[#E6F4EC] font-semibold"
                          >
                            <Pencil size={16} /> Edit
                          </button>
                          <button
                            onClick={() => onDelete(t._id)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-semibold"
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-4">
                        <div className="bg-[#F9FAFB] border border-[#E6F4EC] rounded-xl p-3">
                          <p className="text-[11px] text-[#5B7065]">Questions</p>
                          <p className="text-base font-bold text-[#124734]">{t.totalQuestions ?? 0}</p>
                        </div>
                        <div className="bg-[#F9FAFB] border border-[#E6F4EC] rounded-xl p-3">
                          <p className="text-[11px] text-[#5B7065]">Marks</p>
                          <p className="text-base font-bold text-[#124734]">{t.totalMarks ?? 0}</p>
                        </div>
                        <div className="bg-[#F9FAFB] border border-[#E6F4EC] rounded-xl p-3">
                          <p className="text-[11px] text-[#5B7065]">Duration</p>
                          <p className="text-base font-bold text-[#124734]">
                            {t.durationMinutes ? `${t.durationMinutes} min` : "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6F4EC] bg-white">
              <div>
                <h3 className="text-lg font-bold text-[#124734]">
                  {mode === "create" ? "Add Test" : "Edit Test"}
                </h3>
                <p className="text-xs text-[#5B7065] mt-1">Only test details .</p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100">
                <X />
              </button>
            </div>

            <form onSubmit={submit} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-[#124734]">Test Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="mt-1 w-full border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#009846]/20"
                  placeholder="eg. Mock Test 01"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-semibold text-[#124734]">Total Questions</label>
                  <input
                    type="number"
                    min="0"
                    value={form.totalQuestions}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        totalQuestions: e.target.value === "" ? "" : Number(e.target.value),
                      }))
                    }
                    className="mt-1 w-full border rounded-xl px-4 py-2"
                    placeholder="eg. 50"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#124734]">Total Marks</label>
                  <input
                    type="number"
                    min="0"
                    value={form.totalMarks}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        totalMarks: e.target.value === "" ? "" : Number(e.target.value),
                      }))
                    }
                    className="mt-1 w-full border rounded-xl px-4 py-2"
                    placeholder="eg. 100"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#124734]">Duration (minutes)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.durationMinutes}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        durationMinutes: e.target.value === "" ? "" : Number(e.target.value),
                      }))
                    }
                    className="mt-1 w-full border rounded-xl px-4 py-2"
                    placeholder="eg. 60"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl border font-semibold text-[#124734] hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#009846] text-white font-semibold shadow hover:opacity-95"
                >
                  {mode === "create" ? "Add" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
