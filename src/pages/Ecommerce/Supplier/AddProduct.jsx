import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import SupplierSidebar from "../../../components/SupplierEcommerce/Sidebar";
import SupplierTopbar from "../../../components/SupplierEcommerce/Topbar";
import { api } from "../../../lib/api";

export default function AddProduct() {
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
          name: "Add Product",
          item: canonicalUrl,
        },
      ],
    }),
    [canonicalUrl]
  );

  const [isCollapsed, setIsCollapsed] = useState(false);

  // ✅ store selected files (max 4)
  const [imageFiles, setImageFiles] = useState([null, null, null, null]);
  // ✅ for preview only
  const [previews, setPreviews] = useState([null, null, null, null]);

  // ✅ supplier categories from backend
  const [supplierCategories, setSupplierCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);

  // ✅ form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    offerPrice: "",
    quantity: "",
  });

  // ✅ engineering subcategory
  const [subCategory, setSubCategory] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const ENGINEERING_PARENT = "Engineering Books";
  const ENGINEERING_SUBCATS = ["IT Books", "Electrical Books", "Civil Books"];

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

  const loadSupplierCategories = async () => {
    setLoadingCats(true);
    setError("");
    try {
      const res = await api.get("/categories");
      const items = res?.data?.categories || [];
      const names = items.map((c) => c.name);
      setSupplierCategories(names);
    } catch (e) {
      setSupplierCategories([]);
      setError(e?.response?.data?.message || "Failed to load categories");
    } finally {
      setLoadingCats(false);
    }
  };

  useEffect(() => {
    loadSupplierCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChangeCategory = (value) => {
    setForm((p) => ({ ...p, category: value }));
    if (value !== ENGINEERING_PARENT) setSubCategory("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim()) return setError("Product name required");
    if (!form.category.trim()) return setError("Please select a category");

    if (form.category === ENGINEERING_PARENT && !subCategory.trim()) {
      return setError("Please select Engineering sub-category");
    }

    if (form.price === "" || Number(form.price) < 0) return setError("Invalid price");
    if (form.offerPrice === "" || Number(form.offerPrice) < 0)
      return setError("Invalid offer price");
    if (form.quantity === "" || Number(form.quantity) < 0) return setError("Invalid quantity");

    const finalCategory =
      form.category === ENGINEERING_PARENT ? subCategory : form.category;

    const chosenFiles = imageFiles.filter(Boolean);
    if (chosenFiles.length === 0) {
      return setError("Please upload at least 1 product image");
    }
    if (chosenFiles.length > 4) {
      return setError("Max 4 images allowed");
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("description", form.description.trim());
      fd.append("category", finalCategory);
      fd.append("price", String(form.price));
      fd.append("offerPrice", String(form.offerPrice));
      fd.append("quantity", String(form.quantity));

      chosenFiles.forEach((file) => fd.append("images", file));

      await api.post("/products", fd, {
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
      setSubCategory("");
      setImageFiles([null, null, null, null]);
      setPreviews([null, null, null, null]);
    } catch (e2) {
      setError(e2?.response?.data?.message || "Failed to add product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex bg-[#F9FAFB] min-h-screen text-left">
      <Helmet>
        <title>Add Product | Supplier Dashboard | ProspectEdu</title>
        <meta
          name="description"
          content="Add a new product to your ProspectEdu supplier store with images/dashboard controls."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      {/* SIDEBAR */}
      <SupplierSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">
        {/* TOPBAR */}
        <SupplierTopbar pageTitle="Add Product" />

        {/* PAGE CONTENT */}
        <div className="p-8">
          <h1 className="text-3xl font-bold text-[#124734] mb-6">Add New Product</h1>

          <div className="bg-white shadow-lg rounded-xl p-8 border border-[#A7E1B2]/60 max-w-3xl">
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

            <form className="space-y-6" onSubmit={onSubmit}>
              {/* PRODUCT IMAGES */}
              <div>
                <p className="text-base font-semibold text-[#124734] ">Product Images</p>

                <div className="flex flex-wrap items-center gap-3 mt-3">
                  {previews.map((img, index) => (
                    <label key={index} htmlFor={`image${index}`}>
                      <input
                        type="file"
                        accept="image/*"
                        id={`image${index}`}
                        hidden
                        onChange={(e) => handleImageChange(e, index)}
                      />

                      <img
                        src={
                          img ||
                          "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/e-commerce/uploadArea.png"
                        }
                        alt={
                          img
                            ? `Selected product image ${index + 1}`
                            : `Upload product image slot ${index + 1}`
                        }
                        width={100}
                        height={100}
                        loading="lazy"
                        decoding="async"
                        className="cursor-pointer rounded-lg hover:scale-105 transition shadow"
                      />
                    </label>
                  ))}
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Upload up to 4 images. Images will be uploaded to Cloudinary and URLs saved in DB.
                </p>
              </div>

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
                  onChange={(e) => onChangeCategory(e.target.value)}
                  disabled={loadingCats}
                  required
                >
                  <option value="">
                    {loadingCats ? "Loading Categories..." : "Select Category"}
                  </option>

                  {supplierCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Engineering Subcategory dropdown */}
              {form.category === ENGINEERING_PARENT ? (
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium">Engineering Sub-Category</label>
                  <select
                    className="outline-none py-2.5 px-3 rounded-lg border border-gray-300 focus:border-[#124734]"
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    required
                  >
                    <option value="">Select Sub-Category</option>
                    {ENGINEERING_SUBCATS.map((sc) => (
                      <option key={sc} value={sc}>
                        {sc}
                      </option>
                    ))}
                  </select>

                  <p className="text-xs text-gray-500 mt-1">
                    Note: Shop page me product <b>Engineering Books</b> ke naam se nahi dikhega,
                    balki sub-category (IT/Electrical/Civil) me dikhega.
                  </p>
                </div>
              ) : null}

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
      </div>
    </div>
  );
}
