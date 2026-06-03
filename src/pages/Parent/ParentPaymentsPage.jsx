import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import ParentSidebar from "../../components/Parent/ParentSidebar";
import ParentTopbar from "../../components/Parent/ParentTopbar";
import { paymentsApi } from "../../services/payments";
import Breadcrumb from "../../components/Breadcrumb";
import { Wallet, CheckCircle, Clock, CreditCard } from "lucide-react";

function fmtMoney(n) {
  return `₹${Number(n || 0)}`;
}
function fmtDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  if (String(dt) === "Invalid Date") return "-";
  return dt.toLocaleDateString();
}

export default function ParentPaymentsPage() {
  const location = useLocation();

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
          name: "Parent Dashboard",
          item:
            typeof window !== "undefined"
              ? `${window.location.origin}/parent`
              : "/parent",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Payments",
          item: canonicalUrl,
        },
      ],
    }),
    [canonicalUrl]
  );

  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 80 : 256;

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ total: 0, paid: 0, pending: 0, nextDue: null });

  async function load() {
    setLoading(true);
    try {
      const res = await paymentsApi.parentGetMine();
      setItems(res.data?.items || []);
      setSummary(res.data?.summary || { total: 0, paid: 0, pending: 0, nextDue: null });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const statusColors = {
    paid: "text-green-700 bg-green-100",
    pending: "text-orange-700 bg-orange-100",
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB]">
      {/* ✅ SEO */}
      <Helmet>
        <title>Parent Payments | ProspectEdu</title>
        <meta
          name="description"
          content="View fee breakdown, payment status and upcoming dues in ProspectEdu parent dashboard."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      {/* SIDEBAR */}
      <div className="fixed top-0 left-0 h-full transition-all duration-300" style={{ width: sidebarWidth }}>
        <ParentSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col" style={{ marginLeft: sidebarWidth }}>
        <ParentTopbar pageTitle="Payments" showStudentSwitcher={false} />
         <Breadcrumb
        items={[
          { label: "Dashboard", to: "/parent-dashboard" },
          { label: "Payments" },
        ]}
      />

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E6F4EC] rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-[#E6F4EC] rounded-xl">
                <Wallet size={28} className="text-[#124734]" />
              </div>
              <div>
                <p className="text-sm text-[#5B7065]">Total Fees</p>
                <p className="text-xl font-semibold text-[#124734]">{fmtMoney(summary.total)}</p>
              </div>
            </div>

            <div className="bg-white border border-[#E6F4EC] rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-[#E6F4EC] rounded-xl">
                <CheckCircle size={28} className="text-[#124734]" />
              </div>
              <div>
                <p className="text-sm text-[#5B7065]">Paid</p>
                <p className="text-xl font-semibold text-[#124734]">{fmtMoney(summary.paid)}</p>
              </div>
            </div>

            <div className="bg-white border border-[#E6F4EC] rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-[#E6F4EC] rounded-xl">
                <Clock size={28} className="text-[#124734]" />
              </div>
              <div>
                <p className="text-sm text-[#5B7065]">Pending</p>
                <p className="text-xl font-semibold text-[#124734]">{fmtMoney(summary.pending)}</p>
              </div>
            </div>

            <div className="bg-white border border-[#E6F4EC] rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-[#E6F4EC] rounded-xl">
                <Clock size={28} className="text-[#124734]" />
              </div>
              <div>
                <p className="text-sm text-[#5B7065]">Next Due</p>
                <p className="text-xl font-semibold text-[#124734]">{fmtDate(summary.nextDue)}</p>
              </div>
            </div>
          </div>

          {/* FEE TABLE */}
          <div className="bg-white border border-[#E6F4EC] rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-lg font-semibold text-[#124734]">Fee Breakdown</h1>
              <button
                onClick={load}
                className="text-sm px-3 py-2 rounded-lg border border-[#E6F4EC] bg-[#F8FFFA] text-[#124734]"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-sm text-[#5B7065]">Loading...</div>
            ) : items.length === 0 ? (
              <div className="text-sm text-[#5B7065]">No fees available right now.</div>
            ) : (
              <>
                {/* DESKTOP */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-center text-[#5B7065]">
                      <tr>
                        <th className="text-left">Particular</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Due Date</th>
                      </tr>
                    </thead>

                    <tbody>
                      {items.map((row) => (
                        <tr key={row._id} className="border-t">
                          <td className="py-3">{row.title}</td>
                          <td className="text-center">{fmtMoney(row.amount)}</td>
                          <td className="text-center">
                            <span className={`px-2 py-[2px] rounded-md text-xs ${statusColors[row.status]}`}>
                              {row.status === "paid" ? "Paid" : "Pending"}
                            </span>
                          </td>
                          <td className="text-center">{fmtDate(row.dueDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE */}
                <div className="md:hidden space-y-4">
                  {items.map((row) => (
                    <div
                      key={row._id}
                      className="border border-[#E6F4EC] rounded-lg p-4 text-sm bg-[#F9FAFB]"
                    >
                      <p className="font-semibold text-[#124734] mb-2">{row.title}</p>

                      <div className="flex justify-between py-1">
                        <span className="text-[#5B7065]">Amount:</span>
                        <span>{fmtMoney(row.amount)}</span>
                      </div>

                      <div className="flex justify-between py-1">
                        <span className="text-[#5B7065]">Status:</span>
                        <span className={`px-2 py-[2px] rounded-md text-xs ${statusColors[row.status]}`}>
                          {row.status === "paid" ? "Paid" : "Pending"}
                        </span>
                      </div>

                      <div className="flex justify-between py-1">
                        <span className="text-[#5B7065]">Due Date:</span>
                        <span>{fmtDate(row.dueDate)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* PAYMENT STATUS */}
          <div className="bg-white border border-[#E6F4EC] rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <CreditCard className="text-[#009846]" />
              <h2 className="text-lg font-semibold text-[#124734]">Payment Status</h2>
            </div>

            <div className="bg-[#F8FFFA] p-4 rounded-lg border border-[#E6F4EC]">
              <p className="text-sm text-[#5B7065]">Next Fee Due</p>
              <p className="text-lg font-semibold text-[#124734] mt-1">{fmtDate(summary.nextDue)}</p>
              <p className="text-xs text-[#5B7065] mt-1">Updated by teacher</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
