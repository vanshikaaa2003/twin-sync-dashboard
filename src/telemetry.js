// ────────────────────────────────────────────────────────────────
// telemetry.js – one shared WebSocket + fan‑out to many listeners
// • Auto‑subscribes to every new topic it sees (“give me everything”)
// • Supports multiple callbacks per twin
// • Falls back to prod mesh URL if VITE_MESH_WS is missing
// ────────────────────────────────────────────────────────────────
const BASE_WS =
  import.meta.env.VITE_MESH_WS ||
  "wss://twin-sync-mesh.onrender.com";

let socket = null;                      // single shared connection
const twinCallbacks = new Map();        // twinId → [fn, fn …]
const subscribedTopics = new Set();     // keep track to avoid repeats

/* ---------- open‑or‑reuse WebSocket ------------------------- */
export function connectToEventMesh() {
  if (socket) return;                   // already connected

  socket = new WebSocket(BASE_WS);

  socket.addEventListener("open", () =>
    console.log("🟢 Connected to Event Mesh")
  );

  socket.addEventListener("message", (evt) => {
    let msg;
    try {
      msg = JSON.parse(evt.data);
    } catch {
      return;                           // ignore bad JSON
    }
    if (msg.type !== "event") return;

    const { from: twinId, topic, payload } = msg;

    /* 1️⃣ — auto‑subscribe to any unseen topic */
    if (!subscribedTopics.has(topic)) {
      socket.send(JSON.stringify({ type: "subscribe", topics: [topic] }));
      subscribedTopics.add(topic);
    }

    /* 2️⃣ — fan‑out payload to every callback registered for that twin */
    (twinCallbacks.get(twinId) || []).forEach((fn) => fn(payload));
  });

  socket.addEventListener("close", () => {
    console.log("🔴 Disconnected from Event Mesh");
    socket = null;                      // allow reconnect if needed
  });
}

/* ---------- public API -------------------------------------- */
export function subscribeToTwin(twinId, fn) {
  const list = twinCallbacks.get(twinId) || [];
  twinCallbacks.set(twinId, [...list, fn]);
}

export function unsubscribeFromTwin(twinId, fn) {
  const list = twinCallbacks.get(twinId) || [];
  twinCallbacks.set(
    twinId,
    list.filter((cb) => cb !== fn)
  );
}
