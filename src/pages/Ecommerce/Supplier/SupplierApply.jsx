import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EcomHeader from "../../../components/EcomHeader";
import Footer from "../../../components/Footer";
import { api } from "../../../lib/api";

const SupplierApply = () => {
  const navigate = useNavigate();

  const accessToken = sessionStorage.getItem("accessToken");
  const user = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const authHeaders = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
    [accessToken]
  );

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // supplier profile status from backend
  const [supplierProfile, setSupplierProfile] = useState(null); // {exists, status, ...}
  const [error, setError] = useState("");

  const [customCategory, setCustomCategory] = useState("");

  // ✅ NEW: admin predefined categories
  const [categoryOptions, setCategoryOptions] = useState([]);

  const [form, setForm] = useState({
    shopName: "",
    ownerName: "",
    phone: "",
    email: "",
    categories: [],

    pickupAddress: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    },

    kyc: {
      gstin: "",
      pan: "",
    },

    bank: {
      accountHolderName: "",
      accountNumber: "",
      ifsc: "",
      bankName: "",
    },
  });

  // Prefill phone/email/ownerName if available from stored user
  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      ownerName: prev.ownerName || user.fullName || user.name || "",
      phone: prev.phone || user.phone || "",
      email: prev.email || user.email || "",
    }));
  }, [user]);

  // If not logged in -> go login
  useEffect(() => {
    if (!accessToken || !user) {
      navigate("/login", { state: { from: "become-supplier" } });
    }
  }, [accessToken, user, navigate]);

  // ✅ Load admin categories (predefined)
  useEffect(() => {
    let mounted = true;

    const loadAdminCategories = async () => {
      try {
        const res = await api.get("/categories");
        const items = res?.data?.categories || [];
        const names = items.map((c) => c.name).filter(Boolean);

        // ✅ keep existing "Others" option for custom
        const next = [...names, "Others"];

        if (!mounted) return;
        setCategoryOptions(next);
      } catch {
        if (!mounted) return;
        // fallback: still keep Others
        setCategoryOptions(["Others"]);
      }
    };

    loadAdminCategories();
    return () => {
      mounted = false;
    };
  }, []);

 const fetchMySupplierProfile = async () => {
  setError("");
  setLoading(true);

  try {
    // ✅ Always use status API (fresh + simple)
    const stRes = await api.get("/suppliers/me/status", authHeaders);
    const st = stRes?.data?.supplierStatus; // none | pending | approved | rejected

    if (st === "none") {
      setSupplierProfile({ exists: false });
      setLoading(false);
      return;
    }

    // ✅ fetch full supplier profile only if exists
    const profRes = await api.get("/suppliers/me", authHeaders);
    const full = profRes?.data || {};

    // Normalize shape for UI
    setSupplierProfile({
      exists: true,
      status: st,
      reviewNote: full?.reviewNote,
      ...full,
    });

    // ✅ IMPORTANT: if approved, go dashboard (unblock ke baad yehi hoga)
    if (st === "approved") {
      navigate("/supplier", { replace: true });
      return;
    }
  } catch (e) {
    setError(e?.response?.data?.message || "Failed to load supplier status.");
    setSupplierProfile(null);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchMySupplierProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updatePickup = (key, value) => {
    setForm((prev) => ({
      ...prev,
      pickupAddress: { ...prev.pickupAddress, [key]: value },
    }));
  };

  const updateKyc = (key, value) => {
    setForm((prev) => ({
      ...prev,
      kyc: { ...prev.kyc, [key]: value },
    }));
  };

  const updateBank = (key, value) => {
    setForm((prev) => ({
      ...prev,
      bank: { ...prev.bank, [key]: value },
    }));
  };

  const toggleCategory = (cat) => {
    setForm((prev) => {
      const exists = prev.categories.includes(cat);
      const nextCategories = exists
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat];

      // if "Others" got unchecked -> clear custom input
      if (!nextCategories.includes("Others")) {
        setCustomCategory("");
      }

      return {
        ...prev,
        categories: nextCategories,
      };
    });
  };

  const validate = () => {
    if (!form.shopName.trim()) return "Shop/Business name is required.";
    if (!form.ownerName.trim()) return "Owner name is required.";
    if (!form.phone.trim()) return "Phone is required.";
    if (!form.email.trim()) return "Email is required.";

    if (!form.pickupAddress.addressLine1.trim())
      return "Pickup address is required.";
    if (!form.pickupAddress.city.trim()) return "City is required.";
    if (!form.pickupAddress.state.trim()) return "State is required.";
    if (!form.pickupAddress.pincode.trim()) return "Pincode is required.";
    if (!form.categories.length) return "Select at least one category.";

    if (form.categories.includes("Others") && !customCategory.trim()) {
      return "Please specify product type for 'Others' category.";
    }

    if (!form.kyc.pan.trim()) return "PAN is mandatory.";

    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const msg = validate();
    if (msg) return setError(msg);

    setSubmitting(true);
    try {
      const finalCategories = form.categories.includes("Others")
        ? [
            ...form.categories.filter((c) => c !== "Others"),
            customCategory.trim(),
          ]
        : form.categories;

      const payload = {
        shopName: form.shopName.trim(),
        ownerName: form.ownerName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        categories: finalCategories,

        pickupAddress: {
          addressLine1: form.pickupAddress.addressLine1.trim(),
          addressLine2: form.pickupAddress.addressLine2.trim(),
          city: form.pickupAddress.city.trim(),
          state: form.pickupAddress.state.trim(),
          pincode: form.pickupAddress.pincode.trim(),
          country: form.pickupAddress.country.trim() || "India",
        },

        kyc: {
          gstin: form.kyc.gstin.trim(),
          pan: form.kyc.pan.trim(),
        },
        bank: {
          accountHolderName: form.bank.accountHolderName.trim(),
          accountNumber: form.bank.accountNumber.trim(),
          ifsc: form.bank.ifsc.trim(),
          bankName: form.bank.bankName.trim(),
        },
      };

      await api.post("/suppliers/apply", payload, authHeaders);
      await fetchMySupplierProfile();
    } catch (e2) {
      setError(e2?.response?.data?.message || "Application submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const StatusCard = ({ title, subtitle, children }) => (
    <div className="border rounded-2xl p-6 bg-white shadow-sm">
      <h2 className="text-xl font-bold text-[#124734]">{title}</h2>
      {subtitle ? <p className="text-gray-600 mt-1">{subtitle}</p> : null}
      <div className="mt-4">{children}</div>
    </div>
  );

  useEffect(() => {
    if (user?.role === "supplier") {
      // optional
    }
  }, [user, navigate]);

  return (
    <>
      <EcomHeader />

      <div className="px-6 md:px-16 py-10 bg-[#A7E1B2]/20 min-h-[70vh]">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
            <div>
              <h1 className="text-3xl font-extrabold text-[#124734]">
                Supplier Program
              </h1>
              <p className="text-gray-700 mt-2">
                Apply to become a supplier. If you already applied, you will see
                your application status here.
              </p>
            </div>

           <button
  onClick={async () => {
    try {
      const st = await api.get("/suppliers/me/status", authHeaders);
      if (st?.data?.supplierStatus === "approved") return navigate("/supplier");
      return navigate("/supplier/apply");
    } catch {
      return navigate("/supplier/apply");
    }
  }}
  className="px-5 py-2 rounded-xl bg-[#124734] text-white font-semibold hover:opacity-90"
>
  Supplier Info Page
</button>

          </div>

          {error ? (
            <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="mt-8 border rounded-2xl p-6 bg-white shadow-sm">
              <p className="text-gray-700">Loading your supplier status...</p>
            </div>
          ) : (
            <>
              {supplierProfile?.exists ? (
                <div className="mt-8">
                  {supplierProfile.status === "pending" ? (
                    <StatusCard
                      title="Application Submitted ✅"
                      subtitle="Status: Pending review"
                    >
                      <p className="text-gray-700">
                        Your application is under review. You will be able to
                        access the supplier dashboard after approval.
                      </p>

                      <button
                        onClick={fetchMySupplierProfile}
                        className="mt-4 px-5 py-2 rounded-xl bg-[#124734] text-white font-semibold hover:opacity-90"
                      >
                        Refresh Status
                      </button>
                    </StatusCard>
                  ) : supplierProfile.status === "approved" ? (
                    <StatusCard
                      title="Approved 🎉"
                      subtitle="You are approved as a supplier."
                    >
                      <p className="text-gray-700">
                        You can now go to your supplier dashboard. If you still
                        don’t see access, log out and log in once to refresh
                        role.
                      </p>

                      <div className="flex gap-3 flex-wrap mt-4">
                       <button
                        onClick={async () => {
                          try {
                            const stRes = await api.get("/suppliers/me/status", authHeaders);
                            if (stRes?.data?.supplierStatus === "approved") {
                              return navigate("/supplier", { replace: true });
                            }
                            return fetchMySupplierProfile();
                          } catch {
                            return fetchMySupplierProfile();
                          }
                        }}
                        className="px-5 py-2 rounded-xl bg-[#124734] text-white font-semibold hover:opacity-90"
                      >
                        Go to Dashboard
                      </button>

                        <button
                          onClick={fetchMySupplierProfile}
                          className="px-5 py-2 rounded-xl border border-[#124734] text-[#124734] font-semibold hover:bg-[#124734]/10"
                        >
                          Refresh Status
                        </button>
                      </div>
                    </StatusCard>
                  ) : (
                    <StatusCard
                      title="Rejected ❌"
                      subtitle="Your application was not approved."
                    >
                      <p className="text-gray-700">
                        {supplierProfile.reviewNote
                          ? `Reason: ${supplierProfile.reviewNote}`
                          : "Reason not provided."}
                      </p>

                      <div className="flex gap-3 flex-wrap mt-4">
                        <button
                          onClick={() => {
                            setSupplierProfile({ exists: false });
                            setError("");
                          }}
                          className="px-5 py-2 rounded-xl bg-[#124734] text-white font-semibold hover:opacity-90"
                        >
                          Re-Apply
                        </button>
                        <button
                          onClick={fetchMySupplierProfile}
                          className="px-5 py-2 rounded-xl border border-[#124734] text-[#124734] font-semibold hover:bg-[#124734]/10"
                        >
                          Refresh Status
                        </button>
                      </div>
                    </StatusCard>
                  )}
                </div>
              ) : (
                <div className="mt-8 bg-white border rounded-2xl p-6 shadow-sm">
                  <h2 className="text-2xl font-bold text-[#124734]">
                    Apply to Become a Supplier
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Fill the details below. Fields marked * are required.
                  </p>

                  <form onSubmit={onSubmit} className="mt-6 space-y-8">
                    {/* Basic info */}
                    <div>
                      <h3 className="text-lg font-semibold text-[#124734]">
                        Basic Information
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <input
                          value={form.shopName}
                          onChange={(e) =>
                            updateForm("shopName", e.target.value)
                          }
                          placeholder="Shop/Business Name *"
                          className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#124734]/30"
                        />
                        <input
                          value={form.ownerName}
                          onChange={(e) =>
                            updateForm("ownerName", e.target.value)
                          }
                          placeholder="Owner Name *"
                          className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#124734]/30"
                        />
                        <input
                          value={form.phone}
                          onChange={(e) => updateForm("phone", e.target.value)}
                          placeholder="Phone *"
                          className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#124734]/30"
                        />
                        <input
                          value={form.email}
                          onChange={(e) => updateForm("email", e.target.value)}
                          placeholder="Email *"
                          className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#124734]/30"
                        />
                      </div>
                    </div>

                    {/* Categories */}
                    <div>
                      <h3 className="text-lg font-semibold text-[#124734]">
                        Categories you want to sell *
                      </h3>
                      <div className="flex flex-wrap gap-3 mt-3">
                        {categoryOptions.map((cat) => {
                          const active = form.categories.includes(cat);
                          return (
                            <button
                              type="button"
                              key={cat}
                              onClick={() => toggleCategory(cat)}
                              className={`px-4 py-2 rounded-xl border font-semibold transition ${
                                active
                                  ? "bg-[#124734] text-white border-[#124734]"
                                  : "bg-white text-[#124734] border-[#124734] hover:bg-[#124734]/10"
                              }`}
                            >
                              {cat}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Select at least one category.
                      </p>

                      {form.categories.includes("Others") && (
                        <input
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          placeholder="Please specify product type *"
                          className="mt-4 border rounded-xl px-4 py-3 w-full outline-none focus:ring-2 focus:ring-[#124734]/30"
                        />
                      )}
                    </div>

                    {/* Pickup Address */}
                    <div>
                      <h3 className="text-lg font-semibold text-[#124734]">
                        Pickup Address
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <input
                          value={form.pickupAddress.addressLine1}
                          onChange={(e) =>
                            updatePickup("addressLine1", e.target.value)
                          }
                          placeholder="Address Line 1 *"
                          className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#124734]/30 md:col-span-2"
                        />
                        <input
                          value={form.pickupAddress.addressLine2}
                          onChange={(e) =>
                            updatePickup("addressLine2", e.target.value)
                          }
                          placeholder="Address Line 2 (optional)"
                          className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#124734]/30 md:col-span-2"
                        />
                        <input
                          value={form.pickupAddress.city}
                          onChange={(e) => updatePickup("city", e.target.value)}
                          placeholder="City *"
                          className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#124734]/30"
                        />
                        <input
                          value={form.pickupAddress.state}
                          onChange={(e) =>
                            updatePickup("state", e.target.value)
                          }
                          placeholder="State *"
                          className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#124734]/30"
                        />
                        <input
                          value={form.pickupAddress.pincode}
                          onChange={(e) =>
                            updatePickup("pincode", e.target.value)
                          }
                          placeholder="Pincode *"
                          className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#124734]/30"
                        />
                        <input
                          value={form.pickupAddress.country}
                          onChange={(e) =>
                            updatePickup("country", e.target.value)
                          }
                          placeholder="Country"
                          className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#124734]/30"
                        />
                      </div>
                    </div>

                    {/* KYC */}
                    <div>
                      <h3 className="text-lg font-semibold text-[#124734]">
                        KYC Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <input
                          value={form.kyc.gstin}
                          onChange={(e) => updateKyc("gstin", e.target.value)}
                          placeholder="GSTIN (optional)"
                          className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#124734]/30"
                        />
                        <input
                          value={form.kyc.pan}
                          onChange={(e) => updateKyc("pan", e.target.value)}
                          placeholder="PAN * "
                          className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#124734]/30"
                        />
                      </div>
                    </div>

                    {/* Bank (optional) */}
                    <div>
                      <h3 className="text-lg font-semibold text-[#124734]">
                        Bank Details (Optional for now)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <input
                          value={form.bank.accountHolderName}
                          onChange={(e) =>
                            updateBank("accountHolderName", e.target.value)
                          }
                          placeholder="Account Holder Name"
                          className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#124734]/30"
                        />
                        <input
                          value={form.bank.accountNumber}
                          onChange={(e) =>
                            updateBank("accountNumber", e.target.value)
                          }
                          placeholder="Account Number"
                          className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#124734]/30"
                        />
                        <input
                          value={form.bank.ifsc}
                          onChange={(e) => updateBank("ifsc", e.target.value)}
                          placeholder="IFSC"
                          className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#124734]/30"
                        />
                        <input
                          value={form.bank.bankName}
                          onChange={(e) =>
                            updateBank("bankName", e.target.value)
                          }
                          placeholder="Bank Name"
                          className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#124734]/30"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 flex-wrap">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-3 rounded-xl bg-[#124734] text-white font-bold hover:opacity-90 disabled:opacity-60"
                      >
                        {submitting ? "Submitting..." : "Submit Application"}
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate("/ecommerce-home")}
                        className="px-6 py-3 rounded-xl border border-[#124734] text-[#124734] font-bold hover:bg-[#124734]/10"
                      >
                        Back to Home
                      </button>
                    </div>

                    <p className="text-sm text-gray-500">
                      Note: Approval is done by Admin. After approval, your role
                      becomes <b>supplier</b> and supplier dashboard unlocks.
                    </p>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default SupplierApply;
