// src/app/components/DarkModeToggle.tsx
"use client";

import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (saved === "dark" || (!saved && prefers)) {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="fixed top-4 right-6 z-40 p-2.5 rounded-full
                 bg-gray-200/70 dark:bg-gray-800/70
                 text-gray-800 dark:text-gray-200
                 backdrop-blur-sm shadow-sm
                 hover:opacity-90 hover:scale-105
                 transition-all duration-300"
    >
      {dark ? "🌞" : "🌙"}
    </button>
  );
}
