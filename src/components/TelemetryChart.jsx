// src/components/TelemetryChart.jsx
//---------------------------------------------
// Mini chart that auto‑updates, supports zoom,
// nice tooltips, and plays well with dark mode
//---------------------------------------------
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Brush,
  ResponsiveContainer,
} from "recharts";
import { useMemo } from "react";

// Tailwind-ish palette (works both light/dark)
const COLORS = [
  "#ef4444", // red‑500
  "#3b82f6", // blue‑500
  "#10b981", // green‑500
  "#f59e0b", // amber‑500
  "#8b5cf6", // violet‑500
  "#ec4899", // pink‑500
];

export default function TelemetryChart({ data = [] }) {
  if (!data.length) return <span className="text-gray-400">—</span>;

  /* 1️⃣  Pick numeric keys (exclude time) */
  const sample      = data[data.length - 1];
  const metricKeys  = Object.keys(sample).filter(
    (k) => !["at", "time", "timestamp"].includes(k)
  );

  /* 2️⃣  Pre‑massage data – memoised for perf */
  const rows = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        time: new Date(d.at || d.timestamp || d.time).toLocaleTimeString(),
        // force numbers
        ...Object.fromEntries(
          metricKeys.map((k) => [k, Number(d[k])])
        ),
      })),
    [data, metricKeys]
  );

  /* 3️⃣  Render */
  return (
    <ResponsiveContainer width="100%" height={100}>
      <LineChart data={rows} margin={{ top: 4, right: 10, bottom: 4, left: 0 }}>
        {/* hides axes on small card but improves tooltip domain */}
        <XAxis dataKey="time" hide />
        <YAxis hide domain={["auto", "auto"]} />

        {/* nicer tooltip */}
        <Tooltip
          contentStyle={{ fontSize: "0.75rem" }}
          formatter={(v, name) => [`${v.toFixed(2)}`, name]}
          labelFormatter={(l) => `Time ${l}`}
        />

        {/* tiny legend on top‑left */}
        <Legend
          verticalAlign="top"
          height={14}
          iconSize={8}
          wrapperStyle={{ fontSize: "0.65rem" }}
        />

        {/* animated lines */}
        {metricKeys.map((k, i) => (
          <Line
            key={k}
            type="monotone"
            dataKey={k}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
          />
        ))}

        {/* Brush gives drag‑to‑zoom / timeline control */}
        <Brush
          dataKey="time"
          height={8}
          stroke="#8884d8"
          travellerWidth={6}
          className="[&>rect]:fill-gray-200 dark:[&>rect]:fill-slate-700" // Tailwind dark tweak
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
