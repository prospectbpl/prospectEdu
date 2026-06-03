import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";
import ConfirmDialog from "../../../ui/ConfirmDialog";
import { useToast } from "../../../../context/ToastContext";

export default function CustomerRow({ item, onDelete }) {
  const navigate = useNavigate();
  const [openConfirm, setOpenConfirm] = useState(false);
  const { showToast } = useToast();

  return (
    <>
      <tr
        className="border-t hover:bg-gray-50 cursor-pointer"
        onClick={() => navigate(`/admin/ecom/customers/${item.id}`)}
      >
        <td className="p-3">{item.customerId}</td>
        <td className="p-3">{item.name}</td>
        <td className="p-3">{item.phone}</td>
        <td className="p-3">{item.orderCount}</td>
        <td className="p-3">₹{item.totalSpend}</td>

        {/* STATUS BADGE */}
        <td className="p-3">
          <span
            className={`px-3 py-1 rounded-full text-xs 
            ${
              item.status === "Active"
                ? "bg-green-100 text-green-700"
                : item.status === "VIP"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {item.status}
          </span>
        </td>

        {/* ACTION COLUMN */}
        <td className="p-3 text-center">
          <FiTrash2
            size={18}
            className="text-gray-600 hover:text-red-600 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation(); // prevent row navigation
              setOpenConfirm(true);
            }}
          />
        </td>
      </tr>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        open={openConfirm}
        title="Delete Customer?"
        message="Are you sure you want to delete this customer? This action cannot be undone."
        onConfirm={() => {
          onDelete(item.id);
          showToast("Customer deleted successfully!", "success");
          setOpenConfirm(false);
        }}
        onCancel={() => setOpenConfirm(false)}
      />
    </>
  );
}
