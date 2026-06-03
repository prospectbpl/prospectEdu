import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import EcomHeader from "../../components/EcomHeader";
import Footer from "../../components/Footer";
import { api } from "../../lib/api";

const uiStatus = (s) => String(s || "").replaceAll("_", " ").toUpperCase();
const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const prettyDate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
};

const overallStatus = (items = []) => {
  const st = (items || []).map((it) => uiStatus(it.status));
  if (st.length === 0) return "ORDER RECEIVED";

  const allRejected = st.every((x) => x === "REJECTED" || x === "CANCELED");
  if (allRejected) return "REJECTED";

  if (st.some((x) => x === "ON THE WAY")) return "ON THE WAY";
  if (st.some((x) => x === "CONFIRMED")) return "CONFIRMED";
  if (st.some((x) => x === "DELIVERED")) return "DELIVERED";

  return "ORDER RECEIVED";
};

const pillStyle = (label) => {
  const base = { color: "#124734" };
  if (label === "ORDER RECEIVED") return { ...base, backgroundColor: "#C2F8C5" };
  if (label === "CONFIRMED") return { ...base, backgroundColor: "#FFE9B1" };
  if (label === "ON THE WAY") return { ...base, backgroundColor: "#C2E0FF" };
  if (label === "REJECTED") return { ...base, backgroundColor: "#F8C2C2" };
  if (label === "DELIVERED") return { ...base, backgroundColor: "#DFF5E1" };
  if (label === "CANCELED") return { ...base, backgroundColor: "#E5E5E5" };
  return { ...base, backgroundColor: "#E5E5E5" };
};

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const location = useLocation();

  const canonicalUrl =
    typeof window !== "undefined" ? `${window.location.origin}${location.pathname}` : location.pathname;

  const breadcrumbJsonLd = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: typeof window !== "undefined" ? `${window.location.origin}/` : "/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "My Orders",
          item: typeof window !== "undefined" ? `${window.location.origin}/my-order` : "/my-order",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Order Confirmation",
          item: canonicalUrl,
        },
      ],
    };
  }, [canonicalUrl]);

  const forcedStatus = location?.state?.forcedStatus;
  const forcedReason = location?.state?.reason;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const token = sessionStorage.getItem("accessToken");
        if (!token) {
          navigate("/login", { state: { from: "ecom-header" } });
          return;
        }

        let foundOrder = null;

        try {
          const res = await api.get(`/orders/${orderId}`);
          foundOrder = res?.data?.order || res?.data?.data?.order || res?.data?.data || null;
        } catch {
          foundOrder = null;
        }

        if (!foundOrder) {
          try {
            const mine = await api.get("/orders/mine");
            const list = mine?.data?.orders || mine?.data?.data?.orders || mine?.data?.data || [];
            foundOrder =
              (list || []).find((o) => String(o?._id) === String(orderId)) ||
              (list || []).find((o) => String(o?.orderId) === String(orderId)) ||
              null;
          } catch {
            foundOrder = null;
          }
        }

        setOrder(foundOrder);
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [orderId, navigate]);

  const view = useMemo(() => {
    if (!order) return null;

    const items = (order.items || []).map((it) => {
      const qty = Number(it.quantity || 1);
      const price = Number(it.price || 0);
      return {
        id: it._id,
        title: it.title,
        img: it.img || "https://via.placeholder.com/120",
        qty,
        price,
        subTotal: qty * price,
        status: uiStatus(it.status),
      };
    });

    const status = forcedStatus || overallStatus(order.items || []);

    return {
      orderId: order.orderId,
      date: prettyDate(order.createdAt),
      status,
      items,
      totals: {
        totalMRP: Number(order.totalMRP || 0),
        totalPrice: Number(order.totalPrice || 0),
        discount: Number(order.discount || 0),
        shipping: Number(order.shipping || 0),
        grandTotal: Number(order.grandTotal || 0),
      },
      address: order.address,
      forcedReason,
    };
  }, [order, forcedStatus, forcedReason]);

  return (
    <section className="pt-36">
      <Helmet>
        <title>Order Confirmation | ProspectEdu</title>
        <meta
          name="description"
          content="View your order confirmation, delivery address, item-wise status, and payment summary on ProspectEdu."
        />
        <link rel="canonical" href={canonicalUrl} />
        {/* private page - prevent indexing */}
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <EcomHeader />

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 pb-20 font-[Open_Sans] text-left">
        {loading && (
          <div className="border rounded-2xl p-6 bg-white shadow">
            <p className="text-[#124734] font-bold text-lg">Loading your order...</p>
            <p className="text-gray-600 mt-2">Please wait</p>
          </div>
        )}

        {!loading && !view && (
          <div className="border rounded-2xl p-6 bg-white shadow">
            <p className="text-red-600 font-bold text-lg">Order not found</p>
            <button
              onClick={() => navigate("/my-order")}
              className="mt-5 px-6 py-3 rounded-full bg-[#124734] text-white font-semibold"
            >
              Go to My Orders
            </button>
          </div>
        )}

        {!loading && view && (
          <div className="border rounded-2xl bg-white shadow overflow-hidden">
            <div className="bg-[#124734] text-white px-5 md:px-8 py-6">
              <p className="text-xs md:text-sm opacity-90">Order Status</p>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-2">
                <div className="min-w-0">
                  <h1 className="text-xl md:text-2xl font-extrabold truncate">{view.orderId}</h1>
                  <p className="text-xs md:text-sm opacity-90 mt-1">
                    Date: <b>{view.date}</b> • Items: <b>{view.items.length}</b>
                  </p>
                </div>

                <span className="px-4 py-1 rounded-full text-sm font-semibold w-fit" style={pillStyle(view.status)}>
                  {view.status}
                </span>
              </div>
            </div>

            <div className="px-5 md:px-8 py-6">
              {view.status === "REJECTED" ? (
                <div className="border border-red-200 bg-red-50 rounded-2xl p-5">
                  <p className="text-red-700 font-extrabold text-lg">❌ Order Rejected</p>
                  <p className="text-gray-700 mt-2">
                    Your order has been rejected/canceled. You can check item-wise status below.
                  </p>
                  {view.forcedReason ? (
                    <p className="text-gray-700 mt-2">
                      <b>Reason:</b> {view.forcedReason}
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="border border-green-200 bg-green-50 rounded-2xl p-5">
                  <p className="text-green-800 font-extrabold text-lg">✅ Order Confirmed</p>
                  <p className="text-gray-700 mt-2">
                    Your order is placed successfully. Status will update as supplier processes it.
                  </p>
                </div>
              )}

              <div className="mt-6 border rounded-2xl p-4 bg-[#A7E1B2]/10">
                <p className="text-[#124734] font-bold mb-2">Delivery Address</p>
                <p className="text-sm md:text-[15px] text-gray-700 leading-relaxed">
                  <b className="text-gray-900">
                    {view.address?.name || "Customer"}
                    {view.address?.phone ? ` • ${view.address.phone}` : ""}
                  </b>
                  <br />
                  {view.address?.address}
                  {view.address?.city ? `, ${view.address.city}` : ""}
                  {view.address?.state ? `, ${view.address.state}` : ""}
                  <br />
                  {view.address?.pincode ? `Pincode: ${view.address.pincode}` : ""}
                  {view.address?.country ? ` • ${view.address.country}` : ""}
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {view.items.map((it) => (
                  <div key={it.id} className="flex gap-4 items-center border rounded-2xl p-4">
                    <img
                      src={it.img}
                      alt={it.title ? `${it.title} image` : "Ordered item image"}
                      className="w-16 h-16 object-contain bg-[#A7E1B2]/20 p-2 rounded-xl"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#124734] truncate">{it.title}</p>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {money(it.price)} × {it.qty}
                      </p>
                      <span
                        className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold"
                        style={pillStyle(it.status)}
                      >
                        {it.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Subtotal</p>
                      <p className="font-extrabold text-[#124734]">{money(it.subTotal)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 border-t pt-6">
                <p className="text-[#124734] font-extrabold text-lg mb-3">Payment Summary</p>

                <div className="space-y-2 text-sm md:text-base">
                  <div className="flex justify-between text-gray-700">
                    <span>Total MRP</span>
                    <b>{money(view.totals.totalMRP)}</b>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Items Total</span>
                    <b>{money(view.totals.totalPrice)}</b>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Discount</span>
                    <b className="text-green-700">- {money(view.totals.discount)}</b>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping</span>
                    <b>{view.totals.shipping === 0 ? "Free" : money(view.totals.shipping)}</b>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-2xl bg-[#A7E1B2]/25 flex justify-between items-center">
                  <span className="text-[#124734] font-extrabold text-lg">Grand Total</span>
                  <span className="text-[#124734] font-extrabold text-xl">{money(view.totals.grandTotal)}</span>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate("/my-order")}
                    className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#124734] text-white font-semibold"
                  >
                    Go to My Orders
                  </button>

                  <button
                    onClick={() => navigate("/shop")}
                    className="w-full sm:w-auto px-6 py-3 rounded-full border border-black hover:bg-[#124734] hover:text-white transition"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-10">
        <Footer />
      </div>
    </section>
  );
};

export default OrderConfirmation;
