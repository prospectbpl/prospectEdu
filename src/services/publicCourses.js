import { publicApi } from "../lib/publicApi";

export const publicCoursesApi = {
  listByCategory: (category) =>
    publicApi.get(`/courses`, {
      params: { category },
    }),
listAll: () => publicApi.get("/courses"),

  getBySlug: (slug) =>
    publicApi.get(`/courses/slug/${slug}`),
  getById: (id) => publicApi.get(`/courses/${id}`)
};
