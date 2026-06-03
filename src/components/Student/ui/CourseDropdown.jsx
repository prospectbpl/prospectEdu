import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CourseDropdown({ role = "student" }) {
  const navigate = useNavigate();

  const redirectPath =
    role === "teacher" ? "/teacher-dashboard" : "/student/all-courses";

  return (
    <button
      onClick={() => navigate(redirectPath)}
      className="flex items-center gap-2 border border-[#124734]/30 px-4 py-2 rounded-md bg-[#F9FAFB] hover:bg-[#A7E1B2]/20 transition"
    >
      <span className="font-medium text-[#124734]">All Courses</span>
      <ChevronDown size={16} className="text-[#124734]" />
    </button>
  );
}
