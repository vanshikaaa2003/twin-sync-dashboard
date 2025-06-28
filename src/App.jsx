// src/App.jsx
import { useEffect, useState } from "react";
import {
  fetchTwins,            // REST helpers
} from "./api/twins";
import { connectToEventMesh, subscribeToTwin } from "./telemetry";

import FilterBar from "./components/FilterBar";
import TwinTable from "./components/TwinTable";
import ToastProvider from "./ToastProvider";
import { TooltipProvider } from "@radix-ui/react-tooltip";

export default function App() {
  // ---------- state ----------
  const [twins, setTwins] = useState([]);
  const [series, setSeries] = useState({});      // chart data per twin
  const [filter, setFilter] = useState("");
  const [sortNewest, setSortNewest] = useState(true);

  // ---------- initial fetch + WS subscriptions ----------
  useEffect(() => {
    fetchTwins()
      .then((data) => {
        setTwins(data);

        // subscribe each twin to WebSocket telemetry
        data.forEach((twin) =>
          subscribeToTwin(twin.id, (payload) =>
            setSeries((prev) => ({
              ...prev,
              [twin.id]: [
                ...(prev[twin.id] || []),
                { value: payload.value ?? payload.temperature, timestamp: Date.now() },
              ].slice(-50), // keep last 50 points
            }))
          )
        );
      })
      .catch(console.error);

    connectToEventMesh();
  }, []);

  // ---------- 10-second polling refresh ----------
  useEffect(() => {
    const refetch = () => fetchTwins().then(setTwins).catch(console.error);
    const t = setInterval(refetch, 10_000);
    return () => clearInterval(t);
  }, []);

  // ---------- apply filter & sort ----------
  const filteredTwins = twins
    .filter((t) => !filter || t.capabilities.includes(filter))
    .sort((a, b) =>
      sortNewest
        ? new Date(b.registeredAt) - new Date(a.registeredAt)
        : new Date(a.registeredAt) - new Date(b.registeredAt)
    );

  // ---------- UI ----------
  return (
    <TooltipProvider>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold">🧠 TwinSync Dashboard</h1>

        <FilterBar
          capabilities={twins.map((t) => t.capabilities).flat()}
          selected={filter}
          onChange={setFilter}
          sortNew={sortNewest}
          onToggleSort={() => setSortNewest((s) => !s)}
        />

        {/* ✅ Card-style table component */}
        <TwinTable
          twins={filteredTwins}
          series={series}
          setTwins={setTwins}
        />
      </div>

      <ToastProvider />
    </TooltipProvider>
  );
}
