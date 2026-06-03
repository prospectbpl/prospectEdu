import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import AdminSidebar from "../../components/Admin/Layout/AdminSidebar";
import AdminTopbar from "../../components/Admin/Layout/AdminTopbar";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import ErrorToast from "../../components/ui/ErrorToast";
import Breadcrumb from "../../components/Breadcrumb";
import { usersApi } from "../../services/users";

export default function AdminConfirmTeacherPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 80 : 256;

  const canonicalUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    return origin && pathname ? `${origin}${pathname}` : "";
  }, []);

  const pageTitle = "Confirm Teachers | ProspectEdu Admin";
  const pageDescription =
    "Review and approve or reject pending teacher requests in ProspectEdu Admin.";

  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [toast, setToast] = useState("");

  const [approveOpen, setApproveOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState("");

  const pendingTeachers = useMemo(() => {
    return teachers.filter((t) => (t.teacherApproval?.status || "pending") === "pending");
  }, [teachers]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await usersApi.listTeacherRequests("pending");
      setTeachers(res.data?.teachers || []);
    } catch (err) {
      setToast(err.response?.data?.message || "Failed to load teacher requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openApprove = (teacher) => {
    setSelected(teacher);
    setApproveOpen(true);
  };

  const confirmApprove = async () => {
    if (!selected?._id && !selected?.id) return;
    const teacherId = selected._id || selected.id;

    try {
      await usersApi.approveTeacher(teacherId);
      setToast("Teacher approved ✅");
      setTeachers((prev) => prev.filter((t) => (t._id || t.id) !== teacherId));
    } catch (err) {
      setToast(err.response?.data?.message || "Failed to approve teacher");
    } finally {
      setApproveOpen(false);
      setSelected(null);
    }
  };

  const openReject = (teacher) => {
    setSelected(teacher);
    setRejectNote("");
    setRejectOpen(true);
  };

  const confirmReject = async () => {
    if (!selected?._id && !selected?.id) return;
    const teacherId = selected._id || selected.id;

    try {
      await usersApi.rejectTeacher(teacherId, rejectNote);
      setToast("Teacher rejected ❌");
      setTeachers((prev) => prev.filter((t) => (t._id || t.id) !== teacherId));
    } catch (err) {
      setToast(err.response?.data?.message || "Failed to reject teacher");
    } finally {
      setRejectOpen(false);
      setSelected(null);
      setRejectNote("");
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FBF2] flex">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}

        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Helmet>

      <h1 className="sr-only">Confirm Teachers</h1>

      {toast && <ErrorToast message={toast} onClose={() => setToast("")} />}

      <div style={{ width: sidebarWidth }} className="transition-all duration-300">
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      <main className="flex-1" aria-label="Confirm teachers admin page">
        <AdminTopbar />
        <div className="ml=-3"> 
           <Breadcrumb
        items={[
          { label: "Dashboard", to: "/admin-dashboard" },
          { label: "Confirm Teacher" },
        ]}
      />
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold text-[#124734]">Confirm Teachers</h2>
            </div>

            <button
              onClick={fetchRequests}
              className="px-4 py-2 rounded-md bg-white border border-[#A7E1B2] text-[#124734] hover:bg-[#EAF7E5]"
            >
              Refresh
            </button>
          </div>

          <div className="bg-white rounded-xl border border-[#E6F4EC] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E6F4EC] flex items-center justify-between">
              <h3 className="font-semibold text-[#124734]">
                Pending Requests ({pendingTeachers.length})
              </h3>
              {loading && <span className="text-xs text-[#5B7065]">Loading...</span>}
            </div>

            {loading ? (
              <div className="p-6 text-sm text-[#5B7065]" aria-live="polite">Loading requests...</div>
            ) : pendingTeachers.length === 0 ? (
              <div className="p-6 text-sm text-[#5B7065]" aria-live="polite">
                No pending teacher requests.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F3FAF1] text-[#124734]">
                    <tr className="text-left">
                      <th className="px-5 py-3 font-semibold text-center">Name</th>
                      <th className="px-5 py-3 font-semibold text-center">Email</th>
                      <th className="px-5 py-3 font-semibold text-center">Phone</th>
                      <th className="px-5 py-3 font-semibold text-center">City</th>
                      <th className="px-5 py-3 font-semibold text-center">State</th>
                      <th className="px-5 py-3 font-semibold text-center">Requested</th>
                      <th className="px-5 py-3 font-semibold text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {pendingTeachers.map((t) => {
                      const id = t._id || t.id;
                      return (
                        <tr key={id} className="border-t border-[#E6F4EC]">
                          <td className="px-5 py-3 text-[#124734] font-medium">
                            {t.fullName || "-"}
                          </td>
                          <td className="px-5 py-3 text-[#5B7065]">{t.email || "-"}</td>
                          <td className="px-5 py-3 text-[#5B7065]">{t.phone || "-"}</td>
                          <td className="px-5 py-3 text-[#5B7065]">{t.city || "-"}</td>
                          <td className="px-5 py-3 text-[#5B7065]">{t.state || "-"}</td>
                          <td className="px-5 py-3 text-[#5B7065]">
                            {t.createdAt ? new Date(t.createdAt).toLocaleString() : "-"}
                          </td>

                          <td className="px-5 py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openReject(t)}
                                className="px-3 py-1.5 rounded-md border border-red-200 text-red-700 hover:bg-red-50"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => openApprove(t)}
                                className="px-3 py-1.5 rounded-md bg-[#124734] text-white hover:bg-[#009846]"
                              >
                                Approve
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      <ConfirmDialog
        open={approveOpen}
        title="Approve Teacher?"
        message={`Are you sure you want to approve ${
          selected?.fullName || "this teacher"
        }? They will be able to login.`}
        onCancel={() => {
          setApproveOpen(false);
          setSelected(null);
        }}
        onConfirm={confirmApprove}
        confirmText="Approve"
      />

      {rejectOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[5000]" role="dialog" aria-modal="true">
          <div className="bg-white w-[520px] rounded-xl shadow-xl p-6 border border-[#E6F4EC]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-[#124734]">Reject Teacher?</h2>
              <button
                onClick={() => {
                  setRejectOpen(false);
                  setSelected(null);
                  setRejectNote("");
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-[#5B7065] mb-3">
              Reject <span className="font-medium text-[#124734]">{selected?.fullName}</span>. Optional: add a note.
            </p>

            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Reason (optional)"
              className="w-full border border-[#A7E1B2] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#009846]"
              rows={3}
            />

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => {
                  setRejectOpen(false);
                  setSelected(null);
                  setRejectNote("");
                }}
                className="px-4 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
