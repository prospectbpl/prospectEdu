// src/pages/Teacher/ReviewSubmissionsPageWrapper.jsx

import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import TeacherSidebar from "../../components/Teacher/TeacherSidebar";
import TeacherTopbar from "../../components/Teacher/TeacherTopbar";

import ReviewSubmissionsPage from "../../components/Teacher/Submission/ReviewSubmissionsPage";
import SubmissionListPage from "../../components/Teacher/Submission/SubmissionListPage";
import EvaluateSubmissionModal from "../../components/Teacher/Submission/EvaluateSubmissionModal";

export default function ReviewSubmissionsPageWrapper() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 80 : 256;

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

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
          name: "Review Submissions",
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
        <title>Review Submissions | Teacher Dashboard | ProspectEdu</title>
        <meta
          name="description"
          content="Review and evaluate student assignment submissions in the ProspectEdu teacher dashboard."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      {/* SIDEBAR — FIXED LIKE IN ASSESSMENT PAGE */}
      <div
        className="fixed left-0 top-0 h-full transition-all duration-300"
        style={{ width: sidebarWidth }}
      >
        <TeacherSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* MAIN CONTENT — FULL WIDTH */}
      <div
        className="flex flex-col flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* TOPBAR — FULL WIDTH WITHOUT CENTERING */}
        <TeacherTopbar pageTitle="Review Submissions" />

        {/* PAGE CONTENT — FULL WIDTH */}
        <div className="p-6 overflow-y-auto">
          {/* 1️⃣ STEP 1 — LIST OF ASSIGNMENTS */}
          {!selectedAssignment && (
            <ReviewSubmissionsPage onOpenAssignment={(assignment) => setSelectedAssignment(assignment)} />
          )}

          {/* 2️⃣ STEP 2 — LIST OF SUBMISSIONS */}
          {selectedAssignment && !selectedSubmission && (
            <SubmissionListPage
              assignment={selectedAssignment}
              onBack={() => setSelectedAssignment(null)}
              onEvaluate={(submission) => setSelectedSubmission(submission)}
            />
          )}

          {/* 3️⃣ STEP 3 — EVALUATION MODAL */}
          {selectedSubmission && (
            <EvaluateSubmissionModal
              submission={selectedSubmission}
              onClose={() => setSelectedSubmission(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
