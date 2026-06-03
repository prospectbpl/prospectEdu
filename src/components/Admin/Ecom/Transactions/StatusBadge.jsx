export default function StatusBadge({ status }) {
  const colors = {
    Complete: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Canceled: "bg-red-100 text-red-600",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs ${colors[status]}`}>
      {status}
    </span>
  );
}
