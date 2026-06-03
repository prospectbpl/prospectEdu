import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import AdminSidebar from "../../../components/Admin/Layout/AdminSidebar";
import AdminTopbar from "../../../components/Admin/Layout/AdminTopbar";
import Breadcrumb from "../../../components/Breadcrumb";
import { api } from "../../../lib/api";

const AdminAchieversPage = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidthPx = isCollapsed ? 80 : 256;

  const canonicalUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    return origin && pathname ? `${origin}${pathname}` : "";
  }, []);

  const pageTitle = "Achievers | ProspectEdu Admin";
  const pageDescription =
    "Add and manage achievers displayed on the public Achievers page in ProspectEdu.";

  const accessToken = sessionStorage.getItem("accessToken");
  const authHeaders = useMemo(
    () => ({ headers: { Authorization: `Bearer ${accessToken}` } }),
    [accessToken]
  );

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  const [saving, setSaving] = useState(false);
  const [imgFile, setImgFile] = useState(null);

  const [form, setForm] = useState({
    name: "",
    course: "Engineering",
    year: "2024",
    achievement: "",
    extra: "",
    quote: "",
  });

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await api.get("/achievers");
      setItems(res.data?.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const addAchiever = async (e) => {
    e.preventDefault();
    if (!imgFile) return alert("Please select achiever image");

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("img", imgFile);
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));

      await api.post("/achievers/admin", fd, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setForm({
        name: "",
        course: "Engineering",
        year: "2024",
        achievement: "",
        extra: "",
        quote: "",
      });
      setImgFile(null);

      await fetchList();
      alert("✅ Achiever added");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to add achiever");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this achiever?")) return;
    try {
      await api.delete(`/achievers/admin/${id}`, authHeaders);
      setItems((prev) => prev.filter((x) => x._id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}

        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
        <meta property="og:type" content="website" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Helmet>

      {/* Hidden H1 for SEO/accessibility (no layout change) */}
      <h1 className="sr-only">Achievers</h1>

      <div
        className={`${isCollapsed ? "w-20" : "w-64"} fixed top-0 left-0 h-full z-40 transition-all duration-300`}
      >
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      <main
        className="flex flex-col flex-1 h-screen transition-all duration-300 text-left"
        style={{ marginLeft: sidebarWidthPx, width: `calc(100vw - ${sidebarWidthPx}px)` }}
        aria-label="Achievers admin page"
      >
        <div
          className="fixed top-0 bg-white shadow-sm h-[64px] z-[999]"
          style={{ left: sidebarWidthPx, right: 0 }}
        >
          <AdminTopbar pageTitle="Achievers" />
        </div>

        <div className="px-6 pt-[90px] pb-10 overflow-y-auto">
           <div className="ml=-3"> 
                     <Breadcrumb
                  items={[
                    { label: "Dashboard", to: "/admin-dashboard" },
                    { label: "Achievers" },
                  ]}
                />
                  </div>
          {/* ADD FORM */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6" aria-label="Add achiever">
            <h2 className="text-xl font-semibold text-[#124734] mb-1">Add Achiever</h2>
            <p className="text-sm text-gray-600 mb-5">Upload achiever details exactly as shown on Achievers page.</p>

            <form onSubmit={addAchiever} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-700 font-semibold">Student Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  required
                  className="w-full mt-1 border rounded-xl px-4 py-2"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 font-semibold">Course</label>
                <select
                  name="course"
                  value={form.course}
                  onChange={onChange}
                  className="w-full mt-1 border rounded-xl px-4 py-2"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Medical">Medical</option>
                  <option value="Law">Law</option>
                  <option value="Management">Management</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-700 font-semibold">Year</label>
                <select
                  name="year"
                  value={form.year}
                  onChange={onChange}
                  className="w-full mt-1 border rounded-xl px-4 py-2"
                >
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-700 font-semibold">Achiever Photo</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => setImgFile(e.target.files?.[0] || null)}
                  className="w-full mt-1 border rounded-xl px-4 py-2 bg-white"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-gray-700 font-semibold">Achievement (Card Description)</label>
                <textarea
                  name="achievement"
                  value={form.achievement}
                  onChange={onChange}
                  required
                  className="w-full mt-1 border rounded-xl px-4 py-2 min-h-[90px]"
                  placeholder="Write achievement text..."
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 font-semibold">Extra (Bold line)</label>
                <input
                  name="extra"
                  value={form.extra}
                  onChange={onChange}
                  className="w-full mt-1 border rounded-xl px-4 py-2"
                  placeholder="e.g. Scholarship Winner"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 font-semibold">Quote</label>
                <input
                  name="quote"
                  value={form.quote}
                  onChange={onChange}
                  className="w-full mt-1 border rounded-xl px-4 py-2"
                  placeholder='e.g. "Prospect changed my life"'
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button
                  disabled={saving}
                  className="px-6 py-2 rounded-xl bg-[#124734] text-white font-semibold hover:bg-[#0B2F23] disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Add Achiever"}
                </button>
              </div>
            </form>
          </section>

          {/* LIST */}
          <section
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
            aria-label="Uploaded achievers list"
          >
            <div className="p-5 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#124734]">Uploaded Achievers</h3>
                <p className="text-sm text-gray-600">These are visible on the public Achievers page.</p>
              </div>
              <button
                onClick={fetchList}
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="p-6 text-gray-600" aria-live="polite">
                Loading…
              </div>
            ) : items.length === 0 ? (
              <div className="p-6 text-gray-600" aria-live="polite">
                No achievers added yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="text-left px-4 py-3">Student</th>
                      <th className="text-left px-4 py-3">Course</th>
                      <th className="text-left px-4 py-3">Year</th>
                      <th className="text-left px-4 py-3">Achievement</th>
                      <th className="text-right px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map((a) => (
                      <tr key={a._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 flex items-center gap-3">
                          <img
                            src={a.imgUrl}
                            alt={a?.name ? `${a.name} achiever photo` : "Achiever photo"}
                            className="w-10 h-10 rounded-full border"
                            width={40}
                            height={40}
                            loading="lazy"
                            decoding="async"
                          />
                          <div>
                            <div className="font-semibold text-gray-900">{a.name}</div>
                            <div className="text-xs text-gray-500">{a.extra || "-"}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">{a.course}</td>
                        <td className="px-4 py-3">{a.year}</td>
                        <td className="px-4 py-3 text-gray-600 line-clamp-2">{a.achievement}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => remove(a._id)}
                            className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700"
                            aria-label={`Delete achiever ${a.name}`}
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
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminAchieversPage;
