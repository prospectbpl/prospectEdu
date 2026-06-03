import { api } from "./api";

// PUBLIC
export const fetchPublicBlogs = async () => {
  const res = await api.get("/blogs");
  return res.data?.data || [];
};

export const fetchBlogBySlug = async (slug) => {
  const res = await api.get(`/blogs/${slug}`);
  return res.data?.data;
};

// TEACHER
export const fetchTeacherBlogs = async () => {
  const res = await api.get("/blogs/teacher/mine");
  return res.data?.data || [];
};

export const createTeacherBlog = async (formData) => {
  const res = await api.post("/blogs/teacher", formData);
  return res.data?.data;
};

export const updateTeacherBlog = async (id, formData) => {
  const res = await api.patch(`/blogs/teacher/${id}`, formData);
  return res.data?.data;
};

export const deleteTeacherBlog = async (id) => {
  const res = await api.delete(`/blogs/teacher/${id}`);
  return res.data;
};
