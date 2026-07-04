"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className="flex items-center gap-2 rounded-pill border border-hairline dark:border-hairline-dark
                 px-3 py-1.5 text-caption text-muted dark:text-muted-dark
                 hover:border-teal dark:hover:border-teal-dark"
    >
      {isDark ? <Moon size={14} /> : <Sun size={14} />}
      <span>{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}
