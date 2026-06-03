// src/pages/Test/CheckoutTestLearning.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer";
import testImg from "../../assets/test1.webp";
import { fetchPublicTestSeries, fetchPublicTestSeriesById } from "../../lib/testSeriesApi";
import {
  confirmTestPurchase,
  hasPurchasedSeries,
  createTestSeriesRazorpayOrder,
  verifyTestSeriesRazorpayPayment,
} from "../../lib/testPurchaseApi";
import { Helmet } from "react-helmet-async";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutTestLearning() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [purchased, setPurchased] = useState(false);

  const token = sessionStorage.getItem("accessToken");
  const isLoggedIn = !!token;

  const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;
  const canonicalUrl = `${SITE_URL}/checkout-test-learning/${id}`;

  const pageTitle = useMemo(() => {
    return series?.title ? `Checkout - ${series.title} | ProspectEdu` : "Checkout | ProspectEdu";
  }, [series]);

  const pageDescription = useMemo(() => {
    return series?.title
      ? `Complete checkout for ${series.title} on ProspectEdu.`
      : "Complete your test series checkout on ProspectEdu.";
  }, [series]);

  const ogImage = useMemo(() => {
    const img = series?.imageUrl || testImg;
    if (typeof img === "string" && /^https?:\/\//i.test(img)) return img;
    return `${SITE_URL}${img}`;
  }, [series, SITE_URL]);

  // ✅ JSON-LD for checkout page
  const jsonLd = useMemo(() => {
    if (!series) return null;
    const price = Number(series?.price || 0);
    return {
      "@context": "https://schema.org",
      "@type": "CheckoutPage",
      name: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      mainEntity: {
        "@type": "Offer",
        priceCurrency: "INR",
        price,
        url: canonicalUrl,
        availability: "https://schema.org/InStock",
      },
    };
  }, [series, pageTitle, pageDescription, canonicalUrl]);

  useEffect(() => {
    if (!isLoggedIn) {
      sessionStorage.setItem("postLoginRedirect", `/checkout-test-learning/${id}`);
      navigate("/login", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, id]);

  useEffect(() => {
    (async () => {
      if (!id) return;

      setLoading(true);
      try {
        let data = null;
        try {
          data = await fetchPublicTestSeriesById(id);
        } catch (err) {
          const list = await fetchPublicTestSeries();
          data = Array.isArray(list) ? list.find((x) => String(x._id) === String(id)) : null;
        }

        setSeries(data);

        if (isLoggedIn) {
          const ok = await hasPurchasedSeries(id);
          setPurchased(ok);
        } else {
          setPurchased(false);
        }
      } catch (e) {
        console.error("Checkout load error:", e);
        setSeries(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isLoggedIn]);

  const price = useMemo(() => Number(series?.price || 0), [series]);
  const mrp = useMemo(() => Number(series?.mrp || 0), [series]);
  const discount = useMemo(() => (mrp > price ? mrp - price : 0), [mrp, price]);

  const onPayNow = async () => {
    if (!series) return;

    if (Number(series.price || 0) === 0) {
      setPaying(true);
      try {
        await confirmTestPurchase({
          testSeriesId: series._id,
          provider: "FREE",
          transactionId: "FREE_" + Date.now(),
        });
        navigate("/student/test-series", { replace: true });
      } catch (e) {
        console.error(e);
        alert(e?.response?.data?.message || "Unlock failed");
      } finally {
        setPaying(false);
      }
      return;
    }

    setPaying(true);
    try {
      const ok = await loadRazorpayScript();
      if (!ok) {
        alert("Razorpay SDK failed to load. Check internet / adblocker.");
        return;
      }

      const order = await createTestSeriesRazorpayOrder(series._id);

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "ProspectEdu",
        description: `Purchase: ${order.title || "Test Series"}`,
        order_id: order.razorpayOrderId,

        handler: async (response) => {
          try {
            await verifyTestSeriesRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              testSeriesId: series._id,
            });

            navigate("/student/test-series", { replace: true });
          } catch (e) {
            console.error(e);
            alert(e?.response?.data?.message || "Payment verification failed");
            setPaying(false);
          }
        },

        modal: { ondismiss: () => setPaying(false) },
        theme: { color: "#009846" },
      };

      const rz = new window.Razorpay(options);
      rz.open();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Payment failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#124734]">
        Loading...
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#124734]">
        Checkout item not found.
      </div>
    );
  }

  if (purchased) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <Helmet>
          <title>{pageTitle}</title>
          <meta name="description" content={pageDescription} />
          <meta name="robots" content="noindex, nofollow" />
          <link rel="canonical" href={canonicalUrl} />
        </Helmet>

        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-[#E6F4EC] p-8 text-center">
            <p className="text-xl font-bold text-[#124734]">✅ Already Purchased</p>
            <p className="text-[#5B7065] mt-2">This test series is already in your account.</p>
            <button
              onClick={() => navigate("/student/test-series")}
              className="mt-6 px-5 py-2 rounded-xl bg-[#009846] text-white fsont-semibold"
              type="button"
            >
              Go to My Test Series
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#124734] font-[Open_Sans,sans-serif]">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:type" content="website" />
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

      <main className="max-w-6xl mx-auto px-6 py-10 text-left">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-[#E6F4EC] overflow-hidden">
            <div className="relative">
              <img
                src={series.imageUrl || testImg}
                alt={series.title}
                className="w-full h-56 object-contain bg-[#F9FAFB]"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full bg-[#124734] text-white">
                {series.type}
              </div>
            </div>

            <div className="p-6">
              <h1 className="text-2xl font-extrabold text-[#124734]">{series.title}</h1>
              <p className="text-[#5B7065] mt-2">
                Language: <b className="text-[#124734]">{series.language}</b> • Tests:{" "}
                <b className="text-[#124734]">{series.totalTest}</b> • Questions:{" "}
                <b className="text-[#124734]">{series.totalQuestion}</b>
              </p>

              <div className="mt-5 bg-[#F9FAFB] border border-[#E6F4EC] rounded-2xl p-5">
                <p className="font-bold text-[#124734]">What you will get</p>
                <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[#5B7065]">
                  <li>✅ Full Test Access</li>
                  <li>✅ Schedule (if provided)</li>
                  <li>✅ Updates / Improvements</li>
                  <li>✅ Mobile Friendly</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[380px]">
            <div className="bg-white rounded-2xl shadow-sm border border-[#E6F4EC] p-6 sticky top-24">
              <h2 className="text-lg font-extrabold text-[#124734]">Order Summary</h2>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#5B7065]">Price</span>
                  <span className="font-bold">{price === 0 ? "Free" : `₹${price}`}</span>
                </div>

                {mrp > price && (
                  <div className="flex justify-between">
                    <span className="text-[#5B7065]">MRP</span>
                    <span className="line-through text-gray-400">₹{mrp}</span>
                  </div>
                )}

                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#5B7065]">Discount</span>
                    <span className="font-bold text-[#009846]">-₹{discount}</span>
                  </div>
                )}

                <hr className="border-[#E6F4EC]" />

                <div className="flex justify-between text-base">
                  <span className="font-extrabold">Total</span>
                  <span className="font-extrabold">{price === 0 ? "Free" : `₹${price}`}</span>
                </div>
              </div>

              <button
                onClick={onPayNow}
                disabled={paying}
                className={`mt-6 w-full py-3 rounded-xl font-bold shadow transition ${
                  paying
                    ? "bg-gray-200 text-gray-600 cursor-wait"
                    : "bg-[#009846] text-white hover:opacity-95"
                }`}
                type="button"
              >
                {paying ? "Processing..." : price === 0 ? "Unlock Now" : "Pay Now"}
              </button>

              <p className="text-xs text-[#5B7065] mt-3">
                Note: You will be redirected after successful payment confirmation.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
