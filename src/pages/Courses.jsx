import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer";
import CourseCard from "./Courses/CourseCard";
import { publicCoursesApi } from "../services/publicCourses";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;
  const canonicalUrl = `${SITE_URL}/courses`;

  const pageTitle = "All Courses | ProspectEdu";
  const pageDescription =
    "Browse all ProspectEdu courses. Explore curated programs, flexible learning modes, and structured content designed for students and professionals.";

useEffect(() => {
  const fetchAllCourses = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/scholarship/result`
      );
      const data = await res.json();

      const backendCourses = data.courses || [];

      const uiCourses = backendCourses.map((c) => ({
        _id: c._id,
        slug: c.slug,
        title: c.title,
        image: c.img,
        mode: c.short,
        startDate: c.date,
        price: c.price,
      }));

      setCourses(uiCourses);
    } catch (err) {
      console.error("Failed to load courses", err);
    } finally {
      setLoading(false);
    }
  };

  fetchAllCourses();
}, []);

  const jsonLd = useMemo(() => {
    const items = (courses || []).slice(0, 100).map((c, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: c.title,
      url: c.slug ? `${SITE_URL}/courses/${c.slug}` : canonicalUrl,
    }));

    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: items,
      },
    };
  }, [courses, SITE_URL, canonicalUrl]);

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

      <Navbar />

      <section className="py-16 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-heading text-[#124734] mb-6">All Courses</h1>

          {loading ? (
            <p className="text-center text-[#5B7065]">Loading courses...</p>
          ) : courses.length === 0 ? (
            <p className="text-center text-[#5B7065]">No courses available.</p>
          ) : (
            <>
              <p className="text-center text-[#5B7065] mb-10">
                Total Courses {courses.length}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
