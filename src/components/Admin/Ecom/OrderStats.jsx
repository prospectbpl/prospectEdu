import React, { useEffect, useRef, useState } from "react";
import { api } from "../../../lib/api";

export default function OrderStats() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // prevent overlapping requests on slow networks
  const inFlight = useRef(false);

  const load = async () => {
    if (inFlight.current) return;
    inFlight.current = true;

    try {
      setLoading(true);
      const res = await api.get("/orders/admin/stats");
      setStats(res?.data?.stats || null);
    } catch (e) {
      setStats(null);
    } finally {
      setLoading(false);
      inFlight.current = false;
    }
  };

  useEffect(() => {
    load();

    // ✅ auto refresh (live updates)
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cards = [
    {
      label: "Total Orders",
      value: stats?.totalOrders?.value ?? 0,
      change: stats?.totalOrders?.change,
      color: "text-[#009846]",
    },
    {
      label: "New Orders (24h)",
      value: stats?.newOrders?.value ?? 0,
      change: stats?.newOrders?.change ?? "0%",
      color: "text-[#009846]",
    },
    {
      label: "Completed Orders (24h)",
      value: stats?.completedOrders?.value ?? 0,
      change: stats?.completedOrders?.change ?? "0%",
      color: "text-[#009846]",
    },
    {
      label: "Cancelled Orders (24h)",
      value: stats?.cancelledOrders?.value ?? 0,
      change: stats?.cancelledOrders?.change ?? "0%",
      color:
        String(stats?.cancelledOrders?.change || "").startsWith("-")
          ? "text-[#009846]"
          : "text-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {cards.map((s) => (
        <div
          key={s.label}
          className="bg-white p-5 rounded-xl shadow flex flex-col"
        >
          <p className="text-sm text-gray-600">{s.label}</p>

          <h2 className="text-2xl font-bold text-[#124734]">
            {loading ? "…" : s.value}
          </h2>

          <span className={`text-xs ${s.color}`}>
            {loading ? "Loading" : s.change ?? ""}
          </span>
        </div>
      ))}
    </div>
  );
}
