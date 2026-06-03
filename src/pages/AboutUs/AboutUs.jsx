import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import aboutImg from "../../assets/AboutUs.webp";
import careerImg from "../../assets/carrer2.webp";

import ContactUs from "../../components/Contact";
import { useNavigate } from "react-router-dom";
import HeaderSection from "../../components/HeaderSection";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer";

const AboutUs = () => {
  const navigate = useNavigate();

  const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;
  const canonicalUrl = `${SITE_URL}/about-us`;

  const pageTitle = "About Us | Prospect Education";
  const pageDescription =
    "Learn about Prospect Education—our mission, vision, and founder’s message. Discover how we make quality education accessible for everyone.";

  const jsonLd = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: `${SITE_URL}${aboutImg}`,
      },
      about: {
        "@type": "Organization",
        name: "Prospect Education",
        url: SITE_URL,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Bhopal",
          addressRegion: "Madhya Pradesh",
          addressCountry: "IN",
        },
      },
    };
  }, [SITE_URL, canonicalUrl]);

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
        <meta property="og:image" content={`${SITE_URL}${aboutImg}`} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={`${SITE_URL}${aboutImg}`} />

        {/* JSON-LD */}
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Navbar />

      <HeaderSection
        page=" About-Us"
        title="Welcome to the Future of Education"
        subtitle="Revolutionizing learning through innovative technology 
              and personalized experiences."
        image={aboutImg}
      />

      {/* ✅ main wrapper (no layout change) */}
      <main>
        {/* ---------------- Founder’s Message Section ---------------- */}
        <div className="max-w-7xl mx-auto px-8 py-16 text-[#124734] font-[Open_Sans,sans-serif] text-left">
          <h2 className="text-3xl font-bold mb-2">Founder’s Message</h2>
          <div className="h-[4px] w-24 bg-[#A7E1B2] mb-8"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white shadow-md rounded-xl p-6 border border-gray-200">
            <img
              src={aboutImg}
              alt="Founder"
              className="rounded-lg w-3/4 object-cover"
              loading="lazy"
              decoding="async"
            />

            <div>
              <div className="md:pl-2">
                <h3 className="text-2xl font-semibold mb-3">Founder’s Message</h3>

                <p className="text-gray-700 mb-4 leading-relaxed">
                  "शिक्षा का अर्थ है उस रोशनी को जलाना, जो अंधेरे में भी रास्ता दिखाए।"
                  <br />
                  <span className="text-sm text-gray-500">
                    {" "}
                    (Education means igniting the light that shows the way even in darkness.)
                  </span>
                </p>

                <p className="text-gray-700 leading-relaxed mb-4">Hello Everyone,</p>

                <p className="text-gray-700 leading-relaxed mb-4">
                  I am <b>Subodh Sir</b>, the founder of <b>Prospect Education</b>. I want to share
                  my story with you — a story that reflects the purpose behind everything we do
                  here. Growing up, I understood how important the right guidance and support can
                  be for a student trying to achieve their dreams. Education became my guiding
                  light, helping me navigate life and discover my purpose.
                </p>

                <p className="text-gray-700 leading-relaxed mb-4">
                  With this belief in the transformative power of knowledge, I dedicated myself to
                  helping students learn effectively, gain confidence, and build a strong future.
                  Many students, especially those from humble backgrounds, need more than just
                  study material — they need direction, mentorship, and a learning environment that
                  truly supports them.
                </p>

                <p className="text-gray-700 leading-relaxed">
                  At <b>Prospect Education</b>, our mission is to provide accessible, innovative,
                  and high-quality learning experiences. We strive to ignite that light within
                  every student, helping them move forward with clarity, strength, and hope towards
                  a brighter future.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- About Prospect Education Section ---------------- */}
        <div className="max-w-7xl mx-auto px-8 py-16 text-[#124734] font-[Open_Sans,sans-serif] text-left">
          <h2 className="text-3xl font-bold mb-2">About Prospect Education</h2>
          <div className="h-[4px] w-24 bg-[#A7E1B2] mb-8"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white shadow-md rounded-xl p-6 border border-gray-200">
            <img
              src={aboutImg}
              alt="About Prospect Education"
              className="rounded-lg w-3/4 object-cover "
              loading="lazy"
              decoding="async"
            />

            <div>
              <div className="md:pl-2">
                <h3 className="text-2xl font-semibold mb-3">About Prospect Education</h3>

                <p className="text-gray-700 leading-relaxed mb-4">
                  Prospect Education is a growing educational platform dedicated to empowering
                  students through accessible learning, guidance, and mentorship...
                </p>

                <p className="text-gray-700 leading-relaxed mb-4">
                  Our initiative focuses on bridging the gap between quality education and
                  affordability...
                </p>

                <p className="text-gray-700 leading-relaxed mb-4">
                  From interactive sessions to personalized guidance...
                </p>

                <p className="text-gray-700 leading-relaxed">
                  Through a growing network of teachers, volunteers, and academic experts...
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- Education for Everyone Section ---------------- */}
        <div className="max-w-7xl mx-auto px-8 py-20 text-[#124734] font-[Open_Sans,sans-serif] text-left">
          <h2 className="text-3xl font-bold mb-2">Education for Everyone</h2>
          <div className="h-[4px] w-28 bg-[#A7E1B2] mb-12"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200 text-center">
              <div className="flex justify-center mb-4">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3001/3001764.png"
                  alt="Learn from Experts"
                  className="w-24 h-24"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <h3 className="text-xl font-semibold text-[#1E5631] mb-3">Learn From Experts</h3>
              <p className="text-gray-700 leading-relaxed">
                Learning from experts accelerates knowledge and skill development...
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200 text-center">
              <div className="flex justify-center mb-4">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/2991/2991108.png"
                  alt="Learn at Your Own Pace"
                  className="w-24 h-24"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <h3 className="text-xl font-semibold text-[#1E5631] mb-3">Learn at Your Own Pace</h3>
              <p className="text-gray-700 leading-relaxed">
                Flexible learning enables students to absorb concepts at a comfortable speed...
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200 text-center">
              <div className="flex justify-center mb-4">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/19024/19024930.png"
                  alt="Study Materials"
                  className="w-24 h-24"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <h3 className="text-xl font-semibold text-[#1E5631] mb-3">
                Learn From Study Materials
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Curated study materials provide structured understanding...
              </p>
            </div>
          </div>
        </div>

        {/* ---------------- Mission and Vision Section ---------------- */}
        <div className="max-w-7xl mx-auto px-8 py-20 text-[#124734] font-[Open_Sans,sans-serif] text-left">
          <h2 className="text-3xl font-bold mb-2 ">Our Mission and Vision</h2>
          <div className="h-[4px] w-40 bg-[#A7E1B2]  mb-12"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 place-items-center">
            <div className="w-full bg-[#A7E1B2] rounded-xl p-8 shadow-md h-full">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/9971/9971421.png"
                  alt="Mission Icon"
                  className="w-12 h-12"
                  loading="lazy"
                  decoding="async"
                />
                <h3 className="text-xl font-semibold text-[#1E5631]">Mission</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Our mission is to empower students through exceptional mentorship...
              </p>
            </div>

            <div className="w-full bg-[#A7E1B2] rounded-xl p-8 shadow-md h-full">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/6886/6886928.png"
                  alt="Vision Icon"
                  className="w-12 h-12"
                  loading="lazy"
                  decoding="async"
                />
                <h3 className="text-xl font-semibold text-[#1E5631]">Vision</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Our vision is to make high-quality education accessible and inclusive for all...
              </p>
            </div>
          </div>
        </div>

        {/* ---------------- Career at Prospect Edu Section ---------------- */}
        <div className="max-w-7xl mx-auto px-8 py-20 text-[#124734] font-[Open_Sans,sans-serif] text-left">
          <h2 className="text-3xl font-bold mb-2">Career at Prospect Edu.</h2>
          <div className="h-[4px] w-44 bg-[#A7E1B2] mb-12"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              <img
                src={careerImg}
                alt="Career Illustration"
                className="w-full max-w-lg object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-[#1E5631] mb-4">Join The Team</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                Calling all learners, innovators, and problem solvers...
              </p>

              <button
                onClick={() => navigate("/career")}
                className="bg-[#1E5631] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-[#144923] transition-all"
                type="button"
              >
                Open Positions
              </button>
            </div>
          </div>
        </div>

        <div className="text-left">
          <ContactUs />
        </div>
      </main>

      <div className="pt-10">
        <Footer />
      </div>
    </section>
  );
};

export default AboutUs;
