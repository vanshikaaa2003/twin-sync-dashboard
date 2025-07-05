// src/components/AddTwinModal.jsx
import { useState } from "react";
import { registerTwin } from "../api/twins";
import { useAuth } from "../context/AuthProvider";
import { notifySuccess, notifyError } from "../ToastProvider";

export default function AddTwinModal({ onCreated }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // form fields
  const [specURL, setSpecURL] = useState("");
  const [capabilities, setCaps] = useState("");

  if (!user) return null; // hide if logged‑out

  /* helper to fully reset form */
  const closeAndReset = () => {
    setSpecURL("");
    setCaps("");
    setOpen(false);
    setSaving(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1 bg-green-600 text-white rounded"
      >
        ➕ Add Twin
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-96 space-y-4 shadow-lg">
            <h2 className="text-xl font-bold">Register new Twin</h2>

            <input
              className="border p-2 w-full rounded"
              placeholder="Spec URL"
              value={specURL}
              onChange={(e) => setSpecURL(e.target.value)}
            />

            <input
              className="border p-2 w-full rounded"
              placeholder="Capabilities (comma‑sep)"
              value={capabilities}
              onChange={(e) => setCaps(e.target.value)}
            />

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={closeAndReset}
                className="px-3 py-1 rounded hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                disabled={saving}
                className={`px-3 py-1 rounded text-white ${
                  saving ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
                }`}
                onClick={async () => {
                  setSaving(true);
                  try {
                    const twin = await registerTwin({
                      specURL,
                      capabilities: capabilities
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    });
                    onCreated(twin);        // push to dashboard state
                    notifySuccess("Twin registered");
                    closeAndReset();        // 🧹 clear form + close
                  } catch (err) {
                    notifyError(err.message);
                    setSaving(false);
                  }
                }}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
