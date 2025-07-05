// src/api/twins.js
// -----------------------------------
// REST helpers for the Twin Registry
// -----------------------------------
import { supabase } from "../lib/supabaseClient";

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

/** Get current user’s access-token */
async function authHeader() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** GET /twin.query */
export async function fetchTwins() {
  const res = await fetch(`${BASE}/twin.query`, {
    headers: await authHeader(),
  });
  if (!res.ok) throw new Error("Failed to fetch twins");
  return res.json();
}

/** DELETE /twin/:id */
export const deleteTwin = async (id) => {
  const res = await fetch(`${BASE}/twin/${id}`, {
    method: "DELETE",
    headers: await authHeader(),
  });
  if (!res.ok) throw new Error("Delete failed");
  return { ok: true };
};

/** PUT /twin/:id — body: { specURL, capabilities } */
export const updateTwin = async (id, body) => {
  const res = await fetch(`${BASE}/twin/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeader()),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
};

/** POST /twin.register — body: { specURL, capabilities } */
export const registerTwin = async (body) => {
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  const res = await fetch(`${BASE}/twin.register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeader()),
    },
    body: JSON.stringify({
      ...body,
      createdBy: user.id, // Optional: server will enforce
    }),
  });

  if (!res.ok) throw new Error("Create failed");
  return res.json();
};
