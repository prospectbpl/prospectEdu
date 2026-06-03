import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import AdminSidebar from "../../../components/Admin/Layout/AdminSidebar";
import AdminTopbar from "../../../components/Admin/Layout/AdminTopbar";
import Breadcrumb from "../../../components/Breadcrumb";
import { api } from "../../../lib/api";
import {
  Search,
  CheckCircle2,
  XCircle,
  Ban,
  RotateCcw,
  Store,
  User,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

const Badge = ({ text, kind }) => {
  const base = "px-3 py-1 rounded-full text-xs font-semibold border";
  const map = {
    pending: "bg-yellow-50 text-yellow-800 border-yellow-200",
    approved: "bg-green-50 text-green-800 border-green-200",
    rejected: "bg-red-50 text-red-800 border-red-200",
  };
  return (
    <span className={`${base} ${map[kind] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
      {text}
    </span>
  );
};

const Field = ({ icon: Icon, label, value }) => (
  <div className="flex gap-3">
    <div className="w-9 h-9 rounded-lg bg-[#ECF5EE] flex items-center justify-center text-[#124734]">
      <Icon size={18} />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-800 break-words">{value || "-"}</p>
    </div>
  </div>
);

export default function SupplierApprovalPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 80 : 256;

  const [tab, setTab] = useState("pending"); // pending | approved | rejected
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);

  const canonicalUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    return origin && pathname ? `${origin}${pathname}` : "";
  }, []);

  const pageTitle = "Supplier Approval | ProspectEdu Admin";
  const pageDescription =
    "Review supplier applications, approve or reject suppliers, and manage supplier status in ProspectEdu Admin.";

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/suppliers/applications", { params: { status: tab } });
      const data = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
      setItems(data);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((s) => {
      const u = s.userId || {};
      return (
        String(s.shopName || "").toLowerCase().includes(q) ||
        String(s.ownerName || "").toLowerCase().includes(q) ||
        String(u.fullName || "").toLowerCase().includes(q) ||
        String(u.email || "").toLowerCase().includes(q) ||
        String(s.phone || "").toLowerCase().includes(q)
      );
    });
  }, [items, search]);

  const act = async (type, supplierId) => {
    try {
      if (type === "approve") {
        await api.patch(`/suppliers/${supplierId}/approve`);
        alert("Supplier approved ✅");
      }
      if (type === "reject") {
        const note = prompt("Reject note (optional):") || "";
        await api.patch(`/suppliers/${supplierId}/reject`, { reviewNote: note });
        alert("Supplier rejected ❌");
      }
      if (type === "block") {
        const note = prompt("Block reason (optional):") || "Blocked by admin";
        await api.patch(`/suppliers/${supplierId}/block`, { reviewNote: note });
        alert("Supplier blocked 🚫");
      }
      if (type === "unblock") {
        const note = prompt("Unblock note (optional):") || "Unblocked by admin";
        await api.patch(`/suppliers/${supplierId}/unblock`, { reviewNote: note });
        alert("Supplier unblocked ✅");
      }

      setSelected(null);
      load();
    } catch (e) {
      alert(e?.response?.data?.message || "Action failed");
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

      {/* Hidden H1 for SEO (no layout change) */}
      <h1 className="sr-only">Supplier Approval</h1>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full z-40 transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* Main */}
      <main
        className="flex flex-col flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
        aria-label="Supplier approval admin page"
      >
        <div
          className="fixed top-0 bg-white shadow-sm h-[64px] flex items-center z-[999]"
          style={{ left: sidebarWidth, right: 0 }}
        >
          <AdminTopbar pageTitle="Supplier Approval" />
        </div>
        

        <div className="px-6 pt-[90px] pb-10 overflow-y-auto">
           <div className="ml=-3"> 
           <Breadcrumb
        items={[
          { label: "Dashboard", to: "/admin-dashboard" },
          { label: "Supplier Approval" },
        ]}
      />
        </div>
          {/* Header */}
          <section className="bg-white rounded-xl shadow p-5 flex flex-col gap-4" aria-label="Supplier approval header">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-[#124734]">Manage Supplier Applications</h2>
                <p className="text-sm text-gray-600">
                  Approve, reject, or block suppliers. See all details in one place.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-gray-50 border rounded-lg px-3 py-2 w-full md:w-[340px]">
                <Search size={18} className="text-gray-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent outline-none w-full text-sm"
                  placeholder="Search shop / owner / email / phone..."
                  aria-label="Search suppliers"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Supplier application tabs">
              {[
                { key: "pending", label: "Pending Applications" },
                { key: "approved", label: "Approved Suppliers" },
                { key: "rejected", label: "Rejected / Blocked" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border transition
                    ${
                      tab === t.key
                        ? "bg-[#124734] text-white border-[#124734]"
                        : "bg-white text-[#124734] border-[#A7E1B2]/60 hover:bg-[#ECF5EE]"
                    }
                  `}
                  role="tab"
                  aria-selected={tab === t.key}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </section>

          {/* List */}
          <section className="mt-6 bg-white rounded-xl shadow" aria-label="Supplier list">
            <div className="p-4 border-b flex items-center justify-between">
              <p className="text-sm text-gray-600" aria-live="polite">
                {loading ? "Loading..." : `Showing ${filtered.length} suppliers`}
              </p>
              <button onClick={load} className="text-sm font-semibold text-[#124734] underline">
                Refresh
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#ECF5EE] text-left">
                    <th className="p-3">Shop</th>
                    <th className="p-3">Owner</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Categories</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading &&
                    filtered.map((s) => (
                      <tr key={s._id} className="border-t hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-semibold text-[#124734]">{s.shopName}</div>
                          <div className="text-xs text-gray-500">Applied by: {s.userId?.fullName || "-"}</div>
                        </td>
                        <td className="p-3">{s.ownerName}</td>
                        <td className="p-3">
                          <div className="text-gray-800">{s.phone}</div>
                          <div className="text-xs text-gray-500">{s.email}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {(s.categories || []).slice(0, 3).map((c) => (
                              <span key={c} className="px-2 py-1 rounded bg-gray-100 text-xs">
                                {c}
                              </span>
                            ))}
                            {(s.categories || []).length > 3 ? (
                              <span className="px-2 py-1 rounded bg-gray-100 text-xs">
                                +{(s.categories || []).length - 3}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge text={String(s.status || "").toUpperCase()} kind={s.status} />
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setSelected(s)}
                              className="px-3 py-2 rounded-lg border text-[#124734] font-semibold hover:bg-[#ECF5EE]"
                              aria-label={`View supplier ${s.shopName}`}
                            >
                              View
                            </button>

                            {tab === "pending" && (
                              <>
                                <button
                                  onClick={() => act("approve", s._id)}
                                  className="px-3 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 flex items-center gap-2"
                                  aria-label={`Accept supplier ${s.shopName}`}
                                >
                                  <CheckCircle2 size={16} /> Accept
                                </button>
                                <button
                                  onClick={() => act("reject", s._id)}
                                  className="px-3 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 flex items-center gap-2"
                                  aria-label={`Reject supplier ${s.shopName}`}
                                >
                                  <XCircle size={16} /> Reject
                                </button>
                              </>
                            )}

                            {tab === "approved" && (
                              <button
                                onClick={() => act("block", s._id)}
                                className="px-3 py-2 rounded-lg bg-[#111827] text-white font-semibold hover:bg-black flex items-center gap-2"
                                aria-label={`Block supplier ${s.shopName}`}
                              >
                                <Ban size={16} /> Block
                              </button>
                            )}

                            {tab === "rejected" && (
                              <button
                                onClick={() => act("unblock", s._id)}
                                className="px-3 py-2 rounded-lg bg-green-700 text-white font-semibold hover:bg-green-800 flex items-center gap-2"
                                aria-label={`Unblock supplier ${s.shopName}`}
                              >
                                <RotateCcw size={16} /> Unblock
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}

                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        No suppliers found.
                      </td>
                    </tr>
                  )}

                  {loading && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-600">
                        Loading suppliers…
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Details Drawer */}
          {selected && (
            <div
              className="fixed inset-0 bg-black/40 z-[2000] flex justify-end"
              onClick={() => setSelected(null)}
              role="dialog"
              aria-modal="true"
              aria-label="Supplier application details"
            >
              <div
                className="w-full sm:w-[520px] h-full bg-white p-6 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-[#124734]">{selected.shopName}</h3>
                    <p className="text-sm text-gray-600">Supplier Application Details</p>
                    <div className="mt-2">
                      <Badge text={String(selected.status || "").toUpperCase()} kind={selected.status} />
                    </div>
                  </div>
                  <button className="text-sm font-semibold text-[#124734] underline" onClick={() => setSelected(null)}>
                    Close
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4">
                  <Field icon={Store} label="Shop Name" value={selected.shopName} />
                  <Field icon={User} label="Owner Name" value={selected.ownerName} />
                  <Field icon={Phone} label="Phone" value={selected.phone} />
                  <Field icon={Mail} label="Email" value={selected.email} />

                  <div className="bg-gray-50 border rounded-xl p-4">
                    <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <MapPin size={16} className="text-[#124734]" /> Pickup Address
                    </p>
                    <p className="text-sm text-gray-700">
                      {selected.pickupAddress?.addressLine1 || "-"}
                      {selected.pickupAddress?.addressLine2 ? `, ${selected.pickupAddress.addressLine2}` : ""}
                    </p>
                    <p className="text-sm text-gray-700">
                      {selected.pickupAddress?.city || "-"}, {selected.pickupAddress?.state || "-"} -{" "}
                      {selected.pickupAddress?.pincode || "-"}
                    </p>
                    <p className="text-sm text-gray-700">{selected.pickupAddress?.country || "India"}</p>
                  </div>

                  <div className="bg-gray-50 border rounded-xl p-4">
                    <p className="text-sm font-bold text-gray-800 mb-2">Categories</p>
                    <div className="flex flex-wrap gap-2">
                      {(selected.categories || []).map((c) => (
                        <span key={c} className="px-3 py-1 rounded-full bg-white border text-xs font-semibold text-gray-700">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 border rounded-xl p-4">
                    <p className="text-sm font-bold text-gray-800 mb-2">KYC</p>
                    <p className="text-sm text-gray-700">
                      GSTIN: <b>{selected.kyc?.gstin || "-"}</b>
                    </p>
                    <p className="text-sm text-gray-700">
                      PAN: <b>{selected.kyc?.pan || "-"}</b>
                    </p>
                  </div>

                  <div className="bg-gray-50 border rounded-xl p-4">
                    <p className="text-sm font-bold text-gray-800 mb-2">Bank</p>
                    <p className="text-sm text-gray-700">
                      Account Holder: <b>{selected.bank?.accountHolderName || "-"}</b>
                    </p>
                    <p className="text-sm text-gray-700">
                      Account No: <b>{selected.bank?.accountNumber || "-"}</b>
                    </p>
                    <p className="text-sm text-gray-700">
                      IFSC: <b>{selected.bank?.ifsc || "-"}</b>
                    </p>
                    <p className="text-sm text-gray-700">
                      Bank: <b>{selected.bank?.bankName || "-"}</b>
                    </p>
                  </div>

                  {selected.reviewNote ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <p className="text-sm font-bold text-yellow-900 mb-1">Review Note</p>
                      <p className="text-sm text-yellow-900">{selected.reviewNote}</p>
                    </div>
                  ) : null}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selected.status === "pending" && (
                      <>
                        <button
                          onClick={() => act("approve", selected._id)}
                          className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 flex items-center gap-2"
                        >
                          <CheckCircle2 size={16} /> Accept
                        </button>
                        <button
                          onClick={() => act("reject", selected._id)}
                          className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 flex items-center gap-2"
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </>
                    )}

                    {selected.status === "approved" && (
                      <button
                        onClick={() => act("block", selected._id)}
                        className="px-4 py-2 rounded-lg bg-[#111827] text-white font-semibold hover:bg-black flex items-center gap-2"
                      >
                        <Ban size={16} /> Block Supplier
                      </button>
                    )}

                    {selected.status === "rejected" && (
                      <button
                        onClick={() => act("unblock", selected._id)}
                        className="px-4 py-2 rounded-lg bg-green-700 text-white font-semibold hover:bg-green-800 flex items-center gap-2"
                      >
                        <RotateCcw size={16} /> Unblock Supplier
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
