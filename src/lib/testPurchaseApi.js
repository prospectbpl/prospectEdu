// src/lib/testPurchaseApi.js
import { api } from "./api";

// ✅ confirm purchase (manual/free fallback)
export async function confirmTestPurchase(payload) {
  const res = await api.post("/test-purchase/confirm", payload);
  return res.data?.data;
}

// ✅ get my purchased test series
export async function fetchMyPurchasedSeries() {
  const res = await api.get("/test-purchase/mine");
  return res.data?.data || [];
}

// ✅ check if already purchased
export async function hasPurchasedSeries(testSeriesId) {
  const res = await api.get(`/test-purchase/has/${testSeriesId}`);
  return !!res.data?.purchased;
}

export async function fetchMySeriesDetails(seriesId) {
  try {
    const res = await api.get(`/test-purchase/me/series/${seriesId}`);
    return res?.data?.data || res?.data || null;
  } catch (e) {
    const res2 = await api.get(`/test-series/${seriesId}`);
    return res2?.data?.data || res2?.data || null;
  }
}

// ✅ NEW: Razorpay for Test Series
export async function createTestSeriesRazorpayOrder(testSeriesId) {
  const res = await api.post("/payments/razorpay/test-series/create-order", { testSeriesId });
  return res.data?.data;
}

export async function verifyTestSeriesRazorpayPayment(payload) {
  const res = await api.post("/payments/razorpay/test-series/verify", payload);
  return res.data?.data;
}
