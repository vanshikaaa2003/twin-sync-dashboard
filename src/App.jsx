// src/App.jsx
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthProvider";

import ThemeToggle from "./components/ThemeToggle";      // 🌙/☀️
import LoginModal   from "./components/LoginModal";
import AddTwinModal from "./components/AddTwinModal";
import FilterBar    from "./components/FilterBar";
import TwinTable    from "./components/TwinTable";
import SkeletonRow  from "./components/SkeletonRow";
import ToastProvider from "./ToastProvider";

import { TooltipProvider } from "@radix-ui/react-tooltip";

import { fetchTwins } from "./api/twins";
import { connectToEventMesh, subscribeToTwin } from "./telemetry";

// ───────────────────────────────────────────────────────────
//  Inner dashboard
// ───────────────────────────────────────────────────────────
function Dashboard() {
  const { user } = useAuth();

  const [twins,  setTwins]   = useState([]);
  const [series, setSeries]  = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("");
  const [sortNewest, setSortNewest] = useState(true);

  /*  Fetch twins + live telemetry  */
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    fetchTwins()
      .then((data) => {
        setTwins(data);
        setLoading(false);

        // subscribe each twin to WS
        data.forEach((twin) =>
          subscribeToTwin(twin.id, (payload) => {
            const ts = payload.at || payload.timestamp || payload.time || Date.now();
            setSeries((prev) => ({
              ...prev,
              [twin.id]: [
                ...(prev[twin.id] || []),
                { ...payload, at: ts },
              ].slice(-50),
            }));
          })
        );
      })
      .catch((err) => {
        console.error("Error fetching twins:", err);
        setLoading(false);
      });

    connectToEventMesh();
  }, [user]);

  /* 10 s polling refresh */
  useEffect(() => {
    if (!user) return;
    const id = setInterval(() => fetchTwins().then(setTwins).catch(console.error), 10_000);
    return () => clearInterval(id);
  }, [user]);

  /*  filter + sort  */
  const filteredTwins = twins
    .filter((t) => !filter || t.capabilities.includes(filter))
    .sort((a, b) =>
      sortNewest
        ? new Date(b.registeredAt) - new Date(a.registeredAt)
        : new Date(a.registeredAt) - new Date(b.registeredAt)
    );

  /*  UI  */
  return (
    <TooltipProvider>
      <div className="p-6 space-y-6 max-w-6xl mx-auto
                  bg-white text-black dark:bg-gray-900 dark:text-gray-100
                  min-h-screen transition-colors">
        {/* ─── Header ─── */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">🧠 TwinSync Dashboard</h1>

          <div className="flex items-center gap-4">
            <ThemeToggle />                          {/* NEW */}
            {user && (
              <AddTwinModal onCreated={(t) => setTwins((p) => [t, ...p])} />
            )}
            <LoginModal />
          </div>
        </div>

        {user ? (
          loading ? (
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

              <TwinTable twins={filteredTwins} series={series} setTwins={setTwins} />
            </>
          )
        ) : (
          <p className="text-lg text-gray-600 dark:text-gray-400 pt-12">
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
