// src/services/parents.js
import { api } from "../lib/api";

export const parentsApi = {
  getMyProfile: () => api.get("/parents/me"),
  updateMyProfile: (payload) => api.patch("/parents/me", payload),
  getMyChildren: () => api.get("/parents/me/children"),
  addChildByPhone: (payload) => api.post("/parents/me/children", payload), // { phone }
  removeChild: (studentId) => api.delete(`/parents/me/children/${studentId}`),
  getMyStudentsOverview: () => api.get("/parents/me/students"),
};
