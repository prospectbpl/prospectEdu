import React, { useEffect, useState } from "react";
import { UserCircle2 } from "lucide-react";
import { usersApi } from "../../../services/users";
import { useToast } from "../../../context/ToastContext";

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [blockingId, setBlockingId] = useState(null);
  const { showToast } = useToast();

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", { dateStyle: "medium" })
      : "—";

  const formatDateTime = (d) =>
    d
      ? new Date(d).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "—";

  const load = async () => {
    try {
      const res = await usersApi.listStudents();
      setStudents(res.data.students || []);
    } catch (e) {
      console.log(e);
      showToast?.("Failed to load students", "error");
      setStudents([]);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBlock = async (userId) => {
    if (!confirm("Block this student?")) return;

    try {
      setBlockingId(userId);
      await usersApi.blockUser(userId);
      showToast?.("Student blocked", "success");
      await load();
    } catch (e) {
      console.log(e);
      showToast?.(e?.response?.data?.message || "Block failed", "error");
    } finally {
      setBlockingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 w-full">
      <h2 className="text-xl font-semibold text-[#124734] mb-4">
        Student List
      </h2>

      {/* ✅ Vertical scroll area (shows ~5 rows) */}
      <div className="overflow-x-auto max-h-[310px] overflow-y-auto">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="border-b text-[#124734]">
              <th className="py-3 px-3"></th>
              <th className="py-3 px-3 font-semibold">Name</th>
              <th className="py-3 px-3 font-semibold">Phone No</th>
              <th className="py-3 px-3 font-semibold">Joined</th>
              <th className="py-3 px-3 font-semibold">Last Active</th>
              <th className="py-3 px-3 font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {students.map((s, idx) => {
              const lastActive = s.lastLoginAt || s.updatedAt || null;

              return (
                <tr
                  key={s._id || idx}
                  className="border-b hover:bg-[#F1F7F4] transition"
                >
                  <td className="py-3 px-3">
                    <UserCircle2
                      size={28}
                      className="text-[#124734]"
                      aria-label="profile"
                    />
                  </td>

                  <td className="py-3 px-3">{s.fullName || s.email || "—"}</td>
                  <td className="py-3 px-3">{s.phone || "—"}</td>
                  <td className="py-3 px-3">{formatDate(s.createdAt)}</td>
                  <td className="py-3 px-3">{formatDateTime(lastActive)}</td>

                  {/* ✅ Direct Block button */}
                  <td className="py-3 px-3">
                    <button
                      disabled={blockingId === s._id}
                      onClick={() => handleBlock(s._id)}
                      className="px-4 py-2 rounded-md border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {blockingId === s._id ? "Blocking..." : "Block"}
                    </button>
                  </td>
                </tr>
              );
            })}

            {students.length === 0 && (
              <tr>
                <td className="py-6 px-3 text-gray-500" colSpan={6}>
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
