import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function IncomeExpenseChart() {
  const data = [
    { year: "2006", income: 180, expense: 100 },
    { year: "2007", income: 160, expense: 70 },
    { year: "2008", income: 150, expense: 120 },
    { year: "2009", income: 200, expense: 100 },
    { year: "2010", income: 140, expense: 60 },
    { year: "2011", income: 220, expense: 130 },
  ];

  return (
   <div className="bg-white rounded-2xl shadow-md p-6 w-full h-[350px]">

      <h3 className="text-xl font-semibold text-[#124734] mb-4">
        Income/Expense Report
      </h3>

      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data} barGap={6}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />

          <XAxis
            dataKey="year"
            stroke="#124734"
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            stroke="#124734"
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            contentStyle={{
              borderRadius: "10px",
              border: "1px solid #E5E7EB",
            }}
          />

          <Bar dataKey="income" fill="#124734" barSize={30} radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" fill="#A7E1B2" barSize={30} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
