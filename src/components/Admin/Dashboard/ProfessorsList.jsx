import React, { useEffect, useMemo, useState } from "react";
import { UserCircle2 } from "lucide-react";
import { usersApi } from "../../../services/users";
import { useToast } from "../../../context/ToastContext";
import { useNavigate } from "react-router-dom";

export default function ProfessorsList() {
  const [teachers, setTeachers] = useState([]);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await usersApi.listTeachers();
        setTeachers(res.data.teachers || []);
      } catch (e) {
        console.log(e);
        showToast?.("Failed to load professors", "error");
      }
    };
    load();
  }, []);

  // ✅ sort by lastActive ASC and limit to 6
  const visibleTeachers = useMemo(() => {
    const toTime = (t) => {
      const dt = t.lastLoginAt || t.updatedAt || null;
      return dt ? new Date(dt).getTime() : Number.POSITIVE_INFINITY; // nulls go last
    };

    return [...teachers]
      .sort((a, b) => toTime(a) - toTime(b)) // ASC
      .slice(0, 6);
  }, [teachers]);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 w-full h-[420px] flex flex-col">
      <h2 className="text-xl font-semibold text-[#124734] mb-4">
        Professors List
      </h2>

      <div className="overflow-y-auto pr-2 flex-1 space-y-5">
        {visibleTeachers.map((t) => {
          const displayName = t.fullName || t.email || "Unnamed";
          const meta = t.email || "—";
          const lastActive = t.lastLoginAt || t.updatedAt || null;

          const lastActiveText = lastActive
            ? new Date(lastActive).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })
            : "—";

          return (
            <div key={t._id} className="flex items-center gap-4 border-b pb-3">
              <div className="w-12 h-12 rounded-full bg-[#E6F4EC] flex items-center justify-center">
                <UserCircle2 size={32} className="text-[#124734]" />
              </div>

              <div>
                <p className="font-semibold text-[#124734]">
                  {displayName}{" "}
                  <span className="text-gray-500 text-sm">({meta})</span>
                </p>

                <p className="text-sm font-medium text-green-600">
                  Last Active: {lastActiveText}
                </p>
              </div>
            </div>
          );
        })}

        {teachers.length === 0 && (
          <p className="text-sm text-gray-500">No professors found</p>
        )}
      </div>

      <div className="text-center mt-4">
        <button
          onClick={() => navigate("/admin/teachers")}
          className="w-30 mt-4 px-4 py-2 bg-[#124734] text-white rounded-lg hover:bg-[#0f3d28]"
        >
          View All
        </button>
      </div>
    </div>
  );
}
