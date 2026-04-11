"use client";

import { useEffect, useState } from "react";

const THEME_KEY = "workswipe-theme";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.setAttribute("data-theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial: Theme = stored ?? (systemDark ? "dark" : "light");
    setTheme(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      role="switch"
      aria-checked={theme === "dark"}
      className="relative inline-flex h-9 w-16 items-center rounded-full border border-blue-200 bg-white px-1 transition hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
      aria-label="Toggle theme"
    >
      <span
        className={`absolute text-xs transition-opacity ${
          mounted && theme === "dark"
            ? "left-2 opacity-100"
            : "left-2 opacity-0"
        }`}
        aria-hidden
      >
        🌙
      </span>
      <span
        className={`absolute right-2 text-xs transition-opacity ${
          mounted && theme === "light"
            ? "opacity-100"
            : "opacity-0"
        }`}
        aria-hidden
      >
        ☀️
      </span>
      <span
        className={`h-7 w-7 rounded-full bg-gradient-to-r from-blue-500 to-sky-500 shadow-sm transition-transform ${
          mounted && theme === "dark" ? "translate-x-7" : "translate-x-0"
        }`}
      />
    </button>
  );
}
