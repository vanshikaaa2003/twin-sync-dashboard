const BASE = "http://localhost:4000";

export async function fetchTwins() {
  const res = await fetch(`${BASE}/twin.query`);
  if (!res.ok) throw new Error("Failed to fetch twins");
  return res.json();
}
