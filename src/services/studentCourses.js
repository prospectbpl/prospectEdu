import { api } from "../lib/api";

export const studentCoursesApi = {
  myEnrollments: () =>
    api.get("/courses/me/enrollments", {
      params: { t: Date.now() }, // ✅ bust cache
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    }),
};
