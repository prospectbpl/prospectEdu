import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";

import StudentSidebar from "../../components/Student/StudentSidebar";
import StudentTopbar from "../../components/Student/StudentTopbar";
import { assignmentsApi } from "../../services/assignments";
import { useToast } from "../../context/ToastContext";

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

export default function StudentAssignmentViewPage() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidthPx = isCollapsed ? 80 : 256;

  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState(null);

  // ✅ SEO (no layout changes)
  useEffect(() => {
    document.title = "Assignment | ProspectEdu Student";
    upsertMeta("description", "View and download assignment attachment in ProspectEdu student dashboard.");
    upsertMeta("robots", "noindex, follow");
    upsertLink("canonical", window.location?.href || "");
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setAssignment({ _id: assignmentId });
      } catch (e) {
        console.log(e);
        showToast?.("Failed to load assignment", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [assignmentId, showToast]);

  const openAttachment = async () => {
    let url = "";
    try {
      const res = await assignmentsApi.getFileBlob(assignmentId);
      const mime = res.headers?.["content-type"] || "application/octet-stream";
      const blob = new Blob([res.data], { type: mime });

      url = window.URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.log(e);
      showToast?.(e?.response?.data?.message || "Failed to open attachment", "error");
    } finally {
      // ✅ cleanup (no layout impact)
      if (url) setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
    }
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      <aside className={`${isCollapsed ? "w-20" : "w-64"} fixed top-0 left-0 h-full z-40 transition-all duration-300`}>
        <StudentSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </aside>

      <div className="flex flex-col flex-1 h-screen transition-all duration-300" style={{ marginLeft: sidebarWidthPx }}>
        <header className="fixed top-0 z-[999] bg-white shadow-sm h-[64px]" style={{ left: sidebarWidthPx, right: 0 }}>
          <StudentTopbar isCollapsed={isCollapsed} pageTitle="Assignment" />
        </header>

        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-8" style={{ marginTop: "64px" }}>
          <div className="w-full max-w-4xl mx-auto">
            <button
              onClick={() => navigate(-1)}
              className="mb-4 inline-flex items-center gap-2 text-sm text-[#124734] hover:underline"
            >
              <ArrowLeft size={16} /> Back
            </button>

            <div className="bg-white border border-[#E6F4EC] rounded-2xl shadow-sm p-6">
              {loading ? (
                <div className="text-[#5B7065]">Loading...</div>
              ) : !assignment ? (
                <div className="text-[#5B7065]">Assignment not found.</div>
              ) : (
                <>
                  <h1 className="text-xl font-semibold text-[#124734]">Assignment</h1>
                  <p className="text-sm text-[#5B7065] mt-1">You can only view/download the attachment (read-only).</p>

                  <div className="mt-5">
                    <button
                      onClick={openAttachment}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#009846] text-white text-sm hover:bg-[#0d3a28]"
                      type="button"
                    >
                      Open Attachment <ExternalLink size={16} />
                    </button>
                  </div>

                  <p className="text-xs text-[#5B7065] mt-3">If file doesn’t open, try downloading from the browser’s PDF viewer.</p>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
