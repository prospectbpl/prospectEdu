export default function ViewSubmissions() {
  const submissions = [
    { name: "Riya Sharma", status: "Submitted", score: "-", date: "2025-01-10" },
    { name: "Aman Verma", status: "Pending", score: "-", date: "-" },
  ];

  return (
    <div className="bg-white border border-[#A7E1B2] p-6 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold text-[#124734] mb-4">Submissions</h2>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#E6F4EC] text-[#124734]">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Score</th>
            <th className="p-2 border">Submitted At</th>
          </tr>
        </thead>

        <tbody>
          {submissions.map((s, i) => (
            <tr key={i} className="text-[#5B7065]">
              <td className="p-2 border">{s.name}</td>
              <td className="p-2 border">{s.status}</td>
              <td className="p-2 border">{s.score}</td>
              <td className="p-2 border">{s.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
