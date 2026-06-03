import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer";
import { publicCoursesApi } from "../../services/publicCourses";

export default function PublicCourseDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;
  const canonicalUrl = `${SITE_URL}/courses/${encodeURIComponent(slug || "")}`;

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await publicCoursesApi.getBySlug(slug);
        setCourse(res.data.course);
      } catch (e) {
        setError(e?.response?.data?.message || "Course not found");
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchCourse();
  }, [slug]);

  const cost = useMemo(() => {
    const price = Number(course?.price || 0);
    const tax = Number(course?.tax || 0);
    const discount = Number(course?.discount || 0);

    const discountAmt = (price * discount) / 100;
    const taxAmt = (price * tax) / 100;
    const total = price + taxAmt - discountAmt;

    return { price, tax, discount, discountAmt, taxAmt, total };
  }, [course]);

  const pageTitle = useMemo(() => {
    return course?.title ? `${course.title} | Course | ProspectEdu` : "Course | ProspectEdu";
  }, [course]);

  const pageDescription = useMemo(() => {
    const text = (course?.short || course?.description || "")
      .toString()
      .replace(/\s+/g, " ")
      .trim();
    return text ? text.slice(0, 160) : "Explore course details, pricing, and enroll on ProspectEdu.";
  }, [course]);

  const ogImage = useMemo(() => {
    const img = course?.img || "/placeholder-course.png";
    if (typeof img === "string" && /^https?:\/\//i.test(img)) return img;
    return `${SITE_URL}${img.startsWith("/") ? "" : "/"}${img}`;
  }, [course, SITE_URL]);

  const jsonLd = useMemo(() => {
    if (!course) return null;
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: course.title,
      description: pageDescription,
      image: [ogImage],
      url: canonicalUrl,
      brand: { "@type": "Brand", name: "ProspectEdu" },
      offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        price: Number(cost.total || 0).toFixed(2),
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/checkout/${course._id}`,
      },
    };
  }, [course, pageDescription, ogImage, canonicalUrl, SITE_URL, cost.total]);

  if (loading) {
    return (
      <>
        <Navbar />
        <p className="text-center py-20 text-gray-600">Loading...</p>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Course not found | ProspectEdu</title>
          <meta name="description" content="The requested course page was not found." />
          <link rel="canonical" href={canonicalUrl} />
        </Helmet>

        <Navbar />
        <p className="text-center py-20 text-red-500">{error}</p>
        <Footer />
      </>
    );
  }

  if (!course) return null;

  const handleBuyNow = () => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) {
      navigate("/login", { state: { from: `/checkout/${course._id}` } });
      return;
    }
    navigate(`/checkout/${course._id}`);
  };

  return (
    <>
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

      <section className="py-16 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT SIDE */}
            <div className="col-span-1">
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <img
                  src={course.img || "/placeholder-course.png"}
                  alt={course.title}
                  className="w-full h-40 object-contain bg-[#F0F5F2] rounded-t-xl"
                  loading="lazy"
                  decoding="async"
                />

                <div className="p-4">
                  <h1 className="text-xl font-semibold text-[#124734]">{course.title}</h1>

                  <p className="text-gray-600 mt-2">{course.short}</p>

                  <button
                    onClick={handleBuyNow}
                    className="mt-6 w-full bg-[#009846] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#007a3a]"
                    type="button"
                  >
                    Buy Now
                  </button>
                </div>
              </div>

              {/* ABOUT COURSE */}
              <div className="bg-white rounded-xl shadow p-5 mt-6">
                <h2 className="font-semibold text-[#124734] mb-3">About Course</h2>

                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <p className="text-gray-500">Professor(s)</p>
                  <div className="font-medium flex flex-col">
                    {course.assignedTeachers?.length
                      ? course.assignedTeachers.map((t, i) => (
                          <span key={t._id || i}>• {t.fullName}</span>
                        ))
                      : course.professors?.length
                      ? course.professors.map((pro, i) => <span key={i}>• {pro}</span>)
                      : "N/A"}
                  </div>

                  <p className="text-gray-500">Start Date</p>
                  <p className="font-medium">{course.date || "—"}</p>
                </div>

                {/* COST BREAKDOWN */}
                <div className="mt-6 border-t pt-4">
                  <h3 className="font-semibold text-[#124734] mb-2">Cost Breakdown</h3>

                  <table className="w-full text-sm">
                    <tbody className="text-gray-700">
                      <tr>
                        <td className="py-2">Base Price</td>
                        <td className="py-2 text-right font-medium">₹{cost.price}</td>
                      </tr>

                      {cost.discount > 0 && (
                        <tr>
                          <td className="py-2">Discount</td>
                          <td className="py-2 text-right text-red-600">
                            -₹{cost.discountAmt.toFixed(2)}
                          </td>
                        </tr>
                      )}

                      {cost.tax > 0 && (
                        <tr>
                          <td className="py-2">Tax</td>
                          <td className="py-2 text-right text-yellow-600">
                            +₹{cost.taxAmt.toFixed(2)}
                          </td>
                        </tr>
                      )}

                      <tr className="border-t">
                        <td className="py-3 font-semibold">Total</td>
                        <td className="py-3 font-semibold text-right text-[#124734]">
                          ₹{cost.total.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="col-span-2">
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-lg font-semibold text-[#124734] mb-4">Course Description</h2>
                <p className="text-gray-600 mb-4">{course.description}</p>

                <h2 className="text-lg font-semibold text-[#124734] mb-4">Course Information</h2>
                <p className="text-gray-600">{course.info || course.description}</p>

                <div className="mt-6">
                  <h3 className="font-semibold text-[#124734] mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {course.tags?.length
                      ? course.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-[#ECF5EE] text-[#124734] rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))
                      : "No tags available"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
