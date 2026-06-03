import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import AdminSidebar from "../../../components/Admin/Layout/AdminSidebar";
import Breadcrumb from "../../../components/Breadcrumb";
import AdminTopbar from "../../../components/Admin/Layout/AdminTopbar";
import { api } from "../../../lib/api";

const STATUS_OPTIONS = ["NEW", "CONTACTED", "APPROVED", "REJECTED"];

const badgeClass = (s) => {
  switch (s) {
    case "APPROVED":
      return "bg-green-100 text-green-800 border-green-200";
    case "REJECTED":
      return "bg-red-100 text-red-800 border-red-200";
    case "CONTACTED":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
  }
};

const AdminScholarshipPage = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidthPx = isCollapsed ? 80 : 256;

  const canonicalUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname =
      typeof window !== "undefined" ? window.location.pathname : "";
    return origin && pathname ? `${origin}${pathname}` : "";
  }, []);

  const pageTitle = "Scholarship | ProspectEdu Admin";
  const pageDescription =
    "Manage scholarship applications, update applicant status, control result visibility, and upload official result PDF in ProspectEdu Admin.";

  const [loading, setLoading] = useState(true);
  const [regs, setRegs] = useState([]);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const [config, setConfig] = useState({ resultsLive: false });
  const [pdfFile, setPdfFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const [rowSavingId, setRowSavingId] = useState(null);
  const [editedStatus, setEditedStatus] = useState({});
  const [toast, setToast] = useState(null);

  const accessToken = sessionStorage.getItem("accessToken");
  const authHeaders = useMemo(
    () => ({ headers: { Authorization: `Bearer ${accessToken}` } }),
    [accessToken]
  );

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 2500);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([
        api.get("/scholarship/admin/registrations", {
          ...authHeaders,
          params: { q, status },
        }),
        api.get("/scholarship/admin/config", authHeaders),
      ]);

      const list = r1.data?.data || [];
      setRegs(list);
      setEditedStatus((prev) => {
        const next = { ...prev };
        list.forEach((x) => {
          if (!next[x._id]) next[x._id] = x.status;
        });
        return next;
      });

      setConfig(r2.data?.data || { resultsLive: false });
    } catch {
      showToast("error", "Failed to load scholarship data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    fetchAll();
  };

  const toggleLive = async () => {
    setSaving(true);
    try {
      const next = !config.resultsLive;
      const res = await api.patch("/scholarship/admin/config", { resultsLive: next }, authHeaders);
      setConfig(res.data.data);
      showToast("success", `Result is now ${next ? "LIVE" : "NOT LIVE"}`);
    } catch {
      showToast("error", "Failed to update result status");
    } finally {
      setSaving(false);
    }
  };

  const uploadPdf = async () => {
    if (!pdfFile) return showToast("error", "Select a PDF first");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("file", pdfFile);

      await api.post("/scholarship/admin/upload-result", fd, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setPdfFile(null);
      showToast("success", "PDF uploaded successfully");
    } catch (e) {
      showToast("error", e?.response?.data?.message || "PDF upload failed");
    } finally {
      setSaving(false);
    }
  };

  const updateRowStatus = async (id) => {
    const nextStatus = editedStatus[id];
    if (!nextStatus) return;

    setRowSavingId(id);
    try {
      setRegs((prev) => prev.map((r) => (r._id === id ? { ...r, status: nextStatus } : r)));

      await api.patch(`/scholarship/admin/registrations/${id}`, { status: nextStatus }, authHeaders);

      showToast("success", "Status updated");
    } catch {
      showToast("error", "Failed to update status");
      fetchAll();
    } finally {
      setRowSavingId(null);
    }
  };

  const counts = useMemo(() => {
    const c = { TOTAL: regs.length, NEW: 0, CONTACTED: 0, APPROVED: 0, REJECTED: 0 };
    regs.forEach((r) => (c[r.status] = (c[r.status] || 0) + 1));
    return c;
  }, [regs]);

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

      <h1 className="sr-only">Scholarship</h1>

      <div
        className={`${isCollapsed ? "w-20" : "w-64"} fixed top-0 left-0 h-full z-40 transition-all duration-300`}
      >
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      <main
        className="flex flex-col flex-1 h-screen transition-all duration-300 text-left"
        style={{ marginLeft: sidebarWidthPx, width: `calc(100vw - ${sidebarWidthPx}px)` }}
        aria-label="Scholarship admin page"
      >
        <div className="fixed top-0 bg-white shadow-sm h-[64px] z-[999]" style={{ left: sidebarWidthPx, right: 0 }}>
          <AdminTopbar pageTitle="Scholarship" />
        </div>
          

        <div className="px-6 pt-[90px] pb-10 overflow-y-auto">
          <Breadcrumb
        items={[
          { label: "Dashboard", to: "/admin-dashboard" },
          { label: "Scholarship" },
        ]}
      />
          {toast && (
            <div className="fixed right-6 top-[86px] z-[9999]">
              <div
                className={`px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold ${
                  toast.type === "success"
                    ? "bg-green-50 text-green-800 border-green-200"
                    : "bg-red-50 text-red-800 border-red-200"
                }`}
              >
                {toast.msg}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {[
              { label: "Total", value: counts.TOTAL },
              { label: "New", value: counts.NEW },
              { label: "Contacted", value: counts.CONTACTED },
              { label: "Approved", value: counts.APPROVED },
              { label: "Rejected", value: counts.REJECTED },
            ].map((x) => (
              <div key={x.label} className="bg-white rounded-2xl border p-4 shadow-sm">
                <div className="text-xs text-gray-500">{x.label}</div>
                <div className="text-2xl font-bold text-[#124734]">{x.value}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border p-6 mb-6">
            <div className="flex flex-col lg:flex-row justify-between gap-5">
              <div>
                <h2 className="text-xl font-semibold text-[#124734]">Result Control</h2>
                <p className="text-sm text-gray-600">
                  Toggle result live and upload the official result PDF.
                </p>
              </div>

              <button
                disabled={saving}
                onClick={toggleLive}
                className={`px-5 py-2 rounded-full font-semibold ${
                  config.resultsLive ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800"
                }`}
              >
                {config.resultsLive ? "🔴 LIVE" : "⚪ NOT LIVE"}
              </button>
            </div>

            <div className="mt-6 flex flex-col md:flex-row gap-3 items-center">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                className="block w-full md:w-[380px] text-sm"
              />
              <button
                disabled={saving}
                onClick={uploadPdf}
                className="px-6 py-2 rounded-full bg-[#009846] text-white font-semibold"
              >
                Upload Result PDF
              </button>
            </div>
          </div>

          {/* filters + table unchanged */}
          <form onSubmit={onSearch} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
            <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
              <div className="flex-1">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by name, email, phone, parent, course..."
                  className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#1E5631] outline-none"
                />
              </div>

              <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded-xl px-4 py-2">
                <option value="">All Status</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <button className="px-6 py-2 rounded-xl bg-[#124734] text-white font-semibold hover:bg-[#0B2F23] transition">
                Search
              </button>
            </div>
          </form>

          {/* TABLE */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold text-[#124734]">Applications</h3>
                <p className="text-sm text-gray-600">Change status from dropdown and Save.</p>
              </div>

              <button
                onClick={fetchAll}
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="p-6 text-gray-600" aria-live="polite">Loading…</div>
            ) : regs.length === 0 ? (
              <div className="p-6 text-gray-600" aria-live="polite">No applications found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="text-left px-4 py-3">Applicant</th>
                      <th className="text-left px-4 py-3">Contact</th>
                      <th className="text-left px-4 py-3">Course</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-left px-4 py-3">Submitted</th>
                      <th className="text-right px-4 py-3">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {regs.map((r) => (
                      <tr key={r._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{r.name}</div>
                          <div className="text-xs text-gray-500">Parent: {r.parent}</div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="text-gray-900">{r.email}</div>
                          <div className="text-xs text-gray-500">{r.phone}</div>
                        </td>

                        <td className="px-4 py-3">
                          <span className="text-gray-900 font-medium">{r.course}</span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${badgeClass(r.status)}`}>
                              {r.status}
                            </span>

                            <select
                              value={editedStatus[r._id] ?? r.status}
                              onChange={(e) =>
                                setEditedStatus((prev) => ({ ...prev, [r._id]: e.target.value }))
                              }
                              className="border rounded-lg px-2 py-1 text-sm bg-white"
                              aria-label={`Set status for ${r.name}`}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {new Date(r.createdAt).toLocaleDateString("en-GB")}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <button
                            disabled={rowSavingId === r._id}
                            onClick={() => updateRowStatus(r._id)}
                            className="px-4 py-2 rounded-xl bg-[#124734] text-white font-semibold hover:bg-[#0B2F23] transition disabled:opacity-60"
                          >
                            {rowSavingId === r._id ? "Saving..." : "Save"}
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
      </main>
    </div>
  );
};

export default AdminScholarshipPage;
