// src/api/twins.js
// -----------------------------------
// REST helpers for the Twin Registry
// -----------------------------------
const BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";


/** GET /twin.query */
export async function fetchTwins() {
  const res = await fetch(`${BASE}/twin.query`);
  if (!res.ok) throw new Error("Failed to fetch twins");
  return res.json();
}

/** DELETE /twin/:id */
export const deleteTwin = (id) =>
  fetch(`${BASE}/twin/${id}`, { method: "DELETE" }).then((r) => {
    if (!r.ok) throw new Error("Delete failed");
    return { ok: true };
  });

/** PUT /twin/:id  — body: { specURL, capabilities } */
export const updateTwin = (id, body) =>
  fetch(`${BASE}/twin/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => {
    if (!r.ok) throw new Error("Update failed");
    return r.json();
  });
