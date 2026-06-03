// src/services/users.js
import { api } from "../lib/api";

export const usersApi = {
  listTeachers: (params = {}) => api.get("/users/teachers", { params }),
  listStudents: (params = {}) => api.get("/users/students", { params }),
  blockUser: (userId) => api.patch(`/users/${userId}/block`),
  unblockUser: (userId) => api.patch(`/users/${userId}/unblock`),

  // ✅ NEW: teacher approval workflow (admin)
  listTeacherRequests: (status = "pending") =>
    api.get("/users/teacher-requests", { params: { status } }),

  approveTeacher: (teacherId) =>
    api.patch(`/users/teacher-requests/${teacherId}/approve`),

  rejectTeacher: (teacherId, note = "") =>
    api.patch(`/users/teacher-requests/${teacherId}/reject`, { note }),
  setTeacherSalary: (teacherId, salary) =>
    api.patch(`/users/teachers/${teacherId}/salary`, { salary }),
   getTeacherById: (teacherId) => api.get(`/users/teachers/${teacherId}`),
   // ✅ NEW: admin approval workflow (admin)
listAdminRequests: (status = "pending") =>
  api.get("/users/admin-requests", { params: { status } }),

approveAdmin: (adminId) =>
  api.patch(`/users/admin-requests/${adminId}/approve`),

rejectAdmin: (adminId, note = "") =>
  api.patch(`/users/admin-requests/${adminId}/reject`, { note }),
 listAdmins: (params = {}) => api.get("/users/admins", { params }),

};
