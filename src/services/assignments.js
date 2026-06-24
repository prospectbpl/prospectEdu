import { api } from "../lib/api";
const BASE = import.meta.env.VITE_API_BASE_URL || "https://prospectedu-backend.prospectlegal.in//api/v1";
const authHeader = () => {
  const token = sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};
export const assignmentsApi = {
  create: (courseId, payload) =>
    api.post(`/assignments/courses/${courseId}`, payload),

  listByCourse: (courseId) =>
    api.get(`/assignments/teacher/courses/${courseId}`),
 // ✅ student
  listForStudent: (courseId) => api.get(`/assignments/courses/${courseId}`),

  // ✅ file url
  fileUrl: (assignmentId) => `${BASE}/assignments/${assignmentId}/file`,
  remove: (assignmentId) =>
    api.delete(`/assignments/${assignmentId}`),
  getFileBlob: (assignmentId) =>
  api.get(`/assignments/${assignmentId}/file`, {
    headers: authHeader(),
    responseType: "blob",
  }),

};
