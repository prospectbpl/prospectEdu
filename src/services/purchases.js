import { api } from "../lib/api";

export const purchasesApi = {
  checkout: (courseId) => api.post(`/purchases/courses/${courseId}/checkout`),

  // Razorpay flow
  createRazorpayOrder: (purchaseId) =>
    api.post(`/purchases/${purchaseId}/razorpay/create-order`),

  verifyRazorpayPayment: (purchaseId, payload) =>
    api.post(`/purchases/${purchaseId}/razorpay/verify`, payload),

  // optional/manual
  confirm: (purchaseId, payload) => api.post(`/purchases/${purchaseId}/confirm`, payload),
};

