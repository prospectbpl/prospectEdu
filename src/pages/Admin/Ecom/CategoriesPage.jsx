import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import AdminSidebar from "../../../components/Admin/Layout/AdminSidebar";
import AdminTopbar from "../../../components/Admin/Layout/AdminTopbar";

import CategoryHeader from "../../../components/Admin/Ecom/Categories/CategoryHeader";
import Breadcrumb from "../../../components/Breadcrumb";
import CategorySlider from "../../../components/Admin/Ecom/Categories/CategorySlider";
import CategoryTabs from "../../../components/Admin/Ecom/Categories/CategoryTabs";
import ProductTable from "../../../components/Admin/Ecom/Categories/ProductTable";
import Pagination from "../../../components/Admin/Ecom/Pagination";

import AddCategoryModal from "../../../components/Admin/Ecom/Categories/AddCategoryModal";
import EditCategoryModal from "../../../components/Admin/Ecom/Categories/EditCategoryModal";

import {
  fetchCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from "../../../lib/categoryApi";

export default function CategoriesPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("All Product ");
  const [page, setPage] = useState(1);

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);

  // Modal states
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);

  const sidebarWidth = isCollapsed ? 80 : 256;

  const pageTitle = "E-Commerce Categories | ProspectEdu Admin";
  const pageDescription =
    "Manage e-commerce categories, supplier products, and category settings in ProspectEdu Admin.";

  const canonicalUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    return origin && pathname ? `${origin}${pathname}` : "";
  }, []);

  const loadCats = async () => {
    setLoadingCats(true);
    try {
      const items = await fetchCategories();
      // map backend => UI shape used in slider/modal
      const mapped = items.map((c) => ({
        id: c._id,
        title: c.name,
        img: c.imageUrl,
      }));
      setCategories(mapped);
    } catch (e) {
      setCategories([]);
    } finally {
      setLoadingCats(false);
    }
  };

  useEffect(() => {
    loadCats();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] overflow-hidden">
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

      {/* Hidden H1 for SEO/accessibility (no layout change) */}
      <h1 className="sr-only">E-Commerce Categories</h1>

      <div
        className={`fixed top-0 left-0 h-full z-40 transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      <main
        className="flex flex-col flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
        aria-label="E-commerce categories page"
      >
        <div
          className="fixed top-0 bg-white shadow-sm h-[64px] flex items-center z-[999]"
          style={{ left: sidebarWidth, right: 0 }}
        >
          <AdminTopbar pageTitle="E-Commerce Categories" />
        </div>
        

        <div className="px-6 pt-[90px] pb-10 overflow-y-auto h-[calc(100vh-64px)]">
          <div className="ml=-3"> 
           <Breadcrumb
        items={[
          { label: "Dashboard", to: "/admin-dashboard" },
          { label: "Categories" },
        ]}
      />
        </div>
          {/* Header */}
          <section aria-label="Category actions and overview">
            <CategoryHeader
              onAddCategory={() => setOpenAddModal(true)}
              onEditCategory={() => setOpenEditModal(true)}
            />
          </section>

          <section aria-label="Category slider">
            <CategorySlider categories={categories} />
          </section>

          <p className="text-2xl font-bold text-left">Supplier Products</p>

          <section aria-label="Category tabs and product table">
            <CategoryTabs active={activeTab} setActive={setActiveTab} />
            <ProductTable activeTab={activeTab} />
          </section>

          <nav aria-label="Pagination">
            <Pagination page={page} setPage={setPage} totalPages={24} />
          </nav>

          {loadingCats ? (
            <div className="text-sm text-gray-500 mt-4" aria-live="polite">
              Loading categories...
            </div>
          ) : null}
        </div>
      </main>

      {/* Add Modal */}
      <AddCategoryModal
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onSave={async ({ name, imageFile }) => {
          await adminCreateCategory({ name, imageFile });
          setOpenAddModal(false);
          loadCats();
        }}
      />

      {/* Edit Modal */}
      <EditCategoryModal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        categories={categories}
        onSave={async ({ id, name, imageFile }) => {
          await adminUpdateCategory(id, { name, imageFile });
          setOpenEditModal(false);
          loadCats();
        }}
        onDelete={async ({ id }) => {
          await adminDeleteCategory(id);
          setOpenEditModal(false);
          loadCats();
        }}
      />
    </div>
  );
}
