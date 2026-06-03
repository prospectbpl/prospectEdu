import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { Search, Plus, CheckCircle2, Clock, Trash2 } from "lucide-react";
import Breadcrumb from "../../components/Breadcrumb";
import TeacherSidebar from "../../components/Teacher/TeacherSidebar";
import TeacherTopbar from "../../components/Teacher/TeacherTopbar";
import { paymentsApi } from "../../services/payments";

function badge(status) {
  return status === "paid"
    ? "bg-[#E6F4EC] text-[#124734] border border-[#CDEAD9]"
    : "bg-[#FFF4E6] text-[#8A4B00] border border-[#FFE2BF]";
}

function formatDateInput(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (String(dt) === "Invalid Date") return "";
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function TeacherPaymentsPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 80 : 256;

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
          name: "Payments",
          item: canonicalUrl,
        },
      ],
    }),
    [canonicalUrl]
  );

  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [activeParentId, setActiveParentId] = useState(null);

  // add fee form
  const [feeTitle, setFeeTitle] = useState("");
  const [feeAmount, setFeeAmount] = useState("");
  const [feeDueDate, setFeeDueDate] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await paymentsApi.teacherListParents(q);
      setRows(res.data?.parents || []);
      if (!activeParentId && (res.data?.parents || []).length) {
        setActiveParentId(res.data.parents[0].parent._id);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = useMemo(() => {
    return rows.find((r) => r.parent._id === activeParentId) || null;
  }, [rows, activeParentId]);

  async function addFee() {
    if (!activeParentId) return;
    const payload = {
      title: feeTitle,
      amount: Number(feeAmount || 0),
      dueDate: feeDueDate,
    };
    const res = await paymentsApi.teacherAddItem(activeParentId, payload);

    setRows((prev) =>
      prev.map((r) =>
        r.parent._id === activeParentId
          ? { ...r, items: res.data.items, summary: res.data.summary, lastUpdatedAt: new Date() }
          : r
      )
    );

    setFeeTitle("");
    setFeeAmount("");
    setFeeDueDate("");
  }

  async function togglePaid(itemId, nextStatus) {
    if (!activeParentId) return;
    const res = await paymentsApi.teacherUpdateItem(activeParentId, itemId, { status: nextStatus });

    setRows((prev) =>
      prev.map((r) =>
        r.parent._id === activeParentId ? { ...r, items: res.data.items, summary: res.data.summary } : r
      )
    );
  }

  async function removeItem(itemId) {
    if (!activeParentId) return;
    const res = await paymentsApi.teacherRemoveItem(activeParentId, itemId);

    setRows((prev) =>
      prev.map((r) =>
        r.parent._id === activeParentId ? { ...r, items: res.data.items, summary: res.data.summary } : r
      )
    );
  }

  return (
    <div className="flex h-screen bg-[#F9FAFB]">
      {/* ✅ SEO (NO layout impact) */}
      <Helmet>
        <title>Payments | Teacher Dashboard | ProspectEdu</title>
        <meta
          name="description"
          content="Manage parent fee items, due dates, and payment status in the ProspectEdu teacher dashboard."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      {/* SIDEBAR */}
      <div className="fixed top-0 left-0 h-full transition-all duration-300" style={{ width: sidebarWidth }}>
        <TeacherSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col" style={{ marginLeft: sidebarWidth }}>
        <TeacherTopbar pageTitle="Payments" />
          <Breadcrumb
        items={[
          { label: "Dashboard", to: "/teacher-dashboard" },
          { label: "Payments" },
        ]}
      />

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-y-auto">
         
          {/* LEFT: Parents list */}

          <div className="lg:col-span-4 bg-white border border-[#E6F4EC] rounded-xl shadow-sm">
            <div className="p-4 border-b border-[#E6F4EC]">
              <div className="flex items-center gap-2 bg-[#F8FFFA] border border-[#E6F4EC] rounded-lg px-3 py-2">
                <Search size={16} className="text-[#5B7065]" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search parent (name/email/phone)"
                  className="w-full bg-transparent outline-none text-sm"
                />
                <button onClick={load} className="text-sm px-3 py-1 rounded-md bg-[#124734] text-white">
                  Search
                </button>
              </div>
            </div>

            <div className="p-2 max-h-[calc(100vh-220px)] overflow-y-auto">
              {loading ? (
                <div className="p-4 text-sm text-[#5B7065]">Loading...</div>
              ) : rows.length === 0 ? (
                <div className="p-4 text-sm text-[#5B7065]">No parents found.</div>
              ) : (
                rows.map((r) => (
                  <button
                    key={r.parent._id}
                    onClick={() => setActiveParentId(r.parent._id)}
                    className={`w-full text-left p-3 rounded-lg border mb-2 transition ${
                      r.parent._id === activeParentId
                        ? "border-[#009846] bg-[#F8FFFA]"
                        : "border-[#E6F4EC] hover:bg-[#F9FAFB]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-[#124734]">{r.parent.fullName}</p>
                        <p className="text-xs text-[#5B7065]">{r.parent.email}</p>
                        <p className="text-xs text-[#5B7065]">{r.parent.phone || "-"}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-[#5B7065]">Pending</p>
                        <p className="font-semibold text-[#124734]">₹{r.summary?.pending || 0}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* RIGHT: Manage fees */}
          <div className="lg:col-span-8 space-y-5">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-[#E6F4EC] rounded-xl p-5 shadow-sm">
                <p className="text-sm text-[#5B7065]">Total Fees</p>
                <p className="text-2xl font-semibold text-[#124734]">₹{active?.summary?.total || 0}</p>
              </div>
              <div className="bg-white border border-[#E6F4EC] rounded-xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#5B7065]">Paid</p>
                  <p className="text-2xl font-semibold text-[#124734]">₹{active?.summary?.paid || 0}</p>
                </div>
                <CheckCircle2 className="text-[#009846]" />
              </div>
              <div className="bg-white border border-[#E6F4EC] rounded-xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#5B7065]">Pending</p>
                  <p className="text-2xl font-semibold text-[#124734]">₹{active?.summary?.pending || 0}</p>
                </div>
                <Clock className="text-[#8A4B00]" />
              </div>
            </div>

            {/* Add fee */}
            <div className="bg-white border border-[#E6F4EC] rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-lg font-semibold text-[#124734]">
                  Manage Fees {active?.parent?.fullName ? `— ${active.parent.fullName}` : ""}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-5">
                  <label className="text-xs text-[#5B7065]">Fee Name</label>
                  <input
                    value={feeTitle}
                    onChange={(e) => setFeeTitle(e.target.value)}
                    placeholder="e.g. Tuition Fee"
                    className="w-full mt-1 border border-[#E6F4EC] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#009846]"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="text-xs text-[#5B7065]">Amount Due</label>
                  <input
                    value={feeAmount}
                    onChange={(e) => setFeeAmount(e.target.value)}
                    placeholder="e.g. 2500"
                    className="w-full mt-1 border border-[#E6F4EC] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#009846]"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="text-xs text-[#5B7065]">Due Date</label>
                  <input
                    type="date"
                    value={feeDueDate}
                    onChange={(e) => setFeeDueDate(e.target.value)}
                    className="w-full mt-1 border border-[#E6F4EC] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#009846]"
                  />
                </div>
                <div className="md:col-span-1">
                  <button
                    onClick={addFee}
                    disabled={!activeParentId}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#124734] text-white text-sm disabled:opacity-50"
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>
              </div>
            </div>

            {/* Fee table */}
            <div className="bg-white border border-[#E6F4EC] rounded-xl p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-[#124734] mb-4">Fee Breakdown</h3>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-center text-[#5B7065]">
                    <tr>
                      <th className="py-2">Fee</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Due Date</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {(active?.items || []).length === 0 ? (
                      <tr>
                        <td className="py-4 text-[#5B7065]" colSpan={5}>
                          No fees added yet.
                        </td>
                      </tr>
                    ) : (
                      (active?.items || []).map((it) => (
                        <tr key={it._id} className="border-t">
                          <td className="py-3 font-medium text-[#124734]">{it.title}</td>
                          <td>₹{it.amount}</td>
                          <td>
                            <span className={`px-2 py-[2px] rounded-md text-xs ${badge(it.status)}`}>
                              {it.status === "paid" ? "Paid" : "Pending"}
                            </span>
                          </td>
                          <td>{formatDateInput(it.dueDate)}</td>
                          <td className="text-right">
                            {it.status !== "paid" ? (
                              <button
                                onClick={() => togglePaid(it._id, "paid")}
                                className="px-3 py-1 rounded-md bg-[#E6F4EC] text-[#124734] border border-[#CDEAD9] hover:opacity-90 text-xs"
                              >
                                Mark Paid
                              </button>
                            ) : (
                              <button
                                onClick={() => togglePaid(it._id, "pending")}
                                className="px-3 py-1 rounded-md bg-[#FFF4E6] text-[#8A4B00] border border-[#FFE2BF] hover:opacity-90 text-xs"
                              >
                                Set Pending
                              </button>
                            )}

                            <button
                              onClick={() => removeItem(it._id)}
                              className="ml-2 inline-flex items-center gap-1 px-3 py-1 rounded-md border border-[#F3D0D0] bg-[#FFF5F5] text-[#9B1C1C] hover:opacity-90 text-xs"
                              title="Remove fee"
                            >
                              <Trash2 size={14} /> Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {(active?.items || []).map((it) => (
                  <div key={it._id} className="border border-[#E6F4EC] rounded-lg p-4 bg-[#F9FAFB]">
                    <p className="font-semibold text-[#124734]">{it.title}</p>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-[#5B7065]">Amount</span>
                      <span>₹{it.amount}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-[#5B7065]">Due</span>
                      <span>{formatDateInput(it.dueDate)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className={`px-2 py-[2px] rounded-md text-xs ${badge(it.status)}`}>
                        {it.status === "paid" ? "Paid" : "Pending"}
                      </span>

                      {it.status !== "paid" ? (
                        <button
                          onClick={() => togglePaid(it._id, "paid")}
                          className="text-xs px-3 py-1 rounded-md bg-[#E6F4EC] text-[#124734] border border-[#CDEAD9]"
                        >
                          Mark Paid
                        </button>
                      ) : (
                        <button
                          onClick={() => togglePaid(it._id, "pending")}
                          className="text-xs px-3 py-1 rounded-md bg-[#FFF4E6] text-[#8A4B00] border border-[#FFE2BF]"
                        >
                          Set Pending
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* end right */}
        </div>
      </div>
    </div>
  );
}
