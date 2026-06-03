import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import SupplierSidebar from "../../../components/SupplierEcommerce/Sidebar";
import SupplierTopbar from "../../../components/SupplierEcommerce/Topbar";
import { api } from "../../../lib/api";
import { FiSave, FiLock } from "react-icons/fi";

export default function EditProfile() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ SEO: canonical URL (safe)
  const canonicalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${location.pathname}`
      : location.pathname;

  // ✅ SEO: breadcrumb schema (dashboard/private)
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
          name: "Edit Profile",
          item: canonicalUrl,
        },
      ],
    }),
    [canonicalUrl]
  );

  const [isCollapsed, setIsCollapsed] = useState(false);

  const user = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [supplier, setSupplier] = useState(null);

  // ✅ NEW: multiple custom categories
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [customCategories, setCustomCategories] = useState([]); // array of strings

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

    bank: {
      accountHolderName: "",
      accountNumber: "",
      ifsc: "",
      bankName: "",
    },
  });

  const [categoryOptions, setCategoryOptions] = useState(["Others"]);

  const updateForm = (key, value) => setForm((p) => ({ ...p, [key]: value }));
  const updatePickup = (key, value) =>
    setForm((p) => ({
      ...p,
      pickupAddress: { ...p.pickupAddress, [key]: value },
    }));
  const updateBank = (key, value) =>
    setForm((p) => ({ ...p, bank: { ...p.bank, [key]: value } }));

  const toggleCategory = (cat) => {
    setForm((p) => {
      const exists = p.categories.includes(cat);
      const nextCategories = exists
        ? p.categories.filter((c) => c !== cat)
        : [...p.categories, cat];

      // ✅ if Others removed => clear custom categories
      if (!nextCategories.includes("Others")) {
        setCustomCategoryInput("");
        setCustomCategories([]);
      }

      return {
        ...p,
        categories: nextCategories,
      };
    });
  };

  const addCustomCategory = () => {
    const val = customCategoryInput.trim();
    if (!val) return;

    // prevent duplicates (case-insensitive)
    const lower = val.toLowerCase();
    const existsInCustom = customCategories.some(
      (c) => c.toLowerCase() === lower
    );
    const existsInFixed = categoryOptions
      .filter((c) => c !== "Others")
      .some((c) => c.toLowerCase() === lower);

    if (existsInCustom || existsInFixed) {
      setCustomCategoryInput("");
      return;
    }

    setCustomCategories((prev) => [...prev, val]);
    setCustomCategoryInput("");
  };

  const removeCustomCategory = (cat) => {
    setCustomCategories((prev) => prev.filter((c) => c !== cat));
  };

  useEffect(() => {
    let mounted = true;

    const loadAdminCategories = async () => {
      try {
        const res = await api.get("/categories");
        const items = res?.data?.categories || [];
        const names = items.map((c) => c.name).filter(Boolean);

        const next = [...names, "Others"]; // keep Others
        if (!mounted) return;

        setCategoryOptions(next);
      } catch {
        if (!mounted) return;
        setCategoryOptions(["Others"]);
      }
    };

    loadAdminCategories();

    return () => {
      mounted = false;
    };
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/suppliers/me");
      const data = res.data;

      if (!data?.exists) {
        navigate("/supplier/apply");
        return;
      }

      setSupplier(data);

      // ✅ Map categories from DB:
      // Known categories => buttons
      // Unknown categories => customCategories, and auto-select "Others"
      const knownSet = new Set(
        (categoryOptions || []).filter((c) => c !== "Others")
      );
      const dbCats = data.categories || [];

      const knownCats = dbCats.filter((c) => knownSet.has(c));
      const unknownCats = dbCats.filter((c) => !knownSet.has(c));

      setCustomCategories(unknownCats);
      setCustomCategoryInput("");

      setForm({
        shopName: data.shopName || "",
        ownerName: data.ownerName || "",
        phone: data.phone || "",
        email: data.email || "",
        categories: unknownCats.length ? [...knownCats, "Others"] : knownCats,

        pickupAddress: {
          addressLine1: data.pickupAddress?.addressLine1 || "",
          addressLine2: data.pickupAddress?.addressLine2 || "",
          city: data.pickupAddress?.city || "",
          state: data.pickupAddress?.state || "",
          pincode: data.pickupAddress?.pincode || "",
          country: data.pickupAddress?.country || "India",
        },

        bank: {
          accountHolderName: data.bank?.accountHolderName || "",
          accountNumber: data.bank?.accountNumber || "",
          ifsc: data.bank?.ifsc || "",
          bankName: data.bank?.bankName || "",
        },
      });
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) navigate("/login");
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validate = () => {
    if (!form.shopName.trim()) return "Shop/Business name required";
    if (!form.ownerName.trim()) return "Owner name required";
    if (!form.phone.trim()) return "Phone required";
    if (!form.email.trim()) return "Email required";
    if (!form.categories.length) return "Select at least one category";

    // ✅ if Others selected => at least 1 custom category required
    if (form.categories.includes("Others") && customCategories.length === 0) {
      return "Please add at least one custom category under 'Others'";
    }

    if (!form.pickupAddress.addressLine1.trim()) return "Pickup Address required";
    if (!form.pickupAddress.city.trim()) return "City required";
    if (!form.pickupAddress.state.trim()) return "State required";
    if (!form.pickupAddress.pincode.trim()) return "Pincode required";
    return "";
  };

  const onSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const msg = validate();
    if (msg) return setError(msg);

    setSaving(true);
    try {
      // ✅ final categories to store in DB:
      // remove "Others" and include customCategories
      const finalCategories = form.categories.includes("Others")
        ? [
            ...form.categories.filter((c) => c !== "Others"),
            ...customCategories.map((c) => c.trim()).filter(Boolean),
          ]
        : form.categories;

      const payload = {
        shopName: form.shopName.trim(),
        ownerName: form.ownerName.trim(),
        phone: form.phone.trim(),
        categories: finalCategories,

        pickupAddress: {
          addressLine1: form.pickupAddress.addressLine1.trim(),
          addressLine2: form.pickupAddress.addressLine2.trim(),
          city: form.pickupAddress.city.trim(),
          state: form.pickupAddress.state.trim(),
          pincode: form.pickupAddress.pincode.trim(),
          country: form.pickupAddress.country.trim() || "India",
        },

        bank: {
          accountHolderName: form.bank.accountHolderName.trim(),
          accountNumber: form.bank.accountNumber.trim(),
          ifsc: form.bank.ifsc.trim(),
          bankName: form.bank.bankName.trim(),
        },
      };

      await api.patch("/suppliers/me", payload);

      setSuccess("Profile updated successfully ✅");
      await loadProfile();
    } catch (e2) {
      setError(e2?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex bg-[#F9FAFB] min-h-screen text-left">
      {/* ✅ SEO (NO layout impact) */}
      <Helmet>
        <title>Edit Supplier Profile | ProspectEdu</title>
        <meta
          name="description"
          content="Update your supplier profile, pickup address, categories and bank details on ProspectEdu."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbJsonLd)}
        </script>
      </Helmet>

      <SupplierSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 
          ${isCollapsed ? "ml-20" : "ml-64"} 
          md:ml-0
        `}
      >
        <SupplierTopbar pageTitle="Edit Profile" />

        <div className="p-4 md:p-8 w-full">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white border border-[#A7E1B2]/40 rounded-2xl shadow-md overflow-hidden">
              <div className="px-6 md:px-8 py-6 bg-gradient-to-r from-[#A7E1B2] to-[#A7E1B2]/40 border-b border-[#A7E1B2]/40">
                <h1 className="text-2xl md:text-3xl font-bold text-[#124734]">
                  Supplier Profile
                </h1>
                <p className="text-gray-600 mt-1">
                  You can edit safe details. PAN/GSTIN are locked for security.
                </p>
              </div>

              <div className="px-6 md:px-8 py-6">
                {loading ? (
                  <div className="p-4 rounded-xl bg-white border">Loading...</div>
                ) : (
                  <>
                    {error ? (
                      <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
                        {error}
                      </div>
                    ) : null}

                    {success ? (
                      <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800">
                        {success}
                      </div>
                    ) : null}

                    {/* Locked Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      <div className="border rounded-2xl p-4 bg-[#F9FAFB]">
                        <p className="text-sm font-semibold text-[#124734] flex items-center gap-2">
                          <FiLock /> PAN (Locked)
                        </p>
                        <p className="mt-2 text-gray-700">
                          {supplier?.kyc?.pan || "—"}
                        </p>
                      </div>

                      <div className="border rounded-2xl p-4 bg-[#F9FAFB]">
                        <p className="text-sm font-semibold text-[#124734] flex items-center gap-2">
                          <FiLock /> GSTIN (Locked)
                        </p>
                        <p className="mt-2 text-gray-700">
                          {supplier?.kyc?.gstin || "—"}
                        </p>
                      </div>
                    </div>

                    <form onSubmit={onSave} className="space-y-8">
                      {/* Basic */}
                      <div>
                        <h2 className="text-lg font-semibold text-[#124734]">
                          Basic Info
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                          <input
                            value={form.shopName}
                            onChange={(e) => updateForm("shopName", e.target.value)}
                            placeholder="Shop/Business Name *"
                            className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#124734]/30"
                          />
                          <input
                            value={form.ownerName}
                            onChange={(e) => updateForm("ownerName", e.target.value)}
                            placeholder="Owner Name *"
                            className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#124734]/30"
                          />
                          <input
                            value={form.phone}
                            onChange={(e) => updateForm("phone", e.target.value)}
                            placeholder="Phone *"
                            className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#124734]/30"
                          />
                          <div>
                            <label className="text-sm font-semibold text-[#124734]">
                              Email (Locked)
                            </label>

                            <div className="relative mt-1">
                              <input
                                value={form.email}
                                disabled
                                readOnly
                                className="border rounded-xl px-4 py-3 pr-10 bg-gray-100 text-gray-600 cursor-not-allowed w-full"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                🔒
                              </span>
                            </div>

                            <p className="text-xs text-gray-500 mt-1">
                              Email cannot be changed. Contact admin if required.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Categories */}
                      <div>
                        <h2 className="text-lg font-semibold text-[#124734]">
                          Categories you sell *
                        </h2>
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

                        {/* ✅ Others area: input + add + chips */}
                        {form.categories.includes("Others") ? (
                          <div className="mt-4">
                            <div className="flex flex-col md:flex-row gap-3">
                              <input
                                value={customCategoryInput}
                                onChange={(e) => setCustomCategoryInput(e.target.value)}
                                placeholder="Enter custom category (e.g. Competitive Books)"
                                className="border rounded-xl px-4 py-3 w-full outline-none focus:ring-2 focus:ring-[#124734]/30"
                              />
                              <button
                                type="button"
                                onClick={addCustomCategory}
                                className="px-6 py-3 rounded-xl bg-[#124734] text-white font-bold hover:opacity-90"
                              >
                                Add
                              </button>
                            </div>

                            {customCategories.length ? (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {customCategories.map((c) => (
                                  <span
                                    key={c}
                                    className="px-3 py-2 rounded-xl border border-[#124734] text-[#124734] bg-white font-semibold flex items-center gap-2"
                                  >
                                    {c}
                                    <button
                                      type="button"
                                      onClick={() => removeCustomCategory(c)}
                                      className="text-[#124734] font-bold hover:opacity-70"
                                      title="Remove"
                                    >
                                      ✕
                                    </button>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500 mt-2">
                                Add at least one custom category under “Others”.
                              </p>
                            )}
                          </div>
                        ) : null}
                      </div>

                      {/* Pickup Address */}
                      <div>
                        <h2 className="text-lg font-semibold text-[#124734]">
                          Pickup Address
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                          <input
                            value={form.pickupAddress.addressLine1}
                            onChange={(e) => updatePickup("addressLine1", e.target.value)}
                            placeholder="Address Line 1 *"
                            className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#124734]/30 md:col-span-2"
                          />
                          <input
                            value={form.pickupAddress.addressLine2}
                            onChange={(e) => updatePickup("addressLine2", e.target.value)}
                            placeholder="Address Line 2"
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
                            onChange={(e) => updatePickup("state", e.target.value)}
                            placeholder="State *"
                            className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#124734]/30"
                          />
                          <input
                            value={form.pickupAddress.pincode}
                            onChange={(e) => updatePickup("pincode", e.target.value)}
                            placeholder="Pincode *"
                            className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#124734]/30"
                          />
                          <input
                            value={form.pickupAddress.country}
                            onChange={(e) => updatePickup("country", e.target.value)}
                            placeholder="Country"
                            className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#124734]/30"
                          />
                        </div>
                      </div>

                      {/* Bank */}
                      <div>
                        <h2 className="text-lg font-semibold text-[#124734]">
                          Bank Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                          <input
                            value={form.bank.accountHolderName}
                            onChange={(e) => updateBank("accountHolderName", e.target.value)}
                            placeholder="Account Holder Name"
                            className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#124734]/30"
                          />
                          <input
                            value={form.bank.accountNumber}
                            onChange={(e) => updateBank("accountNumber", e.target.value)}
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
                            onChange={(e) => updateBank("bankName", e.target.value)}
                            placeholder="Bank Name"
                            className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#124734]/30"
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-6 py-3 rounded-xl bg-[#124734] text-white font-bold hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
                        >
                          <FiSave />
                          {saving ? "Saving..." : "Save Changes"}
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate("/supplier")}
                          className="px-6 py-3 rounded-xl border border-[#124734] text-[#124734] font-bold hover:bg-[#124734]/10"
                        >
                          Back
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center mt-6">
              PAN/GSTIN are locked to prevent compliance issues. Contact admin if you need changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
