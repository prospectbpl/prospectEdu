import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import TeacherSidebar from "../../components/Teacher/TeacherSidebar";
import TeacherTopbar from "../../components/Teacher/TeacherTopbar";
import Breadcrumb from "../../components/Breadcrumb";
import DoubtsList from "../../components/Teacher/Queries/DoubtsList";
import ChatWindow from "../../components/Teacher/Queries/ChatWindow";

export default function QueriesDoubtsPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 80 : 256;

  const [selectedDoubt, setSelectedDoubt] = useState(null);

  // ✅ SEO
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
          name: "Teacher Dashboard",
          item:
            typeof window !== "undefined"
              ? `${window.location.origin}/teacher-dashboard`
              : "/teacher-dashboard",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Reply to Doubts",
          item: canonicalUrl,
        },
      ],
    }),
    [canonicalUrl]
  );

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* ✅ SEO (NO layout impact) */}
      <Helmet>
        <title>Reply to Doubts | Teacher Dashboard | ProspectEdu</title>
        <meta
          name="description"
          content="View and reply to student doubts and queries in the ProspectEdu teacher dashboard."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      {/* FIXED SIDEBAR */}
      <div
        className="fixed left-0 top-0 h-full transition-all duration-300"
        style={{ width: sidebarWidth }}
      >
        <TeacherSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* RIGHT SIDE */}
      <div
        className="flex flex-col flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        <TeacherTopbar pageTitle="Reply to Doubts" />
         <Breadcrumb
        items={[
          { label: "Dashboard", to: "/teacher-dashboard" },
          { label: "Doubts" },
        ]}
      />

        <div className="flex h-full text-left">
          {/* LEFT SIDE = DOUBTS LIST */}
          <div className="w-1/3 border-r border-gray-200 bg-white overflow-y-auto">
            <DoubtsList
              onSelect={(d) => setSelectedDoubt(d)}
              selectedId={selectedDoubt?._id} // ✅ FIX
            />
          </div>

          {/* RIGHT SIDE = CHAT WINDOW */}
          <div className="flex-1">
            {selectedDoubt ? (
              <ChatWindow doubt={selectedDoubt} />
            ) : (
              <div className="h-full flex items-center justify-center text-[#5B7065]">
                Select a doubt to reply
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
