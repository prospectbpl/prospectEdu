import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Search, RefreshCcw, ChevronLeft, ChevronRight } from "lucide-react";

import AdminSidebar from "../../components/Admin/Layout/AdminSidebar";
import AdminTopbar from "../../components/Admin/Layout/AdminTopbar";
import Breadcrumb from "../../components/Breadcrumb";
import { adminPurchasesApi } from "../../services/adminPurchases";

function pill(status) {
  const base =
    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border";
  if (status === "paid")
    return `${base} bg-[#E8F3FF] text-[#0B4F9E] border-[#CFE6FF]`;
  if (status === "pending")
    return `${base} bg-[#FFF7ED] text-[#7C2D12] border-[#FED7AA]`;
  if (status === "failed")
    return `${base} bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]`;
  if (status === "refunded")
    return `${base} bg-[#F3E8FF] text-[#5B21B6] border-[#E9D5FF]`;
  return `${base} bg-gray-50 text-gray-700 border-gray-200`;
}

function fmtINR(n) {
  const num = Number(n || 0);
  return `₹${num.toLocaleString("en-IN")}`;
}

function safe(v, fallback = "—") {
  const s = String(v ?? "").trim();
  return s ? s : fallback;
}

export default function PurchaseList() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // data
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState(null);
  const [total, setTotal] = useState(0);

  // ui state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [provider, setProvider] = useState("all");
  const [sort, setSort] = useState("createdAt_desc");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const limit = 15;

  const sidebarWidth = isCollapsed ? 80 : 256;

  const canonicalUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname =
      typeof window !== "undefined" ? window.location.pathname : "";
    return origin && pathname ? `${origin}${pathname}` : "";
  }, []);

  const pageTitle = "Course Purchases | ProspectEdu Admin";
  const pageDescription =
    "View and manage course purchases, revenue, payment statuses, and provider details in ProspectEdu Admin.";

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(Number(total || 0) / limit));
  }, [total]);

  const fetchData = async (opts = {}) => {
    try {
      setLoading(true);
      setError("");

      const params = {
        q: opts.q ?? q,
        status: opts.status ?? status,
        provider: opts.provider ?? provider,
        sort: opts.sort ?? sort,
        from: opts.from ?? from,
        to: opts.to ?? to,
        page: opts.page ?? page,
        limit,
      };

      const res = await adminPurchasesApi.list(params);

      setRows(res.data.purchases || []);
      setTotal(res.data.total || 0);
      setStats(res.data.stats || null);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load purchases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, provider, sort]);

  const onSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData({ page: 1, q });
  };

  const onReset = () => {
    setQ("");
    setStatus("all");
    setProvider("all");
    setSort("createdAt_desc");
    setFrom("");
    setTo("");
    setPage(1);
    fetchData({
      q: "",
      status: "all",
      provider: "all",
      sort: "createdAt_desc",
      from: "",
      to: "",
      page: 1,
    });
  };

  const onApplyDate = () => {
    setPage(1);
    fetchData({ page: 1, from, to });
  };

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] overflow-hidden">
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

      {/* Hidden H1 for SEO (no layout change) */}
      <h1 className="sr-only">Course Purchases</h1>

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-screen bg-[#124734] transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <AdminSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      </div>

      {/* MAIN */}
      <main
        className="flex-1 flex flex-col"
        style={{ marginLeft: sidebarWidth }}
        aria-label="Course purchases admin page"
      >
        {/* TOPBAR */}
        <div
          className="fixed top-0 bg-white shadow-sm z-[999] h-[64px]"
          style={{ left: sidebarWidth, right: 0 }}
        >
          <AdminTopbar isCollapsed={isCollapsed} pageTitle="Course Purchases" />
        </div>
        

        {/* CONTENT */}
        <div className="px-6 py-8 mt-[64px]">
          <div className="ml=-3"> 
           <Breadcrumb
        items={[
          { label: "Dashboard", to: "/admin-dashboard" },
          { label: "Course Purchases" },
        ]}
      />
        </div>
          
          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-[#A7E1B2]/50 p-5 shadow-sm">
              <p className="text-[#5B7065] text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-[#124734] mt-1">
                {fmtINR(stats?.totalRevenue || 0)}
              </p>
              <p className="text-xs text-[#5B7065] mt-1">Only paid purchases</p>
            </div>

            <div className="bg-white rounded-xl border border-[#A7E1B2]/50 p-5 shadow-sm">
              <p className="text-[#5B7065] text-sm">Paid</p>
              <p className="text-2xl font-bold text-[#124734] mt-1">
                {stats?.paidCount ?? "—"}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-[#A7E1B2]/50 p-5 shadow-sm">
              <p className="text-[#5B7065] text-sm">Pending</p>
              <p className="text-2xl font-bold text-[#124734] mt-1">
                {stats?.pendingCount ?? "—"}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-[#A7E1B2]/50 p-5 shadow-sm">
              <p className="text-[#5B7065] text-sm">Failed</p>
              <p className="text-2xl font-bold text-[#124734] mt-1">
                {stats?.failedCount ?? "—"}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-[#A7E1B2]/50 p-5 shadow-sm">
              <p className="text-[#5B7065] text-sm">Refunded</p>
              <p className="text-2xl font-bold text-[#124734] mt-1">
                {stats?.refundedCount ?? "—"}
              </p>
            </div>
          </div>

          {/* FILTER BAR */}
          <div className="bg-white rounded-xl border border-[#A7E1B2]/50 shadow-sm p-4 mb-4">
            <div className="flex flex-col lg:flex-row lg:items-end gap-3">
              {/* search */}
              <form onSubmit={onSearch} className="flex-1">
                <label className="text-sm text-[#5B7065]">Search</label>
                <div className="mt-1 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#5B7065] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Student name/email/phone, course, purchaseId, orderId..."
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#A7E1B2]/70 focus:outline-none focus:ring-2 focus:ring-[#A7E1B2]"
                      aria-label="Search purchases"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#124734] text-white font-semibold hover:bg-[#0f3a29] transition"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* status */}
              <div className="min-w-[180px]">
                <label className="text-sm text-[#5B7065]">Status</label>
                <select
                  value={status}
                  onChange={(e) => {
                    setPage(1);
                    setStatus(e.target.value);
                  }}
                  className="mt-1 w-full py-2 px-3 rounded-lg border border-[#A7E1B2]/70 focus:outline-none focus:ring-2 focus:ring-[#A7E1B2]"
                  aria-label="Filter by status"
                >
                  <option value="all">All</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              {/* provider */}
              <div className="min-w-[180px]">
                <label className="text-sm text-[#5B7065]">Provider</label>
                <select
                  value={provider}
                  onChange={(e) => {
                    setPage(1);
                    setProvider(e.target.value);
                  }}
                  className="mt-1 w-full py-2 px-3 rounded-lg border border-[#A7E1B2]/70 focus:outline-none focus:ring-2 focus:ring-[#A7E1B2]"
                  aria-label="Filter by payment provider"
                >
                  <option value="all">All</option>
                  <option value="razorpay">Razorpay</option>
                  <option value="manual">Manual</option>
                  <option value="stripe">Stripe</option>
                </select>
              </div>

              {/* sort */}
              <div className="min-w-[200px]">
                <label className="text-sm text-[#5B7065]">Sort</label>
                <select
                  value={sort}
                  onChange={(e) => {
                    setPage(1);
                    setSort(e.target.value);
                  }}
                  className="mt-1 w-full py-2 px-3 rounded-lg border border-[#A7E1B2]/70 focus:outline-none focus:ring-2 focus:ring-[#A7E1B2]"
                  aria-label="Sort purchases"
                >
                  <option value="createdAt_desc">Newest first</option>
                  <option value="createdAt_asc">Oldest first</option>
                  <option value="amount_desc">Amount: high to low</option>
                  <option value="amount_asc">Amount: low to high</option>
                </select>
              </div>

              {/* date range */}
              <div className="min-w-[260px]">
                <label className="text-sm text-[#5B7065]">Date range</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="w-full py-2 px-3 rounded-lg border border-[#A7E1B2]/70 focus:outline-none focus:ring-2 focus:ring-[#A7E1B2]"
                    aria-label="From date"
                  />
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full py-2 px-3 rounded-lg border border-[#A7E1B2]/70 focus:outline-none focus:ring-2 focus:ring-[#A7E1B2]"
                    aria-label="To date"
                  />
                  <button
                    type="button"
                    onClick={onApplyDate}
                    className="px-3 py-2 rounded-lg border border-[#A7E1B2] text-[#124734] font-semibold hover:bg-[#F1FFF6] transition"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* reset */}
              <button
                type="button"
                onClick={onReset}
                className="h-[42px] px-4 rounded-lg border border-[#A7E1B2] text-[#124734] font-semibold hover:bg-[#F1FFF6] transition flex items-center gap-2"
                title="Reset"
              >
                <RefreshCcw className="w-4 h-4" />
                Reset
              </button>
            </div>

            {error ? <div className="mt-3 text-sm text-red-600">{error}</div> : null}
          </div>

          {/* TABLE */}
          <div className="bg-white shadow-lg rounded-xl border border-[#A7E1B2]/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#E6F4EC] text-[#124734] text-sm">
                    <th className="px-4 py-3 text-left whitespace-nowrap">Purchase ID</th>
                    <th className="px-4 py-3 text-left whitespace-nowrap">Student</th>
                    <th className="px-4 py-3 text-left whitespace-nowrap">Course</th>
                    <th className="px-4 py-3 text-left whitespace-nowrap">Amount</th>
                    <th className="px-4 py-3 text-left whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 text-left whitespace-nowrap">Provider</th>
                    <th className="px-4 py-3 text-left whitespace-nowrap">Order ID</th>
                    <th className="px-4 py-3 text-left whitespace-nowrap">Payment ID</th>
                    <th className="px-4 py-3 text-left whitespace-nowrap">Paid At</th>
                    <th className="px-4 py-3 text-left whitespace-nowrap">Created</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-4 py-8 text-center text-sm text-[#5B7065]"
                        aria-live="polite"
                      >
                        Loading purchases...
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-4 py-10 text-center text-sm text-[#5B7065]"
                        aria-live="polite"
                      >
                        No purchases found
                      </td>
                    </tr>
                  ) : (
                    rows.map((x) => {
                      const student = x.userId || {};
                      const course = x.courseId || {};
                      return (
                        <tr
                          key={x._id}
                          className="border-t border-[#E6F4EC] hover:bg-[#F1FFF6] transition"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-[#124734]">
                            {String(x._id).slice(-10)}
                          </td>

                          <td className="px-4 py-3 text-sm">
                            <div className="font-medium text-gray-900">
                              {safe(student.fullName)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {safe(student.email)} · {safe(student.phone)}
                            </div>
                            {student.isActive === false ? (
                              <div className="text-xs text-red-600 mt-0.5">
                                Blocked/Inactive
                              </div>
                            ) : null}
                          </td>

                          <td className="px-4 py-3 text-sm">
                            <div className="font-medium text-gray-900">
                              {safe(course.title)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {safe(course.category, "")}
                            </div>
                          </td>

                          <td className="px-4 py-3 text-sm">
                            <div className="font-semibold text-[#124734]">
                              {fmtINR(x.amount)}{" "}
                              <span className="text-xs text-gray-500">
                                {safe(x.currency, "INR")}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-sm">
                            <span className={pill(x.status)}>{safe(x.status)}</span>
                          </td>

                          <td className="px-4 py-3 text-sm">{safe(x.provider)}</td>

                          <td className="px-4 py-3 text-xs text-gray-700">
                            {safe(x.providerOrderId)}
                          </td>

                          <td className="px-4 py-3 text-xs text-gray-700">
                            {safe(x.providerPaymentId)}
                          </td>

                          <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                            {x.paidAt ? new Date(x.paidAt).toLocaleString() : "—"}
                          </td>

                          <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                            {x.createdAt ? new Date(x.createdAt).toLocaleString() : "—"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* FOOTER / PAGINATION */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-[#E6F4EC] bg-white">
              <div className="text-sm text-[#5B7065]">
                Showing{" "}
                <span className="font-medium text-[#124734]">
                  {rows.length ? (page - 1) * limit + 1 : 0}
                </span>
                {" - "}
                <span className="font-medium text-[#124734]">
                  {(page - 1) * limit + rows.length}
                </span>{" "}
                of <span className="font-medium text-[#124734]">{total}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((v) => Math.max(1, v - 1))}
                  disabled={page <= 1 || loading}
                  className="px-3 py-2 rounded-lg border border-[#A7E1B2] text-[#124734] hover:bg-[#F1FFF6] disabled:opacity-50 transition flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </button>

                <div className="text-sm text-[#124734] font-semibold">
                  Page {page} / {totalPages}
                </div>

                <button
                  onClick={() => setPage((v) => Math.min(totalPages, v + 1))}
                  disabled={page >= totalPages || loading}
                  className="px-3 py-2 rounded-lg border border-[#A7E1B2] text-[#124734] hover:bg-[#F1FFF6] disabled:opacity-50 transition flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <p className="text-xs text-[#5B7065] mt-3">
            Tip: Search supports Student name/email/phone, Course title, PurchaseId,
            Razorpay Order/Payment Id.
          </p>
        </div>
      </main>
    </div>
  );
}
