import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import AdminSidebar from "../../../components/Admin/Layout/AdminSidebar";
import AdminTopbar from "../../../components/Admin/Layout/AdminTopbar";

import CustomerStats from "../../../components/Admin/Ecom/Customers/CustomerStats";
import CustomerChart from "../../../components/Admin/Ecom/Customers/CustomerChart";
import CustomerTable from "../../../components/Admin/Ecom/Customers/CustomerTable";
import Pagination from "../../../components/Admin/Ecom/Pagination";

export default function CustomersPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 80 : 256;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const pageTitle = "Customers | ProspectEdu Admin";
  const pageDescription =
    "View customer analytics, customer lists, and manage customer records in ProspectEdu Admin.";

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

      {/* Hidden H1 for SEO (no layout change) */}
      <h1 className="sr-only">Customers</h1>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full z-40 transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <AdminSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      </div>

      {/* Main Content */}
      <main
        className="flex flex-col flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
        aria-label="Customers admin page"
      >
        <div
          className="fixed top-0 bg-white shadow-sm h-[64px] flex items-center z-[999]"
          style={{ left: sidebarWidth, right: 0 }}
        >
          <AdminTopbar pageTitle="Customers" />
        </div>

        <div className="px-6 pt-[90px] pb-10 overflow-y-auto">
          {/* Stats + Chart Side-by-Side */}
          <section
            className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6 w-full"
            aria-label="Customer analytics"
          >
            <div className="col-span-1 flex flex-col gap-6">
              <CustomerStats />
            </div>

            <div className="col-span-1 lg:col-span-3">
              <CustomerChart />
            </div>
          </section>

          {/* Table */}
          <section aria-label="Customer table">
            <CustomerTable search={search} setSearch={setSearch} page={page} />
          </section>

          {/* Pagination */}
          <nav aria-label="Pagination">
            <Pagination page={page} setPage={setPage} totalPages={24} />
          </nav>
        </div>
      </main>
    </div>
  );
}
