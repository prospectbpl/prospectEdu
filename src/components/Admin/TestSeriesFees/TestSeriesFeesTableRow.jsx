import StatusBadge from "../Fees/StatusBadge"; 
// ✅ adjust path if your StatusBadge is elsewhere

export default function TestSeriesFeesTableRow({ item }) {
  return (
    <tr className="border-b">
      <td className="p-3">{item.roll}</td>
      <td className="p-3">{item.name}</td>
      <td className="p-3">{item.invoice}</td>
      <td className="p-3">{item.type}</td>
      <td className="p-3">{item.payment}</td>

      <td className="p-3">
        <StatusBadge status={item.status} />
      </td>

      <td className="p-3">{item.date}</td>
      <td className="p-3 font-semibold">{item.amount}</td>

      {/* ✅ No redirect, just show receipt/txn */}
      <td className="p-3 text-gray-700">{item.receipt}</td>
    </tr>
  );
}
