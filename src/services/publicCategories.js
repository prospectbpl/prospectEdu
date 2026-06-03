import { publicApi } from "../lib/publicApi";

export const publicCategoriesApi = {
  list: () => publicApi.get("/course-categories/public"),
};
