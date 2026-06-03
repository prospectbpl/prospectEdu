import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Helmet } from "react-helmet-async";

import HeaderSection from "../../components/HeaderSection";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer";
import { api } from "../../lib/api";

import newsImg from "../../assets/News.webp";

const News = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [selectedDate, setSelectedDate] = useState(null);
  const [tabs, setTabs] = useState(["All"]);
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // ✅ Set base URL for canonical/OG (prefer env in production)
  const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;

  const dateStr = useMemo(() => {
    if (!selectedDate) return "";
    return selectedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, [selectedDate]);

  // ✅ canonical (kept clean: no query params unless you want them)
  const canonicalUrl = useMemo(() => `${SITE_URL}/news`, [SITE_URL]);

  const pageTitle = useMemo(() => {
    if (activeTab && activeTab !== "All") return `${activeTab} News | ProspectEdu`;
    return "News | ProspectEdu";
  }, [activeTab]);

  const pageDescription = useMemo(() => {
    if (activeTab && activeTab !== "All") {
      return `Read the latest ${activeTab} news and updates from ProspectEdu.`;
    }
    return "Read the latest news and updates from ProspectEdu.";
  }, [activeTab]);

  // ✅ JSON-LD (CollectionPage + ItemList)
  const jsonLd = useMemo(() => {
    const items = (newsList || []).slice(0, 50).map((n, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `${SITE_URL}/news/${n.slug}`,
      name: n.title,
    }));

    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: items,
      },
    };
  }, [SITE_URL, newsList, pageTitle, pageDescription, canonicalUrl]);

  const loadCats = async () => {
    try {
      const res = await api.get("/news/categories");
      const cats = (res.data?.data || []).map((c) => c.name);
      setTabs(["All", ...cats]);
    } catch {
      setTabs(["All"]);
    }
  };

  const loadNews = async () => {
    setLoading(true);
    try {
      const res = await api.get("/news", {
        params: {
          category: activeTab,
          date: dateStr,
        },
      });
      setNewsList(res.data?.data || []);
    } catch {
      setNewsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCats();
  }, []);

  useEffect(() => {
    loadNews();
    // eslint-disable-next-line
  }, [activeTab, dateStr]);

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
        <meta property="og:image" content={`${SITE_URL}${newsImg}`} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={`${SITE_URL}${newsImg}`} />

        {/* JSON-LD */}
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Navbar />

      <HeaderSection
        page=" News"
        title="Latest News & Updates"
        subtitle="Stay updated with the newest events, announcements, and stories 
              from the academic and professional world."
        image={newsImg}
      />

      <div className="bg-white shadow-md rounded-xl max-w-6xl mx-auto mt-8 md:mt-10 px-4 md:px-6 py-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center md:justify-start w-full md:w-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-4 py-2 rounded-lg border text-sm sm:text-base transition-all duration-200 ${
                activeTab === tab
                  ? "bg-[#A7E1B2] text-black border-[#A7E1B2]"
                  : "bg-white text-black border-gray-300 hover:bg-[#A7E1B2]"
              }`}
              type="button"
              aria-pressed={activeTab === tab}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-auto text-center sm:text-left">
          <DatePicker
            selected={selectedDate}
            onChange={(d) => setSelectedDate(d)}
            className="border px-3 py-2 text-sm sm:text-base rounded-lg shadow-sm w-full sm:w-auto"
            placeholderText="Select Date"
            dateFormat="dd MMM yyyy"
            isClearable
          />
        </div>
      </div>

      {/* ✅ main tag only improves semantics; doesn't change layout */}
      <main className="max-w-6xl mx-auto mt-10 px-4 text-left">
        <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-center md:text-left">
          {activeTab === "All" ? "All News" : activeTab}
        </h2>

        <div className="space-y-6">
          {!loading && newsList.length === 0 && (
            <p className="text-center text-gray-600 py-6">No news found for this date.</p>
          )}

          {loading && <p className="text-center text-gray-600 py-6">Loading…</p>}

          {newsList.map((report) => (
            <div
              key={report._id}
              onClick={() => navigate(`/news/${report.slug}`)}
              className="flex flex-col md:flex-row items-start bg-white shadow-sm rounded-lg p-4 md:p-5 border border-gray-200 hover:shadow-md transition cursor-pointer"
              role="link"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate(`/news/${report.slug}`);
              }}
              aria-label={`Open news: ${report.title}`}
            >
              <img
                src={report.imgUrl || report.img || "https://via.placeholder.com/300x200?text=News"}
                alt={report.title}
                className="w-full md:w-[180px] h-[150px] object-cover rounded-md"
                loading="lazy"
                decoding="async"
              />

              <div className="md:ml-6 mt-4 md:mt-0">
                <h3 className="text-lg sm:text-xl font-semibold text-[#124734] mb-2">
                  {report.title}
                </h3>

                <p className="text-gray-700 text-sm sm:text-base">
                  {report.description}
                </p>

                <div className="flex items-center gap-3 text-gray-500 text-xs mt-3">
                  <span className="px-2 py-1 bg-[#A7E1B2] text-[#124734] rounded-md text-[11px] font-medium">
                    {report.category}
                  </span>
                  <span>📅 {report.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <div className="pt-10"><Footer /></div>
    </section>
  );
};

export default News;
