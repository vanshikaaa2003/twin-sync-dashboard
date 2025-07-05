// src/App.jsx
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthProvider";

import LoginModal from "./components/LoginModal";
import AddTwinModal from "./components/AddTwinModal";
import FilterBar from "./components/FilterBar";
import TwinTable from "./components/TwinTable";
import SkeletonRow from "./components/SkeletonRow";     // make sure file exists
import ToastProvider from "./ToastProvider";

import { TooltipProvider } from "@radix-ui/react-tooltip";

import { fetchTwins } from "./api/twins";
import { connectToEventMesh, subscribeToTwin } from "./telemetry";

// ───────────────────────────────────────────────────────────
//  Inner dashboard
// ───────────────────────────────────────────────────────────
function Dashboard() {
  const { user } = useAuth();

  const [twins, setTwins]       = useState([]);
  const [series, setSeries]     = useState({});
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("");
  const [sortNewest, setSortNewest] = useState(true);

  // ---------- fetch twins + telemetry ----------
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    fetchTwins()
      .then((data) => {
        setTwins(data);
        setLoading(false);

        data.forEach((twin) =>
          subscribeToTwin(twin.id, (payload) =>
            setSeries((prev) => ({
              ...prev,
              [twin.id]: [
                ...(prev[twin.id] || []),
                {
                  value: payload.value ?? payload.temperature,
                  timestamp: Date.now(),
                },
              ].slice(-50),
            }))
          )
        );
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    connectToEventMesh();
  }, [user]);

  // ---------- polling ----------
  useEffect(() => {
    if (!user) return;
    const id = setInterval(
      () =>
        fetchTwins()
          .then(setTwins)
          .catch(console.error),
      10_000
    );
    return () => clearInterval(id);
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
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">🧠 TwinSync Dashboard</h1>
          <div className="flex gap-4">
            {user && (
              <AddTwinModal
                onCreated={(twin) => setTwins((p) => [twin, ...p])}
              />
            )}
            <LoginModal />
          </div>
        </div>

        {user ? (
          loading ? (
            /* shimmer while loading */
            <SkeletonRow rows={4} />
          ) : (
            <>
              <FilterBar
                capabilities={twins.flatMap((t) => t.capabilities)}
                selected={filter}
                onChange={setFilter}
                sortNew={sortNewest}
                onToggleSort={() => setSortNewest((s) => !s)}
              />

              <TwinTable
                twins={filteredTwins}
                series={series}
                setTwins={setTwins}
              />
            </>
          )
        ) : (
          <p className="text-lg text-gray-600 pt-12">
            Please log in to view or register twins.
          </p>
        )}
      </div>

      <ToastProvider />
    </TooltipProvider>
  );
}

// ───────────────────────────────────────────────────────────
//  Root component
// ───────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}
