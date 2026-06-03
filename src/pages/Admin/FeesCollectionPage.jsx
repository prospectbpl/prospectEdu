// src/pages/Admin/Fees/FeesCollectionPage.jsx
import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import AdminSidebar from "../../components/Admin/Layout/AdminSidebar";
import AdminTopbar from "../../components/Admin/Layout/AdminTopbar";
import TestSeriesFeesTable from "../../components/Admin/TestSeriesFees/TestSeriesFeesTable";
import { useNavigate } from "react-router-dom";

export default function FeesCollectionPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const sidebarWidth = isCollapsed ? 80 : 256;

  const canonicalUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname =
      typeof window !== "undefined" ? window.location.pathname : "";
    return origin && pathname ? `${origin}${pathname}` : "";
  }, []);

  const pageTitle = "Fees Collection | ProspectEdu Admin";
  const pageDescription =
    "View test series fees collection and search receipts in ProspectEdu Admin.";

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

      <h1 className="sr-only">Fees Collection</h1>

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-full z-40 transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* MAIN AREA */}
      <main
        className="flex flex-col flex-1 transition-all duration-300"
        style={{
          marginLeft: sidebarWidth,
          width: `calc(100vw - ${sidebarWidth}px)`,
        }}
        aria-label="Fees collection admin page"
      >
        {/* TOPBAR */}
        <div
          className="fixed top-0 bg-white shadow-sm h-[64px] flex items-center z-[999]"
          style={{ left: sidebarWidth, right: 0 }}
        >
          <AdminTopbar pageTitle="Fees Collection" />
        </div>

        {/* CONTENT */}
        <div className="px-6 pt-[90px] pb-10 overflow-y-auto">
          {/* Breadcrumb */}
          <div className="w-full flex flex-col items-start ">
            <div className="text-gray-600 text-sm mb-4">
              <span
                className="cursor-pointer hover:text-[#124734]"
                onClick={() => navigate("/admin-dashboard")}
              >
                Dashboard
              </span>
              {" / "}
              <span className="text-[#124734] font-semibold">
                Test Series Fees Collection
              </span>
            </div>
          </div>

          {/* CARD */}
          <div className="bg-white shadow rounded-xl p-6">
            {/* TOP CONTROLS */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select
                  className="border border-[#124734] px-2 py-1 rounded focus:outline-none"
                  aria-label="Rows per page"
                >
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
                <span>entries</span>
              </div>

              <div className="flex items-center gap-3">
                {/* SEARCH */}
                <div className="flex items-center gap-2">
                  <span>Search:</span>
                  <input
                    type="text"
                    className="border border-[#124734] px-3 py-1 rounded focus:outline-none"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search fees"
                  />
                </div>
              </div>
            </div>

            {/* TABLE */}
            <TestSeriesFeesTable search={search} />
          </div>
        </div>
      </main>
    </div>
  );
}
