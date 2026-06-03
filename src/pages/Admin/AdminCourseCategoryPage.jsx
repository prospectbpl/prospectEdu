import React, { useMemo, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/Admin/Layout/AdminSidebar";
import AdminTopbar from "../../components/Admin/Layout/AdminTopbar";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { categoriesApi } from "../../services/categories";

export default function AdminCourseCategoryPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const sidebarWidth = isCollapsed ? 80 : 256;

  const canonicalUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    return origin && pathname ? `${origin}${pathname}` : "";
  }, []);

  const pageTitle = "Course Categories | ProspectEdu Admin";
  const pageDescription =
    "Create, edit, and delete course categories in ProspectEdu Admin.";

  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesApi.list();
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setInputValue("");
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setInputValue(cat.name);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!inputValue.trim()) return;

    try {
      if (editingCategory) {
        const res = await categoriesApi.update(editingCategory._id, inputValue.trim());
        setCategories(categories.map((c) => (c._id === editingCategory._id ? res.data.category : c)));
      } else {
        const res = await categoriesApi.create(inputValue.trim());
        setCategories([...categories, res.data.category]);
      }

      setModalOpen(false);
      setEditingCategory(null);
      setInputValue("");
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const handleDelete = async () => {
    try {
      await categoriesApi.remove(editingCategory._id);
      const res = await categoriesApi.list();
      setCategories(res.data.categories || []);
      setDeleteOpen(false);
      setEditingCategory(null);
    } catch (err) {
      console.error("Delete failed", err);
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

      <h1 className="sr-only">Course Categories</h1>

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
        style={{ marginLeft: sidebarWidth, width: `calc(100vw - ${sidebarWidth}px)` }}
        aria-label="Course categories admin page"
      >
        {/* TOPBAR */}
        <div
          className="fixed top-0 bg-white shadow-sm h-[64px] flex items-center z-[999]"
          style={{ left: sidebarWidth, right: 0 }}
        >
          <AdminTopbar pageTitle="Course Categories" />
        </div>

        {/* CONTENT */}
        <div className="px-6 pt-[90px] pb-10 overflow-y-auto">
          <div className="w-full flex flex-col items-start">
            <div className="text-gray-600 text-sm mb-6">
              <span
                className="cursor-pointer hover:text-[#124734]"
                onClick={() => navigate("/admin-dashboard")}
              >
                Dashboard
              </span>
              {" / "}
              <span className="text-[#124734] font-semibold">Course Categories</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[#124734]">Manage Categories</h2>
              <button
                onClick={openAddModal}
                className="bg-[#124734] text-white px-4 py-2 rounded-md hover:bg-[#0E3A2B]"
              >
                + Add Category
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {categories.map((cat) => (
                <div
                  key={cat._id}
                  className="flex items-center px-5 py-3 bg-[#ECF5EE] rounded-lg"
                >
                  <span className="text-base font-medium text-[#124734]">{cat.name}</span>

                  <div className="flex items-center gap-6 ml-auto">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="text-sm text-green-600 hover:underline"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setDeleteOpen(true);
                      }}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ADD / EDIT MODAL */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9999]" role="dialog" aria-modal="true">
            <div className="bg-white w-full max-w-sm rounded-xl p-6 shadow">
              <h3 className="text-lg font-semibold text-[#124734] mb-4">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h3>

              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Category name"
                className="w-full border p-2 rounded mb-4"
                autoFocus
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-[#124734] text-white rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRM */}
        <ConfirmDialog
          open={deleteOpen}
          title="Delete Category?"
          message="This category will be permanently removed."
          onConfirm={handleDelete}
          onCancel={() => setDeleteOpen(false)}
        />
      </main>
    </div>
  );
}
