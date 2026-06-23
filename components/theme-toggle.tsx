"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type ThemeToggleProps = {
  label: string;
  lightLabel: string;
  darkLabel: string;
};

export function ThemeToggle({
  label,
  lightLabel,
  darkLabel,
}: ThemeToggleProps) {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    return window.localStorage.getItem("vp23_theme") === "light"
      ? "light"
      : "dark";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem("vp23_theme", nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }

  const Icon = theme === "dark" ? Moon : Sun;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-panel-soft px-3 py-2 text-xs font-medium text-muted transition hover:border-gold/60 hover:text-foreground"
    >
      <Icon className="size-4 text-gold" aria-hidden />
      <span className="hidden sm:inline">
        {theme === "dark" ? darkLabel : lightLabel}
      </span>
    </button>
  );
}
