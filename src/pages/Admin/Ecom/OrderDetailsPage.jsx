import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import AdminSidebar from "../../../components/Admin/Layout/AdminSidebar";
import AdminTopbar from "../../../components/Admin/Layout/AdminTopbar";
import Breadcrumb from "../../../components/Breadcrumb";
import { api } from "../../../lib/api";

const uiStatus = (s) => String(s || "").replaceAll("_", " ").toUpperCase();
const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const prettyDate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

const pillStyle = (label) => {
  const base = "px-3 py-1 rounded-full text-xs font-semibold";
  if (label === "ORDER RECEIVED") return `${base} bg-green-100 text-green-700`;
  if (label === "CONFIRMED") return `${base} bg-yellow-100 text-yellow-700`;
  if (label === "ON THE WAY") return `${base} bg-blue-100 text-blue-700`;
  if (label === "DELIVERED") return `${base} bg-emerald-100 text-emerald-700`;
  if (label === "REJECTED" || label === "CANCELED") return `${base} bg-red-100 text-red-700`;
  return `${base} bg-gray-100 text-gray-700`;
};

export default function OrderDetailsPage() {
  const { id } = useParams(); // orderId string
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 80 : 256;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [savingItemId, setSavingItemId] = useState(null);
  const [localStatuses, setLocalStatuses] = useState({}); // itemId -> status

  const canonicalUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    return origin && pathname ? `${origin}${pathname}` : "";
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/admin/${id}`);
      const o = res?.data?.order || null;
      setOrder(o);

      const init = {};
      for (const it of o?.items || []) init[it._id] = it.status;
      setLocalStatuses(init);
    } catch (e) {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const canUpdateItem = (it) => it?.productOwner === "ADMIN";

  const updateItemStatus = async (itemId) => {
    try {
      setSavingItemId(itemId);
      const status = localStatuses[itemId];

      await api.patch(`/orders/admin/items/${itemId}/status`, { status });
      await load(); // refresh
      alert("Status updated!");
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to update status");
    } finally {
      setSavingItemId(null);
    }
  };

  const view = useMemo(() => {
    if (!order) return null;
    return {
      orderId: order.orderId,
      date: prettyDate(order.createdAt),
      address: order.address,
      totals: {
        totalMRP: order.totalMRP,
        totalPrice: order.totalPrice,
        discount: order.discount,
        shipping: order.shipping,
        grandTotal: order.grandTotal,
      },
      items: (order.items || []).map((it) => ({
        ...it,
        uiStatus: uiStatus(it.status),
        typeLabel: it.productOwner === "SUPPLIER" ? "SUPPLIER PRODUCT" : "ADMIN PRODUCT",
        lineTotal: Number(it.price || 0) * Number(it.quantity || 1),
      })),
    };
  }, [order]);

  const pageTitle = view?.orderId
    ? `Order ${view.orderId} | ProspectEdu Admin`
    : "Order Details | ProspectEdu Admin";

  const pageDescription = view?.orderId
    ? `View order details, items, totals, and customer information for Order ${view.orderId} in ProspectEdu Admin.`
    : "View order details, items, totals, and customer information in ProspectEdu Admin.";

  if (loading) return <p className="p-6 text-gray-600">Loading order...</p>;
  if (!view) return <p className="text-red-500 p-6">Order not found.</p>;

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
      <h1 className="sr-only">{`Order Details ${view.orderId}`}</h1>

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-full z-40 transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* MAIN */}
      <main
        className="flex flex-col flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
        aria-label={`Order details for ${view.orderId}`}
      >
        <div
          className="fixed top-0 bg-white shadow-sm h-[64px] flex items-center z-[999]"
          style={{ left: sidebarWidth, right: 0 }}
        >
          <AdminTopbar pageTitle="Order Details" />
        </div>

        <div className="px-6 pt-[90px] pb-10 overflow-y-auto text-left">
         <div className="ml=-3"> 
           <Breadcrumb
        items={[
          { label: "Dashboard", to: "/admin-dashboard" },
          { label: "All Orders", to: "/admin/ecom/orders" },
          { label: "Order Details" },
        ]}
      />
        </div>

          {/* Header card */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-gray-600 text-sm">Order ID</p>
                <h1 className="text-xl font-extrabold text-[#124734]">{view.orderId}</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Date: <b>{view.date}</b>
                </p>
              </div>
              <div className="text-sm text-gray-700">
                <p>
                  <b>Total:</b> {money(view.totals.grandTotal)}
                </p>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer/Address */}
            <section className="bg-white rounded-xl shadow p-6" aria-label="Customer information">
              <h2 className="text-lg font-semibold text-[#124734] mb-4">Customer Information</h2>
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  <b>Name:</b> {view.address?.name || "-"}
                </p>
                <p>
                  <b>Phone:</b> {view.address?.phone || "-"}
                </p>
                <p>
                  <b>Email:</b> {view.address?.email || "-"}
                </p>
                <p>
                  <b>Address:</b>
                </p>
                <p className="text-gray-600">
                  {view.address?.address || ""} {view.address?.city ? `, ${view.address.city}` : ""}{" "}
                  {view.address?.state ? `, ${view.address.state}` : ""}{" "}
                  {view.address?.pincode ? ` - ${view.address.pincode}` : ""}
                </p>
              </div>
            </section>

            {/* Items + Update only admin items */}
            <section className="bg-white rounded-xl shadow p-6 lg:col-span-2" aria-label="Order items">
              <h2 className="text-lg font-semibold text-[#124734] mb-4">Items</h2>

              <div className="space-y-4">
                {view.items.map((it) => (
                  <div key={it._id} className="border rounded-xl p-4 flex flex-col sm:flex-row gap-4">
                    <div className="flex gap-4 items-center">
                      <img
                        src={it.img || "https://via.placeholder.com/60"}
                        alt={it.title ? `${it.title} image` : "Order item image"}
                        className="w-14 h-14 rounded object-cover bg-gray-100"
                        width={56}
                        height={56}
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-[#124734] truncate">{it.title}</p>
                        <p className="text-sm text-gray-600">
                          {money(it.price)} × {it.quantity} = <b>{money(it.lineTotal)}</b>
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className={pillStyle(it.uiStatus)}>{it.uiStatus}</span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              it.productOwner === "SUPPLIER"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {it.typeLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Update option only if ADMIN product */}
                    {canUpdateItem(it) && (
                      <div className="sm:ml-auto sm:w-64">
                        <p className="text-xs font-semibold text-gray-600 mb-2">Update Status (Admin Product)</p>
                        <select
                          className="border px-3 py-2 rounded w-full text-sm"
                          value={localStatuses[it._id] || it.status}
                          onChange={(e) =>
                            setLocalStatuses((p) => ({ ...p, [it._id]: e.target.value }))
                          }
                          aria-label={`Update status for ${it.title}`}
                        >
                          {["ORDER_RECEIVED", "CONFIRMED", "ON_THE_WAY", "DELIVERED", "CANCELED", "REJECTED"].map(
                            (s) => (
                              <option key={s} value={s}>
                                {uiStatus(s)}
                              </option>
                            )
                          )}
                        </select>

                        <button
                          disabled={savingItemId === it._id}
                          onClick={() => updateItemStatus(it._id)}
                          className={`mt-3 w-full px-4 py-2 rounded text-white text-sm font-semibold
                            ${savingItemId === it._id ? "bg-gray-400" : "bg-[#124734] hover:bg-[#0E3A2B]"}
                          `}
                        >
                          {savingItemId === it._id ? "Updating..." : "Update Status"}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-6 border-t pt-4 text-sm text-gray-700" aria-label="Order totals">
                <div className="flex justify-between">
                  <span>Total MRP</span>
                  <b>{money(view.totals.totalMRP)}</b>
                </div>
                <div className="flex justify-between">
                  <span>Items Total</span>
                  <b>{money(view.totals.totalPrice)}</b>
                </div>
                <div className="flex justify-between">
                  <span>Discount</span>
                  <b className="text-green-700">- {money(view.totals.discount)}</b>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <b>{view.totals.shipping === 0 ? "Free" : money(view.totals.shipping)}</b>
                </div>
                <div className="flex justify-between mt-2 p-3 rounded-xl bg-[#ECF5EE]">
                  <span className="text-[#124734] font-extrabold">Grand Total</span>
                  <span className="text-[#124734] font-extrabold">{money(view.totals.grandTotal)}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
