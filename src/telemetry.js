// ────────────────────────────────────────────────────────────────
// telemetry.js  – shared WebSocket helper for live twin telemetry
// ────────────────────────────────────────────────────────────────
const WS_URL = import.meta.env.VITE_MESH_WS;
let socket = null;

// twinId  →  callback(payload)
const listeners = new Map();

// Add the topics you want to see in the dashboard
const ALL_TOPICS = ["temperature", "vibration", "altitude"];

/**
 * Opens (or re-uses) a single WebSocket connection to the Event-Mesh
 * and wires up global message routing.
 */
export function connectToEventMesh() {
  if (socket) return; // already connected

  socket = new WebSocket(WS_URL);

  socket.addEventListener("open", () => {
    console.log("🟢 Connected to Event Mesh");

    // Tell the mesh we want *all* these topics
    socket.send(
      JSON.stringify({
        type: "subscribe",
        topics: ALL_TOPICS,
      })
    );
  });

  socket.addEventListener("message", (event) => {
    let data;
    try {
      data = JSON.parse(event.data);
    } catch {
      return; // ignore bad JSON
    }

    if (data.type !== "event") return;        // we only care about telemetry

    const twinId = data.from;                 // mesh tags sender in `from`
    const cb = listeners.get(twinId);
    if (cb) cb(data.payload);                 // forward just the payload
  });

  socket.addEventListener("close", () => {
    console.log("🔴 Disconnected from Event Mesh");
    socket = null;                            // allow reconnect if needed
  });
}

/**
 * Register interest in telemetry for a given twin.
 * @param {string} id  – twin UUID (as stored in the registry)
 * @param {Function} callback  – called with `payload` on every event
 */
export function subscribeToTwin(id, callback) {
  listeners.set(id, callback);
}

/**
 * Remove a subscription (e.g., on component unmount)
 */
export function unsubscribeFromTwin(id) {
  listeners.delete(id);
}
