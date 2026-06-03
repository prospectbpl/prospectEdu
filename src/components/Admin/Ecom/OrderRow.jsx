import React from "react";
import { useNavigate } from "react-router-dom";

const uiStatus = (s) => String(s || "").replaceAll("_", " ").toUpperCase();

export default function OrderRow({ index, item }) {
  const navigate = useNavigate();

  const typeLabel = item.productOwner === "SUPPLIER" ? "SUPPLIER PRODUCT" : "ADMIN PRODUCT";

  return (
    <tr
      className="border-t text-sm hover:bg-gray-50 cursor-pointer"
      onClick={() => navigate(`/admin/ecom/orders/${item.orderId}`)}
    >
      <td className="p-3 text-center">{index}</td>
      <td className="p-3 text-center">{item.orderId}</td>

      <td className="p-3 flex gap-4">
        <img src={item.img} alt="" className="w-8 h-8 rounded object-cover" />
        <span className="truncate">{item.product}</span>
      </td>

      <td className="p-3 text-center">{item.date}</td>
      <td className="p-3 text-center">₹{item.price}</td>

      {/* ✅ NEW: TYPE column */}
      <td className="p-3 text-center">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold
          ${item.productOwner === "SUPPLIER" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}
        `}>
          {typeLabel}
        </span>
      </td>

      <td className="p-3 text-center">
        <span
          className={`px-3 py-1 rounded-full text-xs 
            ${uiStatus(item.status) === "DELIVERED" && "bg-green-100 text-green-700"}
            ${uiStatus(item.status) === "CONFIRMED" && "bg-yellow-100 text-yellow-600"}
            ${uiStatus(item.status) === "ON THE WAY" && "bg-blue-100 text-blue-600"}
            ${(uiStatus(item.status) === "CANCELED" || uiStatus(item.status) === "REJECTED") && "bg-red-100 text-red-600"}
          `}
        >
          {uiStatus(item.status)}
        </span>
      </td>
    </tr>
  );
}
