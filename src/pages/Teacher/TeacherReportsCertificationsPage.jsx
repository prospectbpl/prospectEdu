import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Search, Upload, Download, Trash2, FileText } from "lucide-react";

import TeacherSidebar from "../../components/Teacher/TeacherSidebar";
import TeacherTopbar from "../../components/Teacher/TeacherTopbar";
import Breadcrumb from "../../components/Breadcrumb";
import { useToast } from "../../context/ToastContext";
import { reportsApi } from "../../services/reports";

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

function fmtDate(d) {
  const dt = new Date(d);
  if (String(dt) === "Invalid Date") return "";
  return dt.toLocaleDateString();
}

export default function TeacherReportsCertificationsPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 80 : 256;
  const { showToast } = useToast();

  const [q, setQ] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [students, setStudents] = useState([]);
  const [activeStudentId, setActiveStudentId] = useState(null);

  const [loadingFiles, setLoadingFiles] = useState(false);
  const [files, setFiles] = useState([]);
  const [maxFiles, setMaxFiles] = useState(10);
  const remaining = Math.max(0, maxFiles - (files?.length || 0));

  async function loadStudents() {
    setLoadingStudents(true);
    try {
      const res = await reportsApi.teacherListStudents(q);
      const list = res.data?.students || [];
      setStudents(list);

      if (!activeStudentId && list.length) setActiveStudentId(list[0]._id);
    } catch (e) {
      setStudents([]);
      showToast(e?.response?.data?.message || "Failed to load students", "error");
    } finally {
      setLoadingStudents(false);
    }
  }
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



  async function loadFiles(studentId) {
    if (!studentId) return;
    setLoadingFiles(true);
    try {
      const res = await reportsApi.teacherGetStudentReports(studentId);
      setFiles(res.data?.files || []);
      setMaxFiles(res.data?.maxFiles || 10);
    } catch (e) {
      setFiles([]);
      showToast(e?.response?.data?.message || "Failed to load reports", "error");
    } finally {
      setLoadingFiles(false);
    }
  }

  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeStudentId) loadFiles(activeStudentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStudentId]);

  const activeStudent = useMemo(
    () => students.find((s) => s._id === activeStudentId) || null,
    [students, activeStudentId]
  );

  async function onPickFiles(e) {
    const chosen = e.target.files;
    if (!activeStudentId) return;

    if (!chosen || chosen.length === 0) return;
    if (remaining <= 0) {
      showToast(`Max ${maxFiles} files already uploaded`, "error");
      return;
    }

    const batch = Array.from(chosen).slice(0, remaining);
    try {
      setLoadingFiles(true);
      const res = await reportsApi.teacherUploadReports(activeStudentId, batch);
      setFiles(res.data?.files || []);
      setMaxFiles(res.data?.maxFiles || 10);
      showToast("Uploaded successfully", "success");
    } catch (e2) {
      showToast(e2?.response?.data?.message || "Upload failed", "error");
    } finally {
      setLoadingFiles(false);
      e.target.value = ""; // reset input
    }
  }

  async function onDelete(fileId) {
    if (!activeStudentId || !fileId) return;
    try {
      const res = await reportsApi.teacherDeleteReport(activeStudentId, fileId);
      setFiles(res.data?.files || []);
      showToast("Deleted", "success");
    } catch (e) {
      showToast(e?.response?.data?.message || "Delete failed", "error");
    }
  }

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      <Helmet>
        <title>Reports & Certifications | Teacher Dashboard | ProspectEdu</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* SIDEBAR */}
      <div
        className="fixed top-0 left-0 h-full transition-all duration-300"
        style={{ width: sidebarWidth }}
      >
        <TeacherSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col" style={{ marginLeft: sidebarWidth }}>
        <TeacherTopbar pageTitle="Reports & Certifications" />
        <Breadcrumb 
        items={[
          { label: "Dashboard", to: "/teacher-dashboard" },
          { label: "Reports & Certifications" },
        ]}
      />

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-y-auto">
          {/* LEFT: Students */}
          <div className="lg:col-span-4 bg-white border border-[#E6F4EC] rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#E6F4EC]">
              <div className="flex items-center gap-2 bg-[#F8FFFA] border border-[#E6F4EC] rounded-lg px-3 py-2">
                <Search size={16} className="text-[#5B7065]" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search student (name/email/phone)"
                  className="w-full bg-transparent outline-none text-sm"
                />
                <button
                  onClick={loadStudents}
                  className="text-sm px-3 py-1 rounded-md bg-[#124734] text-white"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="p-2 max-h-[calc(100vh-220px)] overflow-y-auto">
              {loadingStudents ? (
                <div className="p-4 text-sm text-[#5B7065]">Loading...</div>
              ) : students.length === 0 ? (
                <div className="p-4 text-sm text-[#5B7065]">No students found.</div>
              ) : (
                students.map((s) => {
                  const blocked = !s?.isActive;
                  return (
                    <button
                      key={s._id}
                      onClick={() => setActiveStudentId(s._id)}
                      className={`w-full text-left p-3 rounded-lg border mb-2 transition ${
                        s._id === activeStudentId
                          ? "border-[#009846] bg-[#F8FFFA]"
                          : "border-[#E6F4EC] hover:bg-[#F9FAFB]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-[#124734]">{s.fullName}</p>
                          <p className="text-xs text-[#5B7065]">{s.email}</p>
                          <p className="text-xs text-[#5B7065]">{s.phone || "-"}</p>
                          {blocked && (
                            <span className="mt-2 inline-flex text-xs px-2 py-1 rounded-full bg-red-50 border border-red-100 text-red-700">
                              Blocked
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

          {/* RIGHT: Reports */}
          <div className="lg:col-span-8 space-y-5">
            {/* Upload card */}
            <div className="bg-white border border-[#E6F4EC] rounded-xl shadow-sm p-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-[#124734]">
                    Upload Reports {activeStudent?.fullName ? `— ${activeStudent.fullName}` : ""}
                  </h3>
                  <p className="text-sm text-[#5B7065] mt-1">
                    Upload certificates / reports for the selected student (max {maxFiles}).
                  </p>
                </div>

                <label
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm cursor-pointer
                    ${
                      !activeStudentId || remaining <= 0
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-[#124734] text-white hover:opacity-95"
                    }`}
                >
                  <Upload size={16} />
                  {remaining <= 0 ? "Limit reached" : `Upload (remaining ${remaining})`}
                  <input
                    type="file"
                    multiple
                    onChange={onPickFiles}
                    disabled={!activeStudentId || remaining <= 0}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="mt-4 text-xs text-[#98A6A2]">
                Tip: You can select multiple files at once. Only “Download” will be visible to parents.
              </div>
            </div>

            {/* Files list */}
            <div className="bg-white border border-[#E6F4EC] rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#124734]">Uploaded Files</h3>
                <div className="text-sm text-[#5B7065]">
                  {files.length}/{maxFiles}
                </div>
              </div>

              <div className="mt-4">
                {loadingFiles ? (
                  <div className="p-4 text-sm text-[#5B7065]">Loading...</div>
                ) : files.length === 0 ? (
                  <div className="p-4 bg-[#F8FFFA] border border-[#E6F4EC] rounded-lg text-sm text-[#5B7065]">
                    No reports uploaded yet.
                  </div>
                ) : (
                  <div className="divide-y">
                    {files.map((f) => (
                      <div key={f._id} className="py-3 flex items-center justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-[#F8FFFA] border border-[#E6F4EC] flex items-center justify-center">
                            <FileText className="text-[#124734]" size={18} />
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

                        <div className="flex items-center gap-2 shrink-0">
                      <button
  onClick={() => handleDownload(f)}
  className="text-sm text-green-600 hover:underline"
>
  Download
</button>


                          <button
                            onClick={() => onDelete(f._id)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#F3D0D0] bg-[#FFF5F5] text-[#9B1C1C] text-xs hover:opacity-90"
                            title="Delete"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {!activeStudentId && (
                <div className="mt-4 text-sm text-[#5B7065]">
                  Select a student from the left to manage reports.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
