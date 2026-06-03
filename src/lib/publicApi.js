import axios from "axios";

export const publicApi = axios.create({
  baseURL: "http://localhost:5000/api/v1", // ✅ FIXED
  withCredentials: false,
});