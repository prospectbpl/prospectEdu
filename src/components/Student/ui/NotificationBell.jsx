// src/components/Student/ui/NotificationBell.jsx
import { useEffect, useState, useCallback } from "react";
import { Bell } from "lucide-react";
import { api } from "../../../lib/api";

export default function NotificationBell({ onClick }) {
  const [count, setCount] = useState(0);

  const loadUnreadCount = useCallback(async () => {
    try {
      // ✅ backend returns: { success: true, data: { unread: number } }
      const res = await api.get("/announcements/me/unread-count");
      setCount(Number(res?.data?.data?.unread || 0));
    } catch (e) {
      setCount(0);
    }
  }, []);

  useEffect(() => {
    // initial load
    loadUnreadCount();

    // 🔁 refresh count every 20 seconds
    const timer = setInterval(loadUnreadCount, 20000);

    return () => clearInterval(timer);
  }, [loadUnreadCount]);

  // ✅ NEW: instantly refresh when announcements page marks read
  useEffect(() => {
    const handler = () => loadUnreadCount();
    window.addEventListener("announcements:refresh", handler);
    return () => window.removeEventListener("announcements:refresh", handler);
  }, [loadUnreadCount]);

  return (
    <button
      type="button"
      onClick={() => onClick?.()}
      className="relative p-2 rounded-full hover:bg-gray-100 transition"
      aria-label="Notifications"
    >
      <Bell size={22} className="text-[#124734]" />

      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
