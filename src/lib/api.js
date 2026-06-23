import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
export const api = axios.create({
  baseURL: BASE, // ✅ FIXED
  withCredentials: true,
});

// attach access token
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// handle JWT expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
      try {
        const res = await axios.post(
          `${BASE}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = res.data.accessToken;

        // ✅ CONSISTENT STORAGE
        sessionStorage.setItem("accessToken", newAccessToken);

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (err) {
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);
