// src/components/Admin/Settings/AdminManagement.jsx
import { useEffect, useMemo, useState } from "react";
import { Search, ShieldOff, ShieldCheck, Eye, RefreshCw } from "lucide-react";
import AdminDetailsModal from "./AdminDetailsModal";
import { usersApi } from "../../../services/users";
import { useToast } from "../../../context/ToastContext";

export default function AdminManagement() {
  const { showToast } = useToast();

  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const [status, setStatus] = useState("active"); // active | blocked | all
  const [q, setQ] = useState("");

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await usersApi.listAdmins({ status, q: q.trim() });
      setAdmins(res.data?.admins || []);
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to load admins", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return admins;

    return admins.filter((a) => {
      const name = (a.fullName || "").toLowerCase();
      const email = (a.email || "").toLowerCase();
      const phone = (a.phone || "").toLowerCase();
      return name.includes(query) || email.includes(query) || phone.includes(query);
    });
  }, [admins, q]);

  const toggleBlock = async (admin) => {
    const active = admin.isActive !== false;
    const id = admin._id || admin.id;

    try {
      setBusyId(id);

      if (active) {
        await usersApi.blockUser(id);
        showToast("Admin blocked", "success");
      } else {
        await usersApi.unblockUser(id);
        showToast("Admin unblocked", "success");
      }

      // optimistic update
      setAdmins((prev) =>
        prev.map((a) =>
          (a._id || a.id) === id ? { ...a, isActive: !active } : a
        )
      );

      // if modal open, keep it in sync
      setSelectedAdmin((prev) =>
        prev && (prev._id || prev.id) === id ? { ...prev, isActive: !active } : prev
      );
    } catch (e) {
      showToast(e?.response?.data?.message || "Action failed", "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E6F4EC]">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading text-[#124734]">Admin Management</h2>
          <p className="text-sm text-[#5B7065] mt-1">
            View all approved admins and block/unblock access instantly.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-11 px-3 rounded-xl border border-[#E6F4EC] bg-[#F9FAFB] text-sm outline-none focus:ring-2 focus:ring-[#A7E1B2]"
          >
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
            <option value="all">All</option>
          </select>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3.5" size={18} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name / email / phone..."
              className="h-11 w-full sm:w-[320px] pl-10 pr-3 rounded-xl border border-[#E6F4EC] bg-[#F9FAFB] text-sm outline-none focus:ring-2 focus:ring-[#A7E1B2]"
            />
          </div>

          <button
            onClick={fetchAdmins}
            className="h-11 px-4 rounded-xl border border-[#E6F4EC] bg-white hover:bg-[#F9FAFB] text-sm flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {loading ? (
          <SkeletonGrid />
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E6F4EC] p-10 text-center">
            <div className="text-lg font-semibold text-[#124734]">No admins found</div>
            <div className="text-sm text-[#5B7065] mt-1">
              Try switching filters or changing the search term.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((admin) => {
              const id = admin._id || admin.id;
              const active = admin.isActive !== false;

              return (
                <div
                  key={id}
                  className="rounded-2xl border border-[#E6F4EC] bg-white p-5 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[#124734] truncate">
                        {admin.fullName || admin.name}
                      </h3>
                      <p className="text-sm text-[#5B7065] truncate">{admin.email}</p>
                      <p className="text-sm text-[#5B7065] truncate">{admin.phone || "-"}</p>
                    </div>

                    <span
                      className={`shrink-0 inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full border ${
                        active
                          ? "bg-[#E6F4EC] text-[#124734] border-[#A7E1B2]"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {active ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
                      {active ? "Active" : "Blocked"}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setSelectedAdmin(admin)}
                      className="px-4 py-2 rounded-xl border border-[#E6F4EC] hover:bg-[#F9FAFB] text-sm flex items-center gap-2"
                    >
                      <Eye size={16} />
                      View
                    </button>

                    <button
                      onClick={() => toggleBlock(admin)}
                      disabled={busyId === id}
                      className={`px-4 py-2 rounded-xl text-sm text-white flex items-center gap-2 disabled:opacity-60 ${
                        active ? "bg-red-600 hover:bg-red-700" : "bg-[#009846] hover:bg-[#007d39]"
                      }`}
                    >
                      {active ? <ShieldOff size={16} /> : <ShieldCheck size={16} />}
                      {busyId === id ? "Please wait..." : active ? "Block" : "Unblock"}
                    </button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#E6F4EC] text-xs text-[#5B7065] flex justify-between">
                    <span>Joined: {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "-"}</span>
                    <span>Last login: {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleDateString() : "-"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedAdmin && (
        <AdminDetailsModal admin={selectedAdmin} onClose={() => setSelectedAdmin(null)} />
      )}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-[#E6F4EC] bg-white p-5 animate-pulse"
        >
          <div className="h-4 w-2/3 bg-[#E6F4EC] rounded" />
          <div className="h-3 w-5/6 bg-[#E6F4EC] rounded mt-3" />
          <div className="h-3 w-1/2 bg-[#E6F4EC] rounded mt-2" />
          <div className="mt-6 flex gap-3">
            <div className="h-10 w-24 bg-[#E6F4EC] rounded-xl" />
            <div className="h-10 w-28 bg-[#E6F4EC] rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
