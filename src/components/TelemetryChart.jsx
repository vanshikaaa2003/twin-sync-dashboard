// src/components/TelemetryChart.jsx
//-----------------------------------
// Dynamic mini‑chart for a twin.
// • Accepts `data` = [{ temperature, humidity, at|timestamp, … }, …]
// • Renders one <Line> per metric (excluding time keys)
//-----------------------------------
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Tailwind palette-ish line colours
const COLORS = [
  "#ef4444", // red‑500
  "#3b82f6", // blue‑500
  "#10b981", // green‑500
  "#f59e0b", // amber‑500
  "#8b5cf6", // violet‑500
  "#ec4899", // pink‑500
];

export default function TelemetryChart({ data = [] }) {
  if (data.length === 0) return null;

  // ── 1.  Pick numeric keys to plot (ignore "at", "timestamp", etc.) ──
  const sample      = data[data.length - 1];
  const metricKeys  = Object.keys(sample).filter(
    (k) => !["at", "timestamp"].includes(k)
  );

  // ── 2.  Map strings → numbers & prettify x‑label ────────────────
  const clean = data.map((d) => {
    const row = { ...d };
    metricKeys.forEach((k) => (row[k] = Number(d[k])));
    row.time = d.at
      ? new Date(d.at).toLocaleTimeString()
      : new Date(d.timestamp || d.time || Date.now()).toLocaleTimeString();
    return row;
  });

  // ── 3.  Chart ────────────────────────────────────────────────────
  return (
    <ResponsiveContainer width="100%" height={90}>
      <LineChart data={clean} margin={{ top: 5, left: 0, right: 5, bottom: 5 }}>
        <XAxis dataKey="time" hide />
        <YAxis hide domain={["auto", "auto"]} />
        <Tooltip
          labelFormatter={(l) => `Time: ${l}`}
          formatter={(v) => (typeof v === "number" ? v.toFixed(2) : v)}
        />
        <Legend verticalAlign="top" height={14} iconSize={8} />

        {metricKeys.map((k, i) => (
          <Line
            key={k}
            dataKey={k}
            type="monotone"
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
