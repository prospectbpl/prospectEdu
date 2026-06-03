import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import parentImg from "../../assets/ParentCompany.webp";
import HeaderSection from "../../components/HeaderSection";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer";

const ParentCompany = () => {
  const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;
  const canonicalUrl = `${SITE_URL}/parent-company`;

  const pageTitle = "Parent Company | Prospect Education";
  const pageDescription =
    "Prospect Education is the parent organization supporting multiple learning platforms, research, technology, and digital education services across India.";

  const jsonLd = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: `${SITE_URL}${parentImg}`,
      },
      about: {
        "@type": "Organization",
        name: "Prospect Education",
        url: SITE_URL,
      },
    };
  }, [SITE_URL, canonicalUrl]);

  return (
    <section className="bg-[#F9FAFB] text-[#124734]  font-[Open_Sans,sans-serif]">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={`${SITE_URL}${parentImg}`} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={`${SITE_URL}${parentImg}`} />

        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Navbar />

      <HeaderSection
        page=" Parent Company"
        title="Prospect Education — Our Parent Company"
        subtitle="Prospect Education is the parent organization that manages,
              guides, and supports all our learning platforms. With a strong
              vision to make education simple and accessible, it empowers
              students, institutes, and educators through technology, research,
              and innovation."
        image={parentImg}
      />

      <main>
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-20 text-left">
          <div className="bg-[#A7E1B2] p-6 sm:p-8 md:p-10 rounded-2xl shadow-xl">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#124734] mb-4">
              About Services
            </h1>

            <div className="h-[4px] w-32 sm:w-40 bg-[#124734] mb-6 sm:mb-8"></div>

            <p className="text-base sm:text-lg leading-7 sm:leading-8 text-[#124734]">
              Prospect Education is the foundation and main umbrella company that
              powers several educational services across India. It aims to make
              learning smooth, modern, and student-friendly. With a team of
              skilled educators, developers, and academic experts, the company
              works continuously to deliver reliable resources for students of
              engineering, law, medical, and competitive exam backgrounds.
              <br /><br />
              It focuses on blending technology with education. Through research,
              digital tools, modern learning platforms, test series, guides, and
              training programs, Prospect Education ensures that every student
              receives high-quality, accessible, and affordable learning support.
              <br /><br />
              The company also works closely with schools, colleges, and training
              institutes to help them grow digitally by offering website
              solutions, academic content, management software, and more. With a
              clear vision of transforming the education system, Prospect
              Education continues to build new projects that help students learn
              better and faster.
            </p>
          </div>
        </div>
      </main>

      <div className="pt-10">
        <Footer />
      </div>
    </section>
  );
};

export default ParentCompany;
