import { useEffect, useMemo, useRef, useState } from "react";
import { FileText, PenLine, Plus, Search, Trash2, UploadCloud, X } from "lucide-react";
import { Helmet } from "react-helmet-async";

import TeacherSidebar from "../../components/Teacher/TeacherSidebar";
import Breadcrumb from "../../components/Breadcrumb";
import TeacherTopbar from "../../components/Teacher/TeacherTopbar";

import { uploadsApi } from "../../services/uploads";
import { studyMaterialsApi } from "../../services/studyMaterials";
import { categoriesApi } from "../../services/categories";

function badgeClass(type) {
  return type === "pdf"
    ? "bg-[#E8F3FF] text-[#0B4F9E] border border-[#CFE6FF]"
    : "bg-[#F3E8FF] text-[#5B21B6] border border-[#E9D5FF]";
}

function safeName(name, fallback = "file.pdf") {
  const n = String(name || "").trim();
  if (!n) return fallback;
  return n;
}

export default function TeacherStudyMaterials() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidthPx = isCollapsed ? 80 : 256;

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  const [categories, setCategories] = useState([]);

  const [tab, setTab] = useState("all"); // all | pdf | handwritten
  const [q, setQ] = useState("");

  // create modal
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [materialType, setMaterialType] = useState("pdf");
  const [category, setCategory] = useState("");
  const [fileUploading, setFileUploading] = useState(false);
  const [fileMeta, setFileMeta] = useState(null); // { url, publicId, originalName, mimeType }
  const fileRef = useRef(null);

  async function loadAll() {
    setLoading(true);
    try {
      const [mineRes, catsRes] = await Promise.all([
        studyMaterialsApi.teacherMine(),
        categoriesApi.publicList(),
      ]);
      setItems(mineRes.data?.items || []);
      setCategories(catsRes.data?.categories || []);
      if (!category && (catsRes.data?.categories || []).length) {
        setCategory(catsRes.data.categories[0].name);
      }
    } finally {
      setLoading(false);
    }
  }

  async function downloadFile(url, filename) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Download failed");
    const blob = await res.blob();

    const a = document.createElement("a");
    a.href = window.URL.createObjectURL(blob);
    a.download =
      filename.endsWith(".pdf") || filename.endsWith(".doc") || filename.endsWith(".docx")
        ? filename
        : `${filename}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(a.href);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    return list.filter((x) => {
      if (tab !== "all" && x.materialType !== tab) return false;
      if (q && !String(x.title || "").toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [items, tab, q]);

  async function onPickFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const ok =
      file.type === "application/pdf" ||
      file.type === "application/msword" ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    if (!ok) {
      alert("Only PDF / DOC / DOCX is allowed");
      e.target.value = "";
      return;
    }

    setFileUploading(true);
    setFileMeta(null);
    try {
      const res = await uploadsApi.uploadStudyMaterialFile(file);
      const d = res.data;
      setFileMeta({
        url: d.url,
        publicId: d.publicId,
        originalName: d.originalName,
        mimeType: d.mimeType,
      });
    } catch (err) {
      alert(err?.response?.data?.message || "Upload failed");
    } finally {
      setFileUploading(false);
    }
  }

  async function createMaterial() {
    if (!title.trim()) return alert("Title is required");
    if (!category.trim()) return alert("Category is required");
    if (!fileMeta?.url) return alert("Please upload a file");

    setLoading(true);
    try {
      await studyMaterialsApi.create({
        title: title.trim(),
        category: category.trim(),
        materialType,
        fileUrl: fileMeta.url,
        filePublicId: fileMeta.publicId,
        fileName: fileMeta.originalName,
        mimeType: fileMeta.mimeType,
      });

      setOpen(false);
      setTitle("");
      setMaterialType("pdf");
      setFileMeta(null);
      if (fileRef.current) fileRef.current.value = "";
      await loadAll();
    } catch (err) {
      alert(err?.response?.data?.message || "Create failed");
    } finally {
      setLoading(false);
    }
  }

  async function removeItem(id) {
    if (!confirm("Delete this study material?")) return;
    setLoading(true);
    try {
      await studyMaterialsApi.remove(id);
      await loadAll();
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  // ✅ SEO (teacher dashboard pages should usually be "noindex")
  const seoTitle = "Teacher Study Materials | ProspectEdu";
  const seoDesc = "Upload and manage study materials (PDF/DOC/handwritten) by category inside the teacher dashboard.";
  const canonical = typeof window !== "undefined" ? window.location.href : "";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: seoTitle,
    description: seoDesc,
    url: canonical,
    isPartOf: {
      "@type": "WebSite",
      name: "ProspectEdu",
      url: canonical ? new URL(canonical).origin : "",
    },
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

      {/* ✅ SR-only H1 for SEO hierarchy (no layout change) */}
      <h1 className="sr-only">Teacher Study Materials</h1>

      {/* Sidebar */}
      <aside
        className={`${isCollapsed ? "w-20" : "w-64"} fixed top-0 left-0 h-full z-40 transition-all duration-300`}
        aria-label="Teacher sidebar navigation"
      >
        <TeacherSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </aside>


      {/* Main */}
      <div
        className="flex flex-col flex-1 h-screen transition-all duration-300"
        style={{
          marginLeft: sidebarWidthPx,
          width: `calc(100vw - ${sidebarWidthPx}px)`,
        }}
      >
        {/* Topbar */}
        <header
          className="fixed top-0 z-[999] bg-white shadow-sm h-[64px]"
          style={{ left: sidebarWidthPx, right: 0 }}
        >
          <TeacherTopbar pageTitle="Study Materials" />
        </header>
        
        {/* Toolbar */}
        <div className="sticky top-[64px] z-[998] bg-[#F9FAFB] border-b border-[#E6F4EC] px-6 py-4">
          <Breadcrumb
        items={[
          { label: "Dashboard", to: "/teacher-dashboard" },
          { label: "Study Materials" },
        ]}
      />
          <div className="max-w-6xl mx-auto flex flex-col gap-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-lg text-left font-semibold text-[#124734]">Your Study Materials</h2>
                <p className="text-sm text-[#5B7065] text-left">
                  Upload PDFs or handwritten notes, and organize them by course category.
                </p>
              </div>

              <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#009846] text-white hover:bg-[#007a36] transition shadow-sm"
                aria-label="Create study material"
              >
                <Plus size={18} /> Create Study Material
              </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-3">
              {/* Tabs */}
              <div className="flex gap-2" role="tablist" aria-label="Study material type filters">
                {[
                  { key: "all", label: "All" },
                  { key: "pdf", label: "PDF/DOC" },
                  { key: "handwritten", label: "Handwritten" },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`px-3 py-2 rounded-xl text-sm border transition ${
                      tab === t.key
                        ? "bg-white border-[#009846] text-[#009846]"
                        : "bg-transparent border-[#E6F4EC] text-[#5B7065] hover:bg-white"
                    }`}
                    role="tab"
                    aria-selected={tab === t.key}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B7065]"
                  size={18}
                  aria-hidden="true"
                />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by title..."
                  className="w-full pl-10 pr-3 py-2 rounded-xl border border-[#E6F4EC] bg-white focus:outline-none focus:ring-2 focus:ring-[#A7E1B2]"
                  aria-label="Search study materials by title"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-8" style={{ marginTop: "64px" }}>
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="bg-white border border-[#E6F4EC] rounded-2xl p-6 text-[#5B7065]">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="bg-white border border-[#E6F4EC] rounded-2xl p-8 text-center">
                <p className="text-[#124734] font-semibold">No study materials yet</p>
                <p className="text-sm text-[#5B7065] mt-1">Create your first upload to show here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((x) => (
                  <article
                    key={x._id}
                    className="bg-white border border-[#E6F4EC] rounded-2xl p-5 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-[#124734] font-semibold leading-snug">{x.title}</h3>
                      <button
                        onClick={() => removeItem(x._id)}
                        className="p-2 rounded-xl border border-[#F1D0D0] text-[#B42318] hover:bg-[#FFF3F3] transition"
                        title="Delete"
                        aria-label={`Delete ${x.title}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 items-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${badgeClass(x.materialType)}`}>
                        {x.materialType === "pdf" ? (
                          <span className="inline-flex items-center gap-1">
                            <FileText size={14} /> PDF
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <PenLine size={14} /> Handwritten
                          </span>
                        )}
                      </span>

                      <span className="text-xs px-2 py-1 rounded-full bg-[#ECF5EE] text-[#124734] border border-[#A7E1B2]">
                        {String(x.category || "").toUpperCase()}
                      </span>
                    </div>

                    <p className="text-sm text-[#5B7065] mt-3 truncate">{x.fileName}</p>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => downloadFile(x.fileUrl, safeName(x.fileName, `${x.title}.pdf`))}
                        className="flex-1 text-center px-4 py-2 rounded-xl bg-[#009846] text-white"
                        aria-label={`Download ${x.title}`}
                      >
                        Download
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Modal */}
      {open && (
        <div className="fixed inset-0 z-[2000] bg-black/30 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#E6F4EC]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E6F4EC]">
              <div>
                <h3 className="text-[#124734] font-semibold">Create Study Material</h3>
                <p className="text-sm text-[#5B7065]">Title + category + upload file (PDF/DOC/DOCX)</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 rounded-xl hover:bg-[#F2F4F7]" aria-label="Close modal">
                <X />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-[#124734]">Title *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-[#E6F4EC] bg-white focus:outline-none focus:ring-2 focus:ring-[#A7E1B2]"
                  placeholder="e.g. Polity – Fundamental Rights Notes"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-[#124734]">Material Type *</label>
                  <select
                    value={materialType}
                    onChange={(e) => setMaterialType(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-[#E6F4EC] bg-white"
                  >
                    <option value="pdf">PDF</option>
                    <option value="handwritten">Handwritten Notes</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#124734]">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-[#E6F4EC] bg-white"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border border-[#E6F4EC] rounded-2xl p-4 bg-[#FAFFFC]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#124734]">Upload File *</p>
                    <p className="text-xs text-[#5B7065]">Allowed: PDF, DOC, DOCX</p>
                  </div>

                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={onPickFile}
                    className="hidden"
                    id="sm-file"
                  />
                  <label
                    htmlFor="sm-file"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#A7E1B2] bg-white text-[#124734] cursor-pointer hover:bg-[#ECF5EE]"
                  >
                    <UploadCloud size={18} />
                    Choose File
                  </label>
                </div>

                <div className="mt-3">
                  {fileUploading ? (
                    <p className="text-sm text-[#5B7065]">Uploading…</p>
                  ) : fileMeta ? (
                    <div className="text-sm">
                      <p className="text-[#124734] font-medium">Uploaded:</p>
                      <p className="text-[#5B7065] truncate">{fileMeta.originalName}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-[#5B7065]">No file selected</p>
                  )}
                </div>
              </div>

              <button
                onClick={createMaterial}
                disabled={loading || fileUploading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#009846] text-white hover:bg-[#007a36] transition disabled:opacity-60"
              >
                <Plus size={18} /> Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
