import React, { useEffect, useMemo, useState } from "react";
import testImg from "../../assets/test1.webp";
import whyTestImg from "../../assets/WhyTest.webp";
import HeaderSection from "../../components/HeaderSection";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer";
import { fetchPublicTestSeries } from "../../lib/testSeriesApi";
import WhyTestSeries from "../../components/WhyTestSeries";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const TestPage = () => {
  const [selectedType, setSelectedType] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;
  const canonicalUrl = `${SITE_URL}/test-learning`;

  const pageTitle = useMemo(() => {
    const t = selectedType !== "All" ? `${selectedType} ` : "";
    const l = selectedLanguage ? `${selectedLanguage} ` : "";
    const suffix = t || l ? `(${t}${l}Test Series)` : "";
    return `Test & Learning ${suffix} | ProspectEdu`.replace(/\s+/g, " ").trim();
  }, [selectedType, selectedLanguage]);

  const pageDescription = useMemo(() => {
    if (selectedType !== "All" || selectedLanguage) {
      return `Explore ${selectedType !== "All" ? selectedType : "all"} test series ${
        selectedLanguage ? `in ${selectedLanguage}` : ""
      } on ProspectEdu. Practice with curated tests, model answers, and evaluation.`
        .replace(/\s+/g, " ")
        .trim();
    }
    return "Explore ProspectEdu Test & Learning resources. Practice with expert-curated test series for Engineering, Law, and Management.";
  }, [selectedType, selectedLanguage]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchPublicTestSeries();
        setTests(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setTests([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredTests = tests.filter((test) => {
    const matchesType = selectedType === "All" || test.type === selectedType;
    const matchesLanguage =
      selectedLanguage === "" ||
      String(test.language || "")
        .toLowerCase()
        .includes(selectedLanguage.toLowerCase());
    return matchesType && matchesLanguage;
  });

  // ✅ JSON-LD: CollectionPage + ItemList
  const jsonLd = useMemo(() => {
    const itemList = (filteredTests || []).slice(0, 50).map((t, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `${SITE_URL}/test-learning/${t._id}`,
      name: t.title,
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
  }, [filteredTests, SITE_URL, pageTitle, pageDescription, canonicalUrl]);

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
        <meta property="og:image" content={`${SITE_URL}${testImg}`} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={`${SITE_URL}${testImg}`} />

        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Navbar />

      <HeaderSection
        page="Test & Learning"
        title=" Explore Test & Learning Resources"
        subtitle="Strengthen your academic foundation with our expert-curated learning
              and test materials designed for Engineering, Law, and Management students."
        image={testImg}
      />

      {/* Filters */}
      <div className="bg-white shadow-md rounded-2xl -mt-8 mx-auto max-w-6xl flex flex-col md:flex-row flex-wrap justify-between items-center px-6 py-4 gap-4">
        <div className="flex flex-wrap gap-3">
          {["All", "Online", "Offline"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-5 py-2 rounded-full font-medium transition border ${
                selectedType === type
                  ? "bg-[#1E5631] text-white border-[#1E5631]"
                  : "border-[#1E5631] text-[#1E5631] hover:bg-[#A7E1B2] hover:text-white"
              }`}
              type="button"
              aria-pressed={selectedType === type}
            >
              {type === "All" ? "All" : `${type} Test Series`}
            </button>
          ))}
        </div>

        <div className="w-full md:w-auto">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="border border-[#1E5631] text-[#1E5631] font-medium px-4 py-2 rounded-full bg-white cursor-pointer w-full md:w-auto"
          >
            <option value="">Select Language</option>
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
          </select>
        </div>
      </div>

      {/* ✅ main semantic wrapper only */}
      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <p className="text-center text-gray-600 col-span-full">Loading tests...</p>
        ) : filteredTests.length > 0 ? (
          filteredTests.map((test) => (
            <article
              key={test._id}
              className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition flex flex-col overflow-hidden"
            >
              <div className="relative">
                <img
                  src={test.imageUrl || testImg}
                  alt={test.title}
                  className="w-full h-44 object-contain bg-[#F9FAFB]"
                  loading="lazy"
                  decoding="async"
                />
                <span
                  className={`absolute top-2 right-2 text-xs font-semibold px-3 py-1 rounded-md text-white ${
                    test.type === "Online" ? "bg-[#1E5631]" : "bg-red-600"
                  }`}
                >
                  {test.type}
                </span>
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-semibold text-lg mb-3 text-center">{test.title}</h3>

                <hr className="my-3 border-gray-200" />

                <div className="grid grid-cols-2 gap-y-1 text-sm text-gray-700">
                  <p>
                    <strong>Total Test:</strong> {test.totalTest}
                  </p>
                  <p>
                    <strong>Language:</strong> {test.language}
                  </p>
                  <p>
                    <strong>Total Question:</strong> {test.totalQuestion}
                  </p>
                  <p>
                    <strong>Total Amount:</strong>{" "}
                    <b className="text-red-600">
                      {Number(test.price || 0) === 0 ? "Free" : `₹${test.price}`}
                    </b>
                  </p>

                  <p className="col-span-2">
                    <strong>Question Type:</strong> {test.questionType}
                  </p>
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => navigate(`/test-learning/${test._id}`)}
                    className="border border-[#1E5631] text-[#1E5631] font-medium px-6 py-2 rounded-full hover:bg-[#1E5631] hover:text-white transition"
                    type="button"
                  >
                    View Test Series
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <p className="text-center text-gray-600 col-span-full">
            No tests found for the selected filters.
          </p>
        )}
      </main>

      <WhyTestSeries image={whyTestImg} />

      {/* FAQ Section */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-[#1E5631] mb-10">FAQ's</h2>

        <div className="space-y-4 text-left">
          {[
            {
              question: "How many mock tests are included?",
              answer: "Each test series includes multiple topic-wise and full-length tests.",
            },
            {
              question: "Is the series available in Hindi or English?",
              answer: "Yes! Most test series are available in both Hindi and English.",
            },
            {
              question: "Can I access the series on mobile?",
              answer: "Yes! Access tests and reports on mobile, tablet, or laptop anytime.",
            },
          ].map((faq, i) => (
            <details
              key={i}
              className="group border border-gray-200 bg-white rounded-xl shadow-sm p-5"
            >
              <summary className="flex justify-between items-center cursor-pointer text-[#124734] font-semibold">
                {faq.question}
                <span className="transition-transform group-open:rotate-180 text-[#1E5631]">
                  ▼
                </span>
              </summary>
              <p className="text-gray-600 mt-3 font-semibold ">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>

      <div className="pt-10">
        <Footer />
      </div>
    </section>
  );
};

export default TestPage;
