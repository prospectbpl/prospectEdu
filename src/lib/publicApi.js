import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
export const publicApi = axios.create({
  baseURL: BASE, // ✅ FIXED
  withCredentials: false,
});