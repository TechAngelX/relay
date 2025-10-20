// src/app/context/DarkModeToggle.tsx
"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Detect stored or system preference
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved ? saved === "dark" : prefersDark;

    setIsDark(initial);
    document.documentElement.classList.toggle("dark", initial);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
      <button
          onClick={toggleTheme}
          className="
        relative flex items-center justify-center h-9 w-9 rounded-full
        transition-all duration-300 hover:scale-105 active:scale-95
        bg-transparent hover:bg-gray-100/50 dark:hover:bg-gray-800/60
        text-gray-800 dark:text-gray-200
      "
      >
        {isDark ? (
            <Sun className="h-5 w-5 text-yellow-400" />
        ) : (
            <Moon className="h-5 w-5 text-gray-700" />
        )}
      </button>
  );
}
