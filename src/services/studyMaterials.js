import { api } from "../lib/api";
const authHeader = () => {
  const token = sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};
export const studyMaterialsApi = {
  teacherMine: () => api.get("/study-materials/teacher/mine", { params: { t: Date.now() } }),
  create: (payload) => api.post("/study-materials", payload),
  remove: (id) => api.delete(`/study-materials/${id}`),
  studentList: (params) => api.get("/study-materials/student", { params: { ...params, t: Date.now() } }),
  fileUrl: (id) =>
    `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1"}/study-materials/${id}/file`,

  // ✅ download/view as blob
  getFileBlob: (id) =>
    api.get(`/study-materials/${id}/file`, {
      headers: authHeader(),
      responseType: "blob",
    }),

};