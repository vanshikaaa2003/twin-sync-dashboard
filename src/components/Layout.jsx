import TwinTable from "./TwinTable";
import FilterBar from "./FilterBar";
import ThemeToggle from "./ThemeToggle";

export default function Layout({ twins, loading, setTwins }) {
  return (
    <div className="flex h-screen dark:bg-black">
      <aside className="w-64 bg-gray-100 dark:bg-gray-900 p-4">Sidebar</aside>
      <main className="flex-1 overflow-y-auto p-6">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">🧠 TwinSync Dashboard</h1>
          <ThemeToggle />
        </header>
        <FilterBar />
        <TwinTable twins={twins} setTwins={setTwins} loading={loading} />
      </main>
    </div>
  );
}