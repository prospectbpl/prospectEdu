// src/pages/Teacher/TeacherTestLearning.jsx
import { useEffect, useMemo, useState } from "react";
import TeacherSidebar from "../../components/Teacher/TeacherSidebar";
import Breadcrumb from "../../components/Breadcrumb";
import TeacherTopbar from "../../components/Teacher/TeacherTopbar";
import {
  createTeacherSeries,
  deleteTeacherSeries,
  fetchTeacherMySeries,
  updateTeacherSeries,
} from "../../lib/testSeriesApi";
import { Plus, Trash2, Pencil, Image as ImageIcon, X, Search, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const emptyForm = {
  title: "",
  type: "Online",
  language: "English",
  price: "",
  mrp: "",
  description: "",
  isPublished: true,
  image: null,
};

function prettyDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function TeacherTestLearning() {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidthPx = isCollapsed ? 80 : 256;

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [activeId, setActiveId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [imgPreview, setImgPreview] = useState("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterVis, setFilterVis] = useState("All");

  const totalCount = useMemo(() => items.length, [items]);

  const visibleItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((x) => {
      if (filterType !== "All" && x.type !== filterType) return false;
      if (filterVis === "Published" && !x.isPublished) return false;
      if (filterVis === "Hidden" && x.isPublished) return false;

      if (!q) return true;
      return (
        String(x.title || "").toLowerCase().includes(q) ||
        String(x.language || "").toLowerCase().includes(q)
      );
    });
  }, [items, search, filterType, filterVis]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchTeacherMySeries();
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setMode("create");
    setActiveId(null);
    setForm(emptyForm);
    setImgPreview("");
    setOpen(true);
  };

  const openEdit = (x) => {
    setMode("edit");
    setActiveId(x._id);
    setForm({
      title: x.title || "",
      type: x.type || "Online",
      language: x.language || "English",
      price: x.price ?? "",
      mrp: x.mrp ?? "",
      description: x.description || "",
      isPublished: x.isPublished !== false,
      image: null,
    });
    setImgPreview(x.imageUrl || "");
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setForm(emptyForm);
    setActiveId(null);
    setImgPreview("");
  };

  const onPickImage = (file) => {
    setForm((p) => ({ ...p, image: file }));
    if (file) setImgPreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("type", form.type);
    fd.append("language", form.language);

    // ✅ MCQ ONLY
    fd.append("questionType", "MCQ");

    const price = form.price === "" ? 0 : Number(form.price);
    const mrp = form.mrp === "" ? 0 : Number(form.mrp);

    fd.append("price", String(price));
    fd.append("mrp", String(mrp));
    fd.append("description", form.description || "");
    fd.append("isPublished", form.isPublished ? "true" : "false");

    fd.append("schedule", JSON.stringify([]));
    fd.append("totalTest", "0");
    fd.append("totalQuestion", "0");

    if (form.image) fd.append("image", form.image);

    try {
      if (mode === "create") {
        await createTeacherSeries(fd);
      } else {
        await updateTeacherSeries(activeId, fd);
      }
      await load();
      closeModal();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed. Check console.");
      console.error(err);
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this test series?")) return;
    try {
      await deleteTeacherSeries(id);
      await load();
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
      console.error(err);
    }
  };

  const publishedCount = useMemo(() => items.filter((x) => x.isPublished).length, [items]);
  const hiddenCount = useMemo(() => items.filter((x) => !x.isPublished).length, [items]);

  // ✅ SEO
  const seoTitle = "Teacher Test & Learning | ProspectEdu";
  const seoDesc = "Create and manage MCQ test series, publish or hide them, and manage tests inside the teacher dashboard.";
  const canonical = typeof window !== "undefined" ? window.location.href : "";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: seoTitle,
    description: seoDesc,
    url: canonical,
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <meta name="robots" content="noindex,nofollow" />
        {canonical ? <link rel="canonical" href={canonical} /> : null}

        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        {canonical ? <meta property="og:url" content={canonical} /> : null}
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDesc} />

        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <aside className={`${isCollapsed ? "w-20" : "w-64"} fixed top-0 left-0 h-full z-40 transition-all duration-300`}>
        <TeacherSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </aside>

      <div
        className="flex flex-col flex-1 h-screen transition-all duration-300 text-left"
        style={{ marginLeft: sidebarWidthPx, width: `calc(100vw - ${sidebarWidthPx}px)` }}
      >
        <header className="fixed top-0 z-[999] bg-white shadow-sm h-[64px]" style={{ left: sidebarWidthPx, right: 0 }}>
          <TeacherTopbar isCollapsed={isCollapsed} pageTitle="Test & Learning" />
        </header>
         

        <main className="flex-1 overflow-y-auto px-6 py-8" style={{ marginTop: "64px" }}>
          <Breadcrumb
        items={[
          { label: "Dashboard", to: "/teacher-dashboard" },
          { label: "Test & Learning" },
        ]}
      />
          <div className="max-w-6xl mx-auto">
            <div className="bg-white border border-[#E6F4EC] rounded-2xl shadow-sm overflow-hidden mb-6">
              <div className="p-6 md:p-8 bg-gradient-to-r from-[#E6F4EC] to-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-[#124734] mt-3">
                      Create Test Series
                    </h1>
                    <p className="text-sm text-[#5B7065] mt-2 max-w-xl">
                      Create series, then add tests inside it, then add MCQ questions.
                    </p>

                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#CDE8D5] text-[#124734] text-sm font-semibold">
                        <Layers size={16} /> Total: {totalCount}
                      </span>
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#CDE8D5] text-[#124734] text-sm font-semibold">
                        ✅ Published: {publishedCount}
                      </span>
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#CDE8D5] text-[#124734] text-sm font-semibold">
                        Hidden: {hiddenCount}
                      </span>
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#009846] text-white text-sm font-semibold">
                        Question Type: MCQ
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={openCreate}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#009846] text-white font-semibold shadow hover:opacity-95"
                    >
                      <Plus size={18} /> Create Test Series
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full">
                <div className="relative w-full sm:w-[320px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B7065]" size={18} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by title or language..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#CDE8D5] bg-white outline-none focus:ring-2 focus:ring-[#009846]/20"
                    aria-label="Search test series"
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-[#CDE8D5] bg-white text-sm font-semibold text-[#124734]"
                    aria-label="Filter by type"
                  >
                    <option>All</option>
                    <option>Online</option>
                    <option>Offline</option>
                  </select>

                  <select
                    value={filterVis}
                    onChange={(e) => setFilterVis(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-[#CDE8D5] bg-white text-sm font-semibold text-[#124734]"
                    aria-label="Filter by visibility"
                  >
                    <option>All</option>
                    <option>Published</option>
                    <option>Hidden</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E6F4EC]">Loading...</div>
            ) : visibleItems.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 shadow-sm border border-[#E6F4EC] text-center">
                <p className="text-[#124734] font-semibold text-lg">No test series found</p>
                <p className="text-[#5B7065] mt-1">Try changing filters or create a new one.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {visibleItems.map((x) => (
                  <div
                    key={x._id}
                    className="bg-white rounded-2xl shadow-sm border border-[#E6F4EC] overflow-hidden hover:shadow-md transition"
                  >
                    <div className="relative">
                      <img
                        src={x.imageUrl || "/src/assets/test1.webp"}
                        alt={x.title ? `Test series cover: ${x.title}` : "Test series cover"}
                        className="w-full h-44 object-contain bg-[#F9FAFB]"
                        loading="lazy"
                        decoding="async"
                      />

                      <span
                        className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full ${
                          x.type === "Online" ? "bg-[#124734] text-white" : "bg-red-600 text-white"
                        }`}
                      >
                        {x.type}
                      </span>

                      <span
                        className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full ${
                          x.isPublished ? "bg-[#E6F4EC] text-[#124734]" : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {x.isPublished ? "Published" : "Hidden"}
                      </span>
                    </div>

                    <div className="p-5">
                      <h3 className="text-lg font-extrabold text-[#124734] line-clamp-2">{x.title}</h3>

                      <div className="grid grid-cols-2 gap-2 mt-3 text-sm text-[#5B7065]">
                        <div>
                          <b className="text-[#124734]">Language:</b> {x.language || "—"}
                        </div>
                        <div>
                          <b className="text-[#124734]">Q.Type:</b> MCQ
                        </div>
                        <div>
                          <b className="text-[#124734]">Tests:</b> {x.totalTest ?? "—"}
                        </div>
                        <div>
                          <b className="text-[#124734]">Price:</b> {Number(x.price || 0) === 0 ? "Free" : `₹${x.price}`}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-xs text-[#5B7065]">Created: {prettyDate(x.createdAt)}</p>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/teacher/series-tests/${x._id}`)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[#009846] text-[#009846] hover:bg-[#E6F4EC] font-semibold"
                          >
                            Manage Tests
                          </button>

                          <button
                            onClick={() => openEdit(x)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[#CDE8D5] text-[#124734] hover:bg-[#E6F4EC] font-semibold"
                            aria-label={`Edit ${x.title}`}
                          >
                            <Pencil size={16} /> Edit
                          </button>

                          <button
                            onClick={() => onDelete(x._id)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-semibold"
                            aria-label={`Delete ${x.title}`}
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      </div>

                      {x.description ? <p className="text-sm text-[#5B7065] mt-3 line-clamp-2">{x.description}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal remains same (no SEO changes needed inside) */}
      {open && (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6F4EC] bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-lg font-bold text-[#124734]">
                  {mode === "create" ? "Create Test Series" : "Edit Test Series"}
                </h3>
                <p className="text-xs text-[#5B7065] mt-1">Question type is fixed: MCQ.</p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Close modal">
                <X />
              </button>
            </div>

            <div className="max-h-[78vh] overflow-y-auto">
              <form onSubmit={submit} className="p-6">
                {/* (rest of your modal code unchanged) */}
                {/* ... keep exactly as you had ... */}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2 space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-[#124734]">Title *</label>
                      <input
                        value={form.title}
                        onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                        className="mt-1 w-full border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#009846]/20"
                        placeholder="eg. DSA Mastery Test Series"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-[#124734]">Type</label>
                        <select
                          value={form.type}
                          onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                          className="mt-1 w-full border rounded-xl px-4 py-2"
                        >
                          <option value="Online">Online</option>
                          <option value="Offline">Offline</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-[#124734]">Language</label>
                        <input
                          value={form.language}
                          onChange={(e) => setForm((p) => ({ ...p, language: e.target.value }))}
                          className="mt-1 w-full border rounded-xl px-4 py-2"
                          placeholder="English/Hindi"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-[#124734]">Question Type</label>
                        <input value="MCQ" disabled className="mt-1 w-full border rounded-xl px-4 py-2 bg-gray-100" />
                      </div>

                      <div className="flex gap-4">
                        <div className="w-1/2">
                          <label className="text-sm font-semibold text-[#124734]">Price (₹)</label>
                          <input
                            type="number"
                            min="0"
                            value={form.price}
                            onChange={(e) => setForm((p) => ({ ...p, price: e.target.value === "" ? "" : e.target.value }))}
                            className="mt-1 w-full border rounded-xl px-4 py-2"
                            placeholder="0 = Free"
                          />
                        </div>

                        <div className="w-1/2">
                          <label className="text-sm font-semibold text-[#124734]">MRP (₹)</label>
                          <input
                            type="number"
                            min="0"
                            value={form.mrp}
                            onChange={(e) => setForm((p) => ({ ...p, mrp: e.target.value === "" ? "" : e.target.value }))}
                            className="mt-1 w-full border rounded-xl px-4 py-2"
                            placeholder="Optional"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-[#124734]">Description</label>
                      <textarea
                        value={form.description}
                        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                        className="mt-1 w-full border rounded-xl px-4 py-2 min-h-[120px]"
                        placeholder="Write what student will get in this test series..."
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-1">
                    <div className="bg-[#F9FAFB] border border-[#E6F4EC] rounded-2xl p-4">
                      <p className="text-sm font-bold text-[#124734] mb-2">Cover Image</p>

                      <div className="w-full h-44 rounded-2xl border border-[#E6F4EC] overflow-hidden bg-white flex items-center justify-center">
                        {imgPreview ? (
                          <img
                            src={imgPreview}
                            alt={form.title ? `Preview cover: ${form.title}` : "Preview cover image"}
                            className="w-full h-full object-contain bg-white"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="text-[#5B7065] flex items-center gap-2">
                            <ImageIcon size={18} /> No image
                          </div>
                        )}
                      </div>

                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => onPickImage(e.target.files?.[0] || null)}
                        className="block w-full text-sm mt-3"
                      />

                      <div className="mt-4 flex items-center gap-3 bg-white border border-[#E6F4EC] rounded-xl p-3">
                        <input
                          id="published"
                          type="checkbox"
                          checked={!!form.isPublished}
                          onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.checked }))}
                        />
                        <label htmlFor="published" className="text-sm font-semibold text-[#124734]">
                          Publish (visible to students)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#E6F4EC] pt-4">
                  <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl border font-semibold text-[#124734] hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-[#009846] text-white font-semibold shadow hover:opacity-95">
                    {mode === "create" ? "Create" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
