import { Trash2, Pencil } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import TelemetryChart from "./TelemetryChart";
import { deleteTwin, updateTwin } from "../api/twins";
import { notifySuccess, notifyError } from "../ToastProvider";

export default function TwinTable({ twins, series, setTwins }) {
  const fmt = (v) =>
    v ? new Date(v).toLocaleString() : "—";

  return (
    <div className="bg-white shadow rounded-lg ring-1 ring-gray-200 overflow-x-auto">
      <table className="min-w-full text-sm border-collapse">
        <thead className="bg-gray-50">
          <tr>
            {["ID", "Spec URL", "Capabilities", "Registered", "Telemetry", "Actions"].map((h) => (
              <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {twins.map((twin, idx) => (
            <tr
              key={twin.id}
              className={`${idx % 2 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100 transition`}
            >
              <td className="px-4 py-3 font-mono text-xs">{twin.id.slice(0, 8)}…</td>
              <td className="px-4 py-3 break-all">
                <a href={twin.specURL} target="_blank" className="text-blue-600 hover:underline">
                  {twin.specURL}
                </a>
              </td>
              <td className="px-4 py-3">{(twin.capabilities || []).join(", ") || "—"}</td>
              <td className="px-4 py-3">{fmt(twin.registeredAt)}</td>
              <td className="px-4 py-3">{series[twin.id] ? <TelemetryChart data={series[twin.id]} /> : "—"}</td>

              <td className="px-4 py-3 flex gap-3">
                {/* Delete */}
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      onClick={() =>
                        deleteTwin(twin.id)
                          .then(() => {
                            setTwins((p) => p.filter((t) => t.id !== twin.id));
                            notifySuccess("Twin deleted");
                          })
                          .catch(() => notifyError("Delete failed"))
                      }
                      className="text-red-600 hover:scale-110 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Content className="px-2 py-1 rounded bg-gray-800 text-white text-xs">
                    Delete
                    <Tooltip.Arrow className="fill-gray-800" />
                  </Tooltip.Content>
                </Tooltip.Root>

                {/* Edit */}
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      onClick={() => {
                        const newURL = prompt("New Spec URL:", twin.specURL);
                        if (!newURL) return;
                        updateTwin(twin.id, { specURL: newURL })
                          .then((upd) =>
                            setTwins((p) =>
                              p.map((t) => (t.id === upd.id ? upd : t))
                            )
                          )
                          .then(() => notifySuccess("Twin updated"))
                          .catch(() => notifyError("Update failed"));
                      }}
                      className="text-blue-600 hover:scale-110 transition"
                    >
                      <Pencil size={16} />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Content className="px-2 py-1 rounded bg-gray-800 text-white text-xs">
                    Edit
                    <Tooltip.Arrow className="fill-gray-800" />
                  </Tooltip.Content>
                </Tooltip.Root>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
