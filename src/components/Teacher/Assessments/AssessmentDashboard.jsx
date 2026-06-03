import { FileText, HelpCircle, Inbox } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AssessmentDashboard({ course }) {
  const navigate = useNavigate();

  const courseId = course?._id; // ✅ get it from props

  const cards = [
    {
      title: "Create Assignment",
      desc: "Upload instructions, add due date, attachments.",
      icon: <FileText size={30} />,
      path: `/teacher/assessment/assignment/${courseId}`,

    },
    {
      title: "Create Quiz",
      desc: "Add MCQs, short answers, timer.",
      icon: <HelpCircle size={30} />,
     path: `/teacher/assessment/quiz/${courseId}`
    },
  ];

  const handleClick = (card) => {
  if (card.title === "Create Assignment") {
    if (!courseId) return alert("Course not loaded yet");
  }
  return navigate(card.path);
};

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {cards.map((card, idx) => (
        <div
          key={idx}
          onClick={() => handleClick(card)}
          className="cursor-pointer bg-white border border-[#A7E1B2] p-6 rounded-xl shadow-sm hover:shadow-md transition hover:-translate-y-1"
        >
          <div className="w-14 h-14 rounded-full bg-[#E6F4EC] flex items-center justify-center text-[#124734] mb-4">
            {card.icon}
          </div>

          <h3 className="text-lg font-semibold text-[#124734]">{card.title}</h3>
          <p className="text-sm text-[#5B7065] mt-1">{card.desc}</p>
        </div>
      ))}
    </div>
  );
}
