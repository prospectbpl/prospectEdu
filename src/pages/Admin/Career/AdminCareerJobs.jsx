import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { api } from "../../../lib/api";
import AdminSidebar from "../../../components/Admin/Layout/AdminSidebar";
import AdminTopbar from "../../../components/Admin/Layout/AdminTopbar";
import Breadcrumb from "../../../components/Breadcrumb";
import { Plus, Trash2, Briefcase, MapPin, Users, ToggleLeft, ToggleRight } from "lucide-react";

function buildDescription(responsibilities, requirements) {
  const clean = (arr) =>
    (arr || [])
      .map((x) => String(x || "").trim())
      .filter(Boolean);

  const resp = clean(responsibilities);
  const reqs = clean(requirements);

  const lines = [
    "Responsibilities:",
    ...(resp.length ? resp.map((t) => `• ${t}`) : ["• "]),
    "Requirements:",
    ...(reqs.length ? reqs.map((t) => `• ${t}`) : ["• "]),
  ];

  return lines.join("\n");
}

export default function AdminCareerJobs() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 80 : 256;

  const canonicalUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    return origin && pathname ? `${origin}${pathname}` : "";
  }, []);

  const pageTitle = "Post Job | ProspectEdu Admin";
  const pageDescription =
    "Create and manage career job postings, set responsibilities and requirements, and toggle job visibility in ProspectEdu Admin.";

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    vacancy: 1,
    location: "",
    jobType: "",
    isActive: true,
  });
  const [responsibilities, setResponsibilities] = useState([""]);
  const [requirements, setRequirements] = useState([""]);

  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/careers/jobs");
      setJobs(res?.data?.jobs || []);
    } catch (e) {
      console.error(e);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter((j) => {
      const t = String(j?.title || "").toLowerCase();
      const loc = String(j?.location || "").toLowerCase();
      const type = String(j?.jobType || "").toLowerCase();
      return t.includes(q) || loc.includes(q) || type.includes(q);
    });
  }, [jobs, query]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const addResp = () => setResponsibilities((p) => [...p, ""]);
  const removeResp = (idx) =>
    setResponsibilities((p) => (p.length <= 1 ? p : p.filter((_, i) => i !== idx)));
  const updateResp = (idx, val) =>
    setResponsibilities((p) => p.map((x, i) => (i === idx ? val : x)));

  const addReq = () => setRequirements((p) => [...p, ""]);
  const removeReq = (idx) =>
    setRequirements((p) => (p.length <= 1 ? p : p.filter((_, i) => i !== idx)));
  const updateReq = (idx, val) =>
    setRequirements((p) => p.map((x, i) => (i === idx ? val : x)));

  const resetForm = () => {
    setForm({
      title: "",
      vacancy: 1,
      location: "",
      jobType: "",
      isActive: true,
    });
    setResponsibilities([""]);
    setRequirements([""]);
  };

  const createJob = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        vacancy: Number(form.vacancy || 1),
        description: buildDescription(responsibilities, requirements),
      };

      await api.post("/careers/admin/jobs", payload);
      alert("Job posted ✅");
      resetForm();
      await load();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to post job");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (job) => {
    try {
      await api.patch(`/careers/admin/jobs/${job._id}`, { isActive: !job.isActive });
      load();
    } catch (e) {
      console.error(e);
      alert("Failed to update job");
    }
  };

  const removeJob = async (id) => {
    if (!confirm("Delete this job? This will also remove all applications for this job.")) return;
    try {
      await api.delete(`/careers/admin/jobs/${id}`);
      load();
    } catch (e) {
      console.error(e);
      alert("Failed to delete job");
    }
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}

        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Helmet>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* Main */}
      <main
        className="flex flex-col flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarWidth, width: `calc(100vw - ${sidebarWidth}px)` }}
        aria-label="Career post job admin page"
      >
        {/* Topbar */}
        <div
          className="fixed top-0 bg-white shadow-sm h-[64px] flex items-center z-[999]"
          style={{ left: sidebarWidth, right: 0 }}
        >
          <AdminTopbar pageTitle="Career • Post Job" />
        </div>

        <div className="px-6 pt-[90px] pb-10 overflow-y-auto">
          <div className="ml=-3"> 
           <Breadcrumb
        items={[
          { label: "Dashboard", to: "/admin-dashboard" },
          { label: "Post Jobs" },
        ]}
      />
        </div>
          {/* Header row */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6">
            <div className="text-left">
              {/* Keep your visible H1 as-is (layout unchanged) */}
              <h1 className="text-2xl font-bold text-[#124734]">Create a New Job</h1>
              <p className="text-sm text-gray-600">
                Add responsibilities & requirements with proper numbering. This will show on the Career page.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full lg:w-[340px]">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search jobs (title / location / type)"
                  className="w-full border bg-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#A7E1B2]"
                  aria-label="Search job postings"
                />
              </div>
              <button onClick={load} className="border rounded-xl px-4 py-2.5 bg-white hover:bg-gray-50">
                Refresh
              </button>
            </div>
          </div>

          {/* Form Card */}
          <form onSubmit={createJob} className="bg-white rounded-2xl shadow p-5 md:p-6 grid gap-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="text-left">
                <label className="block mb-1 font-semibold text-[#124734]">Job Title</label>
                <div className="flex items-center gap-2 border rounded-xl px-3 py-2.5 bg-[#F9FAFB]">
                  <Briefcase className="w-5 h-5 text-[#124734]" />
                  <input
                    name="title"
                    value={form.title}
                    onChange={onChange}
                    className="w-full bg-transparent outline-none"
                    placeholder="e.g. Academic Counsellor"
                    required
                  />
                </div>
              </div>

              <div className="text-left">
                <label className="block mb-1 font-semibold text-[#124734]">Vacancy</label>
                <div className="flex items-center gap-2 border rounded-xl px-3 py-2.5 bg-[#F9FAFB]">
                  <Users className="w-5 h-5 text-[#124734]" />
                  <input
                    type="number"
                    name="vacancy"
                    value={form.vacancy}
                    onChange={onChange}
                    className="w-full bg-transparent outline-none"
                    min={1}
                    required
                  />
                </div>
              </div>

              <div className="text-left">
                <label className="block mb-1 font-semibold text-[#124734]">Location</label>
                <div className="flex items-center gap-2 border rounded-xl px-3 py-2.5 bg-[#F9FAFB]">
                  <MapPin className="w-5 h-5 text-[#124734]" />
                  <input
                    name="location"
                    value={form.location}
                    onChange={onChange}
                    className="w-full bg-transparent outline-none"
                    placeholder="e.g. Delhi / Remote"
                    required
                  />
                </div>
              </div>

              <div className="text-left">
                <label className="block mb-1 font-semibold text-[#124734]">Job Type</label>
                <input
                  name="jobType"
                  value={form.jobType}
                  onChange={onChange}
                  className="w-full border rounded-xl px-4 py-2.5 bg-[#F9FAFB] outline-none focus:ring-2 focus:ring-[#A7E1B2]"
                  placeholder="Full-time / Part-time / Internship"
                  required
                />
              </div>
            </div>

            {/* Responsibilities & Requirements (unchanged layout) */}
            <div className="grid lg:grid-cols-2 gap-5">
              {/* Responsibilities */}
              <div className="rounded-2xl border bg-[#F9FAFB] p-4 md:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-[#124734]">Responsibilities</h3>
                    <p className="text-xs text-gray-600">Add multiple points. Numbering is automatic.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setResponsibilities((p) => [...p, ""])}
                    className="inline-flex items-center gap-2 bg-[#124734] text-white px-4 py-2 rounded-xl hover:bg-[#0f3a23]"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>

                <div className="mt-4 grid gap-3">
                  {responsibilities.map((val, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="min-w-[32px] h-[32px] rounded-full bg-white border flex items-center justify-center font-bold text-[#124734]">
                        {idx + 1}
                      </div>

                      <input
                        value={val}
                        onChange={(e) => updateResp(idx, e.target.value)}
                        placeholder="Write responsibility..."
                        className="flex-1 border rounded-xl px-4 py-2.5 outline-none bg-white focus:ring-2 focus:ring-[#A7E1B2]"
                        required={idx === 0}
                      />

                      <button
                        type="button"
                        onClick={() => removeResp(idx)}
                        className="p-2.5 rounded-xl border bg-white hover:bg-gray-50"
                        title="Remove"
                        aria-label={`Remove responsibility ${idx + 1}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div className="rounded-2xl border bg-[#F9FAFB] p-4 md:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-[#124734]">Requirements</h3>
                    <p className="text-xs text-gray-600">Add multiple points. Numbering is automatic.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRequirements((p) => [...p, ""])}
                    className="inline-flex items-center gap-2 bg-[#124734] text-white px-4 py-2 rounded-xl hover:bg-[#0f3a23]"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>

                <div className="mt-4 grid gap-3">
                  {requirements.map((val, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="min-w-[32px] h-[32px] rounded-full bg-white border flex items-center justify-center font-bold text-[#124734]">
                        {idx + 1}
                      </div>

                      <input
                        value={val}
                        onChange={(e) => updateReq(idx, e.target.value)}
                        placeholder="Write requirement..."
                        className="flex-1 border rounded-xl px-4 py-2.5 outline-none bg-white focus:ring-2 focus:ring-[#A7E1B2]"
                        required={idx === 0}
                      />

                      <button
                        type="button"
                        onClick={() => removeReq(idx)}
                        className="p-2.5 rounded-xl border bg-white hover:bg-gray-50"
                        title="Remove"
                        aria-label={`Remove requirement ${idx + 1}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Active toggle + actions */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <label className="flex items-center gap-3 text-left">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={onChange}
                  className="w-5 h-5 accent-[#124734]"
                />
                <div>
                  <div className="font-semibold text-[#124734]">Active Job</div>
                  <div className="text-xs text-gray-600">If off, job won’t show on frontend Career page.</div>
                </div>
              </label>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="border rounded-xl px-5 py-2.5 bg-white hover:bg-gray-50"
                  disabled={saving}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="bg-[#124734] text-white px-6 py-2.5 rounded-xl hover:bg-[#0f3a23] disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? "Posting..." : "Post Job"}
                </button>
              </div>
            </div>
          </form>

          {/* Jobs list */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-[#124734] text-left">All Jobs</h2>
              <div className="text-sm text-gray-600">{filteredJobs.length} job(s)</div>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl shadow p-6">Loading jobs...</div>
            ) : filteredJobs.length === 0 ? (
              <div className="bg-white rounded-2xl shadow p-6 text-gray-600">No jobs found.</div>
            ) : (
              <div className="grid gap-4">
                {filteredJobs.map((j) => (
                  <div
                    key={j._id}
                    className="bg-white rounded-2xl shadow p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-bold text-[#124734]">{j.title}</div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full border ${
                            j.isActive
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {j.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 mt-1">
                        Vacancy: <b>{j.vacancy}</b> • Location: <b>{j.location}</b> • Type: <b>{j.jobType}</b>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Created: {new Date(j.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => toggleActive(j)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border bg-white hover:bg-gray-50"
                        aria-label={`${j.isActive ? "Deactivate" : "Activate"} job ${j.title}`}
                      >
                        {j.isActive ? (
                          <>
                            <ToggleLeft className="w-5 h-5" /> Deactivate
                          </>
                        ) : (
                          <>
                            <ToggleRight className="w-5 h-5" /> Activate
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => removeJob(j._id)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700"
                        aria-label={`Delete job ${j.title}`}
                      >
                        <Trash2 className="w-5 h-5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 text-left text-xs text-gray-500">
            Tip: Responsibilities & Requirements are stored as bullets for your Career frontend (JobDetail parsing remains correct).
          </div>
        </div>
      </main>
    </div>
  );
}
