import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import TeacherSidebar from "../../components/Teacher/TeacherSidebar";
import TeacherTopbar from "../../components/Teacher/TeacherTopbar";
import Breadcrumb from "../../components/Breadcrumb";

import AnnouncementCard from "../../components/Parent/Announcements/AnnouncementCard";
import AnnouncementModal from "../../components/Parent/Announcements/AnnouncementModal";
import { api } from "../../lib/api";

export default function TeacherAnnouncementsPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 80 : 256;

  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;
  const canonicalUrl = `${SITE_URL}/teacher/announcements`;

  const pageTitle = "Teacher Announcements | ProspectEdu";
  const pageDescription =
    "View important announcements for teachers in ProspectEdu. Stay updated with latest notices and updates.";

  const load = async () => {
    try {
      setLoading(true);

      // ✅ teacher will receive only those announcements where recipients includes "teacher"
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
      // ✅ when opening announcements page -> mark all as read -> bell count becomes 0
      try {
        await api.post("/announcements/me/mark-all-read");
        window.dispatchEvent(new Event("announcements:refresh"));
      } catch (e) {
        // ignore
      }
      load();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* ✅ Private dashboard page */}
        <meta name="robots" content="noindex, nofollow" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Helmet>

      {/* ✅ semantic H1 (hidden, no layout impact) */}
      <h1 className="sr-only">Teacher Announcements</h1>

      {/* SIDEBAR */}
      <div
        className="fixed top-0 left-0 h-full transition-all duration-300"
        style={{ width: sidebarWidth }}
      >
        <TeacherSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col" style={{ marginLeft: sidebarWidth }}>
        <TeacherTopbar isCollapsed={isCollapsed} pageTitle="Announcements" />
          <Breadcrumb 
        items={[
          { label: "Dashboard", to: "/teacher-dashboard" },
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
              <AnnouncementCard
                key={a._id}
                a={{ ...a, id: a._id }}
              />
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
