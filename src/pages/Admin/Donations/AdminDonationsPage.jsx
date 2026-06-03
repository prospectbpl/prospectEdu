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

const AdminDonationsPage = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidthPx = isCollapsed ? 80 : 256;

  const canonicalUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname =
      typeof window !== "undefined" ? window.location.pathname : "";
    return origin && pathname ? `${origin}${pathname}` : "";
  }, []);

  const pageTitle = "Donations | ProspectEdu Admin";
  const pageDescription =
    "View donation submissions, Razorpay transaction references, and donation totals in ProspectEdu Admin.";

  const accessToken = sessionStorage.getItem("accessToken");
  const authHeaders = useMemo(
    () => ({ headers: { Authorization: `Bearer ${accessToken}` } }),
    [accessToken]
  );

  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState([]);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const res = await api.get("/donations/admin", authHeaders);
      setDonations(res.data?.data || []);
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to load donations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
    // eslint-disable-next-line
  }, []);

  const totalAmount = useMemo(
    () => donations.reduce((sum, d) => sum + Number(d.amount || 0), 0),
    [donations]
  );

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

      <h1 className="sr-only">Donations</h1>

      <div
        className={`${isCollapsed ? "w-20" : "w-64"} fixed top-0 left-0 h-full z-40 transition-all duration-300`}
      >
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      <main
        className="flex flex-col flex-1 h-screen transition-all duration-300"
        style={{ marginLeft: sidebarWidthPx, width: `calc(100vw - ${sidebarWidthPx}px)` }}
        aria-label="Donations admin page"
      >
        <div
          className="fixed top-0 bg-white shadow-sm h-[64px] z-[999]"
          style={{ left: sidebarWidthPx, right: 0 }}
        >
          <AdminTopbar pageTitle="Donations" />
        </div>

        <div className="px-6 pt-[90px] pb-10 overflow-y-auto text-left">
           <div className="ml=-3"> 
           <Breadcrumb
        items={[
          { label: "Dashboard", to: "/admin-dashboard" },
          { label: "Donations" },
        ]}
      />
        </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl border p-5 shadow-sm">
              <div className="text-xs text-gray-500">Total Donations</div>
              <div className="text-2xl font-bold text-[#124734]">{donations.length}</div>
            </div>
            <div className="bg-white rounded-2xl border p-5 shadow-sm">
              <div className="text-xs text-gray-500">Total Amount</div>
              <div className="text-2xl font-bold text-[#124734]">₹{totalAmount}</div>
            </div>
            <div className="bg-white rounded-2xl border p-5 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500">Refresh</div>
                <div className="text-sm text-gray-700">Get latest list</div>
              </div>
              <button
                onClick={fetchDonations}
                className="px-4 py-2 rounded-xl bg-[#124734] text-white font-semibold hover:bg-[#0B2F23]"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-5 border-b">
              <h3 className="text-lg font-semibold text-[#124734]">Donation List</h3>
              <p className="text-sm text-gray-600">All submissions from Donate page (latest first).</p>
            </div>

            {loading ? (
              <div className="p-6 text-gray-600" aria-live="polite">Loading…</div>
            ) : donations.length === 0 ? (
              <div className="p-6 text-gray-600" aria-live="polite">No donations yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="text-left px-4 py-3">Donor</th>
                      <th className="text-left px-4 py-3">Contact</th>
                      <th className="text-left px-4 py-3">Amount</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-left px-4 py-3">Razorpay</th>
                      <th className="text-left px-4 py-3">Date</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {donations.map((d) => (
                      <tr key={d._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">
                            {d.firstName} {d.lastName}
                          </div>
                          <div className="text-xs text-gray-500">PAN: {d.pan || "-"}</div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="text-gray-900">{d.email}</div>
                          <div className="text-gray-600">{d.mobile}</div>
                        </td>

                        <td className="px-4 py-3 font-bold text-[#124734]">₹{d.amount}</td>

                        <td className="px-4 py-3">
                          <span
                            className={`text-xs px-2 py-1 rounded-full border ${
                              d.status === "CONFIRMED"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : d.status === "CREATED"
                                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-xs text-gray-700">
                          <div className="font-mono break-all">Order: {d.razorpayOrderId || "-"}</div>
                          <div className="font-mono break-all">Pay: {d.razorpayPaymentId || "-"}</div>
                        </td>

                        <td className="px-4 py-3 text-gray-600">{fmt(d.createdAt)}</td>
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

export default AdminDonationsPage;
