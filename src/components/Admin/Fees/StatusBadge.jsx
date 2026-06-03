import React from "react";

export default function StatusBadge({ status }) {
  // Define color classes based on status
  const styles = {
    Paid: "bg-green-500",
    Pending: "bg-yellow-500",
    Unpaid: "bg-red-500",
  };

  return (
    <span
      className={`
        px-3 
        py-1 
        rounded-full 
        text-white 
        text-sm 
        font-medium
        ${styles[status] || "bg-gray-400"}
      `}
    >
      {status}
    </span>
  );
}
