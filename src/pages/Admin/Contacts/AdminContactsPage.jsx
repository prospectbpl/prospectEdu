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

const badge = (s) => {
  const b = "px-3 py-1 rounded-full text-xs font-semibold";
  if (s === "PENDING") return `${b} bg-yellow-100 text-yellow-700`;
  if (s === "IN_PROGRESS") return `${b} bg-blue-100 text-blue-700`;
  if (s === "RESOLVED") return `${b} bg-green-100 text-green-700`;
  return `${b} bg-gray-200 text-gray-700`;
};

export default function AdminContactsPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidthPx = isCollapsed ? 80 : 256;

  const canonicalUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname =
      typeof window !== "undefined" ? window.location.pathname : "";
    return origin && pathname ? `${origin}${pathname}` : "";
  }, []);

  const pageTitle = "Contact Requests | ProspectEdu Admin";
  const pageDescription =
    "View and manage Contact Us submissions, search requests, and update contact request statuses in ProspectEdu Admin.";

  const accessToken =
    sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");
  const authHeaders = useMemo(
    () => ({ headers: { Authorization: `Bearer ${accessToken}` } }),
    [accessToken]
  );

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  const [status, setStatus] = useState("ALL");
  const [q, setQ] = useState("");

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get("/contacts/admin", {
        ...authHeaders,
        params: { status, q },
      });
      setItems(res.data?.data || []);
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to load contact requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line
  }, [status]);

  const updateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/contacts/admin/${id}/status`, { status: newStatus }, authHeaders);
      setItems((prev) =>
        prev.map((x) => (x._id === id ? { ...x, status: newStatus } : x))
      );
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to update status");
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
      <h1 className="sr-only">Contact Requests</h1>

      <div
        className={`${isCollapsed ? "w-20" : "w-64"} fixed top-0 left-0 h-full z-40 transition-all duration-300`}
      >
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      <main
        className="flex flex-col flex-1 h-screen transition-all duration-300"
        style={{ marginLeft: sidebarWidthPx, width: `calc(100vw - ${sidebarWidthPx}px)` }}
        aria-label="Contact requests admin page"
      >
        <div
          className="fixed top-0 bg-white shadow-sm h-[64px] z-[999]"
          style={{ left: sidebarWidthPx, right: 0 }}
        >
          <AdminTopbar pageTitle="Contact Requests" />
        </div>

        <div className="px-6 pt-[90px] pb-10 overflow-y-auto text-left">
           <div className="ml=-3"> 
           <Breadcrumb
        items={[
          { label: "Dashboard", to: "/admin-dashboard" },
          { label: "Contact Requests" },
        ]}
      />
        </div>
          <div className="bg-white rounded-2xl border shadow-sm p-5 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#124734]">
                  Contact Us Submissions
                </h2>
                <p className="text-sm text-gray-600">
                  View all requests and update their status.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
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
                  placeholder="Search name/email/phone/issue"
                  className="border rounded-xl px-4 py-2 w-full sm:w-[280px]"
                />

                <button
                  onClick={fetchItems}
                  className="px-5 py-2 rounded-xl bg-[#124734] text-white font-semibold hover:bg-[#0B2F23]"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#124734]">All Requests</h3>
              <button
                onClick={fetchItems}
                className="px-4 py-2 rounded-xl border hover:bg-gray-50 font-semibold text-sm"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="p-6 text-gray-600" aria-live="polite">Loading…</div>
            ) : items.length === 0 ? (
              <div className="p-6 text-gray-600" aria-live="polite">No contact requests found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="text-left px-4 py-3">User</th>
                      <th className="text-left px-4 py-3">Issue</th>
                      <th className="text-left px-4 py-3">Message</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-left px-4 py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map((x) => (
                      <tr key={x._id} className="hover:bg-gray-50 align-top">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{x.name}</div>
                          <div className="text-xs text-gray-600">{x.email}</div>
                          <div className="text-xs text-gray-600">{x.phone}</div>
                        </td>
                        <td className="px-4 py-3">{x.issue}</td>
                        <td className="px-4 py-3">
                          <div className="text-gray-800 whitespace-pre-line max-w-[520px]">
                            {x.message}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={badge(x.status)}>{x.status}</div>
                          <select
                            className="mt-2 border rounded-lg px-2 py-1 text-xs"
                            value={x.status}
                            onChange={(e) => updateStatus(x._id, e.target.value)}
                            aria-label={`Update status for ${x.name}`}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="IN_PROGRESS">IN_PROGRESS</option>
                            <option value="RESOLVED">RESOLVED</option>
                            <option value="CLOSED">CLOSED</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{fmt(x.createdAt)}</td>
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
}
