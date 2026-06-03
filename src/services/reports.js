import { api } from "../lib/api";

export const reportsApi = {
  // teacher
  teacherListStudents: (q = "") => api.get("/reports/teacher/students", { params: { q } }),
  teacherGetStudentReports: (studentId) => api.get(`/reports/teacher/students/${studentId}`),
  teacherUploadReports: (studentId, files) => {
    const fd = new FormData();
    Array.from(files || []).forEach((f) => fd.append("files", f));
    return api.post(`/reports/teacher/students/${studentId}/files`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  teacherDeleteReport: (studentId, fileId) =>
    api.delete(`/reports/teacher/students/${studentId}/files/${fileId}`),
  downloadFile: (fileId) =>
  api.get(`/reports/files/${fileId}/download`, {
    responseType: "blob",
  }),

  // parent
  parentGetChildReports: (studentId) => api.get(`/reports/parent/students/${studentId}`),
};
