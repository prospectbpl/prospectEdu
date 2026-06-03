import { api } from "./api";

// ✅ Get / create a live attempt + fetch questions
export async function getLiveAttempt(seriesId, testId) {
  const res = await api.get(`/live-tests/${seriesId}/tests/${testId}`);
  return res?.data?.data;
}

// ✅ Save answers (autosave)
export async function saveLiveAttempt(attemptId, answers) {
  const res = await api.put(`/live-tests/attempts/${attemptId}/save`, { answers });
  return res?.data;
}

// ✅ Submit attempt
export async function submitLiveAttempt(attemptId) {
  const res = await api.post(`/live-tests/attempts/${attemptId}/submit`);
  return res?.data;
}

// ✅ NEW: Fetch report
export async function getTestReport(seriesId, testId) {
  const res = await api.get(`/live-tests/${seriesId}/tests/${testId}/report`);
  return res?.data?.data;
}
