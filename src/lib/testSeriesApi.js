// src/lib/testSeriesApi.js
import { api } from "./api";

// PUBLIC
export const fetchPublicTestSeries = async () => {
  const res = await api.get("/test-series");
  return res.data?.data || [];
};

export const fetchPublicTestSeriesById = async (id) => {
  const res = await api.get(`/test-series/${id}`);
  return res.data?.data;
};

// TEACHER
export const fetchTeacherMySeries = async () => {
  const res = await api.get("/test-series/teacher/mine");
  return res.data?.data || [];
};

export const createTeacherSeries = async (payload) => {
  const res = await api.post("/test-series", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data?.data;
};

export const updateTeacherSeries = async (id, payload) => {
  const res = await api.patch(`/test-series/${id}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data?.data;
};

export const deleteTeacherSeries = async (id) => {
  const res = await api.delete(`/test-series/${id}`);
  return res.data;
};
export async function fetchTeacherSeriesById(id) {
  const res = await api.get(`/test-series/teacher/${id}`);
  return res?.data?.data || res?.data || null;
}
