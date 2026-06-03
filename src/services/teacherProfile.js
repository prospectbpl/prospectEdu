import { api } from "../lib/api"; // your axios instance

export const getMyTeacherProfile = () =>
  api.get("/teachers/profile/me");

export const updateMyTeacherProfile = (data) =>
  api.put("/teachers/profile/me", data);
