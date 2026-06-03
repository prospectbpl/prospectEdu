import { api } from "./api";

export async function fetchTestQuestions(seriesId, testId) {
  const res = await api.get(`/test-series/${seriesId}/tests/${testId}/questions`);
  return res?.data?.data || [];
}

export async function saveTestQuestionsBulk(seriesId, testId, questions) {
  const res = await api.put(`/test-series/${seriesId}/tests/${testId}/questions/bulk`, { questions });
  return res?.data?.data || [];
}
