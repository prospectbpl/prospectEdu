import { MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CourseCard({ course, index }) {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white rounded-xl border border-[#E6F4EC] shadow-sm hover:shadow-md transition cursor-pointer"
      onClick={() => navigate(`/teacher/course/${course._id}`)}
    >
      {/* Thumbnail */}
      <div className="h-48 w-full rounded-t-xl bg-[#E8F5EC] flex items-center justify-center overflow-hidden">
  <img
    src={course.img || course.gallery?.[0] || "/fallback-course.png"}
    alt={course.title}
    className="w-full h-full object-contain"
  />
</div>


      {/* Course Info */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-[#124734] leading-tight">
            {course.title}
          </h3>
        </div>
        
      </div>
    </div>
  );
}
