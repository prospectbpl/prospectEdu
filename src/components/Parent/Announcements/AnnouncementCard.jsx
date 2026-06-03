// src/components/Parent/Announcements/AnnouncementCard.jsx
import { Calendar, Megaphone } from "lucide-react";

const categoryColors = {
  Exams: "bg-[#D7F2E4] text-[#124734]",
  PTA: "bg-[#DDE9FF] text-[#124734]",
  Holiday: "bg-[#FFF0D7] text-[#8B5E00]",
  Homework: "bg-[#F3E8FF] text-[#5B2A9A]",
  Events: "bg-[#E7F5FF] text-[#0B4F79]",
  Urgent: "bg-[#FFE0E0] text-[#B20000]",
  General: "bg-[#E6F4EC] text-[#124734]",
};

// helper to format date/time from createdAt
const formatDateTime = (iso) => {
  if (!iso) return { date: "", time: "" };

  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

export default function AnnouncementCard({ a }) {
  const category =
    a?.category ||
    a?.type ||
    a?.tag ||
    a?.announcementCategory ||
    a?.announcementType ||
    "General";

  const categoryStyle = categoryColors[category] || categoryColors.General;

  const { date, time } = formatDateTime(a?.createdAt);

  return (
    <div className="bg-white border-2 border-[#E6F4EC] rounded-xl p-5 shadow-sm hover:shadow-md transition">
      {/* ICON + TITLE */}
      <div className="flex items-start gap-3">
        <Megaphone size={24} className="text-[#009846] mt-1" />

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[#124734]">{a?.title || "Announcement"}</h3>

          {/* CATEGORY */}
          <span
            className={`inline-block mt-1 px-3 py-[2px] text-xs font-medium rounded-full ${categoryStyle}`}
          >
            {category}
          </span>
        </div>
      </div>

      {/* DESCRIPTION */}
      <p className="text-sm text-[#5B7065] mt-3 line-clamp-2">{a?.description || ""}</p>

      {/* DATE + TIME */}
      {(date || time) && (
        <div className="flex items-center gap-2 text-xs mt-3 text-[#98A6A2]">
          <Calendar size={14} />
          {date && <span>{date}</span>}
          {time && (
            <>
              <span>•</span>
              <span>{time}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
