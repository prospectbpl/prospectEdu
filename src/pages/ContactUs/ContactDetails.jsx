import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import contactImg from "../../assets/contact.webp";
import ContactUs from "../../components/Contact";
import HeaderSection from "../../components/HeaderSection";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer";

const ContactDetails = () => {
  const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;
  const canonicalUrl = `${SITE_URL}/contact`;

  const pageTitle = "Contact Us | Prospect Education";
  const pageDescription =
    "Contact Prospect Education for course guidance, support, or queries. Reach us by phone, email, or visit our office in Bhopal.";

  const jsonLd = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      mainEntity: {
        "@type": "Organization",
        name: "Prospect Education",
        url: SITE_URL,
        telephone: "+91-9752812898",
        email: "prospectbpl@gmail.com",
        address: {
          "@type": "PostalAddress",
          streetAddress:
            "R-52, First Floor, Zone-1, MP Nagar, Near Shree Vatika",
          addressLocality: "Bhopal",
          addressRegion: "Madhya Pradesh",
          postalCode: "462011",
          addressCountry: "IN",
        },
      },
    };
  }, [SITE_URL, canonicalUrl]);

  return (
    <>
      <section className="bg-[#F9FAFB] text-[#124734]  font-[Open_Sans,sans-serif]">
        <Helmet>
          <title>{pageTitle}</title>
          <meta name="description" content={pageDescription} />
          <link rel="canonical" href={canonicalUrl} />

          <meta property="og:type" content="website" />
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={pageDescription} />
          <meta property="og:url" content={canonicalUrl} />
          <meta property="og:image" content={`${SITE_URL}${contactImg}`} />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={pageTitle} />
          <meta name="twitter:description" content={pageDescription} />
          <meta name="twitter:image" content={`${SITE_URL}${contactImg}`} />

          <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        </Helmet>

        <Navbar />

        <HeaderSection
          page="Contact Us"
          title="  Get in Touch"
          subtitle="We’re here to help you, every step of the way."
          image={contactImg}
        />

        <main>
          <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 text-left">
            <ContactUs />
          </div>

          <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 text-center text-[#124734]">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#1E5631]">
              Prospect Education
            </h1>

            <p className="text-lg font-semibold mb-1">Prospect Education</p>

            <p className="text-lg font-semibold mb-1">
              R-52, First Floor, Zone-1, MP Nagar, Near Shree Vatika, Bhopal
              (M.P.)
            </p>

            <p className="text-lg font-semibold mb-1">9752812898</p>

            <div className="w-full h-[300px] sm:h-[400px] md:h-[450px] rounded-xl overflow-hidden shadow-lg border-2 border-[#A7E1B2] mt-6">
              <iframe
                title="Prospect Digital Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3680.9057282443933!2d77.41913397530306!3d23.23311867902944!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x397c4264ff94d31f%3A0x7e476c631d36f0f7!2sR-52%2C%20Zone-I%2C%20Maharana%20Pratap%20Nagar%2C%20Bhopal%2C%20Madhya%20Pradesh%20462011!5e0!3m2!1sen!2sin!4v1700000000001"
                width="100%"
                height="100%"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </main>

        <div className="pt-10">
          <Footer />
        </div>
      </section>
    </>
  );
};

export default ContactDetails;
