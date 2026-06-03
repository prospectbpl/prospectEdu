import { api } from "../lib/api";

export const paymentsApi = {
  // teacher
  teacherListParents: (q = "") => api.get("/payments/teacher/parents", { params: { q } }),
  teacherAddItem: (parentId, payload) =>
    api.post(`/payments/teacher/parents/${parentId}/items`, payload), // { title, amount, dueDate }
  teacherUpdateItem: (parentId, itemId, payload) =>
    api.patch(`/payments/teacher/parents/${parentId}/items/${itemId}`, payload),
  teacherRemoveItem: (parentId, itemId) =>
    api.delete(`/payments/teacher/parents/${parentId}/items/${itemId}`),

  // parent
  parentGetMine: () => api.get("/payments/parent/me"),
};
