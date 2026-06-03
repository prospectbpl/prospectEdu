import { BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CoursesCard({ courses = [] }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E6F4EC] p-6">

      {/* Card Title */}
      <h2 className="text-2xl font-semibold text-[#124734] mb-6">
        Your Courses
      </h2>

      {/* Empty State */}
      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen size={60} className="text-[#A7E1B2] mb-4" />
          <p className="text-xl font-medium text-[#124734]">No Courses Assigned</p>
          <p className="text-sm text-[#5B7065] mt-1">
            You are not assigned to any courses yet.
          </p>
        </div>
      ) : (
        /* Course Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course, index) => (
            <div
              key={index}
              onClick={() => navigate("/teacher/courses")}   // ← ADDED NAVIGATION
              className="bg-[#F8FBF9] border border-[#A7E1B2]/40 rounded-2xl 
                         px-6 py-5 h-40 flex flex-col justify-between
                         hover:shadow-xl hover:bg-[#F2FBF6] transition cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-[#124734] leading-snug">
                  {course.name}
                </h3>
                <BookOpen size={28} className="text-[#009846]" />
              </div>

              <p className="text-base text-[#5B7065] mt-2">
                {course.students} Students
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
