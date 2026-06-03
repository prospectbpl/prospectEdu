import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import TeacherSidebar from "../../../components/Teacher/TeacherSidebar";
import TeacherTopbar from "../../../components/Teacher/TeacherTopbar";
import Breadcrumb from "../../../components/Breadcrumb";
import { Plus, Pencil, Trash2, Image as ImageIcon, X } from "lucide-react";
import {
  createTeacherBlog,
  deleteTeacherBlog,
  fetchTeacherBlogs,
  updateTeacherBlog,
} from "../../../lib/blogApi";

const emptyForm = {
  title: "",
  subtitle: "",
  slug: "",
  content: "",
  cover: null,
};

const prettyDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

export default function TeacherBlogs() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidthPx = isCollapsed ? 80 : 256;

  const location = useLocation();

  // ✅ SEO
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
          name: "Blogs",
          item: canonicalUrl,
        },
      ],
    }),
    [canonicalUrl]
  );

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [activeId, setActiveId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imgPreview, setImgPreview] = useState("");

  const totalCount = useMemo(() => items.length, [items]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchTeacherBlogs();
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

  const openEdit = (b) => {
    setMode("edit");
    setActiveId(b._id);
    setForm({
      title: b.title || "",
      subtitle: b.subtitle || "",
      slug: b.slug || "",
      content: b.content || "",
      cover: null,
    });
    setImgPreview(b.coverUrl || "");
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setForm(emptyForm);
    setActiveId(null);
    setImgPreview("");
  };

  const onPickCover = (file) => {
    setForm((p) => ({ ...p, cover: file }));
    if (file) setImgPreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("subtitle", form.subtitle || "");
    fd.append("slug", form.slug || "");
    fd.append("content", form.content || "");
    if (form.cover) fd.append("cover", form.cover);

    try {
      if (mode === "create") await createTeacherBlog(fd);
      else await updateTeacherBlog(activeId, fd);

      await load();
      closeModal();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed. Check console.");
      console.error(err);
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this blog?")) return;
    try {
      await deleteTeacherBlog(id);
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
        <title>Blogs | Teacher Dashboard | ProspectEdu</title>
        <meta
          name="description"
          content="Create, edit and manage blog posts from the ProspectEdu teacher dashboard."
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
        style={{
          marginLeft: sidebarWidthPx,
          width: `calc(100vw - ${sidebarWidthPx}px)`,
        }}
      >
        <header
          className="fixed top-0 z-[999] bg-white shadow-sm h-[64px]"
          style={{ left: sidebarWidthPx, right: 0 }}
        >
          <TeacherTopbar isCollapsed={isCollapsed} pageTitle="Blogs" />
        </header>
       

        <main className="flex-1 overflow-y-auto px-6 py-8" style={{ marginTop: "64px" }}>
           <Breadcrumb
        items={[
          { label: "Dashboard", to: "/teacher-dashboard" },
          { label: "Blogs" },
        ]}
      />
          <div className="max-w-6xl mx-auto text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-[#124734]">Your Blogs</h1>
                <p className="text-sm text-[#5B7065] mt-1">
                  Upload blogs with cover image. Total: <b>{totalCount}</b>
                </p>
              </div>

              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#009846] text-white font-semibold shadow hover:opacity-95"
              >
                <Plus size={18} /> Create Blog
              </button>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E6F4EC]">
                Loading...
              </div>
            ) : items.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 shadow-sm border border-[#E6F4EC] text-center">
                <p className="text-[#124734] font-semibold text-lg">No blogs yet</p>
                <p className="text-[#5B7065] mt-1">
                  Click “Create Blog” to publish your first one.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {items.map((b) => (
                  <div
                    key={b._id}
                    className="bg-white rounded-2xl shadow-sm border border-[#E6F4EC] overflow-hidden hover:shadow-md transition"
                  >
                    <div className="relative">
                      <img
                        src={b.coverUrl || "/src/assets/blog.webp"}
                        alt={b.title}
                        className="w-full h-44 object-contain bg-[#F9FAFB]"
                        loading="lazy"
                      />
                    </div>

                    <div className="p-5">
                      <h3 className="text-lg font-bold text-[#124734] line-clamp-2">{b.title}</h3>
                      <p className="text-sm text-[#5B7065] mt-1 line-clamp-2">
                        {b.subtitle || "—"}
                      </p>

                      <div className="flex items-center justify-between mt-4">
                        <p className="text-xs text-[#5B7065]">Created: {prettyDate(b.createdAt)}</p>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(b)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[#CDE8D5] text-[#124734] hover:bg-[#E6F4EC] font-semibold"
                          >
                            <Pencil size={16} /> Edit
                          </button>

                          <button
                            onClick={() => onDelete(b._id)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-semibold"
                          >
                            <Trash2 size={16} /> Delete
                          </button>
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

      {/* Modal (unchanged) */}
      {open && (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6F4EC] bg-[#F9FAFB]">
              <div>
                <h3 className="text-lg font-bold text-[#124734]">
                  {mode === "create" ? "Create Blog" : "Edit Blog"}
                </h3>
                <p className="text-xs text-[#5B7065] mt-1">
                  Fill details and upload cover image (Cloudinary).
                </p>
              </div>

              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-[#E6F4EC]"
              >
                <X />
              </button>
            </div>

            <form onSubmit={submit} className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-[#124734]">Title *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    className="mt-1 w-full border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#009846]/20"
                    placeholder="eg. How to prepare for exams"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-[#124734]">Subtitle</label>
                  <input
                    value={form.subtitle}
                    onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
                    className="mt-1 w-full border rounded-xl px-4 py-2"
                    placeholder="Short intro line..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-[#124734]">Slug (optional)</label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                    className="mt-1 w-full border rounded-xl px-4 py-2"
                    placeholder="Auto from title if empty"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-[#124734]">Content *</label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                    className="mt-1 w-full border rounded-xl px-4 py-3 min-h-[180px] leading-6"
                    placeholder="Write your blog content..."
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-[#124734]">Cover Image</label>

                  <div className="mt-2 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    <div className="md:col-span-5">
                      <div className="w-full h-44 rounded-2xl border border-[#E6F4EC] overflow-hidden bg-[#F9FAFB] flex items-center justify-center">
                        {imgPreview ? (
                          <img
                            src={imgPreview}
                            alt="preview"
                            className="w-full h-full object-contain bg-white"
                            loading="lazy"
                          />
                        ) : (
                          <div className="text-[#5B7065] flex items-center gap-2">
                            <ImageIcon size={18} /> No image selected
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="md:col-span-7">
                      <div className="bg-[#F9FAFB] border border-[#E6F4EC] rounded-2xl p-4">
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={(e) => onPickCover(e.target.files?.[0] || null)}
                          className="block w-full text-sm"
                        />
                        <p className="text-xs text-[#5B7065] mt-2">
                          JPG / PNG / WEBP (max 5MB). Image will be uploaded to Cloudinary & URL
                          saved in DB.
                        </p>

                        <div className="mt-3 text-xs text-[#5B7065]">
                          ✅ After creating, blog will be immediately displayed publicly.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
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
                  {mode === "create" ? "Create Blog" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
