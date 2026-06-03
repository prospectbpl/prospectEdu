import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import HeaderSection from "../../components/HeaderSection";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer";
import researchImg from "../../assets/research.webp";
import { api } from "../../lib/api";

const ResearchReport = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [tabs, setTabs] = useState(["All"]);
  const [reports, setReports] = useState([]);

  const navigate = useNavigate();

  // ✅ Set your production site URL here (or via VITE_SITE_URL env)
  const SITE_URL =
    import.meta.env.VITE_SITE_URL || window.location.origin;

  const canonicalUrl = useMemo(() => {
    // If you later add query params for category, you can include them.
    return `${SITE_URL}/research-report`;
  }, [SITE_URL]);

  const pageTitle = useMemo(() => {
    return activeTab && activeTab !== "All"
      ? `${activeTab} Research Reports | ProspectEdu`
      : "Research Reports | ProspectEdu";
  }, [activeTab]);

  const pageDescription = useMemo(() => {
    return activeTab && activeTab !== "All"
      ? `Browse easy-to-read ${activeTab} research reports from ProspectEdu. Technology, Engineering, Law, and Management reports.`
      : "Browse easy-to-read research reports from ProspectEdu across Technology, Engineering, Law, and Management.";
  }, [activeTab]);

  useEffect(() => {
    (async () => {
      try {
        const catRes = await api.get("/research/categories");
        const cats = catRes.data?.data || [];
        setTabs(["All", ...cats.map((c) => c.name)]);
      } catch {
        setTabs(["All"]);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/research/reports", {
          params: { category: activeTab },
        });
        setReports(res.data?.data || []);
      } catch {
        setReports([]);
      }
    })();
  }, [activeTab]);

  const filteredReports = reports;

  // ✅ JSON-LD for a collection page (safe, no UI changes)
  const jsonLd = useMemo(() => {
    const itemList = (filteredReports || []).slice(0, 50).map((r, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `${SITE_URL}/research-report/${r.slug}`,
      name: r.title,
    }));

    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: itemList,
      },
    };
  }, [SITE_URL, filteredReports, pageTitle, pageDescription, canonicalUrl]);

  return (
    <section className="bg-[#F9FAFB] text-[#124734]  font-[Open_Sans,sans-serif]">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={`${SITE_URL}${researchImg}`} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={`${SITE_URL}${researchImg}`} />

        {/* JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>

      <Navbar />

      <HeaderSection
        page=" Research Report"
        title="Research Reports made simple."
        subtitle=" Easy-to-read research from Technology, Engineering, Law, and Management."
        image={researchImg}
      />

      {/* Tabs */}
      <div className="bg-white shadow-md rounded-xl max-w-6xl mx-auto mt-10 px-4 md:px-6 py-4 flex flex-wrap justify-left gap-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg border text-sm md:text-base ${
              activeTab === tab
                ? "bg-[#A7E1B2] border-[#A7E1B2]"
                : "border-gray-300 hover:bg-[#A7E1B2]"
            }`}
            type="button"
            aria-pressed={activeTab === tab}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Reports */}
      {/* ✅ main tag for semantics (no layout change) */}
      <main className="max-w-6xl mx-auto mt-10 px-4 space-y-6 text-left">
        {filteredReports.map((report) => (
          <article
            key={report.slug}
            onClick={() => navigate(`/research-report/${report.slug}`)}
            className="flex flex-col md:flex-row bg-white shadow-sm rounded-lg p-4 border hover:shadow-md cursor-pointer"
            role="link"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                navigate(`/research-report/${report.slug}`);
              }
            }}
            aria-label={`Open report: ${report.title}`}
          >
            <img
              src={report.coverUrl || researchImg}
              alt={report.title}
              loading="lazy"
              decoding="async"
              className="w-full md:w-[180px] h-[120px] object-cover rounded-md"
            />

            <div className="md:ml-6 mt-3 md:mt-0">
              <h3 className="text-lg md:text-xl font-semibold mb-2">
                {report.title}
              </h3>
              <p className="text-gray-700 text-sm">{report.description}</p>
              <div className="flex gap-3 text-xs text-gray-500 mt-2">
                <span className="bg-[#A7E1B2] px-2 py-1 rounded">
                  {report.category}
                </span>
                <span>📅 {report.date}</span>
              </div>
            </div>
          </article>
        ))}
      </main>

      <div className="pt-10">
        <Footer />
      </div>
    </section>
  );
};

export default ResearchReport;
