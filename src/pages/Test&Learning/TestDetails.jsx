// src/pages/Test/TestDetails.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import testImg from "../../assets/test1.webp";
import whyTestImg from "../../assets/WhyTest.webp";
import HeaderSection from "../../components/HeaderSection";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer";
import WhyTestSeries from "../../components/WhyTestSeries";
import { fetchPublicTestSeriesById } from "../../lib/testSeriesApi";
import { hasPurchasedSeries } from "../../lib/testPurchaseApi";
import { Helmet } from "react-helmet-async";

const TestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);

  const [checkingPurchase, setCheckingPurchase] = useState(false);
  const [purchased, setPurchased] = useState(false);

  const token = sessionStorage.getItem("accessToken");
  const isLoggedIn = !!token;

  const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;
  const canonicalUrl = `${SITE_URL}/test-learning/${id}`;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchPublicTestSeriesById(id);
        setTest(data);
      } catch (e) {
        console.error(e);
        setTest(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    (async () => {
      if (!isLoggedIn || !id) {
        setPurchased(false);
        return;
      }
      try {
        setCheckingPurchase(true);
        const ok = await hasPurchasedSeries(id);
        setPurchased(ok);
      } catch (e) {
        console.error(e);
        setPurchased(false);
      } finally {
        setCheckingPurchase(false);
      }
    })();
  }, [id, isLoggedIn]);

  const onBuyNow = () => {
    const target = `/checkout-test-learning/${id}`;
    if (!isLoggedIn) {
      sessionStorage.setItem("postLoginRedirect", target);
      navigate("/login");
      return;
    }
    navigate(target);
  };

  const testsList = Array.isArray(test?.tests)
    ? test.tests
    : Array.isArray(test?.schedule)
    ? test.schedule.map((x) => ({ name: x.name }))
    : [];

  const pageTitle = useMemo(() => {
    if (!test?.title) return "Test Series | ProspectEdu";
    return `${test.title} | Test Series | ProspectEdu`;
  }, [test]);

  const pageDescription = useMemo(() => {
    if (!test) return "View test series details on ProspectEdu.";
    const parts = [
      test.title,
      test.language ? `Language: ${test.language}` : "",
      test.totalTest ? `Total Tests: ${test.totalTest}` : "",
      test.totalQuestion ? `Total Questions: ${test.totalQuestion}` : "",
    ].filter(Boolean);
    return parts.join(" • ");
  }, [test]);

  const ogImage = useMemo(() => {
    const img = test?.imageUrl || testImg;
    if (typeof img === "string" && /^https?:\/\//i.test(img)) return img;
    return `${SITE_URL}${img}`;
  }, [test, SITE_URL]);

  // ✅ JSON-LD (Product + Offer) works for free/paid series
  const jsonLd = useMemo(() => {
    if (!test) return null;
    const price = Number(test.price || 0);
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: test.title,
      description: pageDescription,
      image: [ogImage],
      url: canonicalUrl,
      brand: { "@type": "Brand", name: "ProspectEdu" },
      offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        price: price,
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/checkout-test-learning/${id}`,
      },
    };
  }, [test, pageDescription, ogImage, canonicalUrl, SITE_URL, id]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-[#124734]">
        <p className="text-lg font-medium">Loading...</p>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen flex justify-center items-center text-[#124734]">
        <p className="text-lg font-medium">⚠️ Test not found!</p>
      </div>
    );
  }

  const includedItems = [
    { icon: "📄", label: "Question Paper" },
    { icon: "📘", label: "Model Answer" },
    { icon: "📚", label: "Answer Booklet" },
    { icon: "🧾", label: "Evaluation" },
  ];

  return (
    <section className="bg-[#F9FAFB] text-[#124734] font-[Open_Sans,sans-serif]">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:type" content="product" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />

        {jsonLd ? <script type="application/ld+json">{JSON.stringify(jsonLd)}</script> : null}
      </Helmet>

      <Navbar />

      <HeaderSection
        page={`Test Series > ${test.title}`}
        title={test.title}
        subtitle={
          <div>
            <p className="text-[#B7F399] text-lg font-medium mb-4">What’s Included</p>
            <div className="grid grid-cols-2 gap-y-4 gap-x-12 text-white max-w-xl">
              {includedItems.map((item, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        }
        image={test.imageUrl || testImg}
      />

      <main className="max-w-7xl mx-auto mt-12 px-6 md:px-8 flex flex-col md:flex-row gap-8 text-left">
        <div className="bg-white rounded-xl shadow-md p-6 w-full md:w-2/3">
          <h2 className="text-2xl font-semibold mb-6">Tests Included</h2>

          {testsList.length === 0 ? (
            <p className="text-gray-600">No tests available.</p>
          ) : (
            <div className="divide-y divide-gray-200">
              {testsList.map((t, idx) => (
                <div
                  key={idx}
                  className="py-4 px-2 hover:bg-[#F9FAFB] flex items-center gap-3"
                >
                  <span className="text-purple-700 text-xl">🧾</span>
                  <p className="font-semibold text-[#124734]">{t.name || `Test ${idx + 1}`}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 w-full md:w-1/3 h-fit text-left">
          <h1 className="text-2xl md:text-3xl font-semibold mb-4">{test.title}</h1>

          <p className="text-gray-700 text-base mb-2">
            <strong>Registration fee - </strong>
            {Number(test.price || 0) === 0 ? "Free" : `₹${test.price}/-`}
            {Number(test.mrp || 0) > Number(test.price || 0) && (
              <span className="line-through text-gray-400 ml-2">₹{test.mrp}/-</span>
            )}
          </p>

          <ul className="space-y-2 text-sm text-gray-700">
            <li>✅ Expire At - Not Available</li>
            <li>🧾 Total Test - {test.totalTest}</li>
            <li>❓ Total Question - {test.totalQuestion}</li>
            <li>🌐 Language - {test.language}</li>
            <li>🧠 Question Type - {test.questionType}</li>
          </ul>

          {isLoggedIn && checkingPurchase ? (
            <button className="bg-gray-200 text-gray-600 w-full py-2 mt-6 rounded-md font-medium cursor-wait">
              Checking...
            </button>
          ) : purchased ? null : (
            <button
              onClick={onBuyNow}
              className="bg-[#1E5631] text-white w-full py-2 mt-6 rounded-md font-medium hover:bg-[#A7E1B2] transition"
              type="button"
            >
              Buy Now
            </button>
          )}
        </div>
      </main>

      <WhyTestSeries image={whyTestImg} />
      <div className="pt-10">
        <Footer />
      </div>
    </section>
  );
};

export default TestDetails;
