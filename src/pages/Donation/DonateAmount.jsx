// src/pages/Donate/DonateAmount.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import logoImg from "../../assets/logo.webp";
import { api } from "../../lib/api";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById("razorpay-sdk")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const DonateAmount = () => {
  const navigate = useNavigate();

  // ✅ Base URL for canonical/OG (set VITE_SITE_URL in prod)
  const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;
  const canonicalUrl = useMemo(() => `${SITE_URL}/donate-amount`, [SITE_URL]);

  const pageTitle = "Donate Online | ProspectEdu";
  const pageDescription =
    "Donate securely online to support Prospect Education & Social Welfare Society. Pay via UPI, cards, net banking and help students in need.";

  const [amount, setAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    pan: "",
  });

  const [saving, setSaving] = useState(false);

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const isValidEmail = (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
  const isValidMobile = (v) =>
    /^[0-9]{10}$/.test(String(v || "").trim());

  const finalAmount = useMemo(() => Number(amount), [amount]);

  // ✅ JSON-LD (DonateAction)
  const jsonLd = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "DonateAction",
      name: "Online donation",
      description: pageDescription,
      target: canonicalUrl,
      amount: finalAmount > 0 ? finalAmount : undefined,
      priceCurrency: "INR",
      recipient: {
        "@type": "Organization",
        name: "Prospect Education and Social Welfare Society",
        url: SITE_URL,
      },
    };
  }, [canonicalUrl, pageDescription, finalAmount, SITE_URL]);

  const validate = () => {
    if (!finalAmount || finalAmount <= 0)
      return "Please select a donation amount.";
    if (!form.firstName.trim()) return "First name is required.";
    if (!form.lastName.trim()) return "Last name is required.";
    if (!isValidEmail(form.email)) return "Valid email is required.";
    if (!isValidMobile(form.mobile))
      return "Valid 10 digit mobile number is required.";
    if (!form.address.trim()) return "Address is required.";
    if (!form.city.trim()) return "City is required.";
    if (!form.state.trim()) return "State is required.";
    if (!form.postalCode.trim()) return "Postal code is required.";
    if (!form.country.trim()) return "Country is required.";
    return null;
  };

  const handlePayNow = async () => {
    const err = validate();
    if (err) return alert(err);

    setSaving(true);
    try {
      const ok = await loadRazorpayScript();
      if (!ok) {
        return alert(
          "Razorpay SDK failed to load. Please check your internet and try again."
        );
      }

      // ✅ Step-1: create order on backend
      const res = await api.post("/donations/razorpay/order", {
        amount: finalAmount,
        currency: "INR",
        ...form,
      });

      const {
        donationId,
        orderId,
        amount: orderAmount,
        currency,
        keyId, // ✅ comes from backend
      } = res.data?.data || {};

      if (!donationId || !orderId) throw new Error("Order creation failed.");
      if (!keyId)
        throw new Error(
          "Razorpay keyId not received from backend. Please add keyId in API response."
        );

      const options = {
        key: keyId,
        name: "Prospect Education",
        description: "Donation",
        image: logoImg,
        order_id: orderId,
        amount: orderAmount,
        currency: currency || "INR",
        prefill: {
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          contact: form.mobile,
        },
        notes: {
          donationId,
        },
        theme: {
          color: "#124734",
        },
        handler: async function (response) {
          try {
            // ✅ Step-2: verify on backend
            const vr = await api.post("/donations/razorpay/verify", {
              donationId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            const verifiedDonationId = vr.data?.data?._id || donationId;
            navigate(`/donation-confirmation/${verifiedDonationId}`);
          } catch (e) {
            navigate(`/donation-confirmation/${donationId}?status=failed`);
          }
        },
        modal: {
          ondismiss: () => {
            navigate(`/donation-confirmation/${donationId}?status=failed`);
          },
        },
      };

      const rz = new window.Razorpay(options);
      rz.open();
    } catch (e) {
      alert(
        e?.response?.data?.message ||
          e?.message ||
          "Payment initiation failed."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#F9FAFB] min-h-screen py-10 flex flex-col items-center font-[Open_Sans,sans-serif]">
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
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />

        {/* JSON-LD */}
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <img
        src={logoImg}
        alt="Prospect Logo"
        className="w-52 mb-6"
        loading="lazy"
        decoding="async"
      />

      <div className="bg-[#A7E1B2] max-w-4xl w-full rounded-xl shadow-md p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <label className="border p-5 rounded-xl bg-white cursor-pointer hover:shadow-sm transition">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="amount"
                checked={finalAmount === 1000}
                onChange={() => setAmount(1000)}
              />
              <p className="text-xl font-semibold">₹1000</p>
            </div>
            <p className="text-gray-700">Thank you for paying ₹1000</p>
          </label>

          <label className="border p-5 rounded-xl bg-white cursor-pointer hover:shadow-sm transition">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="amount"
                checked={finalAmount === 2000}
                onChange={() => setAmount(2000)}
              />
              <p className="text-xl font-semibold">₹2000</p>
            </div>
            <p className="text-gray-700">Thank you for paying ₹2000</p>
          </label>

          <label className="border p-5 rounded-xl bg-white cursor-pointer hover:shadow-sm transition">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="amount"
                checked={finalAmount === 3000}
                onChange={() => setAmount(3000)}
              />
              <p className="text-xl font-semibold">₹3000</p>
            </div>
            <p className="text-gray-700">Thank you for paying ₹3000</p>
          </label>

          <label className="border p-5 rounded-xl bg-white cursor-pointer hover:shadow-sm transition">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="amount"
                checked={!!customAmount && finalAmount === Number(customAmount)}
                onChange={() => setAmount(customAmount)}
              />
              <div className="flex items-center gap-2">
                <p className="text-xl font-semibold">₹</p>
                <input
                  type="number"
                  className="w-24 border-b border-black outline-none bg-transparent"
                  placeholder="Amount"
                  value={customAmount}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCustomAmount(v);
                    setAmount(v);
                  }}
                />
              </div>
            </div>
            <p className="text-gray-700 mt-1">
              Thank you for paying ₹{customAmount || ""}
            </p>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            name="firstName"
            value={form.firstName}
            onChange={onChange}
            type="text"
            className="bg-white border p-3 rounded-lg"
            placeholder="First name"
          />
          <input
            name="lastName"
            value={form.lastName}
            onChange={onChange}
            type="text"
            className=" bg-white border p-3 rounded-lg"
            placeholder="Last Name"
          />
          <input
            name="email"
            value={form.email}
            onChange={onChange}
            type="email"
            className=" bg-white border p-3 rounded-lg"
            placeholder="Email"
          />
          <input
            name="mobile"
            value={form.mobile}
            onChange={onChange}
            type="text"
            inputMode="numeric"
            maxLength={10}
            className=" bg-white border p-3 rounded-lg"
            placeholder="Mobile"
          />
        </div>

        <textarea
          name="address"
          value={form.address}
          onChange={onChange}
          className="bg-white border p-3 w-full mb-4 rounded-lg"
          rows="2"
          placeholder="Address"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            name="city"
            value={form.city}
            onChange={onChange}
            type="text"
            className="bg-white border p-3 rounded-lg"
            placeholder="City"
          />
          <input
            name="state"
            value={form.state}
            onChange={onChange}
            type="text"
            className="bg-white border p-3 rounded-lg"
            placeholder="State"
          />
          <input
            name="postalCode"
            value={form.postalCode}
            onChange={onChange}
            type="text"
            className="bg-white border p-3 rounded-lg"
            placeholder="Postal Code"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input
            name="country"
            value={form.country}
            onChange={onChange}
            type="text"
            className="bg-white border p-3 rounded-lg"
            placeholder="Country"
          />
          <input
            name="pan"
            value={form.pan}
            onChange={onChange}
            type="text"
            className="bg-white border p-3 rounded-lg"
            placeholder="PAN (optional)"
          />
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            disabled={saving}
            onClick={handlePayNow}
            className="bg-[#1E5631] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[#124734] disabled:opacity-60"
          >
            {saving ? "PLEASE WAIT..." : `PAY NOW ₹${finalAmount || ""}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonateAmount;
