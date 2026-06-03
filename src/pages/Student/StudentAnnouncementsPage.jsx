import { useEffect, useState } from "react";
import StudentSidebar from "../../components/Student/StudentSidebar";
import StudentTopbar from "../../components/Student/StudentTopbar";

import AnnouncementCard from "../../components/Parent/Announcements/AnnouncementCard";
import AnnouncementModal from "../../components/Parent/Announcements/AnnouncementModal";
import Breadcrumb from "../../components/Breadcrumb";
import { api } from "../../lib/api";

function upsertMeta(name, content) {
  if (!content) return () => {};
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
  return () => {};
}

function upsertLink(rel, href) {
  if (!href) return () => {};
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
  return () => {};
}

export default function StudentAnnouncementsPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 80 : 256;

  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ SEO (no layout changes)
  useEffect(() => {
    document.title = "Announcements | ProspectEdu Student";
    upsertMeta("description", "Read the latest announcements for students in ProspectEdu.");
    upsertMeta("robots", "noindex, follow");
    upsertLink("canonical", window.location?.href || "");
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/announcements/me/for-me");
      setItems(res?.data?.data || []);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await api.post("/announcements/me/mark-all-read");
        window.dispatchEvent(new Event("announcements:refresh"));
      } catch (e) {
        // ignore
      }
      load();
    })();
  }, []);

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* SIDEBAR */}
      <div className="fixed top-0 left-0 h-full transition-all duration-300" style={{ width: sidebarWidth }}>
        <StudentSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col" style={{ marginLeft: sidebarWidth }}>
        <StudentTopbar isCollapsed={isCollapsed} pageTitle="Announcements" />
        
        <Breadcrumb
        items={[
          { label: "Dashboard", to: "/student-dashboard" },
          { label: "Announcements" },
        ]}
      />

        <main className="p-6 space-y-4 overflow-y-auto text-left">
          
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-gray-500">No announcements.</p>
          ) : (
            items.map((a) => (
              <div key={a._id} onClick={() => setSelectedAnnouncement({ ...a, id: a._id })} className="cursor-pointer">
                <AnnouncementCard a={{ ...a, id: a._id }} />
              </div>
            ))
          )}
        </main>
      </div>

      {/* MODAL */}
      {selectedAnnouncement && (
        <AnnouncementModal
          announcement={selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
        />
      )}
    </div>
  );
}
