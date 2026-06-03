import { api } from "./api";

// ✅ teacher: list tests under series
export async function fetchSeriesTests(seriesId) {
  const res = await api.get(`/test-series/${seriesId}/tests`);
  return res?.data?.data || res?.data || [];
}

export async function addSeriesTest(seriesId, payload) {
  const res = await api.post(`/test-series/${seriesId}/tests`, payload);
  return res?.data?.data || res?.data;
}

export async function updateSeriesTest(seriesId, testId, payload) {
  const res = await api.patch(`/test-series/${seriesId}/tests/${testId}`, payload);
  return res?.data?.data || res?.data;
}

export async function deleteSeriesTest(seriesId, testId) {
  const res = await api.delete(`/test-series/${seriesId}/tests/${testId}`);
  return res?.data?.data || res?.data;
}
