import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import AdminSidebar from "../../components/Admin/Layout/AdminSidebar";
import AdminTopbar from "../../components/Admin/Layout/AdminTopbar";
import { useToast } from "../../context/ToastContext";
import Breadcrumb from "../../components/Breadcrumb";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";

const prettyDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

export default function AdminAnnouncementsPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 80 : 256;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const canonicalUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    return origin && pathname ? `${origin}${pathname}` : "";
  }, []);

  const pageTitle = "Announcements | ProspectEdu Admin";
  const pageDescription =
    "View, create, and delete announcements for students and parents in ProspectEdu Admin.";

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // delete confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get("/announcements");
      setAnnouncements(res?.data?.data || []);
    } catch (e) {
      showToast("Failed to load announcements", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const askDelete = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/announcements/${deleteId}`);
      showToast("Announcement deleted successfully", "success");
      setConfirmOpen(false);
      setDeleteId(null);
      loadAnnouncements();
    } catch (e) {
      showToast("Delete failed", "error");
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

      <h1 className="sr-only">All Announcements</h1>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full ${isCollapsed ? "w-20" : "w-64"}`}>
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* Main */}
      <main
        className="flex flex-col flex-1"
        style={{ marginLeft: sidebarWidth }}
        aria-label="Announcements admin page"
      >
        <div
          className="fixed top-0 bg-white shadow-sm h-[64px] flex items-center z-50"
          style={{ left: sidebarWidth, right: 0 }}
        >
          <AdminTopbar pageTitle="All Announcements" />
        </div>

        <div className="px-6 pt-[90px] pb-10 overflow-y-auto">
              <div className="ml=-3"> 
           <Breadcrumb
        items={[
          { label: "Dashboard", to: "/admin-dashboard" },
          { label: "All Announcements" },
        ]}
      />
        </div>
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">All Announcements</h2>

            <button
              onClick={() => navigate("/admin/announcements/create")}
              className="bg-[#124734] text-white px-4 py-2 rounded-lg hover:bg-[#0E3A2B]"
            >
              + Create Announcement
            </button>
          </div>

          {/* Table */}
          <div className="bg-white shadow rounded-xl p-6">
            {loading ? (
              <p className="text-gray-500" aria-live="polite">Loading...</p>
            ) : announcements.length === 0 ? (
              <p className="text-gray-500" aria-live="polite">No announcements found.</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {announcements.map((a, index) => (
                    <tr key={a._id} className="border-b">
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3 font-medium">{a.title}</td>
                      <td className="p-3 text-gray-600 line-clamp-2">
                        {a.description}
                      </td>
                      <td className="p-3">{prettyDate(a.createdAt)}</td>
                      <td className="p-3">
                        <button
                          onClick={() => askDelete(a._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                          aria-label={`Delete announcement ${a.title}`}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement?"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
