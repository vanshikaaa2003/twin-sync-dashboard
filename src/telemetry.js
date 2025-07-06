// ────────────────────────────────────────────────────────────────
// telemetry.js  – shared WebSocket helper for live telemetry
// ────────────────────────────────────────────────────────────────

/* 1️⃣  Choose the right WebSocket URL
      • VITE_MESH_WS in .env.prod  (GH Pages build)
      • wss://… on https:// sites
      • ws://localhost:5000 in local dev                          */
const BASE_WS =
  import.meta.env.VITE_MESH_WS ||
  (location.protocol === "https:"
    ? "wss://twin-sync-mesh.onrender.com"
    : "ws://localhost:5000");

let socket                = null;           // singleton WS
const twinCallbacks        = new Map();     // twinId → Set<fn>
const subscribedTopicsSet  = new Set();     // remember what we asked for

// topics we always want; you can add more here
const DEFAULT_TOPICS = ["temperature", "humidity"];

export function connectToEventMesh() {
  if (socket) return;                       // already connected

  console.log("🔌 Opening WS →", BASE_WS);
  socket = new WebSocket(BASE_WS);

  socket.addEventListener("open", () => {
    console.log("🟢 WS open");
    askForTopics(DEFAULT_TOPICS);
  });

  socket.addEventListener("message", (evt) => {
    let msg;
    try {
      msg = JSON.parse(evt.data);
    } catch {
      return;
    }

    // dev‑only noisy log
    console.log("📨 mesh msg →", msg);

    if (msg.type !== "event") return;

    const { from: twinId, topic, payload } = msg;

    // ① auto‑subscribe if we encounter a new topic
    if (!subscribedTopicsSet.has(topic)) {
      askForTopics([topic]);
    }

    // ② fan‑out to every listener for this twin
    (twinCallbacks.get(twinId) || []).forEach((fn) => fn(payload));
  });

  socket.addEventListener("close", () => {
    console.log("🔴 WS closed – will reconnect on next call");
    socket = null;
  });
}

/* helper – send subscribe frame once per topic */
function askForTopics(topics) {
  topics
    .filter((t) => !subscribedTopicsSet.has(t))
    .forEach((t) => subscribedTopicsSet.add(t));

  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: "subscribe", topics }));
  }
}

/* ── public helpers ──────────────────────────────────────────── */
export function subscribeToTwin(twinId, fn) {
  const set = twinCallbacks.get(twinId) || new Set();
  set.add(fn);
  twinCallbacks.set(twinId, set);
}

export function unsubscribeFromTwin(twinId, fn) {
  const set = twinCallbacks.get(twinId);
  if (!set) return;
  set.delete(fn);
  if (set.size === 0) twinCallbacks.delete(twinId);
}
