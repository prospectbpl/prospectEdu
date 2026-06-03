import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import hiringImg from "../../assets/hiring2.webp";
import ContactUs from "../../components/Contact";
import HeaderSection from "../../components/HeaderSection";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer";
import { api } from "../../lib/api";

const JobDetail = () => {
  const { id } = useParams();

  const [showForm, setShowForm] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);

  const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;
  const canonicalUrl = `${SITE_URL}/career/${id}`;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    highestEducation: "",
    canRelocate: "",
    fluentIn: "",
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await api.get(`/careers/jobs/${id}`);
        if (!mounted) return;
        setJob(res?.data?.job || null);
      } catch (e) {
        console.error("Failed to load job:", e);
        if (!mounted) return;
        setJob(null);
      } finally {
        if (!mounted) return;
        setLoadingJob(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  const { responsibilities, requirements } = useMemo(() => {
    const desc = (job?.description || "").toString();
    const descLines = desc.split("\n").map((l) => l.trim());

    const responsibilitiesStart = descLines.indexOf("Responsibilities:");
    const requirementsStart = descLines.indexOf("Requirements:");

    const responsibilitiesList =
      responsibilitiesStart !== -1 && requirementsStart !== -1
        ? descLines
            .slice(responsibilitiesStart + 1, requirementsStart)
            .filter((l) => l.startsWith("•"))
        : responsibilitiesStart !== -1
        ? descLines.slice(responsibilitiesStart + 1).filter((l) => l.startsWith("•"))
        : [];

    const requirementsList =
      requirementsStart !== -1
        ? descLines.slice(requirementsStart + 1).filter((l) => l.startsWith("•"))
        : [];

    return { responsibilities: responsibilitiesList, requirements: requirementsList };
  }, [job]);

  const pageTitle = useMemo(() => {
    if (!job?.title) return "Job Opening | Prospect Education";
    return `${job.title} | Careers | Prospect Education`;
  }, [job]);

  const pageDescription = useMemo(() => {
    if (!job) return "View job details and apply at Prospect Education.";
    const parts = [
      job.title,
      job.location ? `Location: ${job.location}` : "",
      job.jobType ? `Job Type: ${job.jobType}` : "",
    ].filter(Boolean);
    return parts.join(" • ");
  }, [job]);

  const jsonLd = useMemo(() => {
    if (!job) return null;

    // Minimal, safe JobPosting schema (no layout impact)
    return {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: job.title,
      description: (job.description || "").toString().slice(0, 5000),
      datePosted: job.createdAt || undefined,
      employmentType: job.jobType || undefined,
      jobLocation: job.location
        ? {
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              addressLocality: job.location,
              addressCountry: "IN",
            },
          }
        : undefined,
      hiringOrganization: {
        "@type": "Organization",
        name: "Prospect Education",
        url: SITE_URL,
      },
      url: canonicalUrl,
    };
  }, [job, SITE_URL, canonicalUrl]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (resumeFile) fd.append("resume", resumeFile);

      await api.post(`/careers/jobs/${id}/apply`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Application submitted ✅");
      setShowForm(false);
      setForm({
        name: "",
        email: "",
        phone: "",
        highestEducation: "",
        canRelocate: "",
        fluentIn: "",
      });
      setResumeFile(null);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingJob) {
    return (
      <section className="bg-[#F9FAFB] text-[#124734] font-[Open_Sans,sans-serif]">
        <Helmet>
          <title>Careers | Prospect Education</title>
          <meta
            name="description"
            content="Explore job opportunities at Prospect Education."
          />
          <link rel="canonical" href={canonicalUrl} />
        </Helmet>

        <Navbar />
        <HeaderSection
          page="Career"
          title="Join the Future of Education"
          subtitle="Unlock your potential and make a difference in the lives  
            of millions of learners worldwide."
          image={hiringImg}
        />
        <h2 className="text-center mt-10">Loading...</h2>
        <div className="pt-10">
          <Footer />
        </div>
      </section>
    );
  }

  if (!job) {
    return (
      <section className="bg-[#F9FAFB] text-[#124734] font-[Open_Sans,sans-serif]">
        <Helmet>
          <title>Job not found | Prospect Education</title>
          <meta name="description" content="The requested job opening was not found." />
          <link rel="canonical" href={canonicalUrl} />
        </Helmet>

        <Navbar />
        <HeaderSection
          page="Career"
          title="Join the Future of Education"
          subtitle="Unlock your potential and make a difference in the lives  
            of millions of learners worldwide."
          image={hiringImg}
        />
        <h2 className="text-center mt-10 text-red-600">Job not found</h2>
        <div className="pt-10">
          <Footer />
        </div>
      </section>
    );
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
        <meta property="og:image" content={`${SITE_URL}${hiringImg}`} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={`${SITE_URL}${hiringImg}`} />

        {/* JSON-LD */}
        {jsonLd ? (
          <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        ) : null}
      </Helmet>

      <Navbar />

      <HeaderSection
        page="Career"
        title="Join the Future of Education"
        subtitle="Unlock your potential and make a difference in the lives  
            of millions of learners worldwide."
        image={hiringImg}
      />

      <main>
        <div className="max-w-7xl mx-auto py-12 flex flex-col lg:flex-row gap-10 text-left">
          <div className="w-full lg:w-3/4">
            <h1 className="text-3xl font-bold mb-2">{job.title}</h1>

            <p className="text-lg mb-6">
              <strong>Vacancy:</strong> {job.vacancy} &nbsp;/&nbsp;
              <strong>Location:</strong> {job.location} &nbsp;/&nbsp;
              <strong>Job Type:</strong> {job.jobType}
            </p>

            <h3 className="text-xl font-semibold mt-8 mb-3">1. Responsibilities:</h3>
            <ul className="list-disc pl-6 space-y-1">
              {responsibilities.map((item, i) => (
                <li key={i}>{item.replace("•", "").trim()}</li>
              ))}
            </ul>

            <h3 className="text-xl font-semibold mt-8 mb-3">2. Requirements:</h3>
            <ul className="list-disc pl-6 space-y-1">
              {requirements.map((item, i) => (
                <li key={i}>{item.replace("•", "").trim()}</li>
              ))}
            </ul>

            <button
              onClick={() => setShowForm(true)}
              className="mt-10 bg-[#1E5631] text-white px-5 py-2 rounded-lg w-full sm:w-auto"
              type="button"
            >
              Apply Now
            </button>
          </div>

          <div className="w-full lg:w-1/4">
            <h3 className="text-lg font-semibold mb-3">
              Share this opening with friends
            </h3>

            <button
              onClick={copyLink}
              className="px-4 py-2 bg-[#1E5631] text-white rounded-md w-full sm:w-auto"
              type="button"
            >
              Copy Link
            </button>

            {showCopied && (
              <p className="mt-2 text-sm bg-[#A7E1B2] text-white px-3 py-1 rounded">
                URL copied to clipboard!
              </p>
            )}
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center p-4 z-50">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl p-6 relative max-h-[80vh] overflow-y-auto">
              <button
                className="absolute top-3 right-4 text-2xl text-gray-500 hover:text-gray-700"
                onClick={() => setShowForm(false)}
                type="button"
              >
                ×
              </button>

              <h2 className="text-2xl font-bold text-[#124734]">Join Our Journey</h2>
              <p className="text-gray-600 mb-4 text-sm">
                Your email and phone number will not be shared.
              </p>

              <form onSubmit={submitApplication} className="space-y-4 text-left">
                <div>
                  <label className="block mb-1">Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1E5631]"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1E5631]"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1">Phone Number</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1E5631]"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1">Highest Education</label>
                  <select
                    name="highestEducation"
                    value={form.highestEducation}
                    onChange={onChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1E5631]"
                    required
                  >
                    <option value="">-- Select option --</option>
                    <option value="12th Pass">12th Pass</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Post Graduate">Post Graduate</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Can you relocate?</label>
                  <select
                    name="canRelocate"
                    value={form.canRelocate}
                    onChange={onChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1E5631]"
                    required
                  >
                    <option value="">-- Select option --</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Fluent In</label>
                  <select
                    name="fluentIn"
                    value={form.fluentIn}
                    onChange={onChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1E5631]"
                    required
                  >
                    <option value="">-- Select option --</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Upload Resume (PDF)</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                    className="w-full border rounded-lg file:bg-[#A7E1B2] file:text-[#124734] file:px-4 file:py-2 file:rounded-lg"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#1E5631] w-full text-white py-3 rounded-lg text-lg font-semibold hover:bg-[#154727] transition disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </form>
            </div>
          </div>
        )}

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

export default JobDetail;
