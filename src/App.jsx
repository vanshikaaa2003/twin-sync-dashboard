// src/App.jsx
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthProvider";
import LoginModal from "./components/LoginModal";

import { fetchTwins } from "./api/twins";
import { connectToEventMesh, subscribeToTwin } from "./telemetry";

import FilterBar from "./components/FilterBar";
import TwinTable from "./components/TwinTable";
import ToastProvider from "./ToastProvider";
import { TooltipProvider } from "@radix-ui/react-tooltip";

// ───────────────────────────────────────────────────────────
//  Inner dashboard – rendered only after AuthProvider mounts
// ───────────────────────────────────────────────────────────
function Dashboard() {
  const { user } = useAuth();               // Supabase user (null if logged‑out)

  // ---------- state ----------
  const [twins, setTwins]     = useState([]);
  const [series, setSeries]   = useState({});
  const [filter, setFilter]   = useState("");
  const [sortNewest, setSort] = useState(true);

  // ---------- fetch twins + WS ----------
  useEffect(() => {
    if (!user) return;                      // wait until logged‑in
    fetchTwins()
      .then((data) => {
        setTwins(data);

        // subscribe each twin to WS telemetry
        data.forEach((twin) =>
          subscribeToTwin(twin.id, (payload) =>
            setSeries((prev) => ({
              ...prev,
              [twin.id]: [
                ...(prev[twin.id] || []),
                { value: payload.value ?? payload.temperature, timestamp: Date.now() },
              ].slice(-50),
            }))
          )
        );
      })
      .catch(console.error);

    connectToEventMesh();
  }, [user]);                               // rerun when user logs in/out

  // ---------- 10‑second polling ----------
  useEffect(() => {
    if (!user) return;
    const t = setInterval(() => fetchTwins().then(setTwins).catch(console.error), 10_000);
    return () => clearInterval(t);
  }, [user]);

  // ---------- filter & sort ----------
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
        {/* top bar */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">🧠 TwinSync Dashboard</h1>
          <LoginModal />   {/* shows Login / Logout */}
        </div>

        {user ? (
          <>
            <FilterBar
              capabilities={twins.flatMap((t) => t.capabilities)}
              selected={filter}
              onChange={setFilter}
              sortNew={sortNewest}
              onToggleSort={() => setSort((s) => !s)}
            />

            <TwinTable twins={filteredTwins} series={series} setTwins={setTwins} />
          </>
        ) : (
          <p className="text-lg text-gray-600 pt-12">Please log in to view your twins.</p>
        )}
      </div>

      <ToastProvider />
    </TooltipProvider>
  );
}

// ───────────────────────────────────────────────────────────
//  Root component wraps everything in AuthProvider
// ───────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}
