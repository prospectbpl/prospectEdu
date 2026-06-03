import { api } from "./api";

export const fetchCategories = async () => {
  const res = await api.get("/categories");
  return res?.data?.categories || [];
};

export const adminCreateCategory = async ({ name, imageFile }) => {
  const fd = new FormData();
  fd.append("name", name);
  fd.append("image", imageFile);
  const res = await api.post("/categories", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res?.data?.category;
};

export const adminUpdateCategory = async (id, { name, imageFile }) => {
  const fd = new FormData();
  if (name !== undefined) fd.append("name", name);
  if (imageFile) fd.append("image", imageFile);

  const res = await api.patch(`/categories/${id}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res?.data?.category;
};

export const adminDeleteCategory = async (id) => {
  await api.delete(`/categories/${id}`);
};
