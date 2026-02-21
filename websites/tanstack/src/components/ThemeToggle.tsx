import { useEffect, useState } from "react";
import type { JSX } from "react";

type Theme = "dark" | "light";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "dark";
  }

  const savedTheme = window.localStorage.getItem("theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeToggle(): JSX.Element {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      type="button"
      aria-label="Toggle light and dark theme"
      onClick={() => setTheme((previousTheme) => (previousTheme === "dark" ? "light" : "dark"))}
      className="rounded-full border border-cyan-500/30 bg-gray-900/70 px-3 py-1.5 text-xs text-cyan-200 transition-all duration-300 hover:border-cyan-400/60 hover:text-cyan-100"
    >
      {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}

