import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function TopBar() {
  const [dark, setDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header className="flex items-center justify-between py-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <span className="animate-spin-slow">🛰️</span> TwinSync Dashboard
      </h1>

      <Button
        size="icon"
        variant="ghost"
        onClick={() => setDark((d) => !d)}
        className="hover:rotate-12 transition"
      >
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </Button>
    </header>
  );
}
