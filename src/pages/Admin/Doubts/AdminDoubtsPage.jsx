import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import AdminSidebar from "../../../components/Admin/Layout/AdminSidebar";
import AdminTopbar from "../../../components/Admin/Layout/AdminTopbar";
import Breadcrumb from "../../../components/Breadcrumb";
import { api } from "../../../lib/api";

const fmt = (iso) => {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const statusBadge = (s) => {
  const base = "px-3 py-1 rounded-full text-xs font-semibold";
  if (s === "PENDING") return `${base} bg-yellow-100 text-yellow-700`;
  if (s === "IN_PROGRESS") return `${base} bg-blue-100 text-blue-700`;
  if (s === "RESOLVED") return `${base} bg-green-100 text-green-700`;
  return `${base} bg-gray-200 text-gray-700`;
};

export default function AdminDoubtsPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidthPx = isCollapsed ? 80 : 256;

  const canonicalUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname =
      typeof window !== "undefined" ? window.location.pathname : "";
    return origin && pathname ? `${origin}${pathname}` : "";
  }, []);

  const pageTitle = "Doubts | ProspectEdu Admin";
  const pageDescription =
    "View Ask Doubt submissions, change doubt status, and send answers to users via email in ProspectEdu Admin.";

  const accessToken =
    sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");
  const authHeaders = useMemo(
    () => ({ headers: { Authorization: `Bearer ${accessToken}` } }),
    [accessToken]
  );

  const [loading, setLoading] = useState(true);
  const [doubts, setDoubts] = useState([]);

  const [filterStatus, setFilterStatus] = useState("ALL");
  const [q, setQ] = useState("");

  const [openId, setOpenId] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [sending, setSending] = useState(false);

  const fetchDoubts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/doubts/admin", {
        ...authHeaders,
        params: { status: filterStatus, q },
      });
      setDoubts(res.data?.data || []);
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to load doubts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoubts();
    // eslint-disable-next-line
  }, [filterStatus]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/doubts/admin/${id}/status`, { status }, authHeaders);
      setDoubts((prev) => prev.map((d) => (d._id === id ? { ...d, status } : d)));
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to update status");
    }
  };

  const openAnswer = (d) => {
    setOpenId(d._id);
    setAnswerText(d.adminAnswer || "");
  };

  const sendAnswer = async () => {
    if (!openId) return;
    if (!answerText.trim()) return alert("Please write an answer.");

    setSending(true);
    try {
      const res = await api.post(
        `/doubts/admin/${openId}/answer`,
        { answer: answerText },
        authHeaders
      );
      const updated = res.data?.data;

      setDoubts((prev) => prev.map((d) => (d._id === openId ? updated : d)));
      alert("✅ Answer sent to user email!");
      setOpenId(null);
      setAnswerText("");
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to send email");
    } finally {
      setSending(false);
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

      <h1 className="sr-only">Doubts</h1>

      <div
        className={`${isCollapsed ? "w-20" : "w-64"} fixed top-0 left-0 h-full z-40 transition-all duration-300`}
      >
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      <main
        className="flex flex-col flex-1 h-screen transition-all duration-300"
        style={{ marginLeft: sidebarWidthPx, width: `calc(100vw - ${sidebarWidthPx}px)` }}
        aria-label="Doubts admin page"
      >
        <div className="fixed top-0 bg-white shadow-sm h-[64px] z-[999]" style={{ left: sidebarWidthPx, right: 0 }}>
          <AdminTopbar pageTitle="Doubts" />
        </div>

        <div className="px-6 pt-[90px] pb-10 overflow-y-auto text-left">
           <div className="ml=-3"> 
           <Breadcrumb
        items={[
          { label: "Dashboard", to: "/admin-dashboard" },
          { label: "Doubts" },
        ]}
      />
        </div>
          {/* FILTER BAR */}
          <div className="bg-white rounded-2xl border shadow-sm p-5 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#124734]">Ask Doubt Submissions</h2>
                <p className="text-sm text-gray-600">Change status and reply via email to the user.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border rounded-xl px-4 py-2"
                >
                  <option value="ALL">All</option>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>

                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search name/email/phone/type"
                  className="border rounded-xl px-4 py-2 w-full sm:w-[280px]"
                />

                <button
                  onClick={fetchDoubts}
                  className="px-5 py-2 rounded-xl bg-[#124734] text-white font-semibold hover:bg-[#0B2F23]"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#124734]">All Doubts</h3>
              <button
                onClick={fetchDoubts}
                className="px-4 py-2 rounded-xl border hover:bg-gray-50 font-semibold text-sm"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="p-6 text-gray-600" aria-live="polite">Loading…</div>
            ) : doubts.length === 0 ? (
              <div className="p-6 text-gray-600" aria-live="polite">No doubts found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="text-left px-4 py-3">User</th>
                      <th className="text-left px-4 py-3">Type</th>
                      <th className="text-left px-4 py-3">Doubt</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-left px-4 py-3">Created</th>
                      <th className="text-right px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {doubts.map((d) => (
                      <tr key={d._id} className="hover:bg-gray-50 align-top">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{d.name}</div>
                          <div className="text-xs text-gray-600">{d.email}</div>
                          <div className="text-xs text-gray-600">{d.phone}</div>
                        </td>
                        <td className="px-4 py-3">{d.doubtType}</td>
                        <td className="px-4 py-3">
                          <div className="text-gray-800 whitespace-pre-line max-w-[420px]">{d.doubt}</div>
                          {d.imageUrl ? (
                            <a
                              className="text-xs text-[#124734] font-semibold underline"
                              href={d.imageUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View Image
                            </a>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <div className={statusBadge(d.status)}>{d.status}</div>
                          <select
                            className="mt-2 border rounded-lg px-2 py-1 text-xs"
                            value={d.status}
                            onChange={(e) => updateStatus(d._id, e.target.value)}
                            aria-label={`Update status for ${d.name}`}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="IN_PROGRESS">IN_PROGRESS</option>
                            <option value="RESOLVED">RESOLVED</option>
                            <option value="CLOSED">CLOSED</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{fmt(d.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => openAnswer(d)}
                            className="px-4 py-2 rounded-xl bg-[#009846] text-white font-semibold hover:bg-green-700"
                          >
                            Answer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ANSWER MODAL */}
          {openId && (
            <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4" role="dialog" aria-modal="true">
              <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#124734]">Send Answer to Email</h3>
                  <button onClick={() => setOpenId(null)} className="px-3 py-1 rounded-lg border hover:bg-gray-50">
                    ✕
                  </button>
                </div>

                <p className="text-sm text-gray-600 mt-1">
                  Write the response. Clicking Send will email the user and mark status as RESOLVED.
                </p>

                <textarea
                  className="w-full border rounded-xl p-3 mt-4 min-h-[180px]"
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Type your answer here…"
                />

                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={() => setOpenId(null)} className="px-5 py-2 rounded-xl border font-semibold hover:bg-gray-50">
                    Cancel
                  </button>
                  <button
                    disabled={sending}
                    onClick={sendAnswer}
                    className="px-6 py-2 rounded-xl bg-[#124734] text-white font-semibold hover:bg-[#0B2F23] disabled:opacity-60"
                  >
                    {sending ? "Sending..." : "Send Email"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
