import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";


export default function RatingChart({ contestHistory }) {
  const sameDateCount = {};

  const data = (contestHistory || []).map((el) => {
    const originalTime = new Date(el.start_time).getTime();

    const dateKey = new Date(el.start_time).toISOString().split("T")[0];

    sameDateCount[dateKey] = (sameDateCount[dateKey] || 0) + 1;

    const offsetHours = (sameDateCount[dateKey] - 1) * 6;

    return {
      time: originalTime + offsetHours * 60 * 60 * 1000,
      originalTime,
      rating: Number(el.rating_after),
    };
  });

  if (data.length === 0) {
    return (
      <div className="chart-empty">
        Complete a ThemeCP-LeetCode practice contest to start your rating graph.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 18, right: 18, left: 0, bottom: 10 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />

        <XAxis
          dataKey="time"
          type="number"
          domain={["dataMin", "dataMax"]}
          scale="time"
          tickFormatter={(value) => new Date(value).toLocaleDateString("en-GB", { month: "short", day: "numeric" })}
          tick={{ fill: "#667085", fontSize: 12 }}
          tickLine={false}
        />

        <YAxis tick={{ fill: "#667085", fontSize: 12 }} tickLine={false} axisLine={false} />

        <Tooltip
          contentStyle={{
            borderRadius: 14,
            border: "1px solid #e5e7eb",
            boxShadow: "0 16px 32px rgba(15, 23, 42, 0.12)",
          }}
          labelFormatter={(_, payload) => {
            const originalTime = payload?.[0]?.payload?.originalTime;
            return originalTime
              ? new Date(originalTime).toLocaleString("en-GB")
              : "";
          }}
        />

        <Line
          type="monotone"
          dataKey="rating"
          stroke="#f59e0b"
          strokeWidth={3}
          dot={{ r: 4, fill: "#f59e0b", strokeWidth: 2, stroke: "#ffffff" }}
          activeDot={{ r: 7, fill: "#f97316", stroke: "#ffffff", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}