import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import hiringImg from "../../assets/hiring2.webp";
import ContactUs from "../../components/Contact";
import { useNavigate } from "react-router-dom";
import HeaderSection from "../../components/HeaderSection";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer";
import { api } from "../../lib/api";

const Career = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;
  const canonicalUrl = `${SITE_URL}/career`;

  const pageTitle = "Careers | Prospect Education";
  const pageDescription =
    "Explore current job openings at Prospect Education. View roles, responsibilities, requirements, and apply online.";

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await api.get("/careers/jobs?active=true");
        const list = res?.data?.jobs || [];
        if (!mounted) return;
        setJobs(list);
      } catch (e) {
        console.error("Failed to load jobs:", e);
        if (!mounted) return;
        setJobs([]);
      } finally {
        if (!mounted) return;
        setLoadingJobs(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const jsonLd = useMemo(() => {
    const itemList = (jobs || []).slice(0, 50).map((job, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `${SITE_URL}/career/${job._id}`,
      name: job.title,
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
  }, [jobs, SITE_URL, canonicalUrl]);

  return (
    <section className="bg-[#F9FAFB] text-[#124734] font-[Open_Sans,sans-serif]">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
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
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
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
        {/* ------------ About the Company Section ------------ */}
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-16">
          <h2 className="text-3xl font-bold mb-10 text-center md:text-left">
            About the Company
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div className="bg-[#A7E1B2] p-8 rounded-xl shadow-md text-center md:text-left">
              <img
                src="https://cdn-icons-png.flaticon.com/512/9971/9971421.png"
                className="w-12 mb-4 mx-auto md:mx-0"
                alt="mission"
                loading="lazy"
                decoding="async"
              />
              <h3 className="text-2xl font-semibold mb-2">Mission</h3>
              <p className="text-sm leading-relaxed">
                Our mission is to revolutionize education by providing innovative
                and accessible learning solutions to students all over India.
              </p>
            </div>

            <div className="bg-[#A7E1B2] p-8 rounded-xl shadow-md text-center md:text-left">
              <img
                src="https://cdn-icons-png.flaticon.com/512/8279/8279756.png"
                className="w-12 mb-4 mx-auto md:mx-0"
                alt="values"
                loading="lazy"
                decoding="async"
              />
              <h3 className="text-2xl font-semibold mb-2">Values</h3>
              <p className="text-sm leading-relaxed">
                We are committed to excellence, collaboration, and continuous
                improvement. We believe in empowering learners and fostering a
                love for lifelong learning.
              </p>
            </div>

            <div className="bg-[#A7E1B2] p-8 rounded-xl shadow-md text-center md:text-left">
              <img
                src="https://cdn-icons-png.flaticon.com/512/13680/13680271.png"
                className="w-12 mb-4 mx-auto md:mx-0"
                alt="achievements"
                loading="lazy"
                decoding="async"
              />
              <h3 className="text-2xl font-semibold mb-2">Achievements</h3>
              <p className="text-sm leading-relaxed">
                Over the years, we have helped millions of students achieve
                academic success. Our platform has been recognized and awarded
                for its impact on education.
              </p>
            </div>
          </div>
        </div>

        {/* ------------ Open Positions ------------ */}
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 text-left">
          <h2 className="text-3xl font-bold mb-10 text-center md:text-left">
            Open Positions
          </h2>

          <div className="space-y-6">
            {loadingJobs ? (
              <div className="p-6 rounded-xl shadow-md bg-white">Loading jobs...</div>
            ) : jobs.length === 0 ? (
              <div className="p-6 rounded-xl shadow-md bg-white">
                No job openings right now.
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job._id}
                  className="p-6 rounded-xl shadow-md bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div>
                    <h3 className="text-lg font-semibold">{job.title}</h3>
                    <p className="text-sm mt-1">
                      Vacancy: {job.vacancy} &nbsp;/&nbsp; Location: {job.location}
                      &nbsp;/&nbsp; Job Type: {job.jobType}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate(`/career/${job._id}`)}
                    className="bg-[#1E5631] text-white px-5 py-2 rounded-lg font-medium hover:bg-[#154727] transition w-full md:w-auto"
                    type="button"
                  >
                    View Details
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ------------ Company Culture Section ------------ */}
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 text-left">
          <h2 className="text-3xl font-bold mb-10 text-center md:text-left">
            Company Culture
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#A7E1B2] p-8 rounded-xl shadow-md flex items-start gap-6">
              <img
                src="https://cdn-icons-png.flaticon.com/512/12535/12535136.png"
                alt="Collaborative Icon"
                className="w-14"
                loading="lazy"
                decoding="async"
              />
              <div>
                <h3 className="text-2xl font-semibold mb-2">
                  Collaborative Work Environment
                </h3>
                <p className="text-sm leading-relaxed">
                  We foster a collaborative workplace where everyone’s ideas matter...
                </p>
              </div>
            </div>

            <div className="bg-[#A7E1B2] p-8 rounded-xl shadow-md flex items-start gap-6">
              <img
                src="https://cdn-icons-png.flaticon.com/512/8917/8917893.png"
                alt="Innovation Icon"
                className="w-14"
                loading="lazy"
                decoding="async"
              />
              <div>
                <h3 className="text-2xl font-semibold mb-2">Innovation</h3>
                <p className="text-sm leading-relaxed">
                  We believe in pushing the boundaries of education technology...
                </p>
              </div>
            </div>

            <div className="bg-[#A7E1B2] p-8 rounded-xl shadow-md flex items-start gap-6">
              <img
                src="https://cdn-icons-png.flaticon.com/512/11817/11817390.png"
                alt="Diversity Icon"
                className="w-14"
                loading="lazy"
                decoding="async"
              />
              <div>
                <h3 className="text-2xl font-semibold mb-2">Diversity and Inclusion</h3>
                <p className="text-sm leading-relaxed">
                  We celebrate diversity and believe it leads to stronger results...
                </p>
              </div>
            </div>

            <div className="bg-[#A7E1B2] p-8 rounded-xl shadow-md flex items-start gap-6">
              <img
                src="https://cdn-icons-png.flaticon.com/512/10893/10893970.png"
                alt="Growth Icon"
                className="w-14"
                loading="lazy"
                decoding="async"
              />
              <div>
                <h3 className="text-2xl font-semibold mb-2">Professional Growth</h3>
                <p className="text-sm leading-relaxed">
                  We support the professional development of our team...
                </p>
              </div>
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

export default Career;
