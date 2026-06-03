// src/pages/Admin/AdminAllTeachersPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import AdminSidebar from "../../components/Admin/Layout/AdminSidebar";
import AdminTopbar from "../../components/Admin/Layout/AdminTopbar";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { usersApi } from "../../services/users";
import { useToast } from "../../context/ToastContext";
import Breadcrumb from "../../components/Breadcrumb";
import Pagination from "../../components/Admin/Ecom/Pagination";

export default function AdminAllTeachersPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 80 : 256;

  const canonicalUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    return origin && pathname ? `${origin}${pathname}` : "";
  }, []);

  const pageTitle = "Teachers | ProspectEdu Admin";
  const pageDescription =
    "Manage teacher accounts, view details, update salaries, and block or unblock teachers in ProspectEdu Admin.";

  const [status, setStatus] = useState("all"); // all | blocked
  const [page, setPage] = useState(1);
  const limit = 15;
  const [totalPages, setTotalPages] = useState(1);

  const [searchQuery, setSearchQuery] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // confirm block/unblock
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [actionType, setActionType] = useState(null); // block | unblock
  const [actionLoading, setActionLoading] = useState(false);

  // details modal
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsUser, setDetailsUser] = useState(null);
  const [detailsProfile, setDetailsProfile] = useState(null);

  // salary inline edit
  const [salaryEditId, setSalaryEditId] = useState(null);
  const [salaryDraft, setSalaryDraft] = useState("");
  const [salarySaving, setSalarySaving] = useState(false);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—";

  const formatDateTime = (d) =>
    d
      ? new Date(d).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "—";

  const load = async () => {
    try {
      setLoading(true);
      const res = await usersApi.listTeachers({ status, page, limit });
      setTeachers(res.data.teachers || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (e) {
      showToast("Failed to load teachers", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page]);

  const filteredTeachers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return teachers;

    return teachers.filter((t) =>
      [
        t.fullName,
        t.email,
        t.phone,
        t.state,
        t.city,
        String(t.salary ?? ""),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [teachers, searchQuery]);

  const openTeacherModal = async (id) => {
    try {
      setDetailsOpen(true);
      setDetailsLoading(true);
      setDetailsUser(null);
      setDetailsProfile(null);

      const res = await usersApi.getTeacherById(id);
      setDetailsUser(res.data.user);
      setDetailsProfile(res.data.profile);
    } catch (e) {
      showToast("Failed to load teacher details", "error");
      setDetailsOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Salary helpers
  const startSalaryEdit = (teacher) => {
    setSalaryEditId(teacher._id);
    setSalaryDraft(String(teacher.salary ?? 0));
  };

  const cancelSalaryEdit = () => {
    setSalaryEditId(null);
    setSalaryDraft("");
  };

  const saveSalary = async (teacherId) => {
    const val = Number(salaryDraft);

    if (Number.isNaN(val) || val < 0) {
      showToast("Enter a valid salary", "error");
      return;
    }

    try {
      setSalarySaving(true);

      await usersApi.setTeacherSalary(teacherId, val);

      setTeachers((prev) =>
        prev.map((t) => (t._id === teacherId ? { ...t, salary: val } : t))
      );

      if (detailsUser?._id === teacherId) {
        setDetailsProfile((p) => ({ ...(p || {}), salary: val }));
      }

      showToast("Salary updated", "success");
      cancelSalaryEdit();
    } catch (e) {
      showToast("Failed to update salary", "error");
    } finally {
      setSalarySaving(false);
    }
  };

  const openConfirm = (teacher, type) => {
    setSelectedTeacher(teacher);
    setActionType(type);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setSelectedTeacher(null);
    setActionType(null);
  };

  const doAction = async () => {
    if (!selectedTeacher?._id || !actionType) return;

    try {
      setActionLoading(true);

      if (actionType === "block") {
        await usersApi.blockUser(selectedTeacher._id);
        showToast("Teacher blocked successfully", "success");
      } else {
        await usersApi.unblockUser(selectedTeacher._id);
        showToast("Teacher unblocked successfully", "success");
      }

      closeConfirm();
      load();
    } catch (e) {
      showToast("Action failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const StatusBadge = ({ active }) => (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
        active
          ? "bg-green-50 text-green-700 border-green-200"
          : "bg-red-50 text-red-700 border-red-200"
      }`}
    >
      {active ? "Active" : "Blocked"}
    </span>
  );

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
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

      <h1 className="sr-only">Teachers</h1>

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-full z-40 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <AdminSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      </div>

      {/* MAIN */}
      <main
        className="flex flex-col flex-1"
        style={{ marginLeft: sidebarWidth }}
        aria-label="Teachers admin page"
      >
        {/* TOPBAR */}
        <div
          className="fixed top-0 bg-white shadow-sm h-[64px] z-[999]"
          style={{ left: sidebarWidth, right: 0 }}
        >
          <AdminTopbar pageTitle="Teachers" />
        </div>
         

        {/* CONTENT */}
        <div className="px-6 pt-[80px] pb-10 overflow-y-auto">
        <div className="ml=-1"> 
           <Breadcrumb
        items={[
          { label: "Dashboard", to: "/admin-dashboard" },
          { label: "All Teachers" },
        ]}
      />
        </div>
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
            <div>
              <h2 className="text-2xl font-bold text-[#124734]">
                All Teachers List
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="bg-white border px-4 py-2 rounded-md hover:bg-gray-50 transition"
                onClick={() => load()}
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white border rounded-xl shadow-sm p-4 mb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-3">
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                  className="border px-3 py-2 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#124734]"
                  aria-label="Filter teachers"
                >
                  <option value="all">All</option>
                  <option value="blocked">Blocked</option>
                </select>

                <div className="text-sm text-gray-500">
                  Showing:{" "}
                  <span className="font-medium text-gray-700">
                    {filteredTeachers.length}
                  </span>
                </div>
              </div>

              <input
                placeholder="Search by name, email, phone, city, salary..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border px-3 py-2 rounded-md w-full md:w-[420px] bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#124734]"
                aria-label="Search teachers"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[980px]">
                <thead className="bg-[#F1F7F3] border-b">
                  <tr className="text-[#124734]">
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 text-center">Mobile</th>
                    <th className="px-4 text-center">Email</th>
                    <th className="px-4 text-center">State</th>
                    <th className="px-4 text-left">City</th>
                    <th className="px-4 text-left">Salary</th>
                    <th className="px-4 text-left">Status</th>
                    <th className="px-4 text-left">Joined</th>
                    <th className="px-4 text-left">Last Active</th>
                    <th className="px-4 text-left">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-gray-600">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredTeachers.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-gray-600">
                        No teachers found
                      </td>
                    </tr>
                  ) : (
                    filteredTeachers.map((t, i) => (
                      <tr
                        key={t._id}
                        onClick={() => openTeacherModal(t._id)}
                        className={`border-b cursor-pointer ${
                          i % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-[#EAF5EE]`}
                      >
                        <td className="px-4 py-3 font-medium">
                          <div className="flex items-center gap-2">
                            <span className="text-[#124734]">
                              {t.fullName || t.email}
                            </span>
                          </div>
                        </td>

                        <td className="px-4">{t.phone || "—"}</td>
                        <td className="px-4">{t.email}</td>
                        <td className="px-4">{t.state || "—"}</td>
                        <td className="px-4">{t.city || "—"}</td>

                        {/* Salary (editable) */}
                        <td
                          className="px-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {salaryEditId === t._id ? (
                            <div className="flex items-center gap-2">
                              <input
                                value={salaryDraft}
                                onChange={(e) => setSalaryDraft(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveSalary(t._id);
                                  if (e.key === "Escape") cancelSalaryEdit();
                                }}
                                className="w-28 border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#124734]"
                                placeholder="0"
                              />
                              <button
                                disabled={salarySaving}
                                onClick={() => saveSalary(t._id)}
                                className="px-2.5 py-1 text-xs rounded-md bg-[#124734] text-white disabled:opacity-60"
                                title="Save"
                              >
                                {salarySaving ? "Saving" : "Save"}
                              </button>
                              <button
                                disabled={salarySaving}
                                onClick={cancelSalaryEdit}
                                className="px-2.5 py-1 text-xs rounded-md border hover:bg-gray-50 disabled:opacity-60"
                                title="Cancel"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-[#124734]">
                                ₹ {t.salary ?? 0}
                              </span>
                              <button
                                onClick={() => startSalaryEdit(t)}
                                className="text-xs px-2 py-1 rounded-md border hover:bg-gray-50"
                                title="Edit salary"
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Status badge */}
                        <td className="px-4">
                          <StatusBadge active={!!t.isActive} />
                        </td>

                        <td className="px-4">{formatDate(t.createdAt)}</td>
                        <td className="px-4">
                          {formatDateTime(t.lastLoginAt || t.updatedAt)}
                        </td>

                        {/* Action */}
                        <td
                          className="px-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {t.isActive ? (
                            <button
                              onClick={() => openConfirm(t, "block")}
                              className="px-3 py-1 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                            >
                              Block
                            </button>
                          ) : (
                            <button
                              onClick={() => openConfirm(t, "unblock")}
                              className="px-3 py-1 border border-green-300 text-green-700 rounded-md hover:bg-green-50"
                            >
                              Unblock
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {!loading && (
            <div className="mt-6 flex justify-center">
              <Pagination
                page={page}
                setPage={setPage}
                totalPages={Math.max(totalPages, 1)}
              />
            </div>
          )}
        </div>
      </main>

      {/* Details Modal */}
      {detailsOpen && (
        <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center px-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-xl">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div className="font-semibold text-[#124734]">Teacher Details</div>
              <button
                onClick={() => setDetailsOpen(false)}
                className="px-3 py-1.5 border rounded-md hover:bg-gray-50 text-sm"
              >
                Close
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {detailsLoading ? (
                <div className="text-center text-gray-600 py-8">
                  Loading details...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <Info label="Name" value={detailsUser?.fullName} />
                  <Info label="Email" value={detailsUser?.email} />
                  <Info label="Phone" value={detailsUser?.phone} />
                  <Info label="State" value={detailsUser?.state} />
                  <Info label="City" value={detailsUser?.city} />
                  <Info label="Join Date" value={formatDate(detailsUser?.createdAt)} />
                  <Info label="Last Active" value={formatDateTime(detailsUser?.lastLoginAt)} />
                  <Info label="Status" value={detailsUser?.isActive ? "Active" : "Blocked"} />

                  <Info label="Teacher ID" value={detailsProfile?.teacherId} />
                  <Info label="Department" value={detailsProfile?.department} />
                  <Info label="Designation" value={detailsProfile?.designation} />
                  <Info label="Qualification" value={detailsProfile?.qualification} />
                  <Info label="Experience" value={detailsProfile?.experience} />
                  <Info
                    label="Subjects"
                    value={
                      detailsProfile?.subjects?.length
                        ? detailsProfile.subjects.join(", ")
                        : "—"
                    }
                  />
                  <Info
                    label="Salary"
                    value={
                      detailsProfile?.salary !== undefined
                        ? `₹ ${detailsProfile.salary}`
                        : "—"
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title={actionType === "block" ? "Block Teacher" : "Unblock Teacher"}
        message={
          actionType === "block"
            ? "Are you sure you want to block this teacher?"
            : "Are you sure you want to unblock this teacher?"
        }
        confirmText={
          actionLoading
            ? "Please wait..."
            : actionType === "block"
            ? "Block"
            : "Unblock"
        }
        onCancel={() => {
          if (!actionLoading) closeConfirm();
        }}
        onConfirm={() => {
          if (!actionLoading) doAction();
        }}
      />
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="bg-[#F9FAFB] border rounded-lg p-3">
      <div className="text-gray-500 text-xs">{label}</div>
      <div className="font-medium text-[#124734] mt-1">{value || "—"}</div>
    </div>
  );
}
