// src/services/adminPurchases.js
import { api } from "../lib/api";

export const adminPurchasesApi = {
  list: (params = {}) => api.get("/purchases/admin", { params }),
};
