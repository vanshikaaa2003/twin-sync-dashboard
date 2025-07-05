// src/components/AddTwinModal.jsx
import { useState } from "react";
import { registerTwin } from "../api/twins";
import { useAuth } from "../context/AuthProvider";
import { notifySuccess, notifyError } from "../ToastProvider";

export default function AddTwinModal({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [specURL, setSpecURL] = useState("");
  const [capabilities, setCaps] = useState("");

  const { user } = useAuth();

  if (!user) return null; // hide if not logged‑in

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1 bg-green-600 text-white rounded"
      >
        ➕ Add Twin
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96 space-y-4">
            <h2 className="text-xl font-bold">Register new Twin</h2>

            <input
              className="border p-2 w-full"
              placeholder="Spec URL"
              value={specURL}
              onChange={(e) => setSpecURL(e.target.value)}
            />

            <input
              className="border p-2 w-full"
              placeholder="Capabilities (comma‑sep)"
              value={capabilities}
              onChange={(e) => setCaps(e.target.value)}
            />

            <div className="flex gap-2 justify-end">
              <button onClick={() => setOpen(false)}>Cancel</button>
              <button
                className="bg-green-600 text-white px-3 py-1 rounded"
                onClick={async () => {
                  try {
                    const twin = await registerTwin({
                      specURL,
                      capabilities: capabilities.split(",").map((s) => s.trim()),
                    });
                    notifySuccess("Twin registered");
                    onCreated(twin);       // push into local state
                    setOpen(false);
                  } catch (err) {
                    notifyError(err.message);
                  }
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
