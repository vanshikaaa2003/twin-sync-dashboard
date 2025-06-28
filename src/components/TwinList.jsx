import { useEffect, useState } from "react";
import { fetchTwins } from "../api";

export default function TwinList() {
  const [twins, setTwins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTwins()
      .then(setTwins)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading twins…</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 uppercase text-gray-600">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Spec URL</th>
            <th className="px-4 py-2">Capabilities</th>
            <th className="px-4 py-2">Registered</th>
          </tr>
        </thead>
        <tbody>
          {twins.map((t) => (
            <tr key={t.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2 font-mono">{t.id.slice(0, 8)}…</td>
              <td className="px-4 py-2 underline text-blue-600">
                {t.specURL}
              </td>
              <td className="px-4 py-2">{t.capabilities.join(", ")}</td>
              <td className="px-4 py-2">
                {new Date(t.registeredAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
 
