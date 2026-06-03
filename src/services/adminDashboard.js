import { api } from "../lib/api";

export const adminDashboardApi = {
  getStats: () => api.get("/admin/dashboard/stats"),
};
