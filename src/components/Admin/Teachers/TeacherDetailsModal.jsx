import React from "react";

export default function TeacherDetailsModal({ open, teacher, onClose }) {
  if (!open) return null;

  const label = "text-xs text-[#5B7065]";
  const value = "text-sm text-[#124734] font-medium";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[6000]">
      <div className="bg-white w-[720px] max-w-[95vw] rounded-xl shadow-xl p-6 border border-[#E6F4EC]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[#124734]">Teacher Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            ✕
          </button>
        </div>

        {!teacher ? (
          <div className="text-sm text-[#5B7065] py-10">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <div className={label}>Name</div>
                <div className={value}>{teacher.fullName || "-"}</div>
              </div>

              <div>
                <div className={label}>Role</div>
                <div className={value}>{teacher.role || "teacher"}</div>
              </div>

              <div>
                <div className={label}>Email</div>
                <div className={value}>{teacher.email || "-"}</div>
              </div>

              <div>
                <div className={label}>Phone</div>
                <div className={value}>{teacher.phone || "-"}</div>
              </div>

              <div>
                <div className={label}>State</div>
                <div className={value}>{teacher.state || "-"}</div>
              </div>

              <div>
                <div className={label}>City</div>
                <div className={value}>{teacher.city || "-"}</div>
              </div>

              <div>
                <div className={label}>Last Active</div>
                <div className={value}>
                  {teacher.lastLoginAt ? new Date(teacher.lastLoginAt).toLocaleString() : "Never"}
                </div>
              </div>

              <div>
                <div className={label}>Status</div>
                <div className={value}>{teacher.isActive ? "Active" : "Blocked"}</div>
              </div>
            </div>

            {/* TeacherProfile (if your backend returns it) */}
            {teacher.profile && (
              <div className="mt-6">
                <h3 className="font-semibold text-[#124734] mb-2">Profile</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className={label}>Department</div>
                    <div className={value}>{teacher.profile.department || "-"}</div>
                  </div>
                  <div>
                    <div className={label}>Qualification</div>
                    <div className={value}>{teacher.profile.qualification || "-"}</div>
                  </div>
                  <div>
                    <div className={label}>Experience</div>
                    <div className={value}>
                      {teacher.profile.experience !== undefined ? teacher.profile.experience : "-"}
                    </div>
                  </div>
                  <div>
                    <div className={label}>Salary</div>
                    <div className={value}>
                      {teacher.profile.salary !== undefined ? `₹ ${teacher.profile.salary}` : "-"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
