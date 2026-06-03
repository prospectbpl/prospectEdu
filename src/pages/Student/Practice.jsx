import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FileText, Timer, ClipboardList } from "lucide-react";

import StudentSidebar from "../../components/Student/StudentSidebar";
import StudentTopbar from "../../components/Student/StudentTopbar";
import RefreshComponent from "../../components/RefreshComponent";

import { assignmentsApi } from "../../services/assignments";
import { quizzesApi } from "../../services/quizzes";
import { studentCoursesApi } from "../../services/studentCourses";
import { useToast } from "../../context/ToastContext";

function upsertMeta(name, content) {
  if (!content) return () => {};
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
  return () => {};
}

function upsertLink(rel, href) {
  if (!href) return () => {};
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
  return () => {};
}

function fmtDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return "—";
  }
}
function getCourseIdFromEnrollment(en) {
  if (!en) return "";
  if (en.course && typeof en.course === "object" && en.course._id) return String(en.course._id);
  if (typeof en.course === "string") return en.course;

  if (en.courseId && typeof en.courseId === "object" && en.courseId._id) return String(en.courseId._id);
  if (typeof en.courseId === "string") return en.courseId;

  return "";
}

function getCourseObjFromEnrollment(en) {
  if (en?.course && typeof en.course === "object") return en.course;
  if (en?.courseId && typeof en.courseId === "object") return en.courseId;
  return null;
}

export default function Practice() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidthPx = isCollapsed ? 80 : 256;

  const [coursesLoading, setCoursesLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  const [enrollments, setEnrollments] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(courseId || "");

  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  // ✅ SEO (no layout changes)
  useEffect(() => {
    document.title = "Practice | ProspectEdu Student";

    upsertMeta("description", "Practice assignments and quizzes for your enrolled courses in ProspectEdu.");
    upsertMeta("robots", "noindex, follow");

    const canonicalUrl = window.location?.href || "";
    upsertLink("canonical", canonicalUrl);
  }, []);

  // 1) Load my enrollments once
  useEffect(() => {
    const loadEnrollments = async () => {
      try {
        setCoursesLoading(true);

        const res = await studentCoursesApi.myEnrollments();

        const list = res?.data?.courses || [];
        setEnrollments(Array.isArray(list) ? list : []);

        if (courseId) {
          setSelectedCourseId(courseId);
        } else {
          const firstId = list?.[0]?.course?._id || "";
          setSelectedCourseId(firstId);
        }
      } catch (e) {
        setEnrollments([]);
        setSelectedCourseId("");
        showToast?.(e?.response?.data?.message || "Failed to load your courses", "error");
      } finally {
        setCoursesLoading(false);
      }
    };

    loadEnrollments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  // 2) Load practice items for selected course
  useEffect(() => {
    const loadPractice = async () => {
      if (!selectedCourseId) {
        setAssignments([]);
        setQuizzes([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const [aRes, qRes] = await Promise.all([
          assignmentsApi.listForStudent(selectedCourseId),
          quizzesApi.listPublishedForStudent(selectedCourseId),
        ]);

        setAssignments(aRes?.data?.assignments || aRes?.data?.items || []);
        setQuizzes(qRes?.data?.quizzes || qRes?.data?.items || []);
      } catch (e) {
        showToast?.(e?.response?.data?.message || "Failed to load practice", "error");
        setAssignments([]);
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };

    loadPractice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseId]);

  const courses = useMemo(() => {
    return (enrollments || []).map(getCourseObjFromEnrollment).filter(Boolean);
  }, [enrollments]);

  const selectedCourse = useMemo(() => courses.find((c) => c._id === selectedCourseId), [courses, selectedCourseId]);

  const hasAny = useMemo(() => (assignments?.length || 0) + (quizzes?.length || 0) > 0, [assignments, quizzes]);

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      <aside className={`${isCollapsed ? "w-20" : "w-64"} fixed top-0 left-0 h-full z-40 transition-all duration-300`}>
        <StudentSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </aside>

      <div
        className="flex flex-col flex-1 h-screen transition-all duration-300"
        style={{ marginLeft: sidebarWidthPx, width: `calc(100vw - ${sidebarWidthPx}px)` }}
      >
        <header className="fixed top-0 z-[999] bg-white shadow-sm h-[64px]" style={{ left: sidebarWidthPx, right: 0 }}>
          <StudentTopbar isCollapsed={isCollapsed} pageTitle="Practice" />
        </header>

        <nav className="sticky top-[64px] bg-[#F9FAFB] z-[998] border-b border-[#E6F4EC] py-3 px-6">
          <p className="text-sm text-[#5B7065]">
            <span
              className="hover:underline hover:text-[#009846] cursor-pointer transition"
              onClick={() => navigate("/student-dashboard")}
            >
              Home
            </span>{" "}
            / <span className="text-[#124734] font-medium">Practice</span>
          </p>

          <div className="mt-2 flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
            <span className="text-xs text-[#5B7065]">Course</span>

            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              disabled={coursesLoading || enrollments.length === 0}
              className="w-full md:w-[420px] bg-white border border-[#E6F4EC] rounded-xl px-3 py-2 text-sm text-[#124734] focus:outline-none"
            >
              {coursesLoading ? (
                <option value="">Loading courses...</option>
              ) : enrollments.length === 0 ? (
                <option value="">No enrolled courses</option>
              ) : (
                enrollments.map((en, idx) => {
                  const id = getCourseIdFromEnrollment(en);
                  const c = getCourseObjFromEnrollment(en);
                  return (
                    <option key={id || idx} value={id}>
                      {c?.title || `Course (${id?.slice?.(-6) || "unknown"})`}
                    </option>
                  );
                })
              )}
            </select>

            <span className="text-xs text-[#5B7065]">{selectedCourse ? selectedCourse.title : selectedCourseId || "—"}</span>
          </div>
        </nav>

        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-8" style={{ marginTop: "128px", height: "calc(100vh - 128px)" }}>
          <div className="w-full max-w-6xl mx-auto">
            {coursesLoading ? (
              <div className="bg-white border border-[#E6F4EC] rounded-2xl p-6 text-[#5B7065]">Loading your courses...</div>
            ) : loading ? (
              <div className="bg-white border border-[#E6F4EC] rounded-2xl p-6 text-[#5B7065]">Loading practice...</div>
            ) : !selectedCourseId ? (
              <RefreshComponent message="You have no enrolled courses to practice." />
            ) : !hasAny ? (
              <RefreshComponent message="No assignments or quizzes available for this course." />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Assignments */}
                <section className="bg-white border border-[#E6F4EC] rounded-2xl shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="text-[#009846]" size={18} />
                    <h2 className="text-lg font-semibold text-[#124734]">Assignments</h2>
                  </div>

                  {assignments.length === 0 ? (
                    <div className="text-sm text-[#5B7065]">No assignments.</div>
                  ) : (
                    <div className="space-y-3">
                      {assignments.map((a) => (
                        <div key={a._id} className="border border-[#E6F4EC] rounded-xl p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-[#124734] font-semibold">{a.title}</div>
                              <div className="text-xs text-[#5B7065] mt-1">
                                Due: <span className="text-[#124734] font-medium">{fmtDate(a.dueDate)}</span>
                                {"  "}•{"  "}
                                Marks: <span className="text-[#124734] font-medium">{a.maxMarks || 0}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => navigate(`/student/assignments/${a._id}`)}
                              className="px-3 py-2 rounded-lg bg-[#009846] text-white text-sm hover:bg-[#0d3a28]"
                            >
                              View
                            </button>
                          </div>

                          {a.instructions ? <p className="text-sm text-[#5B7065] mt-3 line-clamp-2">{a.instructions}</p> : null}
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Quizzes */}
                <section className="bg-white border border-[#E6F4EC] rounded-2xl shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <ClipboardList className="text-[#009846]" size={18} />
                    <h2 className="text-lg font-semibold text-[#124734]">Quizzes</h2>
                  </div>

                  {quizzes.length === 0 ? (
                    <div className="text-sm text-[#5B7065]">No quizzes.</div>
                  ) : (
                    <div className="space-y-3">
                      {quizzes.map((q) => (
                        <div key={q._id} className="border border-[#E6F4EC] rounded-xl p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-[#124734] font-semibold">{q.title}</div>
                              <div className="text-xs text-[#5B7065] mt-1 flex items-center gap-2">
                                <span className="inline-flex items-center gap-1">
                                  <Timer size={14} /> {q.durationMinutes || 0} min
                                </span>
                                <span>•</span>
                                <span>{q.questions?.length || 0} questions</span>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => navigate(`/student/quizzes/${q._id}/attempts`)}
                                className="px-3 py-2 rounded-lg border border-[#A7E1B2] text-[#124734] text-sm hover:bg-[#F2FBF6]"
                              >
                                Scores
                              </button>
                              <button
                                onClick={() => navigate(`/student/quizzes/${q._id}/start`)}
                                className="px-3 py-2 rounded-lg bg-[#009846] text-white text-sm hover:bg-[#0d3a28]"
                              >
                                Start
                              </button>
                            </div>
                          </div>

                          {q.instructions ? <p className="text-sm text-[#5B7065] mt-3 line-clamp-2">{q.instructions}</p> : null}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}

            <button onClick={() => navigate(-1)} className="mt-6 text-sm underline text-[#124734]">
              ← Back
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
