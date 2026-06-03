import React, { Suspense, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "../components/Navbar/Navbar";
import "../App.css";

import HomeBanner from "../components/HomeBanner";
import DashboardSelection from "../components/Dashboard/DashboardSelection";
import CategorySection from "../components/CategorySection";
import StudyMaterialsSection from "../components/StudyMaterialsSection";
import WhyChooseUs from "../components/WhyChooseUs";
import MobileCTA from "../components/MobileCTA";
import Footer from "../components/Footer";

// 🔥 Lazy-loaded heavy sections
const PopularCourses = React.lazy(() => import("../components/PopularCourses"));
const FreeVideos = React.lazy(() => import("../components/FreeVideos"));
const YouTubeChannels = React.lazy(() => import("../components/YouTubeChannels"));

function Home() {
  const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;
  const canonicalUrl = `${SITE_URL}/`;

  const pageTitle = "ProspectEdu – Career Focused Online Learning Platform";
  const pageDescription =
    "ProspectEdu helps students learn faster with structured courses, test series, study materials, and expert guidance for career growth.";

  const jsonLd = useMemo(() => {
    return [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "ProspectEdu",
        url: SITE_URL,
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/courses?search={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "ProspectEdu",
        url: SITE_URL,
      },
    ];
  }, [SITE_URL]);

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />

        {/* JSON-LD */}
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Header */}
      <header>
        <Navbar />
      </header>

      {/* Main Content */}
      <main className="min-h-screen bg-[#F9FAFB] text-dark font-body">
        {/* SEO H1 (only one per page) */}
        <h1 className="sr-only">{pageTitle}</h1>

        <HomeBanner />
        <DashboardSelection />
        <CategorySection />

        {/* Lazy sections */}
        <Suspense fallback={<div className="text-center py-12">Loading courses...</div>}>
          <PopularCourses />
        </Suspense>

        <StudyMaterialsSection />

        <Suspense fallback={<div className="text-center py-12">Loading videos...</div>}>
          <FreeVideos />
        </Suspense>

        <WhyChooseUs />

        <Suspense fallback={<div className="text-center py-12">Loading channels...</div>}>
          <YouTubeChannels />
        </Suspense>

        <MobileCTA />
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}

export default Home;
