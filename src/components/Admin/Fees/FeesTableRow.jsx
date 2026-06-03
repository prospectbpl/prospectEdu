import React from "react";
import StatusBadge from "./StatusBadge";
import { Navigate, useNavigate } from "react-router-dom";
export default function FeesTableRow({ item }) {
    const navigate = useNavigate();
  return (
    <tr className="border-b">
      <td className="p-3">{item.roll}</td>
      <td className="p-3">{item.name}</td>
      <td className="p-3">{item.invoice}</td>
      <td className="p-3">{item.type}</td>
      <td className="p-3">{item.payment}</td>

      {/* Status Badge */}
      <td className="p-3">
        <StatusBadge status={item.status} />
      </td>

      <td className="p-3">{item.date}</td>
      <td className="p-3 font-semibold">{item.amount}</td>

      {/* Receipt column */}
      <td
  onClick={() => navigate(`/admin/fees/receipt/${item.receipt}`)}
  className="p-3 text-green-600 cursor-pointer hover:underline"
>
  {item.receipt}
</td>

    </tr>
  );
}
