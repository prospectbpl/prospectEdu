import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { Search, Download, FileText } from "lucide-react";

import ParentSidebar from "../../components/Parent/ParentSidebar";
import ParentTopbar from "../../components/Parent/ParentTopbar";
import Breadcrumb from "../../components/Breadcrumb";
import { parentsApi } from "../../services/parents";
import { reportsApi } from "../../services/reports";
import { useToast } from "../../context/ToastContext";

function fmtDate(d) {
  const dt = new Date(d);
  if (String(dt) === "Invalid Date") return "";
  return dt.toLocaleDateString();
}

function niceBytes(n = 0) {
  const x = Number(n || 0);
  if (!Number.isFinite(x) || x <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let v = x;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export default function ParentReportsCertificationsPage() {
  const location = useLocation();
  const canonicalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${location.pathname}`
      : location.pathname;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 80 : 256;

  const { showToast } = useToast();

  // children list
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [children, setChildren] = useState([]);
  const [search, setSearch] = useState("");

  // active child
  const [activeStudentId, setActiveStudentId] = useState(null);

  // reports
  const [loadingReports, setLoadingReports] = useState(false);
  const [files, setFiles] = useState([]);
const handleDownload = async (f) => {
  if (!f?._id) return;

  try {
    const res = await reportsApi.downloadFile(f._id);

    const mime = f?.mimeType || res?.headers?.["content-type"] || "application/pdf";
    const blob = new Blob([res.data], { type: mime });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = f?.originalName || "report.pdf";
    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (e) {
    showToast(e?.response?.data?.message || "Failed to download file", "error");
  }
};




  async function loadChildren() {
    try {
      setLoadingChildren(true);
      const { data } = await parentsApi.getMyStudentsOverview();
      const list = Array.isArray(data?.students) ? data.students : [];
      setChildren(list);

      if (!activeStudentId && list.length) {
        setActiveStudentId(list[0]._id);
      }
    } catch (e) {
      setChildren([]);
      showToast(e?.response?.data?.message || "Failed to load linked students", "error");
    } finally {
      setLoadingChildren(false);
    }
  }

  async function loadReports(studentId) {
    if (!studentId) return;
    try {
      setLoadingReports(true);
      const res = await reportsApi.parentGetChildReports(studentId);
      setFiles(Array.isArray(res.data?.files) ? res.data.files : []);
    } catch (e) {
      setFiles([]);
      showToast(e?.response?.data?.message || "Failed to load reports", "error");
    } finally {
      setLoadingReports(false);
    }
  }

  useEffect(() => {
    loadChildren();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeStudentId) loadReports(activeStudentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStudentId]);

  const filteredChildren = useMemo(() => {
    const q = String(search || "").trim().toLowerCase();
    if (!q) return children;
    return children.filter((s) => String(s?.fullName || "").toLowerCase().includes(q));
  }, [children, search]);

  const activeChild = useMemo(
    () => children.find((c) => c._id === activeStudentId) || null,
    [children, activeStudentId]
  );

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      <Helmet>
        <title>Reports & Certifications | Parent Dashboard | ProspectEdu</title>
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="noindex, nofollow" />
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
        <ParentTopbar pageTitle="Reports & Certifications" showStudentSwitcher={false} />
         <Breadcrumb
        items={[
          { label: "Dashboard", to: "/parent-dashboard" },
          { label: "Reports & Certifications" },
        ]}
      />

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-y-auto">
          {/* LEFT: Linked children */}
          <div className="lg:col-span-4 bg-white border border-[#E6F4EC] rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#E6F4EC]">
              <div className="bg-[#F8FFFA] border border-[#E6F4EC] rounded-xl px-3 py-2 flex items-center gap-2">
                <Search size={18} className="text-[#5B7065]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search child name..."
                  className="w-full bg-transparent outline-none text-sm text-[#124734]"
                />
              </div>
            </div>

            <div className="p-3 max-h-[calc(100vh-220px)] overflow-y-auto">
              {loadingChildren ? (
                <div className="p-4 text-sm text-[#5B7065]">Loading linked students...</div>
              ) : filteredChildren.length === 0 ? (
                <div className="p-4 text-sm text-[#5B7065]">
                  No linked students found. Add a child from Settings → Manage Children.
                </div>
              ) : (
                filteredChildren.map((s) => {
                  const selected = s._id === activeStudentId;
                  const blocked = !s?.isActive;

                  return (
                    <button
                      key={s._id}
                      onClick={() => setActiveStudentId(s._id)}
                      className={`w-full text-left p-3 rounded-xl border mb-3 transition ${
                        selected
                          ? "border-[#009846] bg-[#F8FFFA]"
                          : "border-[#E6F4EC] hover:bg-[#F9FAFB]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-[#124734] truncate">
                            {s?.fullName || "—"}
                          </p>

                          {blocked ? (
                            <span className="mt-2 inline-flex text-xs px-2 py-1 rounded-full bg-red-50 border border-red-100 text-red-700">
                              Blocked
                            </span>
                          ) : (
                            <span className="mt-2 inline-flex text-xs px-2 py-1 rounded-full bg-[#E8F3FF] border border-[#CFE6FF] text-[#0B4F9E]">
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT: Files */}
          <div className="lg:col-span-8 space-y-5">
            <div className="bg-white border border-[#E6F4EC] rounded-2xl shadow-sm p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[#124734]">
                    {activeChild?.fullName ? `Reports — ${activeChild.fullName}` : "Reports"}
                  </h2>
                  <p className="text-sm text-[#5B7065] mt-1">
                    Download certificates and reports uploaded by the teacher.
                  </p>
                </div>
              </div>

              <div className="mt-5">
                {!activeStudentId ? (
                  <div className="p-4 bg-[#F8FFFA] border border-[#E6F4EC] rounded-xl text-sm text-[#5B7065]">
                    Select a child from the left to view reports.
                  </div>
                ) : loadingReports ? (
                  <div className="p-4 text-sm text-[#5B7065]">Loading reports...</div>
                ) : files.length === 0 ? (
                  <div className="p-4 bg-[#F8FFFA] border border-[#E6F4EC] rounded-xl text-sm text-[#5B7065]">
                    No reports uploaded yet.
                  </div>
                ) : (
                  <div className="divide-y">
                    {files.map((f) => (
                      <div key={f._id} className="py-3 flex items-center justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-[#F8FFFA] border border-[#E6F4EC] flex items-center justify-center">
                            <FileText size={18} className="text-[#124734]" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#124734] truncate">
                              {f.originalName || "File"}
                            </p>
                            <p className="text-xs text-[#5B7065]">
                              {fmtDate(f.uploadedAt)} • {niceBytes(f.bytes)} • {f.mimeType || "—"}
                            </p>
                          </div>
                        </div>
<button
  onClick={() => handleDownload(f)}
  className="text-sm text-green-600 hover:underline"
>
  Download
</button>


                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
