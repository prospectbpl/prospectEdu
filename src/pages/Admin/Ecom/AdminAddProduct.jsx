// src/pages/Admin/Ecom/AddProduct.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import AdminSidebar from "../../../components/Admin/Layout/AdminSidebar";
import AdminTopbar from "../../../components/Admin/Layout/AdminTopbar";
import Breadcrumb from "../../../components/Breadcrumb";
import { api } from "../../../lib/api";

export default function AdminAddProduct() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // ✅ store selected files (max 4)
  const [imageFiles, setImageFiles] = useState([null, null, null, null]);
  // ✅ for preview only
  const [previews, setPreviews] = useState([null, null, null, null]);

  // ✅ admin predefined categories from backend
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    offerPrice: "",
    quantity: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const pageTitle = "Add Product | ProspectEdu Admin";
  const pageDescription =
    "Add a new e-commerce product with images, category, price, offer price, and quantity in ProspectEdu Admin.";

  const canonicalUrl = useMemo(() => {
    // Works in dev + prod (no hardcoding)
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const pathname =
      typeof window !== "undefined" ? window.location.pathname : "";
    return origin && pathname ? `${origin}${pathname}` : "";
  }, []);

  const handleImageChange = (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFiles((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });

    const url = URL.createObjectURL(file);
    setPreviews((prev) => {
      const next = [...prev];
      next[index] = url;
      return next;
    });
  };

  const loadCategories = async () => {
    setLoadingCats(true);
    setError("");
    try {
      const res = await api.get("/categories");
      const items = res?.data?.categories || [];
      setCategories(items.map((c) => c.name));
    } catch (e) {
      setCategories([]);
      setError(e?.response?.data?.message || "Failed to load categories");
    } finally {
      setLoadingCats(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim()) return setError("Product name required");
    if (!form.category.trim()) return setError("Please select a category");
    if (form.price === "" || Number(form.price) < 0) return setError("Invalid price");
    if (form.offerPrice === "" || Number(form.offerPrice) < 0) return setError("Invalid offer price");
    if (form.quantity === "" || Number(form.quantity) < 0) return setError("Invalid quantity");

    const chosenFiles = imageFiles.filter(Boolean);
    if (chosenFiles.length === 0) return setError("Please upload at least 1 product image");
    if (chosenFiles.length > 4) return setError("Max 4 images allowed");

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("description", form.description.trim());
      fd.append("category", form.category.trim());
      fd.append("price", String(form.price));
      fd.append("offerPrice", String(form.offerPrice));
      fd.append("quantity", String(form.quantity));

      chosenFiles.forEach((file) => fd.append("images", file));

      // ✅ admin endpoint
      await api.post("/products/admin", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Product added successfully ✅");

      setForm({
        name: "",
        description: "",
        category: "",
        price: "",
        offerPrice: "",
        quantity: "",
      });
      setImageFiles([null, null, null, null]);
      setPreviews([null, null, null, null]);
    } catch (e2) {
      setError(e2?.response?.data?.message || "Failed to add product");
    } finally {
      setSaving(false);
    }
  };

  // compute sidebar width to push main content
  const sidebarWidth = isCollapsed ? 80 : 256;

  return (
    <div className="bg-[#F9FAFB] min-h-screen">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}

        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
        <meta property="og:type" content="website" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Helmet>

      {/* Hidden H1 for SEO/accessibility (no layout change) */}
      <h1 className="sr-only">Add Product</h1>

      {/* FIXED SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-screen bg-[#124734] transition-all duration-300 z-40 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* MAIN AREA */}
      <main
        className="flex-1 flex flex-col"
        style={{ marginLeft: sidebarWidth, minHeight: "100vh" }}
        aria-label="Add product page"
      >
        {/* TOPBAR (fixed) */}
        <div className="fixed top-0 right-0 left-0 z-30" style={{ left: sidebarWidth }}>
          <AdminTopbar pageTitle="Add Product" isCollapsed={isCollapsed} />
        </div>
        

        {/* PAGE CONTENT */}
        <div className="pt-[80px] p-8 pb-16" style={{ minHeight: "calc(100vh - 80px)" }}>
          <Breadcrumb
        items={[
          { label: "Dashboard", to: "/admin-dashboard" },
          { label: "Add Product" },
        ]}
      />
          <div className="bg-white shadow-lg rounded-xl p-8 border border-[#A7E1B2]/60 max-w-3xl">
            {error ? (
              <div
                className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            ) : null}

            {success ? (
              <div
                className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800"
                role="status"
                aria-live="polite"
              >
                {success}
              </div>
            ) : null}

            <form className="space-y-6" onSubmit={onSubmit}>
              {/* PRODUCT IMAGES */}
              <section aria-label="Product images">
                <p className="text-base font-semibold text-[#124734]">Product Images</p>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  {previews.map((img, index) => (
                    <label key={index} htmlFor={`image${index}`}>
                      <input
                        type="file"
                        accept="image/*"
                        id={`image${index}`}
                        hidden
                        onChange={(e) => handleImageChange(e, index)}
                        aria-label={`Upload product image ${index + 1}`}
                      />
                      <img
                        src={
                          img ||
                          "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/e-commerce/uploadArea.png"
                        }
                        alt={img ? `Selected product image ${index + 1}` : `Upload area for product image ${index + 1}`}
                        width={100}
                        height={100}
                        loading="lazy"
                        className="cursor-pointer rounded-lg hover:scale-105 transition shadow"
                      />
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Upload up to 4 images. Images will be uploaded to Cloudinary and URLs saved in DB.
                </p>
              </section>

              {/* PRODUCT NAME */}
              <div className="flex flex-col gap-1">
                <label className="text-base font-medium">Product Name</label>
                <input
                  type="text"
                  placeholder="Enter product name"
                  className="outline-none py-2.5 px-3 rounded-lg border border-gray-300 focus:border-[#124734]"
                  required
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />
              </div>

              {/* PRODUCT DESCRIPTION */}
              <div className="flex flex-col gap-1">
                <label className="text-base font-medium">Description</label>
                <textarea
                  rows={4}
                  placeholder="Enter product description"
                  className="outline-none py-2.5 px-3 rounded-lg border border-gray-300 resize-none focus:border-[#124734]"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                ></textarea>
              </div>

              {/* CATEGORY */}
              <div className="flex flex-col gap-1">
                <label className="text-base font-medium">Category</label>
                <select
                  className="outline-none py-2.5 px-3 rounded-lg border border-gray-300 focus:border-[#124734]"
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  disabled={loadingCats}
                  required
                >
                  <option value="">{loadingCats ? "Loading Categories..." : "Select Category"}</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* PRICING SECTION */}
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
                  <label className="text-base font-medium">Product Price</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="outline-none py-2.5 px-3 rounded-lg border border-gray-300 focus:border-[#124734]"
                    required
                    value={form.price}
                    onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                  />
                </div>

                <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
                  <label className="text-base font-medium">Offer Price</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="outline-none py-2.5 px-3 rounded-lg border border-gray-300 focus:border-[#124734]"
                    required
                    value={form.offerPrice}
                    onChange={(e) => setForm((p) => ({ ...p, offerPrice: e.target.value }))}
                  />
                </div>

                <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
                  <label className="text-base font-medium">Quantity (Pieces)</label>
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    className="outline-none py-2.5 px-3 rounded-lg border border-gray-300 focus:border-[#124734]"
                    required
                    value={form.quantity}
                    onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-10 py-3 bg-[#124734] text-white rounded-lg font-semibold shadow hover:bg-[#0f3a23] transition disabled:opacity-60"
              >
                {saving ? "ADDING..." : "ADD PRODUCT"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
