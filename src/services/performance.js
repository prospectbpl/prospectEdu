import { api } from "../lib/api";

const authHeader = () => {
  const token = sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const performanceApi = {
  teacherOverallStudents: () =>
    api.get(`/performance/teacher/students`, { headers: authHeader() }),

  updateOverallStudent: (studentId, payload) =>
    api.patch(`/performance/teacher/students/${studentId}`, payload, {
      headers: authHeader(),
    }),
};
