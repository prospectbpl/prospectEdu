import { api } from "../lib/api";

export const authApi = {
  login: (payload) => api.post("/auth/login", payload),
  register: (payload) => api.post("/auth/register", payload),
  me: (accessToken) =>
    api.get("/auth/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
  refresh: () => api.post("/auth/refresh"),
  logout: (accessToken) =>
    api.post("/auth/logout", null, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
    changePassword(payload) {
    return api.patch("/auth/change-password", payload);
     headers: { Authorization: `Bearer ${accessToken}` }
  },

};
