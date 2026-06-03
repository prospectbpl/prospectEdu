import React, { useEffect, useState } from "react";
import { coursesApi } from "../../../services/courses";
import CourseCard from "./CourseCard";

export default function CoursesList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await coursesApi.adminList();
        setCourses(res.data.courses || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <div className="text-gray-500">Loading courses...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (courses.length === 0) {
    return <div>No courses created yet.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard key={course._id} course={course} />
        ))}
      </div>
    </div>
  );
}
