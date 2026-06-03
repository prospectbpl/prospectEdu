import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import EcomHeader from "../../components/EcomHeader";
import { useAddress } from "../../context/AddressContext";
import Footer from "../../components/Footer";
import { api } from "../../lib/api";

const orderOptions = [
  "All Orders",
  "ORDER RECEIVED",
  "CONFIRMED",
  "ON THE WAY",
  "CANCELED",
  "REJECTED",
  "DELIVERED",
];

const prettyDate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
};

// backend enum -> UI label
const uiStatus = (s) => {
  if (!s) return "CONFIRMED";
  return String(s).replaceAll("_", " ").toUpperCase();
};

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const statusPillStyle = (label) => {
  const base = { color: "#124734" };
  if (label === "ORDER RECEIVED") return { ...base, backgroundColor: "#C2F8C5" };
  if (label === "ON THE WAY") return { ...base, backgroundColor: "#C2E0FF" };
  if (label === "REJECTED") return { ...base, backgroundColor: "#F8C2C2" };
  if (label === "CONFIRMED") return { ...base, backgroundColor: "#FFE9B1" };
  if (label === "DELIVERED") return { ...base, backgroundColor: "#DFF5E1" };
  if (label === "CANCELED") return { ...base, backgroundColor: "#E5E5E5" };
  return { ...base, backgroundColor: "#E5E5E5" };
};

// If multi-item order has mixed statuses, show a smart label.
const deriveOrderStatus = (items = []) => {
  const set = new Set((items || []).map((it) => uiStatus(it.status)));
  const arr = [...set];

  if (arr.length === 0) return "ORDER RECEIVED";
  if (arr.length === 1) return arr[0];

  const allRejected = (items || []).every((it) => {
    const s = uiStatus(it.status);
    return s === "REJECTED" || s === "CANCELED";
  });
  if (allRejected) return "REJECTED";

  if (set.has("ON THE WAY")) return "ON THE WAY";
  if (set.has("CONFIRMED")) return "CONFIRMED";
  if (set.has("DELIVERED")) return "DELIVERED";
  return "ORDER RECEIVED";
};

const MyOrder = () => {
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
          item: canonicalUrl,
        },
      ],
    };
  }, [canonicalUrl]);

  const [activeTab, setActiveTab] = useState("orders");
  const { addresses, addAddress, removeAddress } = useAddress();

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [orderFilter, setOrderFilter] = useState("All Orders");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [orders, setOrders] = useState([]);

  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    address: "",
    state: "",
    country: "INDIA",
    pincode: "",
  });

  const startEdit = (addr) => {
    setEditingId(addr.id);
    setNewAddress(addr);
    setShowForm(true);
  };

  const saveAddress = () => {
    if (
      !newAddress.name.trim() ||
      !newAddress.phone.trim() ||
      !newAddress.address.trim() ||
      !newAddress.state.trim() ||
      !newAddress.pincode.trim()
    ) {
      alert("Please fill all required details.");
      return;
    }

    if (!editingId) {
      addAddress({ id: Date.now(), ...newAddress });
    }

    setShowForm(false);
    setEditingId(null);

    setNewAddress({
      name: "",
      phone: "",
      address: "",
      state: "",
      country: "INDIA",
      pincode: "",
    });
  };

  useEffect(() => {
    if (activeTab === "account") setActiveTab("orders");
  }, [activeTab]);

  useEffect(() => {
    const load = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");
        if (!token) {
          setOrders([]);
          return;
        }
        const res = await api.get("/orders/mine");
        setOrders(res?.data?.orders || []);
      } catch (err) {
        console.log("Load orders error:", err);
        setOrders([]);
      }
    };
    load();
  }, []);

  const uiOrders = useMemo(() => {
    const mapped = (orders || []).map((o) => {
      const items = (o.items || []).map((it) => {
        const qty = Number(it.quantity || 1);
        const price = Number(it.price || 0);
        const subTotal = price * qty;

        return {
          itemId: it._id,
          status: uiStatus(it.status),
          productImg: it.img || "https://via.placeholder.com/120",
          productName: it.title,
          qty,
          price,
          subTotal,
        };
      });

      const totalMRP = Number(o.totalMRP ?? 0);
      const totalPrice = Number(o.totalPrice ?? items.reduce((s, x) => s + x.subTotal, 0));
      const discount = Number(o.discount ?? Math.max(0, totalMRP - totalPrice));
      const shipping = Number(o.shipping ?? (totalPrice < 500 ? 99 : 0));
      const grandTotal = Number(o.grandTotal ?? (totalPrice + shipping));

      return {
        id: o.orderId,
        createdAt: o.createdAt,
        date: prettyDate(o.createdAt),
        status: deriveOrderStatus(o.items || []),
        items,
        totals: {
          totalMRP,
          totalPrice,
          discount,
          shipping,
          grandTotal,
        },
        address: o.address,
      };
    });

    return mapped.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders]);

  const filteredOrders =
    orderFilter === "All Orders"
      ? uiOrders
      : uiOrders.filter((o) => (o.items || []).some((it) => it.status.toUpperCase() === orderFilter.toUpperCase()));

  return (
    <section className=" pt-36">
      <Helmet>
        <title>My Orders | ProspectEdu</title>
        <meta
          name="description"
          content="View your orders, item status updates, totals, and delivery details in your ProspectEdu account."
        />
        <link rel="canonical" href={canonicalUrl} />
        {/* private page - prevent indexing */}
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <EcomHeader />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 font-[Open_Sans] pb-20 text-left">
        <p className="text-gray-600 mb-5 text-sm md:text-base">
          <span className="cursor-pointer text-[#124734] hover:underline">Home</span> &gt; My Orders
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-10">
          <div className="w-full">
            <p className="text-2xl md:text-3xl font-semibold text-[#124734] mb-3">My Orders</p>

            <h2 className="text-lg font-bold text-gray-600 mb-6">Quick Access</h2>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => setActiveTab("orders")}
                className={`border px-4 py-2 rounded-lg font-semibold w-full
                ${activeTab === "orders" ? "bg-[#A7E1B2] text-[#124734]" : "text-gray-700 hover:text-[#124734]"}`}
              >
                My Orders
              </button>

              <button
                onClick={() => setActiveTab("addresses")}
                className={`border px-4 py-2 rounded-lg font-semibold w-full
                ${activeTab === "addresses" ? "bg-[#A7E1B2] text-[#124734]" : "text-gray-700 hover:text-[#124734]"}`}
              >
                My Addresses
              </button>
            </div>
          </div>

          <div className="md:col-span-3 mt-4 md:mt-6">
            {activeTab === "orders" && (
              <div className="relative">
                <div className="flex justify-end mb-6 relative">
                  <button
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className="w-40 md:w-48 bg-[#A7E1B2] border shadow-md rounded-full px-4 py-2 text-[#124734] font-semibold flex justify-between items-center hover:shadow-lg transition"
                  >
                    {orderFilter}
                    <span>▾</span>
                  </button>

                  {showFilterMenu && (
                    <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-2xl overflow-hidden border z-10">
                      {orderOptions.map((opt) => (
                        <div
                          key={opt}
                          onClick={() => {
                            setOrderFilter(opt);
                            setShowFilterMenu(false);
                          }}
                          className={`px-5 py-3 cursor-pointer transition text-sm
                          ${orderFilter === opt ? "bg-[#A7E1B2] text-[#124734] font-bold" : "hover:bg-[#DFF5E1]"}`}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-[#A7E1B2] rounded-2xl p-4 md:p-6 shadow-sm bg-white hover:shadow-md transition"
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-3 md:gap-0">
                        <div>
                          <p className="text-lg font-semibold text-[#124734]">Order ID: {order.id}</p>
                          <p className="text-gray-600 text-sm mt-1">
                            Ordered on: <b>{order.date}</b> • Items: <b>{order.items.length}</b>
                          </p>
                        </div>

                        <span
                          className="px-4 py-1 rounded-full text-sm font-semibold self-start md:self-center"
                          style={statusPillStyle(order.status)}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className="mt-5 space-y-4">
                        {order.items.map((it) => (
                          <div
                            key={it.itemId}
                            className="flex gap-4 md:gap-5 items-center p-3 rounded-xl bg-[#A7E1B2]/15"
                          >
                            <img
                              src={it.productImg}
                              className="w-16 h-16 object-contain bg-white p-2 rounded-xl"
                              alt={it.productName ? `${it.productName} image` : "Ordered item image"}
                              loading="lazy"
                              decoding="async"
                            />

                            <div className="flex-1 min-w-0">
                              <p className="text-[16px] md:text-lg font-semibold text-[#124734] truncate">
                                {it.productName}
                              </p>
                              <p className="text-gray-600 text-sm mt-1">
                                Qty: {it.qty} • {money(it.price)} each
                              </p>

                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <span
                                  className="px-3 py-1 rounded-full text-xs font-semibold"
                                  style={statusPillStyle(it.status)}
                                >
                                  {it.status}
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-gray-600 text-xs md:text-sm">Subtotal</p>
                              <p className="text-[#124734] font-extrabold text-base md:text-lg">
                                {money(it.subTotal)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 rounded-2xl bg-gradient-to-r from-[#A7E1B2]/40 to-[#DFF5E1]/60 border border-[#A7E1B2]/50 p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm md:text-base">
                          <div>
                            <p className="text-gray-600">Items Total</p>
                            <p className="font-bold text-[#124734]">{money(order.totals.totalPrice)}</p>
                          </div>

                          <div>
                            <p className="text-gray-600">Shipping</p>
                            <p className="font-bold text-[#124734]">
                              {order.totals.shipping === 0 ? "Free" : money(order.totals.shipping)}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-600">Discount</p>
                            <p className="font-bold text-green-700">- {money(order.totals.discount)}</p>
                          </div>

                          <div>
                            <p className="text-gray-600">Grand Total</p>
                            <p className="font-extrabold text-[#124734] text-lg md:text-xl">
                              {money(order.totals.grandTotal)}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-end mt-4">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-5 py-2 rounded-full bg-[#124734] text-white font-semibold shadow hover:bg-[#0f3a23] transition"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredOrders.length === 0 && (
                  <div className="flex flex-col items-center mt-16">
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/17009/17009305.png"
                      className="w-32 md:w-52 opacity-70"
                      alt="No orders illustration"
                      loading="lazy"
                      decoding="async"
                    />
                    <p className="text-lg md:text-xl text-gray-600 mt-4 font-semibold">No Orders</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="p-4 md:p-6 rounded-xl border shadow">
                <h3 className="text-xl md:text-2xl font-bold text-[#124734] mb-6">My Addresses</h3>

                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="border-b pb-5 mb-5 flex flex-col md:flex-row justify-between gap-4"
                  >
                    <div>
                      <h4 className="text-lg md:text-xl font-semibold">{addr.name}</h4>
                      <p className="text-gray-700 mt-1 text-sm md:text-base">
                        {addr.address}, {addr.state}, {addr.country}
                      </p>
                      <p className="text-gray-700 mt-1 text-sm md:text-base">
                        Contact – {addr.phone} • Pincode – {addr.pincode}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <button onClick={() => startEdit(addr)} className="text-[#124734] font-medium">
                        Edit
                      </button>

                      <button
                        onClick={() => {
                          setDeleteId(addr.id);
                          setShowDeletePopup(true);
                        }}
                        className="text-red-500 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => setShowForm(true)}
                  className="bg-[#124734] text-white px-6 py-2 rounded-lg mt-4"
                >
                  Add New Address
                </button>

                {showForm && (
                  <div className="mt-8 border p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4">{editingId ? "Edit Address" : "Add New Address"}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <input
                        placeholder="Full Name"
                        className="border p-3 rounded-lg"
                        value={newAddress.name}
                        onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                      />
                      <input
                        placeholder="Contact Number"
                        className="border p-3 rounded-lg"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      />
                    </div>

                    <input
                      placeholder="Address"
                      className="border p-3 rounded-lg w-full mt-6"
                      value={newAddress.address}
                      onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <input
                        placeholder="State"
                        className="border p-3 rounded-lg"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      />
                      <input
                        placeholder="Pincode"
                        className="border p-3 rounded-lg"
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      />
                    </div>

                    <button
                      onClick={saveAddress}
                      className="bg-[#124734] text-white px-6 py-2 rounded-lg mt-6"
                    >
                      {editingId ? "Update Address" : "Save Address"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showDeletePopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-xs text-center">
            <div className="text-yellow-500 text-3xl mb-3">⚠️</div>
            <p className="text-lg font-semibold mb-6">Are you sure you want to delete this address?</p>

            <div className="flex gap-4">
              <button
                onClick={() => setShowDeletePopup(false)}
                className="w-full border px-4 py-2 rounded-lg bg-[#A7E1B2]"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  removeAddress(deleteId);
                  setShowDeletePopup(false);
                }}
                className="w-full bg-[#124734] text-white px-4 py-2 rounded-lg"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 md:p-6">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-[#124734] text-white px-4 md:px-6 py-4 flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-xs md:text-sm opacity-90">Order Details</p>
                <h2 className="text-lg md:text-2xl font-extrabold mt-1 truncate">{selectedOrder.id}</h2>
                <p className="text-xs md:text-sm mt-1 opacity-90">
                  Date: <b>{selectedOrder.date}</b> • Items: <b>{selectedOrder.items.length}</b>
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="ml-3 shrink-0 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <span
                  className="px-4 py-1 rounded-full text-sm font-semibold w-fit"
                  style={statusPillStyle(selectedOrder.status)}
                >
                  {selectedOrder.status}
                </span>

                <div className="text-sm text-gray-600">
                  Items Total: <b className="text-[#124734]">{money(selectedOrder.totals.totalPrice)}</b> • Shipping:{" "}
                  <b className="text-[#124734]">
                    {selectedOrder.totals.shipping === 0 ? "Free" : money(selectedOrder.totals.shipping)}
                  </b>
                </div>
              </div>

              <div className="border rounded-2xl p-4 bg-[#A7E1B2]/10 mb-5">
                <p className="text-[#124734] font-bold text-sm md:text-base mb-2">Shipping Address</p>

                {selectedOrder?.address ? (
                  <div className="text-sm md:text-[15px] text-gray-700 leading-relaxed">
                    <p className="font-semibold text-gray-900">
                      {selectedOrder.address?.name || "Customer"}
                      {selectedOrder.address?.phone ? ` • ${selectedOrder.address.phone}` : ""}
                    </p>
                    <p className="mt-1">
                      {selectedOrder.address?.address}
                      {selectedOrder.address?.city ? `, ${selectedOrder.address.city}` : ""}
                      {selectedOrder.address?.state ? `, ${selectedOrder.address.state}` : ""}
                    </p>
                    <p className="mt-1">
                      {selectedOrder.address?.pincode ? `Pincode: ${selectedOrder.address.pincode}` : ""}
                      {selectedOrder.address?.country ? ` • ${selectedOrder.address.country}` : ""}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Address not found for this order.</p>
                )}
              </div>

              <div className="space-y-3">
                {selectedOrder.items.map((it) => (
                  <div
                    key={it.itemId}
                    className="border rounded-2xl p-3 md:p-4 flex gap-3 md:gap-4 items-center"
                  >
                    <img
                      src={it.productImg}
                      className="w-14 h-14 md:w-16 md:h-16 object-contain bg-[#A7E1B2]/20 p-2 rounded-xl shrink-0"
                      alt={it.productName ? `${it.productName} image` : "Ordered item image"}
                      loading="lazy"
                      decoding="async"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#124734] truncate">{it.productName}</p>
                      <p className="text-gray-600 text-sm mt-0.5">
                        {money(it.price)} × {it.qty}
                      </p>

                      <span
                        className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold"
                        style={statusPillStyle(it.status)}
                      >
                        {it.status}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-gray-500 text-xs">Subtotal</p>
                      <p className="font-extrabold text-[#124734]">{money(it.subTotal)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t pt-5">
                <p className="text-[#124734] font-extrabold text-base md:text-lg mb-3">Price Details</p>

                <div className="space-y-2 text-sm md:text-base">
                  <div className="flex justify-between text-gray-700">
                    <span>Total MRP</span>
                    <b>{money(selectedOrder.totals.totalMRP)}</b>
                  </div>

                  <div className="flex justify-between text-gray-700">
                    <span>Items Total</span>
                    <b>{money(selectedOrder.totals.totalPrice)}</b>
                  </div>

                  <div className="flex justify-between text-gray-700">
                    <span>Discount</span>
                    <b className="text-green-700">- {money(selectedOrder.totals.discount)}</b>
                  </div>

                  <div className="flex justify-between text-gray-700">
                    <span>Shipping</span>
                    <b>{selectedOrder.totals.shipping === 0 ? "Free" : money(selectedOrder.totals.shipping)}</b>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-2xl bg-[#A7E1B2]/25 flex justify-between items-center">
                  <span className="text-[#124734] font-extrabold text-lg">Grand Total</span>
                  <span className="text-[#124734] font-extrabold text-xl">{money(selectedOrder.totals.grandTotal)}</span>
                </div>
              </div>
            </div>

            <div className="px-4 md:px-6 py-4 border-t bg-white">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-[#124734] text-white py-3 rounded-full font-semibold shadow hover:bg-[#0f3a23] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pt-10">
        <Footer />
      </div>
    </section>
  );
};

export default MyOrder;
