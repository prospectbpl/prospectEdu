import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import TeacherSidebar from "../../../components/Teacher/TeacherSidebar";
import TeacherTopbar from "../../../components/Teacher/TeacherTopbar";
import Breadcrumb from "../../../components/Breadcrumb";
import { api } from "../../../lib/api";

const AdminResearchPage = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidthPx = isCollapsed ? 80 : 256;

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
          name: "Research",
          item: canonicalUrl,
        },
      ],
    }),
    [canonicalUrl]
  );

  const accessToken = sessionStorage.getItem("accessToken");
  const authHeaders = useMemo(
    () => ({ headers: { Authorization: `Bearer ${accessToken}` } }),
    [accessToken]
  );

  const [categories, setCategories] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [catName, setCatName] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [files, setFiles] = useState({
    cover: null,
    pdfEnglish: null,
    pdfHindi: null,
  });

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    category: "",
    date: "",
    englishContent: "",
    hindiContent: "",
  });

  const loadAll = async () => {
    setLoading(true);
    try {
      const [c, r] = await Promise.all([
        api.get("/research/teacher/categories", authHeaders),
        api.get("/research/teacher/reports", authHeaders),
      ]);
      setCategories(c.data?.data || []);
      setReports(r.data?.data || []);
    } catch (e) {
      alert("Failed to load Research admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line
  }, []);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const resetForm = () => {
    setEditingId(null);
    setForm({
      title: "",
      slug: "",
      description: "",
      category: "",
      date: "",
      englishContent: "",
      hindiContent: "",
    });
    setFiles({ cover: null, pdfEnglish: null, pdfHindi: null });
  };

  // ---------- category ----------
  const addCategory = async () => {
    if (!catName.trim()) return;
    try {
      await api.post("/research/teacher/categories", { name: catName.trim() }, authHeaders);
      setCatName("");
      loadAll();
    } catch (e) {
      alert(e?.response?.data?.message || "Category create failed");
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm("Delete this category?")) return;
    try {
      await api.delete(`/research/teacher/categories/${id}`, authHeaders);
      loadAll();
    } catch (e) {
      alert("Category delete failed");
    }
  };

  // ---------- report ----------
  const submitReport = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v || ""));

      if (files.cover) fd.append("cover", files.cover);
      if (files.pdfEnglish) fd.append("pdfEnglish", files.pdfEnglish);
      if (files.pdfHindi) fd.append("pdfHindi", files.pdfHindi);

      if (!editingId) {
        await api.post("/research/teacher/reports", fd, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        alert("✅ Research report created");
      } else {
        await api.patch(`/research/teacher/reports/${editingId}`, fd, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        alert("✅ Research report updated");
      }

      resetForm();
      loadAll();
    } catch (e) {
      alert(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const editReport = (r) => {
    setEditingId(r._id);
    setForm({
      title: r.title || "",
      slug: r.slug || "",
      description: r.description || "",
      category: r.category || "",
      date: r.date || "",
      englishContent: r.content?.english || "",
      hindiContent: r.content?.hindi || "",
    });
    setFiles({ cover: null, pdfEnglish: null, pdfHindi: null });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteReport = async (id) => {
    if (!confirm("Delete this report?")) return;
    try {
      await api.delete(`/research/teacher/reports/${id}`, authHeaders);
      setReports((p) => p.filter((x) => x._id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* ✅ SEO (NO layout impact) */}
      <Helmet>
        <title>Research | Teacher Dashboard | ProspectEdu</title>
        <meta
          name="description"
          content="Create research categories and upload research reports (English/Hindi content and PDFs) in the ProspectEdu teacher dashboard."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <div
        className={`${
          isCollapsed ? "w-20" : "w-64"
        } fixed top-0 left-0 h-full z-40 transition-all duration-300`}
      >
        <TeacherSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      <div
        className="flex flex-col flex-1 h-screen transition-all duration-300"
        style={{ marginLeft: sidebarWidthPx, width: `calc(100vw - ${sidebarWidthPx}px)` }}
      >
        <div
          className="fixed top-0 bg-white shadow-sm h-[64px] z-[999]"
          style={{ left: sidebarWidthPx, right: 0 }}
        >
          <TeacherTopbar pageTitle="Research" />
        </div>
         

        <div className="px-6 pt-[90px] pb-10 overflow-y-auto text-left">
          <Breadcrumb
        items={[
          { label: "Dashboard", to: "/teacher-dashboard" },
          { label: "Research Report" },
        ]}
      />
          {/* CATEGORY CARD */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[#124734]">Research Categories</h2>
                <p className="text-sm text-gray-600">
                  These categories appear as filter tabs on the public Research page.
                </p>
              </div>

              <div className="flex gap-2 w-full md:w-[420px]">
                <input
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Add category e.g. Civil Engineering"
                  className="flex-1 border rounded-xl px-4 py-2"
                />
                <button
                  onClick={addCategory}
                  className="px-5 py-2 rounded-xl bg-[#124734] text-white font-semibold hover:bg-[#0B2F23]"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {categories.map((c) => (
                <div
                  key={c._id}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-50 border"
                >
                  <span className="text-sm font-semibold text-gray-800">{c.name}</span>
                  <button
                    onClick={() => deleteCategory(c._id)}
                    className="text-xs px-2 py-1 rounded-full bg-red-600 text-white"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* REPORT FORM */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-[#124734]">
                  {editingId ? "Edit Research Report" : "Add Research Report"}
                </h2>
                <p className="text-sm text-gray-600">
                  Upload Hindi + English content and PDFs (stored in Cloudinary).
                </p>
              </div>

              {editingId && (
                <button
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl border font-semibold hover:bg-gray-50"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={submitReport} className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={onChange}
                  required
                  className="w-full mt-1 border rounded-xl px-4 py-2"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Slug (optional)</label>
                <input
                  name="slug"
                  value={form.slug}
                  onChange={onChange}
                  placeholder="ai-revolution-in-education"
                  className="w-full mt-1 border rounded-xl px-4 py-2"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Description</label>
                <input
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  required
                  className="w-full mt-1 border rounded-xl px-4 py-2"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={onChange}
                  required
                  className="w-full mt-1 border rounded-xl px-4 py-2"
                >
                  <option value="">-- Select --</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Date (e.g. 08 Nov 2025)</label>
                <input
                  name="date"
                  value={form.date}
                  onChange={onChange}
                  required
                  className="w-full mt-1 border rounded-xl px-4 py-2"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Cover Image (optional)</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => setFiles((p) => ({ ...p, cover: e.target.files?.[0] || null }))}
                  className="w-full mt-1 border rounded-xl px-4 py-2 bg-white"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">English PDF (optional)</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) =>
                    setFiles((p) => ({ ...p, pdfEnglish: e.target.files?.[0] || null }))
                  }
                  className="w-full mt-1 border rounded-xl px-4 py-2 bg-white"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Hindi PDF (optional)</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFiles((p) => ({ ...p, pdfHindi: e.target.files?.[0] || null }))}
                  className="w-full mt-1 border rounded-xl px-4 py-2 bg-white"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="text-sm font-semibold text-gray-700">English Content</label>
                <textarea
                  name="englishContent"
                  value={form.englishContent}
                  onChange={onChange}
                  className="w-full mt-1 border rounded-xl px-4 py-2 min-h-[140px]"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Hindi Content</label>
                <textarea
                  name="hindiContent"
                  value={form.hindiContent}
                  onChange={onChange}
                  className="w-full mt-1 border rounded-xl px-4 py-2 min-h-[140px]"
                />
              </div>

              <div className="lg:col-span-2 flex justify-end">
                <button
                  disabled={saving}
                  className="px-6 py-2 rounded-xl bg-[#124734] text-white font-semibold hover:bg-[#0B2F23] disabled:opacity-60"
                >
                  {saving ? "Saving..." : editingId ? "Update Report" : "Create Report"}
                </button>
              </div>
            </form>
          </div>

          {/* REPORT LIST */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#124734]">All Research Reports</h3>
                <p className="text-sm text-gray-600">
                  Click Edit to modify content/PDFs. Delete removes Cloudinary files too.
                </p>
              </div>
              <button
                onClick={loadAll}
                className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50 text-sm font-semibold"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="p-6 text-gray-600">Loading…</div>
            ) : reports.length === 0 ? (
              <div className="p-6 text-gray-600">No reports added yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="text-left px-4 py-3">Title</th>
                      <th className="text-left px-4 py-3">Category</th>
                      <th className="text-left px-4 py-3">Date</th>
                      <th className="text-left px-4 py-3">Slug</th>
                      <th className="text-right px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {reports.map((r) => (
                      <tr key={r._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-gray-900">{r.title}</td>
                        <td className="px-4 py-3">{r.category}</td>
                        <td className="px-4 py-3">{r.date}</td>
                        <td className="px-4 py-3 text-gray-600">{r.slug}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => editReport(r)}
                            className="px-4 py-2 rounded-xl bg-[#009846] text-white font-semibold hover:bg-green-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteReport(r._id)}
                            className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminResearchPage;
