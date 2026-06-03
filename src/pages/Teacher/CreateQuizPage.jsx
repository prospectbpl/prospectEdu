import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import TeacherSidebar from "../../components/Teacher/TeacherSidebar";
import TeacherTopbar from "../../components/Teacher/TeacherTopbar";
import { quizzesApi } from "../../services/quizzes";
import { useToast } from "../../context/ToastContext";

const newQuestion = () => ({
  type: "mcq",
  prompt: "",
  options: ["", "", "", ""],
  correctIndex: 0,
  marks: 1,
});

export default function CreateQuizPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 80 : 256;

  const navigate = useNavigate();
  const location = useLocation();
  const { courseId } = useParams();
  const { showToast } = useToast();

  // ✅ SEO
  const canonicalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${location.pathname}`
      : location.pathname;

  const breadcrumbJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Teacher Dashboard",
          item:
            typeof window !== "undefined"
              ? `${window.location.origin}/teacher-dashboard`
              : "/teacher-dashboard",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Assessments",
          item:
            typeof window !== "undefined"
              ? `${window.location.origin}/teacher-dashboard`
              : "/teacher-dashboard",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Create Quiz",
          item: canonicalUrl,
        },
      ],
    }),
    [canonicalUrl]
  );

  const [quizId, setQuizId] = useState(null);
  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [instructions, setInstructions] = useState("");
  const [questions, setQuestions] = useState([newQuestion()]);
  const [saving, setSaving] = useState(false);

  const totalMarks = useMemo(
    () => questions.reduce((sum, q) => sum + Number(q.marks || 0), 0),
    [questions]
  );

  const addQuestion = () => setQuestions((prev) => [...prev, newQuestion()]);
  const removeQuestion = (idx) => setQuestions((prev) => prev.filter((_, i) => i !== idx));

  const updateQuestion = (idx, patch) => {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  };

  const updateOption = (qIdx, optIdx, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const opts = [...q.options];
        opts[optIdx] = value;
        return { ...q, options: opts };
      })
    );
  };

  const toApiPayload = () => ({
    title: title.trim(),
    instructions: instructions.trim(),
    durationMinutes: Number(durationMinutes || 0),
    questions: questions.map((q) => ({
      type: q.type,
      prompt: String(q.prompt || "").trim(),
      options:
        q.type === "mcq"
          ? q.options.map((t) => ({ text: String(t || "").trim() }))
          : [],
      correctIndex: q.type === "mcq" ? Number(q.correctIndex) : -1,
      marks: Number(q.marks || 1),
    })),
  });

  const validate = () => {
    if (!courseId) return "CourseId missing in route";
    if (!title.trim()) return "Quiz title is required";
    if (!questions.length) return "Add at least 1 question";

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.prompt.trim()) return `Question ${i + 1}: question text required`;
      if (q.type === "mcq") {
        if (q.options.some((o) => !String(o).trim()))
          return `Question ${i + 1}: fill all 4 options`;
        if (q.correctIndex < 0 || q.correctIndex > 3)
          return `Question ${i + 1}: select correct option`;
      }
    }
    return null;
  };

  const saveDraft = async () => {
    const err = validate();
    if (err) return showToast?.(err, "error");

    try {
      setSaving(true);
      const payload = toApiPayload();

      if (!quizId) {
        const res = await quizzesApi.create(courseId, payload);
        setQuizId(res.data.quiz?._id);
      } else {
        await quizzesApi.update(quizId, payload);
      }

      showToast?.("Saved draft", "success");
    } catch (e) {
      console.log(e);
      showToast?.(e?.response?.data?.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    const err = validate();
    if (err) return showToast?.(err, "error");

    try {
      setSaving(true);
      const payload = toApiPayload();

      let id = quizId;
      if (!id) {
        const res = await quizzesApi.create(courseId, payload);
        id = res.data.quiz?._id;
        setQuizId(id);
      } else {
        await quizzesApi.update(id, payload);
      }

      await quizzesApi.publish(id);

      showToast?.("Quiz published!", "success");
      navigate(-1);
    } catch (e) {
      console.log(e);
      showToast?.(e?.response?.data?.message || "Publish failed", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* ✅ SEO */}
      <Helmet>
        <title>Create Quiz | Teacher Dashboard | ProspectEdu</title>
        <meta
          name="description"
          content="Create and publish quizzes for your course in the ProspectEdu teacher dashboard."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      {/* SIDEBAR */}
      <div className={`${isCollapsed ? "w-20" : "w-64"} fixed left-0 top-0 h-full transition-all`}>
        <TeacherSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* MAIN */}
      <div className="flex flex-col flex-1" style={{ marginLeft: sidebarWidth }}>
        <TeacherTopbar pageTitle="Create Quiz" />

        <div className="px-8 pt-[20px] pb-10 overflow-y-auto">
          <div className="w-full flex flex-col items-start ">
            <p className="text-sm text-[#5B7065] mb-6">
              <span
                className="hover:text-[#009846] cursor-pointer hover:underline"
                onClick={() => navigate("/teacher-dashboard")}
              >
                Dashboard
              </span>
              {" / "}
              <span
                className="hover:text-[#009846] cursor-pointer hover:underline"
                onClick={() => navigate("/teacher/courses")}
              >
                Courses
              </span>
              {" / "}
              <span
                className="hover:text-[#009846] cursor-pointer hover:underline"
                onClick={() => navigate(-1)}
              >
                Assessments
              </span>
              {" / "}
              <span className="text-[#124734] font-medium">Create Quiz</span>
            </p>
          </div>

          <div className="bg-white border border-[#A7E1B2] p-6 rounded-xl shadow-sm max-w-4xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-[#124734]">Create Quiz</h1>
                <p className="text-sm text-[#5B7065] mt-1">
                  Total Questions: {questions.length} • Total Marks: {totalMarks}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => navigate(`/teacher/assessment/quizzes/${courseId}`)}
                  className={`px-4 py-2 rounded-md border border-[#A7E1B2] text-[#124734] hover:bg-[#F2FBF6] ${
                    saving ? "opacity-60" : ""
                  }`}
                >
                  Show Quiz
                </button>

                <button
                  disabled={saving}
                  onClick={publish}
                  className={`px-4 py-2 rounded-md bg-[#009846] text-white hover:bg-[#0d3a28] ${
                    saving ? "opacity-60" : ""
                  }`}
                >
                  Publish
                </button>
              </div>
            </div>

            <div className="mt-5">
              <label className="text-[#124734] font-medium">Quiz Title</label>
              <input
                className="w-full border border-[#A7E1B2] px-3 py-2 rounded-md mt-2"
                placeholder="Quiz Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="mt-4">
              <label className="text-[#124734] font-medium">Timer (minutes)</label>
              <input
                type="number"
                className="w-full border border-[#A7E1B2] px-3 py-2 rounded-md mt-2"
                placeholder="e.g. 30"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
              />
            </div>

            <div className="mt-4">
              <label className="text-[#124734] font-medium">Instructions (optional)</label>
              <textarea
                className="w-full border border-[#A7E1B2] px-3 py-2 rounded-md mt-2"
                rows={3}
                placeholder="Any instructions for students..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>

            <div className="mt-6 space-y-4">
              {questions.map((q, idx) => (
                <div key={idx} className="border border-[#E6F4EC] rounded-xl p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[#124734] font-semibold">Question {idx + 1}</div>
                    <button
                      type="button"
                      onClick={() => removeQuestion(idx)}
                      disabled={questions.length === 1}
                      className={`text-red-600 flex items-center gap-1 px-3 py-1 rounded-md border border-red-200 hover:bg-red-50 ${
                        questions.length === 1 ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>

                  <textarea
                    className="w-full border border-[#A7E1B2] px-3 py-2 rounded-md mt-3"
                    rows={2}
                    placeholder="Write the question..."
                    value={q.prompt}
                    onChange={(e) => updateQuestion(idx, { prompt: e.target.value })}
                  />

                  <div className="mt-4">
                    <div className="text-sm text-[#5B7065] mb-2">Options (select correct)</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((opt, oIdx) => (
                        <label
                          key={oIdx}
                          className="flex items-center gap-2 border border-[#E6F4EC] rounded-lg px-3 py-2"
                        >
                          <input
                            type="radio"
                            name={`correct-${idx}`}
                            checked={q.correctIndex === oIdx}
                            onChange={() => updateQuestion(idx, { correctIndex: oIdx })}
                          />
                          <input
                            className="w-full outline-none"
                            placeholder={`Option ${oIdx + 1}`}
                            value={opt}
                            onChange={(e) => updateOption(idx, oIdx, e.target.value)}
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="text-[#124734] font-medium">Marks</label>
                    <input
                      type="number"
                      className="w-full border border-[#A7E1B2] px-3 py-2 rounded-md mt-2"
                      value={q.marks}
                      onChange={(e) => updateQuestion(idx, { marks: Number(e.target.value || 1) })}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addQuestion}
              className="mt-5 bg-[#009846] text-white px-6 py-3 rounded-md flex items-center gap-2 hover:bg-[#007a39] w-full justify-center"
            >
              <Plus size={18} /> Add Question
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
