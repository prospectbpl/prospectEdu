import { api } from "../lib/api";

const authHeader = () => {
  const token = sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const courseContentApi = {
  // ✅ Teacher/Admin: create module
  createModule: (courseId, payload) =>
    api.post(`/content/courses/${courseId}/modules`, payload, {
      headers: authHeader(),
    }),

  // ✅ Teacher/Admin: create lesson
  createLesson: (moduleId, payload) =>
    api.post(`/content/modules/${moduleId}/lessons`, payload, {
      headers: authHeader(),
    }),

  // ✅ Teacher/Admin: get modules WITH lessons (NEW)
  teacherModulesWithLessons: (courseId) =>
    api.get(`/content/teacher/courses/${courseId}/modules`, {
      headers: authHeader(),
    }),

  // ✅ Student: list published modules (enrolled)
  listModules: (courseId) =>
    api.get(`/content/courses/${courseId}/modules`, {
      headers: authHeader(),
    }),

  // ✅ Student: list lessons in a module (enrolled)
  listLessons: (moduleId) =>
    api.get(`/content/modules/${moduleId}/lessons`, {
      headers: authHeader(),
    }),
  deleteLesson: (lessonId) =>
  api.delete(`/content/lessons/${lessonId}`, { headers: authHeader() }),

deleteLesson: (lessonId) =>
  api.delete(`/content/lessons/${lessonId}`, { headers: authHeader() }),
// ✅ stream lesson file inline (PDF opens in browser)
lessonFileUrl: (lessonId) =>
  `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1"}/content/lessons/${lessonId}/file`,

updateLesson: (lessonId, payload) =>
  api.patch(`/content/lessons/${lessonId}`, payload, { headers: authHeader() }),

// ✅ Student: course modules overview (stats + course header)
studentModulesOverview: (courseId) =>
  api.get(`/content/student/courses/${courseId}/modules-overview`, {
    headers: authHeader(),
  }),
getLessonFileBlob: (lessonId) =>
  api.get(`/content/lessons/${lessonId}/file`, {
    headers: authHeader(),
    responseType: "blob",
  }),
updateModule: (moduleId, payload) =>
  api.patch(`/content/modules/${moduleId}`, payload, { headers: authHeader() }),

deleteModule: (moduleId) =>
  api.delete(`/content/modules/${moduleId}`, { headers: authHeader() }),

};
