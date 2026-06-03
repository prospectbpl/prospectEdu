import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import researchImg from "../../assets/research.webp";
import HeaderSection from "../../components/HeaderSection";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer";
import { api } from "../../lib/api";

const ReportDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [language, setLanguage] = useState("English");
  const [report, setReport] = useState(null);

  // ✅ Set your production site URL here (or via VITE_SITE_URL env)
  const SITE_URL =
    import.meta.env.VITE_SITE_URL || window.location.origin;

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/research/reports/${slug}`);
        setReport(res.data?.data || null);
      } catch {
        setReport(null);
      }
    })();
  }, [slug]);

  const canonicalUrl = useMemo(() => {
    return `${SITE_URL}/research-report/${slug}`;
  }, [SITE_URL, slug]);

  const pageTitle = useMemo(() => {
    if (!report?.title) return "Research Report | ProspectEdu";
    return `${report.title} | ProspectEdu`;
  }, [report]);

  const pageDescription = useMemo(() => {
    // Use description if present; fallback to first part of content
    const d = report?.description?.trim();
    if (d) return d;

    const text =
      (report?.content?.english || report?.content?.hindi || "")
        .toString()
        .replace(/\s+/g, " ")
        .trim();

    if (!text) return "Read an easy-to-understand research report from ProspectEdu.";
    return text.slice(0, 155);
  }, [report]);

  const ogImage = useMemo(() => {
    const img = report?.coverUrl || researchImg;
    // If coverUrl is absolute already, keep it; otherwise prefix with site
    if (typeof img === "string" && /^https?:\/\//i.test(img)) return img;
    return `${SITE_URL}${img}`;
  }, [report, SITE_URL]);

  // ✅ JSON-LD for the report page (safe, no layout change)
  const jsonLd = useMemo(() => {
    if (!report) return null;

    // Use whichever language content is currently selected
    const bodyText =
      language === "English"
        ? report.content?.english
        : report.content?.hindi;

    return {
      "@context": "https://schema.org",
      "@type": "Report",
      name: report.title,
      description: pageDescription,
      url: canonicalUrl,
      datePublished: report.date || undefined,
      inLanguage: language === "English" ? "en" : "hi",
      about: report.category ? [report.category] : undefined,
      image: ogImage,
      // Optional: include a snippet (avoid huge payload)
      text: (bodyText || "").toString().slice(0, 2000),
      publisher: {
        "@type": "Organization",
        name: "ProspectEdu",
        url: SITE_URL,
      },
    };
  }, [report, language, pageDescription, canonicalUrl, ogImage, SITE_URL]);

  const downloadPdf = async () => {
    try {
      if (!report) return;

      const url =
        language === "English" ? report.pdf?.englishUrl : report.pdf?.hindiUrl;
      if (!url) return alert("PDF not available");

      const res = await fetch(url);
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${report.slug}-${language}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch {
      alert("Download failed. Please try again.");
    }
  };

  if (!report) {
    // Keep your existing UI; adding Helmet here is optional
    return <p className="text-center mt-20 text-lg">Report not found</p>;
  }

  return (
    <section className="bg-[#F9FAFB] text-[#124734]  font-[Open_Sans,sans-serif]">
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
          <script type="application/ld+json">
            {JSON.stringify(jsonLd)}
          </script>
        ) : null}
      </Helmet>

      <Navbar />

      <HeaderSection
        page=" Research Report"
        title="Research Reports made simple."
        subtitle=" Easy-to-read research from Technology, Engineering, Law, and Management."
        image={researchImg}
      />

      {/* ===== CONTENT ===== */}
      {/* ✅ main/article tags (no layout change) */}
      <main className="max-w-5xl mx-auto mt-10 bg-white shadow-md rounded-xl p-6 md:p-8 relative text-left">
        {/* Language toggle */}
        <div className="absolute top-4 right-4 flex gap-2">
          {["English", "Hindi"].map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-3 py-1 text-sm border rounded-md ${
                language === lang
                  ? "bg-[#A7E1B2] border-[#A7E1B2]"
                  : "hover:bg-[#A7E1B2]"
              }`}
              type="button"
              aria-pressed={language === lang}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="text-[#1E5631] font-semibold mb-6 hover:underline"
          type="button"
        >
          ← Back
        </button>

        <article>
          {/* Title */}
          {/* ✅ h1 is best for SEO; styling kept identical */}
          <h1 className="text-2xl md:text-3xl font-bold border-b pb-2 mb-4">
            {report.title}
          </h1>

          {/* Meta */}
          <div className="flex gap-4 text-sm text-gray-500 mb-4">
            <span className="bg-[#A7E1B2] px-2 py-1 rounded">
              {report.category}
            </span>
            <span>📅 {report.date}</span>
          </div>

          {/* Content */}
          <div className="mt-4 text-gray-800 whitespace-pre-line leading-relaxed text-sm md:text-[15px]">
            {language === "English"
              ? report.content?.english
              : report.content?.hindi}
          </div>

          {/* PDF Download */}
          <div className="mt-8">
            <button
              type="button"
              onClick={downloadPdf}
              className="inline-block bg-[#A7E1B2] px-5 py-2 rounded-lg font-semibold hover:bg-[#8fd49f]"
            >
              ⬇️ Download Full Report ({language})
            </button>
          </div>
        </article>
      </main>

      <div className="pt-10">
        <Footer />
      </div>
    </section>
  );
};

export default ReportDetails;
