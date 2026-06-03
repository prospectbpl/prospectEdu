import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import HeaderSection from "../../components/HeaderSection";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer";
import { api } from "../../lib/api";

import newsImg from "../../assets/News.webp";

const NewsDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [language, setLanguage] = useState("English");

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Base URL (canonical/OG)
  const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/news/${slug}`);
        setReport(res.data?.data || null);
      } catch {
        setReport(null);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [slug]);

  const canonicalUrl = useMemo(() => `${SITE_URL}/news/${slug}`, [SITE_URL, slug]);

  const pageTitle = useMemo(() => {
    if (!report?.title) return "News | ProspectEdu";
    return `${report.title} | ProspectEdu`;
  }, [report]);

  const pageDescription = useMemo(() => {
    const d = report?.description?.trim();
    if (d) return d;

    const text = (language === "English" ? report?.english : report?.hindi) || "";
    const clean = text.toString().replace(/\s+/g, " ").trim();
    return clean ? clean.slice(0, 155) : "Read the latest news and updates from ProspectEdu.";
  }, [report, language]);

  const ogImage = useMemo(() => {
    const img = report?.imgUrl || report?.img || newsImg;
    if (typeof img === "string" && /^https?:\/\//i.test(img)) return img;
    return `${SITE_URL}${img}`;
  }, [report, SITE_URL]);

  // ✅ JSON-LD Article schema
  const jsonLd = useMemo(() => {
    if (!report) return null;

    const bodyText = (language === "English" ? report.english : report.hindi) || "";

    return {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: report.title,
      description: pageDescription,
      url: canonicalUrl,
      image: [ogImage],
      datePublished: report.date || undefined,
      inLanguage: language === "English" ? "en" : "hi",
      articleSection: report.category || undefined,
      articleBody: bodyText.toString().slice(0, 2000),
      publisher: {
        "@type": "Organization",
        name: "ProspectEdu",
        url: SITE_URL,
      },
    };
  }, [report, language, pageDescription, canonicalUrl, ogImage, SITE_URL]);

  if (loading) {
    return <p className="text-center mt-20 text-lg">Loading…</p>;
  }
  if (!report) {
    return <p className="text-center mt-20 text-lg">News not found</p>;
  }

  return (
    <section className="bg-[#F9FAFB] text-[#124734] font-[Open_Sans,sans-serif]">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />

        {/* JSON-LD */}
        {jsonLd ? (
          <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        ) : null}
      </Helmet>

      <Navbar />

      <HeaderSection
        page="News"
        title={report.title}
        subtitle={report.description}
        image={newsImg}
      />

      {/* ✅ main/article tags: semantics only, no layout change */}
      <main className="max-w-5xl mx-auto mt-10 bg-white shadow-md rounded-xl p-5 sm:p-6 md:p-8 lg:p-10 relative text-left">
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={() => setLanguage("English")}
            className={`px-3 py-1 rounded-md border text-sm font-medium ${
              language === "English"
                ? "bg-[#A7E1B2] border-[#A7E1B2]"
                : "bg-white border-gray-300 hover:bg-[#A7E1B2]"
            }`}
            type="button"
            aria-pressed={language === "English"}
          >
            English
          </button>

          <button
            onClick={() => setLanguage("Hindi")}
            className={`px-3 py-1 rounded-md border text-sm font-medium ${
              language === "Hindi"
                ? "bg-[#A7E1B2] border-[#A7E1B2]"
                : "bg-white border-gray-300 hover:bg-[#A7E1B2]"
            }`}
            type="button"
            aria-pressed={language === "Hindi"}
          >
            Hindi
          </button>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="text-[#1E5631] mb-6 text-sm font-semibold hover:underline"
          type="button"
        >
          ← Back
        </button>

        {/* Keep styling same; just use h1 for SEO */}
        <article>
          <h1 className="text-2xl sm:text-3xl font-bold mb-3 border-b border-gray-300 pb-2">
            {report.title}
          </h1>

          <div className="text-gray-800 leading-relaxed whitespace-pre-line text-sm sm:text-[15px] mt-4">
            {language === "English" ? (report.english || "") : (report.hindi || "")}
          </div>
        </article>
      </main>

      <div className="pt-10">
        <Footer />
      </div>
    </section>
  );
};

export default NewsDetails;
