import { api } from "../lib/api";
const authHeader = () => {
  const token = sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};
export const coursesApi = {
  // Admin: create course
  create: (payload) => api.post("/courses", payload),

  // Admin: list courses
  adminList: () => api.get("/courses/admin"),

  // Admin: get one course
  adminGet: (courseId) => api.get(`/courses/admin/${courseId}`),
  adminDelete: (courseId) => api.delete(`/courses/admin/${courseId}`),
  // Admin: update course fields
  adminUpdate: (courseId, payload) => api.patch(`/courses/admin/${courseId}`, payload),

  // Admin: change status
  adminSetStatus: (courseId, status) =>
    api.patch(`/courses/admin/${courseId}/status`, { status }),

  // Admin: assign teachers
  adminAssignTeachers: (courseId, teacherIds) =>
    api.patch(`/courses/admin/${courseId}/assign-teachers`, { teacherIds }),

  teacherMyCourses: () => api.get("/courses/teacher/my-courses"),
  getTeacherCourseById: (id) => api.get(`/courses/${id}`),
    teacherCourseStudents: (courseId) =>
    api.get(`/courses/teacher/${courseId}/students`, { headers: authHeader() }), 
};
