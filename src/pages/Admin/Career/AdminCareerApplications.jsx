import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { api } from "../../../lib/api";
import AdminSidebar from "../../../components/Admin/Layout/AdminSidebar";
import AdminTopbar from "../../../components/Admin/Layout/AdminTopbar";
import Breadcrumb from "../../../components/Breadcrumb";
import { FileText, Mail, Phone, User, Filter, RefreshCw } from "lucide-react";

function Badge({ status }) {
  const s = String(status || "NEW").toUpperCase();
  const map = {
    NEW: "bg-blue-50 text-blue-700 border-blue-200",
    SHORTLISTED: "bg-yellow-50 text-yellow-700 border-yellow-200",
    REJECTED: "bg-red-50 text-red-700 border-red-200",
    HIRED: "bg-green-50 text-green-700 border-green-200",
  };
  return (
    <span className={`text-xs px-2 py-1 rounded-full border ${map[s] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
      {s}
    </span>
  );
}

function resumeHref(a) {
  const url = a?.resumeUrl || "";
  const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${BASE}${url}`;
}

async function forceDownloadPdf(url, filename = "resume.pdf") {
  try {
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) throw new Error("Download failed");

    const blob = await res.blob();
    const safeName = filename.toLowerCase().endsWith(".pdf") ? filename : `${filename}.pdf`;

    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = safeName;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(blobUrl);
  } catch (e) {
    console.error(e);
    alert("Resume download failed");
  }
}

export default function AdminCareerApplications() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 80 : 256;

  const canonicalUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    return origin && pathname ? `${origin}${pathname}` : "";
  }, []);

  const pageTitle = "Career Applications | ProspectEdu Admin";
  const pageDescription =
    "Search and manage career job applications, download resumes, and update applicant statuses in ProspectEdu Admin.";

  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/careers/admin/applications");
      setApps(res?.data?.applications || []);
    } catch (e) {
      console.error(e);
      setApps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/careers/admin/applications/${id}/status`, { status });
      load();
    } catch (e) {
      console.error(e);
      alert("Failed to update status");
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return apps.filter((a) => {
      const matchesQuery =
        !q ||
        String(a?.name || "").toLowerCase().includes(q) ||
        String(a?.email || "").toLowerCase().includes(q) ||
        String(a?.phone || "").toLowerCase().includes(q) ||
        String(a?.job?.title || "").toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "ALL" || String(a?.status || "").toUpperCase() === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [apps, query, statusFilter]);

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
        aria-label="Career applications admin page"
      >
        {/* Topbar */}
        <div
          className="fixed top-0 bg-white shadow-sm h-[64px] flex items-center z-[999]"
          style={{ left: sidebarWidth, right: 0 }}
        >
          <AdminTopbar pageTitle="Career • Applications" />
        </div>

        <div className="px-6 pt-[90px] pb-10 overflow-y-auto">
           <div className="ml=-3"> 
           <Breadcrumb
        items={[
          { label: "Dashboard", to: "/admin-dashboard" },
          { label: "Job Applications" },
        ]}
      />
        </div>
          {/* Filters */}
          <div className="bg-white rounded-2xl shadow p-4 md:p-5 mb-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="text-left">
                {/* Keep your visible H1 as-is (layout unchanged) */}
                <h1 className="text-2xl font-bold text-[#124734]">Job Applications</h1>
                <p className="text-sm text-gray-600">Search and manage applicant status.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search name / email / job title"
                    className="w-full sm:w-[340px] border rounded-xl px-4 py-2.5 bg-[#F9FAFB] outline-none focus:ring-2 focus:ring-[#A7E1B2]"
                    aria-label="Search career applications"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border rounded-xl px-3 py-2.5 bg-[#F9FAFB] outline-none"
                    aria-label="Filter by status"
                  >
                    <option value="ALL">All</option>
                    <option value="NEW">NEW</option>
                    <option value="SHORTLISTED">SHORTLISTED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="HIRED">HIRED</option>
                  </select>
                </div>

                <button
                  onClick={load}
                  className="inline-flex items-center justify-center gap-2 border rounded-xl px-4 py-2.5 bg-white hover:bg-gray-50"
                >
                  <RefreshCw className="w-4 h-4" /> Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow overflow-auto">
            <div className="min-w-[1100px]">
              <div className="grid grid-cols-12 bg-[#124734] text-white text-sm font-semibold">
                <div className="col-span-3 p-3">Applicant</div>
                <div className="col-span-3 p-3">Job</div>
                <div className="col-span-2 p-3">Contact</div>
                <div className="col-span-2 p-3">Details</div>
                <div className="col-span-1 p-3">Resume</div>
                <div className="col-span-1 p-3">Status</div>
              </div>

              {loading ? (
                <div className="p-6 text-gray-600" aria-live="polite">
                  Loading applications...
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-6 text-gray-600" aria-live="polite">
                  No applications found.
                </div>
              ) : (
                filtered.map((a) => (
                  <div key={a._id} className="grid grid-cols-12 border-t text-sm">
                    {/* Applicant */}
                    <div className="col-span-3 p-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#A7E1B2]/40 flex items-center justify-center">
                          <User className="w-5 h-5 text-[#124734]" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-[#124734]">{a.name}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(a.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Job */}
                    <div className="col-span-3 p-3">
                      <div className="text-left">
                        <div className="font-semibold">{a.job?.title || "—"}</div>
                        <div className="text-xs text-gray-500">
                          {a.job?.location || "—"} / {a.job?.jobType || "—"}
                        </div>
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="col-span-2 p-3">
                      <div className="text-left space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-600" />
                          <span className="truncate">{a.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-600" />
                          <span>{a.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="col-span-2 p-3">
                      <div className="text-left text-xs text-gray-700 space-y-1">
                        <div><b>Edu:</b> {a.highestEducation || "—"}</div>
                        <div><b>Relocate:</b> {a.canRelocate || "—"}</div>
                        <div><b>Fluent:</b> {a.fluentIn || "—"}</div>
                      </div>
                    </div>

                    {/* Resume */}
                    <div className="col-span-1 p-3">
                      {a.resumeUrl ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                          onClick={() => forceDownloadPdf(resumeHref(a), a.resumeOriginalName || "resume.pdf")}
                          aria-label={`Download resume for ${a.name}`}
                        >
                          <FileText className="w-4 h-4" />
                          <span className="text-xs">
                            {a.resumeOriginalName
                              ? a.resumeOriginalName.toLowerCase().endsWith(".pdf")
                                ? a.resumeOriginalName
                                : `${a.resumeOriginalName}.pdf`
                              : "Resume.pdf"}
                          </span>
                        </button>
                      ) : (
                        <span className="text-gray-500 text-xs">No file</span>
                      )}
                    </div>

                    {/* Status */}
                    <div className="col-span-1 p-3">
                      <div className="flex flex-col gap-2">
                        <Badge status={a.status} />
                        <select
                          value={String(a.status || "NEW").toUpperCase()}
                          onChange={(e) => updateStatus(a._id, e.target.value)}
                          className="border rounded-xl px-2 py-2 bg-[#F9FAFB] outline-none text-xs"
                          aria-label={`Update status for ${a.name}`}
                        >
                          <option value="NEW">NEW</option>
                          <option value="SHORTLISTED">SHORTLISTED</option>
                          <option value="REJECTED">REJECTED</option>
                          <option value="HIRED">HIRED</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 text-left text-xs text-gray-500">
            Showing <b>{filtered.length}</b> of <b>{apps.length}</b> applications.
          </div>
        </div>
      </main>
    </div>
  );
}
