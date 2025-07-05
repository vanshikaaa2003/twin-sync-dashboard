import { useState } from "react";
import { useAuth } from "../context/AuthProvider";

export default function LoginModal() {
  const { user, signIn, signUp, signOut } = useAuth();
  const [isOpen, setOpen] = useState(false);
  const [email, setEmail]   = useState("");
  const [pw, setPw] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");

  if (user) {
    return (
      <div className="flex gap-2 items-center">
        <span className="text-sm">{user.email}</span>
        <button className="text-blue-600" onClick={signOut}>Logout</button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1 bg-blue-600 text-white rounded"
      >
        Login
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-80 space-y-4">
            <h2 className="text-xl font-bold">
              {isSignUp ? "Sign up" : "Log in"}
            </h2>

            <input
              type="email"
              placeholder="Email"
              value={email}
              className="border p-2 w-full"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={pw}
              className="border p-2 w-full"
              onChange={(e) => setPw(e.target.value)}
            />

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              className="w-full bg-blue-600 text-white py-2 rounded"
              onClick={async () => {
                const fn = isSignUp ? signUp : signIn;
                const { error } = await fn(email, pw);
                if (error) return setError(error.message);
                setOpen(false);
              }}
            >
              {isSignUp ? "Create account" : "Log in"}
            </button>

            <button
              className="text-xs text-blue-600"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Have an account? Log in" : "Need an account? Sign up"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
