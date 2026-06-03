export default function CreateQuiz() {
  return (
    <div className="bg-white border border-[#A7E1B2] p-6 rounded-xl shadow-sm max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-[#124734] mb-4">Create Quiz</h2>

      <input
        className="w-full border border-[#A7E1B2] px-3 py-2 rounded-md mb-3"
        placeholder="Quiz Title"
      />

      <input
        type="number"
        className="w-full border border-[#A7E1B2] px-3 py-2 rounded-md mb-4"
        placeholder="Timer (minutes)"
      />

      <button className="bg-[#009846] text-white px-6 py-2 rounded-md">
        + Add Question
      </button>
    </div>
  );
}
