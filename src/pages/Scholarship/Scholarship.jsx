import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import scholarshipImg from "../../assets/Scholarship.webp";
import scholarshipPool from "../../assets/scholarshipPool.webp";
import HeaderSection from "../../components/HeaderSection";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer";
import { api } from "../../lib/api"; // ✅ added

const Scholarship = () => {
  const [email, setEmail] = useState(""); // (kept as-is, not used in your layout currently)
  const [submitting, setSubmitting] = useState(false);

  // ✅ result status from backend
  const [resultInfo, setResultInfo] = useState({
    resultsLive: false,
    resultPdfUrl: "",
    resultPdfOriginalName: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    parent: "",
    email: "",
    phone: "",
    course: "",
  });

  const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;
  const canonicalUrl = `${SITE_URL}/scholarship`;

  const pageTitle = "Scholarship Exam | ProspectEdu";
  const pageDescription =
    "Apply for ProspectEdu Scholarship Exam to unlock scholarships, rewards, performance report, and mentorship. Register online and stay updated with results.";

  const faqJsonLd = useMemo(() => {
    // These questions already exist in your UI (details/summary), so schema matches your page.
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How many times can I take the Scholarship Test?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You can take it once per academic year.",
          },
        },
        {
          "@type": "Question",
          name: "What is the test pattern?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "MCQs from reasoning, aptitude & general academics.",
          },
        },
        {
          "@type": "Question",
          name: "Who can appear?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Any school/college student can apply.",
          },
        },
        {
          "@type": "Question",
          name: "How is the test taken?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Online mode, login details via email.",
          },
        },
      ],
    };
  }, []);

  const fetchResult = async () => {
    try {
      const res = await api.get("/scholarship/result");
      const data = res?.data?.data || {};
      setResultInfo({
        resultsLive: Boolean(data.resultsLive),
        resultPdfUrl: data.resultPdfUrl || "",
        resultPdfOriginalName: data.resultPdfOriginalName,
      });
    } catch (e) {
      // keep default resultInfo
    }
  };

  useEffect(() => {
    fetchResult();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      await api.post("/scholarship/register", formData);
      alert("🎉 Your enrollment form has been submitted successfully!");
      setFormData({
        name: "",
        parent: "",
        email: "",
        phone: "",
        course: "",
      });
      fetchResult();
    } catch (err) {
      alert(err?.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const downloadResultPdf = async () => {
    try {
      if (!resultInfo.resultPdfUrl) return;

      const res = await fetch(resultInfo.resultPdfUrl);
      if (!res.ok) throw new Error("Failed to download");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = resultInfo.resultPdfOriginalName;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert("Download failed. Please try again.");
    }
  };

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
        <meta property="og:image" content={`${SITE_URL}${scholarshipImg}`} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={`${SITE_URL}${scholarshipImg}`} />

        {/* FAQ JSON-LD */}
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      <Navbar />

      {/* ---------------- Header Section ---------------- */}
      <HeaderSection
        page="Scholarship"
        title="Unlock your potential with Scholarships."
        subtitle="Discover opportunities to support your education with merit-based, need-based,
              and special category scholarships. Stay updated with latest announcements and
              eligibility criteria."
        image={scholarshipImg}
      />

      {/* ✅ main tag for semantics (no layout change) */}
      <main>
        {/* ---------------- Scholarship Description ---------------- */}
        <div className="py-16 px-6 md:px-8">
          <div className="max-w-6xl mx-auto text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-[#124734] mb-8">
              Scholarships, cash rewards & more!
            </h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="text-blue-700 text-2xl">⚡</div>
                <p className="text-gray-700 text-lg">
                  Gives an early start to <strong>professional students</strong> aiming to build careers.
                </p>
              </div>

              <div className="flex items-start gap-4">
                <div className="text-blue-700 text-2xl">🏅</div>
                <p className="text-gray-700 text-lg">
                  Nurtures young talent with <strong>scholarships, cash rewards & more.</strong>
                </p>
              </div>

              <div className="flex items-start gap-4">
                <div className="text-blue-700 text-2xl">⏰</div>
                <p className="text-gray-700 text-lg">
                  Includes a <strong>2-hour online evaluation</strong> designed to test skills effectively.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- Scholarship Offer Image ---------------- */}
        <div className="flex justify-center my-10 px-4">
          <img
            src={scholarshipPool}
            alt="Scholarship Offer"
            loading="lazy"
            decoding="async"
            className="w-full max-w-xl rounded-xl shadow-md transition hover:scale-105 hover:shadow-2xl"
          />
        </div>

        {/* ---------------- Result Status ---------------- */}
        <div className="bg-white py-10 px-6 text-center rounded-xl shadow-md max-w-3xl mx-auto border border-gray-200">
          <h2 className="text-xl md:text-2xl font-semibold text-[#124734] mb-4 flex items-center justify-center gap-2">
            Scholarship Results
            {resultInfo.resultsLive && (
              <span className="bg-green-500 text-white text-sm px-3 py-1 rounded-full animate-pulse">
                🔴 LIVE
              </span>
            )}
          </h2>

          {resultInfo.resultsLive ? (
            <>
              <p className="text-green-700 font-medium mb-3">🎉 Results are Live! Download below.</p>

              {resultInfo.resultPdfUrl ? (
                <button
                  type="button"
                  onClick={downloadResultPdf}
                  className="bg-[#1E5631] text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  📄 Download Result PDF
                </button>
              ) : (
                <p className="text-gray-600">PDF not uploaded yet.</p>
              )}
            </>
          ) : (
            <>
              <p className="text-gray-600 text-lg font-medium mb-2">⏳ Results will be out soon!</p>
              <p className="text-sm text-gray-500">Stay tuned for updates.</p>
            </>
          )}
        </div>

        {/* ---------------- Unique Benefits Section ---------------- */}
        <div className="py-16 px-6 md:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[#124734] mb-12">
              Unique Benefits of the Scholarship Exam
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 md:gap-12">
              {/* Card 1 */}
              <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/1724/1724611.png"
                  className="w-16 mb-4"
                  alt="National Rank & Report"
                  loading="lazy"
                  decoding="async"
                />
                <h3 className="text-xl font-semibold text-[#1E5631] mb-2">National Rank & Report</h3>
                <p className="text-gray-600">Detailed analysis to track your real performance.</p>
              </div>

              {/* Card 2 */}
              <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3135/3135789.png"
                  className="w-16 mb-4"
                  alt="Scholarship Certificate"
                  loading="lazy"
                  decoding="async"
                />
                <h3 className="text-xl font-semibold text-[#1E5631] mb-2">Scholarship Certificate</h3>
                <p className="text-gray-600">Boost your academic profile with certification.</p>
              </div>

              {/* Card 3 */}
              <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3343/3343974.png"
                  className="w-16 mb-4"
                  alt="Expert Mentorship"
                  loading="lazy"
                  decoding="async"
                />
                <h3 className="text-xl font-semibold text-[#1E5631] mb-2">Expert Mentorship</h3>
                <p className="text-gray-600">Guidance sessions for top performers.</p>
              </div>

              {/* Card 4 */}
              <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/4712/4712029.png"
                  className="w-16 mb-4"
                  alt="Early Career Advantage"
                  loading="lazy"
                  decoding="async"
                />
                <h3 className="text-xl font-semibold text-[#1E5631] mb-2">Early Career Advantage</h3>
                <p className="text-gray-600">Get a strong academic confidence early.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- FAQs ---------------- */}
        <div className="py-16 px-6 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-[#124734] mb-10 text-center">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4 text-left">
              <details className="bg-white p-6 rounded-lg shadow-md">
                <summary className="text-lg font-semibold text-[#1E5631] cursor-pointer">
                  How many times can I take the Scholarship Test?
                </summary>
                <p className="mt-3 text-gray-600">You can take it once per academic year.</p>
              </details>

              <details className="bg-white p-6 rounded-lg shadow-md">
                <summary className="text-lg font-semibold text-[#1E5631] cursor-pointer">
                  What is the test pattern?
                </summary>
                <p className="mt-3 text-gray-600">MCQs from reasoning, aptitude & general academics.</p>
              </details>

              <details className="bg-white p-6 rounded-lg shadow-md">
                <summary className="text-lg font-semibold text-[#1E5631] cursor-pointer">Who can appear?</summary>
                <p className="mt-3 text-gray-600">Any school/college student can apply.</p>
              </details>

              <details className="bg-white p-6 rounded-lg shadow-md">
                <summary className="text-lg font-semibold text-[#1E5631] cursor-pointer">
                  How is the test taken?
                </summary>
                <p className="mt-3 text-gray-600">Online mode, login details via email.</p>
              </details>
            </div>
          </div>
        </div>

        {/* ---------------- Register Form ---------------- */}
        <div className="bg-white py-16 px-6 md:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-[#124734] mb-10 text-center">
              Register Now!
            </h2>

            <form
              onSubmit={handleSubmit}
              className="p-6 md:p-8 rounded-xl shadow-md space-y-6 transition bg-[#F9FAFB]"
            >
              <div>
                <label className="block mb-2 text-[#124734]">Full Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your name"
                  className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#1E5631]"
                />
              </div>

              <div>
                <label className="block mb-2 text-[#124734]">Parent's Name</label>
                <input
                  name="parent"
                  value={formData.parent}
                  onChange={handleChange}
                  required
                  placeholder="Enter parent's name"
                  className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#1E5631]"
                />
              </div>

              <div>
                <label className="block mb-2 text-[#124734]">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#1E5631]"
                />
              </div>

              <div>
                <label className="block mb-2 text-[#124734]">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number (10 digits)"
                  maxLength="10"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#1E5631]"
                />
              </div>

              <div>
                <label className="block mb-2 text-[#124734]">Select Course</label>
                <select
                  name="course"
                  required
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#1E5631]"
                >
                  <option value="">-- Choose a course --</option>
                  <option value="IT">Information Technology</option>
                  <option value="electrical">Electrical Engineering</option>
                  <option value="civil">Civil Engineering</option>
                  <option value="law">Law</option>
                  <option value="management">Management</option>
                </select>
              </div>

              <div className="text-center">
                <button
                  disabled={submitting}
                  className="bg-[#1E5631] disabled:opacity-60 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  {submitting ? "Submitting..." : "Submit Enrollment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <div className="pt-10">
        <Footer />
      </div>
    </section>
  );
};

export default Scholarship;
