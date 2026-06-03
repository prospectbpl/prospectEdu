import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import AdminSidebar from "../../components/Admin/Layout/AdminSidebar";
import AdminTopbar from "../../components/Admin/Layout/AdminTopbar";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { usersApi } from "../../services/users";
import { useToast } from "../../context/ToastContext";
import Pagination from "../../components/Admin/Ecom/Pagination";
import Breadcrumb from "../../components/Breadcrumb";
import { getStudentByIdAdmin } from "../../services/student.service";

export default function AdminStudentsPage() {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 15;
  const [totalPages, setTotalPages] = useState(1);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 80 : 256;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [actionType, setActionType] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsUser, setDetailsUser] = useState(null);
  const [detailsProfile, setDetailsProfile] = useState(null);

  const canonicalUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    return origin && pathname ? `${origin}${pathname}` : "";
  }, []);

  const pageTitle = "Students | ProspectEdu Admin";
  const pageDescription =
    "Manage student accounts, view student details, and block or unblock students in ProspectEdu Admin.";

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
      const res = await usersApi.listStudents({ status, page, limit });
      setStudents(res.data.students || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (e) {
      showToast("Failed to load students", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status, page]);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return students;
    return students.filter((s) =>
      [s.fullName, s.email, s.phone, s.state, s.city]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [students, searchQuery]);

  const openStudentModal = async (id) => {
    try {
      setDetailsOpen(true);
      setDetailsLoading(true);
      const data = await getStudentByIdAdmin(id);
      setDetailsUser(data.user);
      setDetailsProfile(data.profile);
    } catch {
      showToast("Failed to load student details", "error");
      setDetailsOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

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

      <h1 className="sr-only">Students</h1>

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
        aria-label="Students admin page"
      >
        {/* TOPBAR */}
        <div
          className="fixed top-0 bg-white shadow-sm h-[64px] z-[999]"
          style={{ left: sidebarWidth, right: 0 }}
        >
          <AdminTopbar pageTitle="Students" />
        </div>
         
 
        {/* CONTENT */}
        <div className="px-6 pt-[80px] pb-10 overflow-y-auto">
        <div className="ml=-3"> 
           <Breadcrumb
        items={[
          { label: "Dashboard", to: "/admin-dashboard" },
          { label: "Students" },
        ]}
      />
        </div>
          {/* HEADER */}
          <div className="flex justify-between mb-5">
            <h2 className="text-2xl font-bold text-[#124734]">
              All Students List
            </h2>
          </div>

          {/* CONTROLS */}
          <div className="flex justify-between mb-4">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="border px-3 py-2 rounded-md"
              aria-label="Filter students"
            >
              <option value="all">All</option>
              <option value="blocked">Blocked</option>
            </select>

            <input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border px-3 py-2 rounded-md w-64"
              aria-label="Search students"
            />
          </div>

          {/* TABLE */}
          <div className="bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#F1F7F3] border-b">
                <tr className="text-[#124734]">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4">Mobile</th>
                  <th className="px-4">Email</th>
                  <th className="px-4">State</th>
                  <th className="px-4">City</th>
                  <th className="px-4">Joined</th>
                  <th className="px-4">Last Active</th>
                  <th className="px-4">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center" aria-live="polite">
                      Loading...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center" aria-live="polite">
                      No students found
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s, i) => (
                    <tr
                      key={s._id}
                      onClick={() => openStudentModal(s._id)}
                      className={`border-b cursor-pointer ${
                        i % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-[#EAF5EE]`}
                    >
                      <td className="px-4 py-3 font-medium">
                        {s.fullName || s.email}
                      </td>
                      <td className="px-4">{s.phone || "—"}</td>
                      <td className="px-4">{s.email}</td>
                      <td className="px-4">{s.state || "—"}</td>
                      <td className="px-4">{s.city || "—"}</td>
                      <td className="px-4">{formatDate(s.createdAt)}</td>
                      <td className="px-4">
                        {formatDateTime(s.lastLoginAt || s.updatedAt)}
                      </td>
                      <td
                        className="px-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {s.isActive ? (
                          <button
                            onClick={() => {
                              setSelectedStudent(s);
                              setActionType("block");
                              setConfirmOpen(true);
                            }}
                            className="px-3 py-1 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                          >
                            Block
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedStudent(s);
                              setActionType("unblock");
                              setConfirmOpen(true);
                            }}
                            className="px-3 py-1 border border-green-300 text-green-600 rounded-md hover:bg-green-50"
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

          {/* PAGINATION */}
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

      {/* STUDENT DETAILS MODAL */}
      {detailsOpen && (
        <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center px-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b font-semibold text-[#124734]">
              Student Details
            </div>

            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <Info label="Name" value={detailsUser?.fullName} />
              <Info label="Email" value={detailsUser?.email} />
              <Info label="Phone" value={detailsUser?.phone} />
              <Info label="State" value={detailsUser?.state} />
              <Info label="City" value={detailsUser?.city} />
              <Info label="Join Date" value={formatDate(detailsUser?.createdAt)} />
              <Info label="Last Active" value={formatDateTime(detailsUser?.lastLoginAt)} />
              <Info label="Status" value={detailsUser?.isActive ? "Active" : "Blocked"} />

              <Info label="Grade" value={detailsProfile?.grade} />
              <Info label="Stream" value={detailsProfile?.stream} />
              <Info label="Enrolled" value={detailsProfile?.isEnrolled ? "Yes" : "No"} />
              <Info label="Gender" value={detailsProfile?.gender} />
              <Info label="Interested In" value={detailsProfile?.interested} />
              <Info label="Highest Education" value={detailsProfile?.highestEducation} />
              <Info label="Currently Pursuing" value={detailsProfile?.currentlyPursuing} />
              <Info label="Preparing For" value={detailsProfile?.preparingFor} />
              <Info label="Occupation" value={detailsProfile?.occupation} />
              <Info label="Last Exam" value={detailsProfile?.lastExamName} />
              <Info label="Last Exam Year" value={detailsProfile?.lastExamYear} />
              <Info label="Preparing Since" value={detailsProfile?.preparingSince} />
            </div>

            <div className="border-t px-6 py-3 text-right">
              <button
                onClick={() => setDetailsOpen(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DIALOG */}
      <ConfirmDialog
        open={confirmOpen}
        title={actionType === "block" ? "Block Student" : "Unblock Student"}
        message={
          actionType === "block"
            ? "Are you sure you want to block this student?"
            : "Are you sure you want to unblock this student?"
        }
        confirmText={actionType === "block" ? "Block" : "Unblock"}
        onCancel={() => {
          setConfirmOpen(false);
          setSelectedStudent(null);
          setActionType(null);
        }}
        onConfirm={async () => {
          if (!selectedStudent?._id) return;

          try {
            if (actionType === "block") {
              await usersApi.blockUser(selectedStudent._id);
              showToast("Student blocked successfully", "success");
            } else {
              await usersApi.unblockUser(selectedStudent._id);
              showToast("Student unblocked successfully", "success");
            }

            setConfirmOpen(false);
            setSelectedStudent(null);
            setActionType(null);
            load();
          } catch (e) {
            showToast("Action failed", "error");
          }
        }}
      />
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-gray-500">{label}</div>
      <div className="font-medium text-[#124734]">{value || "—"}</div>
    </div>
  );
}
