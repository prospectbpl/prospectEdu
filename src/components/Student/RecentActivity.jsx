import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Video,
  FolderOpen,
  ClipboardList,
  PenTool,
  HelpCircle,
  ShoppingBag,
  User,
  KeyRound,
  FileText,
} from "lucide-react";
import { activityApi } from "../../services/activity";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const iconMap = {
  "/student-dashboard": <LayoutDashboard size={20} className="text-[#009846]" />,
  "/student/live-classes": <Video size={20} className="text-[#009846]" />,
  "/student/my-courses": <BookOpen size={20} className="text-[#009846]" />,
  "/student/test-series": <ClipboardList size={20} className="text-[#009846]" />,
  "/student/study-materials": <FolderOpen size={20} className="text-[#009846]" />,
  "/student/practice": <PenTool size={20} className="text-[#009846]" />,
  "/student/all-test-series": <ClipboardList size={20} className="text-[#009846]" />,
  "/student/all-courses": <GraduationCap size={20} className="text-[#009846]" />,
};


export default function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

useEffect(() => {
  const load = async () => {
    try {
      const res = await activityApi.myRecent();
      console.log("RECENT API RAW:", res.data);

     setActivities(res.data.activities || res.data.data || res.data.items || []);

    } catch (e) {
      setActivities([]);
      console.error("RecentActivity fetch failed:", e?.response?.status, e?.response?.data);
    }
  };
  load();
}, [location.pathname]);
useEffect(() => {
  const refresh = async () => {
    try {
      const res = await activityApi.myRecent();
      setActivities(res.data.activities || []);
    } catch {
      setActivities([]);
    }
  };

  window.addEventListener("activity_refresh", refresh);
  return () => window.removeEventListener("activity_refresh", refresh);
}, []);


  return (
    <aside className="bg-white rounded-lg shadow-sm p-4 border border-[#E6F4EC] h-auto w-full md:w-auto">
      <h3 className="text-lg font-semibold text-[#124734] mb-4">
        Recent Activity
      </h3>

      <div className="flex flex-col gap-3">
        {activities.map((a) => (
          <div
            key={a._id}
            onClick={() => {
              if (a.route) navigate(a.route);
            }}
            className={`flex items-start gap-3 p-3 rounded-md transition-all duration-200 ${
              a.route ? "hover:bg-[#F5FBF7] cursor-pointer" : "opacity-70 cursor-default"
            }`}
          >
            <div className="p-2 bg-[#E6F4EC] rounded-md">
              {iconMap[a.type] || <FileText size={20} className="text-[#009846]" />}
            </div>
            <div>
              <p className="text-sm font-medium text-[#124734]">{a.title}</p>
              <p className="text-xs text-[#5B7065]">
                {a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
