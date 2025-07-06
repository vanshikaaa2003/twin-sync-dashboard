// ────────────────────────────────────────────────────────────────
// telemetry.js – shared WebSocket helper
// ────────────────────────────────────────────────────────────────
const BASE_WS =
  import.meta.env.VITE_MESH_WS || "wss://twin-sync-mesh.onrender.com";

let socket = null;
const twinCallbacks   = new Map();                // twinId → [fn, fn …]
const subscribedTopics = new Set();               // keep track

// Default topics we *know* we care about:
const DEFAULT_TOPICS = ["temperature", "humidity"];

/* ---------- open‑or‑reuse WebSocket ------------------------- */
export function connectToEventMesh() {
  if (socket) return;                             // already connected

  socket = new WebSocket(BASE_WS);

  socket.addEventListener("open", () => {
    console.log("🟢 Connected to Event Mesh");

    // Immediately ask for our default topics
    socket.send(JSON.stringify({ type: "subscribe", topics: DEFAULT_TOPICS }));
    DEFAULT_TOPICS.forEach((t) => subscribedTopics.add(t));
  });

  socket.addEventListener("message", (evt) => {
    let msg;
    try {
      msg = JSON.parse(evt.data);
    } catch {
      return;
    }
    if (msg.type !== "event") return;

    const { from: twinId, topic, payload } = msg;

    /* 1️⃣ auto‑subscribe any *new* topic we notice (future‑proof) */
    if (!subscribedTopics.has(topic)) {
      socket.send(JSON.stringify({ type: "subscribe", topics: [topic] }));
      subscribedTopics.add(topic);
    }

    /* 2️⃣ fan‑out to every callback registered for this twin */
    (twinCallbacks.get(twinId) || []).forEach((fn) => fn(payload));
  });

  socket.addEventListener("close", () => {
    console.log("🔴 Disconnected from Event Mesh");
    socket = null;                                // allow reconnect
  });
}

/* ---------- public helpers ---------------------------------- */
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
