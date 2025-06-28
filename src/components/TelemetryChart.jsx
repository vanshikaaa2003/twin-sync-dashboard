import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as ReTooltip, CartesianGrid } from "recharts";

export default function TelemetryChart({ data }) {
  const last20 = data.slice(-20);
  return (
    <div className="hover:scale-[1.03] transition">
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={last20} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" tickFormatter={(v) => new Date(v).toLocaleTimeString()} hide />
          <YAxis domain={["dataMin - 1", "dataMax + 1"]} width={30} fontSize={10} />
          <ReTooltip labelFormatter={(v) => new Date(v).toLocaleTimeString()} />
          <Line type="monotone" dataKey="value" stroke="#16a34a" dot={false} isAnimationActive={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
