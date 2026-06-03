import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import SupplierSidebar from "../../../components/SupplierEcommerce/Sidebar";
import SupplierTopbar from "../../../components/SupplierEcommerce/Topbar";
import { api } from "../../../lib/api"; // ✅ use your axios instance (same used elsewhere)

const statusOptions = [
  "ORDER_RECEIVED",
  "CONFIRMED",
  "ON_THE_WAY",
  "DELIVERED",
  "REJECTED",
  "CANCELED",
];

const uiStatus = (s) => String(s || "").replaceAll("_", " ").toUpperCase();

const pillByStatus = (s) => {
  const label = uiStatus(s);
  if (label === "ORDER RECEIVED") return "bg-green-200 text-green-700";
  if (label === "CONFIRMED") return "bg-yellow-200 text-yellow-800";
  if (label === "ON THE WAY") return "bg-blue-200 text-blue-800";
  if (label === "DELIVERED") return "bg-emerald-200 text-emerald-800";
  if (label === "REJECTED") return "bg-red-200 text-red-800";
  if (label === "CANCELED") return "bg-gray-200 text-gray-800";
  return "bg-gray-200 text-gray-800";
};

const prettyDate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
};

export default function Orders() {
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
          name: "Supplier Dashboard",
          item:
            typeof window !== "undefined"
              ? `${window.location.origin}/supplier`
              : "/supplier",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Orders",
          item: canonicalUrl,
        },
      ],
    }),
    [canonicalUrl]
  );

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [loading, setLoading] = useState(true);
  const [rawOrders, setRawOrders] = useState([]); // from backend
  const [updatingItemId, setUpdatingItemId] = useState(null);

  // ✅ Fetch supplier orders from backend
  const fetchSupplierOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders/supplier"); // ✅ GET /api/v1/orders/supplier
      setRawOrders(res?.data?.orders || []);
    } catch (e) {
      console.error("supplierOrders error:", e);
      setRawOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplierOrders();
  }, []);

  // ✅ Flatten: one supplier-item = one card (layout same as your current design)
  const orders = useMemo(() => {
    const list = [];
    for (const o of rawOrders || []) {
      for (const it of o.items || []) {
        list.push({
          id: o.orderId,
          itemId: it._id,
          paid: true,
          paymentType: "COD",
          orderDate: o.createdAt ? prettyDate(o.createdAt) : "",
          qty: Number(it.quantity || 1),
          amount: Number(it.price || 0) * Number(it.quantity || 1),
          status: it.status,
          address: {
            name: o.address?.name || "",
            city: o.address?.city || "",
            pincode: o.address?.pincode || "",
            country: o.address?.country || "India",
            street: o.address?.address || "",
            state: o.address?.state || "",
          },
          product: {
            title: it.title,
            category: "",
            img: it.img || "https://via.placeholder.com/120",
          },
        });
      }
    }
    return list;
  }, [rawOrders]);

  // ✅ Supplier changes status -> DB update -> user My Orders auto reflects
  const handleStatusChange = async (itemId, newStatus) => {
    try {
      setUpdatingItemId(itemId);
      await api.patch(`/orders/items/${itemId}/status`, { status: newStatus });

      localStorage.setItem("supplierStatsRefresh", String(Date.now()));
      window.dispatchEvent(new Event("supplierStatsRefresh"));

      setRawOrders((prev) =>
        (prev || []).map((o) => ({
          ...o,
          items: (o.items || []).map((it) =>
            String(it._id) === String(itemId) ? { ...it, status: newStatus } : it
          ),
        }))
      );
    } catch (e) {
      console.error("updateItemStatus error:", e);
      alert(e?.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingItemId(null);
    }
  };

  return (
    <div className="flex bg-[#F9FAFB] min-h-screen text-left">
      <Helmet>
        <title>Supplier Orders | ProspectEdu</title>
        <meta name="description" content="Manage and update your supplier orders on ProspectEdu." />
        <link rel="canonical" href={canonicalUrl} />
        {/* Dashboard/private page */}
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <SupplierSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 
          ${isCollapsed ? "ml-20 md:ml-0" : "ml-64 md:ml-0"}
        `}
      >
        <SupplierTopbar pageTitle="Order List" />

        <div className="p-8">
          <h1 className="text-3xl font-bold text-[#124734] mb-6">Orders List</h1>

          {loading && (
            <div className="text-center mt-10 text-gray-500 text-lg">Loading orders...</div>
          )}

          {/* ============ MOBILE VIEW (Attractive Cards) ============ */}
          {!loading && (
            <div className="md:hidden space-y-6">
              {orders.map((order, i) => (
                <div
                  key={order.itemId || i}
                  className="bg-white p-4 rounded-2xl shadow border border-[#A7E1B2]/40"
                >
                  <div className="flex justify-between mb-3 items-center gap-3">
                    <span className="font-semibold text-[#124734]">#{order.id}</span>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.paid ? "bg-green-200 text-green-700" : "bg-red-200 text-red-700"
                        }`}
                      >
                        {order.paid ? "Paid" : "Pending"}
                      </span>

                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${pillByStatus(order.status)}`}>
                        {uiStatus(order.status)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <img
                      src={order.product.img}
                      className="w-20 h-20 rounded-lg object-contain bg-[#A7E1B2]/20 p-2"
                      alt={order.product.title ? `${order.product.title} image` : "Ordered product image"}
                      loading="lazy"
                      decoding="async"
                    />

                    <div className="flex-1">
                      <p className="text-[#124734] font-semibold text-base leading-tight">
                        {order.product.title}
                      </p>

                      <p className="text-gray-500 text-xs mt-1">{order.product.category}</p>

                      <p className="text-[#124734] font-bold text-sm mt-2">
                        ₹{order.amount} <span className="font-normal">• Qty {order.qty}</span>
                      </p>

                      <p className="text-gray-500 text-xs mt-1">Payment: {order.paymentType}</p>
                      <p className="text-gray-400 text-xs mt-1">{order.orderDate}</p>

                      <p className="text-gray-600 mt-2 text-xs leading-4">
                        {order.address.name} , {order.address.city} – {order.address.pincode} ,{order.address.country}
                        <p className="text-gray-500 mt-1">Date: {order.orderDate}</p>
                      </p>

                      <div className="mt-3">
                        <select
                          value={order.status}
                          disabled={updatingItemId === order.itemId}
                          onChange={(e) => handleStatusChange(order.itemId, e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border border-[#A7E1B2]/60 bg-white text-[#124734] font-semibold"
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>
                              {uiStatus(s)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ============ DESKTOP VIEW (ORIGINAL - UNTOUCHED) ============ */}
          {!loading && (
            <div className="hidden md:block">
              <div className="space-y-6">
                {orders.map((order, i) => (
                  <div
                    key={order.itemId || i}
                    className="p-6 bg-white rounded-2xl shadow-md border border-[#A7E1B2]/40 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-[#124734]">#{order.id}</h3>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-4 py-1 rounded-full text-sm font-semibold ${
                            order.paid ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                          }`}
                        >
                          {order.paid ? "Paid" : "Pending"}
                        </span>

                        <span className={`px-4 py-1 rounded-full text-sm font-semibold ${pillByStatus(order.status)}`}>
                          {uiStatus(order.status)}
                        </span>

                        <select
                          value={order.status}
                          disabled={updatingItemId === order.itemId}
                          onChange={(e) => handleStatusChange(order.itemId, e.target.value)}
                          className="px-3 py-2 rounded-xl border border-[#A7E1B2]/60 bg-white text-[#124734] font-semibold"
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>
                              {uiStatus(s)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-[1fr_2fr_0.7fr_1fr_1.3fr] gap-6 items-center">
                      <img
                        src={order.product.img}
                        alt={order.product.title ? `${order.product.title} image` : "Ordered product image"}
                        className="w-20 h-20 rounded-lg object-contain bg-[#A7E1B2]/20 p-2 shadow-sm"
                        loading="lazy"
                        decoding="async"
                      />

                      <div className="flex flex-col gap-1">
                        <p className="text-lg font-semibold text-[#124734]">{order.product.title}</p>
                        <p className="text-gray-600 text-sm">Category: {order.product.category}</p>
                        <p className="text-gray-500 text-sm">Payment: {order.paymentType}</p>
                      </div>

                      <div className="flex justify-center">
                        <span className="px-3 py-1 text-sm font-semibold rounded-full bg-[#A7E1B2]/60 text-[#124734] shadow-sm">
                          Qty: {order.qty}
                        </span>
                      </div>

                      <div className="text-lg font-extrabold text-[#124734] text-center">₹{order.amount}</div>

                      <div className="text-sm leading-5 text-gray-700">
                        <p className="font-semibold">{order.address.name}</p>
                        <p>
                          {order.address.street}, {order.address.city}
                        </p>
                        <p>
                          {order.address.state} – {order.address.pincode}
                        </p>
                        <p>{order.address.country}</p>
                        <p className="text-gray-500 mt-1">Date: {order.orderDate}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div className="text-center mt-20 text-gray-500 text-xl">No Orders Found</div>
          )}
        </div>
      </div>
    </div>
  );
}
