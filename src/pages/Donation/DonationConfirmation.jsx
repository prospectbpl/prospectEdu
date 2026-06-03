// src/pages/Donate/DonationConfirmation.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { api } from "../../lib/api";
import logoImg from "../../assets/logo.webp";

const DonationConfirmation = () => {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const forcedStatus = sp.get("status"); // "failed" if popup dismissed etc.

  const [loading, setLoading] = useState(true);
  const [donation, setDonation] = useState(null);
  const [err, setErr] = useState("");

  const isSuccess = useMemo(() => {
    if (forcedStatus === "failed") return false;
    return donation?.status === "CONFIRMED";
  }, [donation?.status, forcedStatus]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await api.get(`/donations/${id}`);
        setDonation(res.data?.data || null);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load donation confirmation.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4 py-10 font-[Open_Sans,sans-serif]">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md border overflow-hidden">
        <div className="p-6 bg-[#124734] text-white">
          <div className="flex items-center gap-4">
            <img src={logoImg} alt="Logo" className="w-16 h-16 rounded-xl bg-white p-2" />
            <div>
              <div className="text-xl font-bold">Prospect Education</div>
              <div className="text-sm opacity-90">Donation Status</div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-gray-600">Loading…</div>
          ) : err ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">{err}</div>
          ) : (
            <>
              <div
                className={`rounded-2xl p-5 border ${
                  isSuccess ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                }`}
              >
                <div className={`text-2xl font-extrabold ${isSuccess ? "text-green-700" : "text-red-700"}`}>
                  {isSuccess ? "✅ Donation Successful!" : "❌ Donation Not Confirmed"}
                </div>

                <div className="mt-2 text-gray-700 leading-relaxed">
                  {isSuccess ? (
                    <>
                      Thank you, <span className="font-semibold">{donation?.firstName} {donation?.lastName}</span>!
                      Your support helps us improve learning and opportunities for students.
                    </>
                  ) : (
                    <>
                      We couldn’t confirm your payment. If money was deducted, it usually gets reversed automatically by the bank.
                      You can try again anytime.
                    </>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="bg-white rounded-xl border p-3">
                    <div className="text-gray-500 text-xs">Donation Amount</div>
                    <div className="text-lg font-bold text-[#124734]">₹{donation?.amount}</div>
                  </div>
                  <div className="bg-white rounded-xl border p-3">
                    <div className="text-gray-500 text-xs">Status</div>
                    <div className="text-lg font-bold">{donation?.status}</div>
                  </div>
                  <div className="bg-white rounded-xl border p-3">
                    <div className="text-gray-500 text-xs">Donation ID</div>
                    <div className="font-mono text-xs break-all">{donation?._id}</div>
                  </div>
                  <div className="bg-white rounded-xl border p-3">
                    <div className="text-gray-500 text-xs">Payment ID</div>
                    <div className="font-mono text-xs break-all">{donation?.razorpayPaymentId || "-"}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-between">
                <Link
                  to="/donate"
                  className="px-5 py-3 rounded-xl bg-[#124734] text-white font-semibold text-center hover:bg-[#0B2F23]"
                >
                  Donate Again
                </Link>
                <Link
                  to="/"
                  className="px-5 py-3 rounded-xl border font-semibold text-center hover:bg-gray-50"
                >
                  Go Home
                </Link>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                If you need help, please contact support with your Donation ID.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationConfirmation;
