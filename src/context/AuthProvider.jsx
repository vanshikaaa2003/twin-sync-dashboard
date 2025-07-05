import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthCtx = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial check (❗ now awaited)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for future auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setUser(session?.user ?? null)
    );

    return () => subscription.unsubscribe();
  }, []);

  // ---------- auth helpers ----------
  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signUp = (email, password) =>
    supabase.auth.signUp({ email, password });

  const signOut = () => supabase.auth.signOut();

  return (
    <AuthCtx.Provider value={{ user, signIn, signUp, signOut }}>
      {loading ? <div className="p-6">Loading…</div> : children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
