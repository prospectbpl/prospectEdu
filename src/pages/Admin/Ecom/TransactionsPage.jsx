import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import AdminSidebar from "../../../components/Admin/Layout/AdminSidebar";
import AdminTopbar from "../../../components/Admin/Layout/AdminTopbar";

import TransactionStats from "../../../components/Admin/Ecom/Transactions/TransactionStats";
import Breadcrumb from "../../../components/Breadcrumb";
import PaymentMethodCard from "../../../components/Admin/Ecom/Transactions/PaymentMethodCard";
import Transaction from "../../../components/Admin/Ecom/Transactions/Transaction";
import Pagination from "../../../components/Admin/Ecom/Pagination";

export default function TransactionsPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("All order (240)");
  const [page, setPage] = useState(1);

  const sidebarWidth = isCollapsed ? 80 : 256;

  const canonicalUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    return origin && pathname ? `${origin}${pathname}` : "";
  }, []);

  const pageTitle = "Transactions | ProspectEdu Admin";
  const pageDescription =
    "View transaction analytics, payment methods, and transaction history in ProspectEdu Admin.";

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
      <h1 className="sr-only">Transactions</h1>

      <div
        className={`fixed top-0 left-0 h-full transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      <main
        className="flex flex-col flex-1"
        style={{ marginLeft: sidebarWidth }}
        aria-label="Transactions admin page"
      >
        {/* Top Bar */}
        <div
          className="fixed top-0 bg-white shadow-sm h-[64px] flex items-center"
          style={{ left: sidebarWidth, right: 0 }}
        >
          <AdminTopbar pageTitle="Transactions" />
        </div>
        

        <div className="px-6 pt-[90px] pb-10 overflow-y-auto">
          {/* Stats + Payment Method */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 items-start" aria-label="Transaction overview">
            <div className="flex justify-start">
              <TransactionStats />
            </div>

            <div className="flex justify-end">
              <PaymentMethodCard />
            </div>
          </section>

          <section aria-label="Transaction list">
            <Transaction />
          </section>

          <nav aria-label="Pagination">
            <Pagination page={page} setPage={setPage} totalPages={24} />
          </nav>
        </div>
      </main>
    </div>
  );
}
