// StudentsPage.jsx
import { useEffect, useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { useParams } from "react-router-dom";
import { coursesApi } from "../../services/courses";

function formatLastActive(v) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default function StudentsPage({ courseId: courseIdProp }) {
  const params = useParams();
  const courseId = courseIdProp || params.courseId; // ✅ works in both embed + route

  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!courseId) return; // ✅ important when no course selected yet

    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await coursesApi.teacherCourseStudents(courseId);
        if (!alive) return;
        setStudents(data?.students || []);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setStudents([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [courseId]);

  const filtered = useMemo(() => {
    const s = String(q || "").toLowerCase().trim();
    if (!s) return students;
    return (students || []).filter((x) => {
      return (
        String(x?.fullName || "").toLowerCase().includes(s) ||
        String(x?.email || "").toLowerCase().includes(s) ||
        String(x?.phone || "").toLowerCase().includes(s)
      );
    });
  }, [q, students]);

  if (!courseId) {
    return (
      <div className="bg-white border border-[#A7E1B2] rounded-2xl p-6 text-[#5B7065] shadow-sm">
        Select a course to view enrolled students.
      </div>
    );
  }

  return (
    <div className="px-2">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-[#E6F4EC] border border-[#A7E1B2] flex items-center justify-center">
            <Users className="text-[#124734]" size={18} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-[#124734]">Enrolled Students</h2>
            <p className="text-sm text-[#5B7065]">
              {loading ? "Loading..." : `${filtered.length} student(s)`}
            </p>
          </div>
        </div>

        <div className="w-full md:w-[360px]">
          <div className="flex items-center gap-2 bg-white border border-[#A7E1B2] rounded-xl px-3 py-2 shadow-sm">
            <Search size={18} className="text-[#5B7065]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="w-full outline-none text-sm text-[#124734]"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#A7E1B2] rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#E6F4EC] text-[#124734]">
              <th className="p-3 border">Student</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Phone</th>
              <th className="p-3 border">Last Active</th>
            </tr>
          </thead>

          <tbody>
            {!loading &&
              filtered.map((s) => (
                <tr key={s._id} className="text-[#5B7065] hover:bg-[#F9FAFB] transition">
                  <td className="p-3 border font-medium text-[#124734]">{s.fullName || "—"}</td>
                  <td className="p-3 border">{s.email || "—"}</td>
                  <td className="p-3 border">{s.phone || "—"}</td>
                  <td className="p-3 border">{formatLastActive(s.lastActive)}</td>
                </tr>
              ))}
          </tbody>
        </table>

        {!loading && filtered.length === 0 && (
          <div className="text-center p-6 text-[#5B7065]">No enrolled students found.</div>
        )}

        {loading && <div className="text-center p-6 text-[#5B7065]">Loading students…</div>}
      </div>
    </div>
  );
}
