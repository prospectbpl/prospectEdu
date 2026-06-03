import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";

import AdminSidebar from "../../../components/Admin/Layout/AdminSidebar";
import AdminTopbar from "../../../components/Admin/Layout/AdminTopbar";

import customers from "../../../data/customers";
import CustomerInfoCard from "../../../components/Admin/Ecom/CustomerDetails/CustomerInfoCard";
import CustomerStatusUpdate from "../../../components/Admin/Ecom/CustomerDetails/CustomerStatusUpdate";
import CustomerOrdersTable from "../../../components/Admin/Ecom/CustomerDetails/CustomerOrdersTable";

export default function CustomerDetailsPage() {
  const { id } = useParams();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 80 : 256;

  const customer = customers.find((c) => c.id.toString() === id);

  const canonicalUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    return origin && pathname ? `${origin}${pathname}` : "";
  }, []);

  const pageTitle = customer
    ? `Customer #${customer.customerId} | ProspectEdu Admin`
    : "Customer Details | ProspectEdu Admin";

  const pageDescription = customer
    ? `View customer profile, status, and recent orders for Customer #${customer.customerId} in ProspectEdu Admin.`
    : "View customer profile, status, and orders in ProspectEdu Admin.";

  if (!customer) return <p className="text-red-500 p-6">Customer not found</p>;

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

      {/* Hidden H1 for SEO/accessibility (no layout change) */}
      <h1 className="sr-only">{`Customer #${customer.customerId}`}</h1>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* Main Content */}
      <main
        className="flex flex-col flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
        aria-label={`Customer details for customer ${customer.customerId}`}
      >
        <div
          className="fixed top-0 bg-white shadow-sm h-[64px] flex items-center z-[999]"
          style={{ left: sidebarWidth, right: 0 }}
        >
          <AdminTopbar pageTitle={`Customer #${customer.customerId}`} />
        </div>

        <div className="px-6 pt-[90px] pb-10 overflow-y-auto">
          {/* Top Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6" aria-label="Customer overview">
            <CustomerInfoCard customer={customer} />
            <CustomerStatusUpdate customer={customer} />
          </section>

          {/* Recent Orders */}
          <section aria-label="Customer orders">
            <CustomerOrdersTable customer={customer} />
          </section>
        </div>
      </main>
    </div>
  );
}
