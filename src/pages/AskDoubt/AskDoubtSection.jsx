import React, { useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import questionIllustration from "../../assets/question.webp";
import HeaderSection from "../../components/HeaderSection";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer";
import { api } from "../../lib/api";

const AskDoubtSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    doubtType: "Batch Related",
    doubt: "",
    image: null,
  });

  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;
  const canonicalUrl = `${SITE_URL}/ask-question`;

  const pageTitle = "Ask a Doubt | Prospect Education";
  const pageDescription =
    "Ask your question and get a verified answer from Prospect Education. Submit your doubt with details and optional image support.";

  const faqs = useMemo(
    () => [
      {
        q: "How will I receive the answer?",
        a: "After submitting your doubt, our team will send the verified solution on your email.",
      },
      {
        q: "Can I upload an image?",
        a: "Yes, you can upload an optional image to explain your doubt better.",
      },
      {
        q: "Which mobile number should I use?",
        a: "Submit your doubt using your registered mobile number for faster assistance.",
      },
    ],
    []
  );

  const jsonLd = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };
  }, [faqs]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData({ ...formData, [name]: numericValue });
    } else if (name === "image") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!formData.name) newErrors.name = "Full Name is required";
    if (!formData.email) newErrors.email = "Email Address is required";
    if (!formData.phone) newErrors.phone = "Phone Number is required";
    else if (formData.phone.length !== 10)
      newErrors.phone = "Phone Number must be 10 digits";
    if (!formData.doubt) newErrors.doubt = "Please enter your doubt";

    setErrors(newErrors);
    if (Object.keys(newErrors).length !== 0) return;

    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("email", formData.email);
      fd.append("phone", formData.phone);
      fd.append("doubtType", formData.doubtType);
      fd.append("doubt", formData.doubt);
      if (formData.image) fd.append("image", formData.image);

      await api.post("/doubts", fd); // public

      alert("✅ Your doubt has been submitted! You will receive answer on email.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        doubtType: "Batch Related",
        doubt: "",
        image: null,
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to submit doubt");
    }
  };

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
        <meta property="og:image" content={`${SITE_URL}${questionIllustration}`} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={`${SITE_URL}${questionIllustration}`} />

        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Navbar />

      <HeaderSection
        page="Ask Question"
        title="Go from questioning to understanding!"
        subtitle="Discover the benefits of Ask a Doubt!"
        image={questionIllustration}
      />

      {/* ✅ semantic wrapper (no layout change) */}
      <main>
        {/* Page Heading */}
        <div className="text-center mt-10 mb-8 px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-[#102A23]">
            Ask a question. Get a verified answer.
          </h1>
        </div>

        {/* Form */}
        <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-2xl p-6 md:p-12 text-left">
          <h2 className="text-xl font-semibold mb-3 text-[#1E5631]">
            We are here to solve your Doubts
          </h2>
          <p className="text-gray-700 mb-2">
            Submit your doubt in the form below. Our team will reach back to you
            with the solution.
          </p>

          <p className="text-sm text-gray-500 mb-6">
            *Note: Submit your doubt using your registered mobile number.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-700"
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-700"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number (10 digits)"
                maxLength="10"
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-700"
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            </div>

            {/* Doubt Type */}
            <div>
              <label className="block text-sm font-medium mb-1">Doubt Type</label>
              <select
                name="doubtType"
                value={formData.doubtType}
                onChange={handleChange}
                className="w-full border rounded-md p-2"
              >
                <option>Batch Related</option>
                <option>Test Series Related</option>
                <option>E-commerce Related</option>
                <option>Payment Related Issue</option>
                <option>App/Website Related Issues</option>
                <option>Others</option>
              </select>
            </div>

            {/* Doubt */}
            <div>
              <label className="block text-sm font-medium mb-1">Your Doubt</label>
              <textarea
                name="doubt"
                value={formData.doubt}
                onChange={handleChange}
                placeholder="Write your doubt here..."
                className="w-full border rounded-md p-2 h-28 resize-none"
              />
              {errors.doubt && <p className="text-red-500 text-sm">{errors.doubt}</p>}
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium mb-1">Upload Image (optional)</label>
              <input
                ref={fileInputRef}
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="w-full border rounded-md p-2"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              className="bg-[#1E5631] text-white px-6 py-2 rounded-md w-full sm:w-auto"
            >
              Submit Doubt
            </button>
          </form>
        </div>

        {/* Benefits Section */}
        <div className="text-center mt-16 px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-black">
            Discover the benefits of 'Ask a Doubt'
          </h2>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-[#EAF2FF] p-6 rounded-2xl shadow-md">
              <img
                src="https://cdn-icons-png.flaticon.com/512/998/998357.png"
                className="w-16 mx-auto mb-4"
                alt="Crafted by Expert"
                loading="lazy"
                decoding="async"
              />
              <h3 className="font-semibold text-lg mb-2">Crafted by Expert</h3>
              <p className="text-gray-700 text-sm">
                Created by highly skilled professionals.
              </p>
            </div>

            <div className="bg-[#E7F7E8] p-6 rounded-2xl shadow-md">
              <img
                src="https://cdn-icons-png.flaticon.com/512/3176/3176366.png"
                className="w-16 mx-auto mb-4"
                alt="Vast Knowledge"
                loading="lazy"
                decoding="async"
              />
              <h3 className="font-semibold text-lg mb-2">Vast Knowledge</h3>
              <p className="text-gray-700 text-sm">
                Deep understanding across subjects.
              </p>
            </div>

            <div className="bg-[#ECEBFF] p-6 rounded-2xl shadow-md">
              <img
                src="https://cdn-icons-png.flaticon.com/512/2896/2896418.png"
                className="w-16 mx-auto mb-4"
                alt="Problem Solving"
                loading="lazy"
                decoding="async"
              />
              <h3 className="font-semibold text-lg mb-2">Problem Solving</h3>
              <p className="text-gray-700 text-sm">
                Effective solutions for all doubts.
              </p>
            </div>

            <div className="bg-[#FAE9F7] p-6 rounded-2xl shadow-md">
              <img
                src="https://cdn-icons-png.flaticon.com/512/845/845646.png"
                className="w-16 mx-auto mb-4"
                alt="Verified Answer"
                loading="lazy"
                decoding="async"
              />
              <h3 className="font-semibold text-lg mb-2">Verified Answer</h3>
              <p className="text-gray-700 text-sm">
                Accurate and reliable responses.
              </p>
            </div>
          </div>
        </div>
      </main>

      <div className="pt-10">
        <Footer />
      </div>
    </section>
  );
};

export default AskDoubtSection;
