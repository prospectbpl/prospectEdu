import { api } from "../lib/api";

export const categoriesApi = {
  list: () => api.get("/course-categories"),
  create: (name) => api.post("/course-categories", { name }),
  update: (id, name) => api.patch(`/course-categories/${id}`, { name }),
  remove: (id) => api.delete(`/course-categories/${id}`),
  publicList: () => api.get("/course-categories/public"),
};
