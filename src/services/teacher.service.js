import { api } from "../lib/api";

export async function getTeacherByIdAdmin(id) {
  const res = await api.get(`/users/teachers/${id}`);
  return res.data; // { success, user, profile }
}
