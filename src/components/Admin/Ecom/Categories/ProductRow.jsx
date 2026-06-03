import React, { useState } from "react";
import { api } from "../../../../lib/api";

export default function ProductRow({ item, index, onRefresh }) {
  const [saving, setSaving] = useState(false);

  const toggleTrending = async () => {
    try {
      setSaving(true);
      await api.patch(`/products/${item._id}/trending`, {
        isTrending: !item.isTrending,
      });
      onRefresh();
    } catch (e) {
      console.log("Trending toggle failed", e?.response?.data || e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr className="border-t hover:bg-gray-50">
      {/* ✅ removed checkbox column */}
      <td className="p-3 text-center">{index}</td>

      <td className="p-3 flex items-center gap-3">
        <img src={item.img} className="w-10 h-10 rounded object-cover" alt="" />
        <span className="font-medium">{item.name}</span>
      </td>

      <td className="p-3 text-center">{item.supplierName}</td>

      <td className="p-3 text-center">{item.category}</td>

      <td className="p-3 text-center">₹{item.price}</td>

      {/* ✅ Trending checkbox */}
      <td className="p-3 text-center">
        <input
          type="checkbox"
          disabled={saving}
          checked={!!item.isTrending}
          onChange={toggleTrending}
          className="w-4 h-4 accent-[#124734] cursor-pointer disabled:opacity-60"
        />
      </td>

      <td className="p-3 text-center text-gray-600">
        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
      </td>
    </tr>
  );
}
