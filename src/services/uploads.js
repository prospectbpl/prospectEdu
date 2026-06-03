// src/services/uploads.js
import { api } from "../lib/api";// your axios instance

export const uploadsApi = {
  uploadCourseImage: (file) => {
    const fd = new FormData();
    fd.append("image", file);
    return api.post("/uploads/course-image", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

uploadLessonFile: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.post("/uploads/lesson-file", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

 uploadAssignmentFile: (file) => {
  const fd = new FormData();
  fd.append("file", file);
  return api.post("/uploads/assignment-file", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
},
uploadStudyMaterialFile: (file) => {
  const fd = new FormData();
  fd.append("file", file);
  return api.post("/uploads/study-material-file", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
},


};