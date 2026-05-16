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
  console.log("->contest history", contestHistory)

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

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          dataKey="time"
          type="number"
          domain={["dataMin", "dataMax"]}
          scale="time"
          tick={false}
        />

        <YAxis />

        <Tooltip
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
          stroke="#ef0000"
          strokeWidth={3}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}