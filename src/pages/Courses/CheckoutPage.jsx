import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { publicCoursesApi } from "../../services/publicCourses";
import { purchasesApi } from "../../services/purchases";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);

    const existing = document.getElementById("razorpay-checkout-js");
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const token = sessionStorage.getItem("accessToken");
  const isStudentLoggedIn = Boolean(token);

  const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;
  const canonicalUrl = `${SITE_URL}/checkout/${courseId}`;

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const res = await publicCoursesApi.getById(courseId);
        setCourse(res.data.course);
      } catch (e) {
        setError("Failed to load course");
      } finally {
        setLoading(false);
      }
    };
    if (courseId) fetchCourse();
  }, [courseId]);

  const priceDetails = useMemo(() => {
    const price = Number(course?.price || 0);
    const taxPercent = Number(course?.tax || 0);
    const discount = Number(course?.discount || 0);

    const taxAmount = (price * taxPercent) / 100;
    const total = Math.max(0, price - discount + taxAmount);

    return { price, taxPercent, taxAmount, discount, total };
  }, [course]);

  const pageTitle = course?.title
    ? `Checkout - ${course.title} | ProspectEdu`
    : "Checkout | ProspectEdu";

  const pageDescription = course?.title
    ? `Complete checkout for ${course.title} on ProspectEdu. Secure payments via Razorpay.`
    : "Complete your checkout on ProspectEdu.";

  const jsonLd = useMemo(() => {
    if (!course) return null;
    return {
      "@context": "https://schema.org",
      "@type": "CheckoutPage",
      name: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      mainEntity: {
        "@type": "Offer",
        priceCurrency: "INR",
        price: Number(priceDetails.total || 0),
        availability: "https://schema.org/InStock",
        url: canonicalUrl,
      },
    };
  }, [course, pageTitle, pageDescription, canonicalUrl, priceDetails.total]);

  const handlePayNow = async () => {
    if (!isStudentLoggedIn) {
      navigate("/login", { state: { from: `/checkout/${courseId}` } });
      return;
    }

    try {
      setPaying(true);

      const ok = await loadRazorpayScript();
      if (!ok) {
        alert("Failed to load Razorpay. Please check your internet and try again.");
        return;
      }

      const checkoutRes = await purchasesApi.checkout(courseId);
      const purchaseId = checkoutRes.data.purchaseId;

      const orderRes = await purchasesApi.createRazorpayOrder(purchaseId);
      const { keyId, razorpayOrderId, amount, currency, courseTitle } = orderRes.data.data;

      const options = {
        key: keyId,
        amount,
        currency,
        name: "ProspectEdu",
        description: courseTitle || course?.title || "Course Purchase",
        order_id: razorpayOrderId,
        theme: { color: "#124734" },
        handler: async function (response) {
          try {
            await purchasesApi.verifyRazorpayPayment(purchaseId, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            navigate("/student/my-courses");
          } catch (err) {
            alert(err?.response?.data?.message || "Payment verification failed");
          }
        },
        modal: { ondismiss: () => {} },
      };

      const rz = new window.Razorpay(options);
      rz.open();
    } catch (err) {
      alert(err?.response?.data?.message || "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <p className="text-center py-20">Loading checkout...</p>;
  if (error || !course)
    return (
      <p className="text-center py-20 text-red-500">{error || "Course not found"}</p>
    );

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* ✅ Checkout should not be indexed */}
        <meta name="robots" content="noindex, nofollow" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />

        {jsonLd ? <script type="application/ld+json">{JSON.stringify(jsonLd)}</script> : null}
      </Helmet>

      {/* BREADCRUMB */}
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-6 pt-6 text-sm text-gray-500">
          <span className="cursor-pointer hover:text-[#124734]" onClick={() => navigate("/")}>
            Home
          </span>
          {" / "}
          <span
            className="cursor-pointer hover:text-[#124734]"
            onClick={() => navigate(`/courses/${course.slug}`)}
          >
            {course.title}
          </span>
          {" / "}
          <span className="text-[#124734] font-medium">Checkout</span>
        </div>
      </div>

      {/* MAIN */}
      <section className="min-h-screen bg-[#F9FAFB] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {/* LEFT */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow border border-[#A7E1B2] flex flex-col">
            <div className="bg-[#ECF5EE] px-6 py-4 rounded-t-xl border-b border-[#A7E1B2]">
              <h2 className="text-xl font-heading font-semibold text-[#124734]">
                Checkout Details
              </h2>
            </div>

            <div className="p-6 flex-1">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                <img
                  src={course.img || "/placeholder-course.png"}
                  alt={course.title}
                  className="w-full sm:w-44 h-40 sm:h-36 object-contain bg-[#F7FBF8] rounded-xl border border-[#A7E1B2] p-3"
                  loading="lazy"
                  decoding="async"
                />

                <div>
                  <h3 className="text-lg font-semibold text-[#124734]">{course.title}</h3>

                  <div className="flex gap-2 mt-3 flex-wrap">
                    <span className="px-3 py-1 text-xs border border-[#A7E1B2] rounded-full text-[#124734]">
                      {course.short || "Online"}
                    </span>
                    <span className="px-3 py-1 text-xs border border-[#A7E1B2] rounded-full text-[#124734]">
                      ₹{priceDetails.price}/-
                    </span>
                    {priceDetails.discount > 0 && (
                      <span className="px-3 py-1 text-xs border border-[#A7E1B2] rounded-full text-[#124734]">
                        Discount: ₹{priceDetails.discount}/-
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* PAYMENT OPTION */}
              <div className="mt-10">
                <h4 className="font-semibold mb-4 text-[#124734]">Choose Your Payment Option</h4>

                {!isStudentLoggedIn ? (
                  <div className="border border-[#A7E1B2] rounded-lg p-4 bg-[#FFF7ED]">
                    <p className="font-medium text-[#7C2D12]">Login required</p>
                    <p className="text-sm text-[#7C2D12]/80 mt-1">
                      Please login as a student to see payment options and continue checkout.
                    </p>

                    <button
                      onClick={() =>
                        navigate("/login", { state: { from: `/checkout/${courseId}` } })
                      }
                      className="mt-4 bg-[#124734] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#0f3b2b] transition"
                      type="button"
                    >
                      Login to Continue
                    </button>
                  </div>
                ) : (
                  <div className="border border-[#A7E1B2] rounded-lg p-4 flex items-center gap-4 bg-[#F7FBF8]">
                    <input type="radio" checked readOnly />
                    <div>
                      <p className="font-medium text-[#124734]">Razorpay</p>
                      <p className="text-sm text-[#5B7065]">UPI, Credit Card, Debit Card, Net Banking</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="bg-white rounded-xl shadow border border-[#A7E1B2] p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#124734] mb-4">Price Details</h3>

              <div className="space-y-3 text-sm text-[#5B7065]">
                <div className="flex justify-between">
                  <span>Item Price</span>
                  <span>₹{priceDetails.price}/-</span>
                </div>

                {priceDetails.discount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span>- ₹{priceDetails.discount}/-</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Tax ({priceDetails.taxPercent}%)</span>
                  <span>₹{priceDetails.taxAmount}/-</span>
                </div>

                <div className="flex justify-between text-green-700">
                  <span>Platform Charges</span>
                  <span>FREE</span>
                </div>

                <hr className="border-[#A7E1B2]" />

                <div className="flex justify-between font-semibold text-[#124734]">
                  <span>Total</span>
                  <span>₹{priceDetails.total}/-</span>
                </div>
              </div>
            </div>

            <div>
              {isStudentLoggedIn ? (
                <>
                  <button
                    onClick={handlePayNow}
                    disabled={paying}
                    className="mt-6 w-full bg-[#124734] text-white py-3 sm:py-3.5 rounded-lg font-semibold hover:bg-[#0f3b2b] transition disabled:opacity-60"
                    type="button"
                  >
                    {paying ? "Processing..." : "Pay Now"}
                  </button>

                  <p className="text-xs text-center text-[#5B7065] mt-3">🔒 Safe and secure payments</p>
                </>
              ) : (
                <p className="text-sm text-center text-[#5B7065] mt-6">Login to continue payment.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
