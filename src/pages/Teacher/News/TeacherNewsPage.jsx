import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import TeacherSidebar from "../../../components/Teacher/TeacherSidebar";
import TeacherTopbar from "../../../components/Teacher/TeacherTopbar";
import Breadcrumb from "../../../components/Breadcrumb";
import { api } from "../../../lib/api";

const fmtToday = () =>
  new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export default function TeacherNewsPage() {
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
          name: "News",
          item: canonicalUrl,
        },
      ],
    }),
    [canonicalUrl]
  );

  const accessToken = sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");
  const authHeaders = useMemo(
    () => ({ headers: { Authorization: `Bearer ${accessToken}` } }),
    [accessToken]
  );

  const [cats, setCats] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [catName, setCatName] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [q, setQ] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    date: fmtToday(),
    english: "",
    hindi: "",
    img: null,
  });

  const loadCats = async () => {
    const res = await api.get("/news/categories");
    setCats(res.data?.data || []);
  };

  const loadNews = async () => {
    setLoading(true);
    try {
      const res = await api.get("/news/teacher/list", {
        ...authHeaders,
        params: { category: filterCat, q },
      });
      setNews(res.data?.data || []);
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to load news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCats();
  }, []);
  useEffect(() => {
    loadNews();
    /* eslint-disable-next-line */
  }, [filterCat]);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      category: "",
      date: fmtToday(),
      english: "",
      hindi: "",
      img: null,
    });
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (n) => {
    setEditing(n);
    setForm({
      title: n.title || "",
      description: n.description || "",
      category: n.category || "",
      date: n.date || fmtToday(),
      english: n.english || "",
      hindi: n.hindi || "",
      img: null,
    });
    setOpen(true);
  };

  const saveNews = async () => {
    if (!form.title.trim()) return alert("Title required");
    if (!form.description.trim()) return alert("Description required");
    if (!form.category.trim()) return alert("Category required");
    if (!form.date.trim()) return alert("Date required");

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("category", form.category);
    fd.append("date", form.date);
    fd.append("english", form.english);
    fd.append("hindi", form.hindi);
    if (form.img) fd.append("img", form.img);

    try {
      if (editing?._id) {
        await api.patch(`/news/teacher/${editing._id}`, fd, authHeaders);
        alert("✅ News updated");
      } else {
        await api.post("/news/teacher", fd, authHeaders);
        alert("✅ News created");
      }
      setOpen(false);
      resetForm();
      await loadCats();
      await loadNews();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to save news");
    }
  };

  const deleteNews = async (id) => {
    if (!confirm("Delete this news?")) return;
    try {
      await api.delete(`/news/teacher/${id}`, authHeaders);
      await loadNews();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to delete");
    }
  };

  const addCategory = async () => {
    if (!catName.trim()) return alert("Category name required");
    try {
      await api.post("/news/teacher/category", { name: catName.trim() }, authHeaders);
      setCatName("");
      await loadCats();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to add category");
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm("Delete this category?")) return;
    try {
      await api.delete(`/news/teacher/category/${id}`, authHeaders);
      await loadCats();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to delete category");
    }
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* ✅ SEO (NO layout impact) */}
      <Helmet>
        <title>News | Teacher Dashboard | ProspectEdu</title>
        <meta
          name="description"
          content="Create, edit, and manage news updates and categories in the ProspectEdu teacher dashboard."
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
          <TeacherTopbar pageTitle="News" />
        </div>

        <div className="px-6 pt-[90px] pb-10 overflow-y-auto text-left">
           <Breadcrumb
        items={[
          { label: "Dashboard", to: "/teacher-dashboard" },
          { label: "News" },
        ]}
      />
          {/* Top cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border rounded-2xl shadow-sm p-5">
              <div className="text-sm text-gray-600">Total News</div>
              <div className="text-3xl font-bold text-[#124734] mt-1">{news.length}</div>
            </div>
            <div className="bg-white border rounded-2xl shadow-sm p-5">
              <div className="text-sm text-gray-600">Total Categories</div>
              <div className="text-3xl font-bold text-[#124734] mt-1">{cats.length}</div>
            </div>
            <div className="bg-white border rounded-2xl shadow-sm p-5 flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Create</div>
                <div className="text-lg font-semibold text-[#124734] mt-1">Add News</div>
              </div>
              <button
                onClick={openCreate}
                className="px-5 py-2 rounded-xl bg-[#124734] text-white font-semibold hover:bg-[#0B2F23]"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Category manager */}
          <div className="bg-white border rounded-2xl shadow-sm p-5 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#124734]">Categories</h2>
                <p className="text-sm text-gray-600">Add or delete filter categories.</p>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <input
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. IT News"
                  className="border rounded-xl px-4 py-2 w-full md:w-[260px]"
                />
                <button
                  onClick={addCategory}
                  className="px-5 py-2 rounded-xl bg-[#009846] text-white font-semibold hover:bg-green-700"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {cats.map((c) => (
                <div
                  key={c._id}
                  className="flex items-center gap-2 px-3 py-2 border rounded-xl bg-gray-50"
                >
                  <span className="text-sm font-semibold text-[#124734]">{c.name}</span>
                  <button
                    onClick={() => deleteCategory(c._id)}
                    className="text-xs px-2 py-1 rounded-full bg-red-600 text-white"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {cats.length === 0 && <div className="text-sm text-gray-600">No categories yet.</div>}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white border rounded-2xl shadow-sm p-5 mb-4">
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#124734]">Manage News</h2>
                <p className="text-sm text-gray-600">Edit or delete uploaded news.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={filterCat}
                  onChange={(e) => setFilterCat(e.target.value)}
                  className="border rounded-xl px-4 py-2"
                >
                  <option value="All">All</option>
                  {cats.map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search title/desc/category"
                  className="border rounded-xl px-4 py-2 w-full sm:w-[280px]"
                />

                <button
                  onClick={loadNews}
                  className="px-5 py-2 rounded-xl bg-[#124734] text-white font-semibold hover:bg-[#0B2F23]"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#124734]">Uploaded News</h3>
              <button
                onClick={loadNews}
                className="px-4 py-2 rounded-xl border hover:bg-gray-50 font-semibold text-sm"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="p-6 text-gray-600">Loading…</div>
            ) : news.length === 0 ? (
              <div className="p-6 text-gray-600">No news found.</div>
            ) : (
              <div className="divide-y">
                {news.map((n) => (
                  <div
                    key={n._id}
                    className="p-5 flex flex-col md:flex-row md:items-center gap-4 hover:bg-gray-50"
                  >
                    <img
                      src={n.imgUrl || "https://via.placeholder.com/300x200?text=News"}
                      alt={n.title}
                      className="w-full md:w-[180px] h-[110px] object-cover rounded-xl border"
                      loading="lazy"
                    />

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-lg font-bold text-[#124734]">{n.title}</h4>
                        <span className="px-2 py-1 bg-[#A7E1B2] text-[#124734] rounded-md text-[11px] font-semibold">
                          {n.category}
                        </span>
                        <span className="text-xs text-gray-500">📅 {n.date}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-2">{n.description}</p>
                      <p className="text-xs text-gray-500 mt-2">Slug: {n.slug}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(n)}
                        className="px-4 py-2 rounded-xl border font-semibold hover:bg-white"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteNews(n._id)}
                        className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal */}
          {open && (
            <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl border p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#124734]">
                    {editing ? "Edit News" : "Add News"}
                  </h3>
                  <button
                    onClick={() => {
                      setOpen(false);
                      resetForm();
                    }}
                    className="px-3 py-1 rounded-lg border hover:bg-gray-50"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Title</label>
                    <input
                      className="w-full border rounded-xl px-4 py-2 mt-1"
                      value={form.title}
                      onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700">Date (dd MMM yyyy)</label>
                    <input
                      className="w-full border rounded-xl px-4 py-2 mt-1"
                      value={form.date}
                      onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700">Short Description</label>
                    <textarea
                      className="w-full border rounded-xl px-4 py-2 mt-1 min-h-[80px]"
                      value={form.description}
                      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700">Category</label>
                    <select
                      className="w-full border rounded-xl px-4 py-2 mt-1"
                      value={form.category}
                      onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    >
                      <option value="">Select Category</option>
                      {cats.map((c) => (
                        <option key={c._id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700">Image (optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full border rounded-xl px-4 py-2 mt-1"
                      onChange={(e) =>
                        setForm((p) => ({ ...p, img: e.target.files?.[0] || null }))
                      }
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700">English Content</label>
                    <textarea
                      className="w-full border rounded-xl px-4 py-2 mt-1 min-h-[120px]"
                      value={form.english}
                      onChange={(e) => setForm((p) => ({ ...p, english: e.target.value }))}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700">Hindi Content</label>
                    <textarea
                      className="w-full border rounded-xl px-4 py-2 mt-1 min-h-[120px]"
                      value={form.hindi}
                      onChange={(e) => setForm((p) => ({ ...p, hindi: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-5">
                  <button
                    onClick={() => {
                      setOpen(false);
                      resetForm();
                    }}
                    className="px-5 py-2 rounded-xl border font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveNews}
                    className="px-6 py-2 rounded-xl bg-[#124734] text-white font-semibold hover:bg-[#0B2F23]"
                  >
                    {editing ? "Update" : "Create"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
