// src/components/Student/DashboardCharts.jsx
import ActivityChart from "./Charts/ActivityChart";
import TestSeriesChart from "./Charts/TestSeriesChart";

export default function DashboardCharts() {
  return (
    <div className="w-full max-w-5xl mx-auto mt-8">
      <h2 className="text-lg font-semibold text-[#124734] mb-4">Performance Overview</h2>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TestSeriesChart />
        <ActivityChart />
      </div>
    </div>
  );
}
