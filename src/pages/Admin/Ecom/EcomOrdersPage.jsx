import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import AdminSidebar from "../../../components/Admin/Layout/AdminSidebar";
import AdminTopbar from "../../../components/Admin/Layout/AdminTopbar";
import OrderStats from "../../../components/Admin/Ecom/OrderStats";
import OrderTabs from "../../../components/Admin/Ecom/OrderTabs";
import Breadcrumb from "../../../components/Breadcrumb";
import OrderTable from "../../../components/Admin/Ecom/OrderTable";
import Pagination from "../../../components/Admin/Ecom/Pagination";

export default function EcomOrdersPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const sidebarWidth = isCollapsed ? 80 : 256;
  const [page, setPage] = useState(1);
  const totalPages = 24;

  // ⭐ moved active tab state here
  const [activeTab, setActiveTab] = useState("All Orders");

  const pageTitle = "E-Commerce Orders | ProspectEdu Admin";
  const pageDescription =
    "Manage e-commerce orders, filter by status, and review order details in ProspectEdu Admin.";

  const canonicalUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname =
      typeof window !== "undefined" ? window.location.pathname : "";
    return origin && pathname ? `${origin}${pathname}` : "";
  }, []);

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
      <h1 className="sr-only">E-Commerce Orders</h1>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full z-40 transition-all duration-300
        ${isCollapsed ? "w-20" : "w-64"}`}
      >
        <AdminSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      </div>

      {/* Main */}
      <main
        className="flex flex-col flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
        aria-label="E-commerce orders admin page"
      >
        <div
          className="fixed top-0 bg-white shadow-sm h-[64px] flex items-center z-[999]"
          style={{ left: sidebarWidth, right: 0 }}
        >
          <AdminTopbar pageTitle="E-Commerce Orders" />
        </div>

        <div className="px-6 pt-[90px] pb-10 overflow-y-auto">
          <div className="ml=-3"> 
           <Breadcrumb
        items={[
          { label: "Dashboard", to: "/admin-dashboard" },
          { label: "All Orders" },
        ]}
      />
        </div>
        

          <section aria-label="Order filters and search">
            <OrderTabs
              active={activeTab}
              setActive={setActiveTab}
              search={search}
              setSearch={setSearch}
            />
          </section>

          <section aria-label="Order table">
            <OrderTable active={activeTab} page={page} search={search} />
          </section>

          <nav aria-label="Pagination">
            <Pagination page={page} setPage={setPage} totalPages={totalPages} />
          </nav>
        </div>
      </main>
    </div>
  );
}
