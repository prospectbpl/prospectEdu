import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import ParentSidebar from "../../components/Parent/ParentSidebar";
import ParentTopbar from "../../components/Parent/ParentTopbar";
import Breadcrumb from "../../components/Breadcrumb";

import AnnouncementCard from "../../components/Parent/Announcements/AnnouncementCard";
import AnnouncementModal from "../../components/Parent/Announcements/AnnouncementModal";
import { api } from "../../lib/api";

export default function ParentAnnouncementsPage() {
  const location = useLocation();

  const canonicalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${location.pathname}`
      : location.pathname;

  const breadcrumbJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Parent Dashboard",
          item:
            typeof window !== "undefined"
              ? `${window.location.origin}/parent`
              : "/parent",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Announcements",
          item: canonicalUrl,
        },
      ],
    }),
    [canonicalUrl]
  );

  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 80 : 256;

  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);

      // ✅ Parent will receive only those announcements where recipients includes "parent"
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
        // ✅ mark all announcements as read when opening this page
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
      {/* ✅ SEO (NO layout impact) */}
      <Helmet>
        <title>Parent Announcements | ProspectEdu</title>
        <meta
          name="description"
          content="View school announcements and updates in the ProspectEdu parent dashboard."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      {/* SIDEBAR */}
      <div
        className="fixed top-0 left-0 h-full transition-all duration-300"
        style={{ width: sidebarWidth }}
      >
        <ParentSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col" style={{ marginLeft: sidebarWidth }}>
        <ParentTopbar pageTitle="Announcements" showStudentSwitcher={false} />
         <Breadcrumb
        items={[
          { label: "Dashboard", to: "/parent-dashboard" },
          { label: "Announcements" },
        ]}
      />

        <div className="p-6 space-y-4 overflow-y-auto text-left">
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-gray-500">No announcements.</p>
          ) : (
            items.map((a) => (
              <AnnouncementCard
                key={a._id}
                a={{ ...a, id: a._id }} // ✅ keep compatibility if card uses a.id
              />
            ))
          )}
        </div>
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
