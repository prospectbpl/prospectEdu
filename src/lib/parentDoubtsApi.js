import { api } from "./api";

export const parentDoubtsApi = {
  myDoubts: () => api.get("/parentdoubts/me"),
  create: (payload) => api.post("/parentdoubts", payload),
};

export const teacherDoubtsApi = {
  inbox: () => api.get("/parentdoubts/teacher/inbox"),
  answer: (id, payload) => api.patch(`/parentdoubts/${id}/answer`, payload),
};
