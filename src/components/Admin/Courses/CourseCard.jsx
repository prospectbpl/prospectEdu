import React from "react";
import { useNavigate } from "react-router-dom";

export default function CourseCard({ course }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-[#A7E1B2] rounded-xl overflow-hidden shadow-sm">

      {/* IMAGE */}
      <div className="w-full h-36 flex items-center justify-center overflow-hidden bg-[#F0F5F2]">
        <img
          src={course.img || "/placeholder-course.png"}
          alt={course.title}
          className="h-full w-auto object-contain"
        />
      </div>

      {/* CONTENT */}
      <div className="p-4">
        <h2 className="font-heading text-lg text-[#124734]">
          {course.title}
        </h2>

        <p className="text-sm text-[#5B7065]">
          {course.short || ""}
        </p>

        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() =>
              navigate(`/admin/courses/${course._id}`)
            }
            className="text-sm font-medium border border-[#009846] text-[#009846] px-4 py-2 rounded-full hover:bg-[#009846] hover:text-white transition"
          >
            View
          </button>

          <span className="text-xs text-[#5B7065]">
            {course.category}
          </span>
        </div>
      </div>

    </div>
  );
}
