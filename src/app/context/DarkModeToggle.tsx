// src/app/context/DarkModeToggle.tsx
"use client";

import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  // Load saved or system preference once component mounts
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldDark = saved ? saved === "dark" : prefersDark;

    setDark(shouldDark);
    document.documentElement.classList.toggle("dark", shouldDark);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
      <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="inline-flex items-center justify-center h-9 w-9 rounded-full
                 border border-gray-200 dark:border-gray-700
                 bg-white/80 dark:bg-gray-800/80
                 text-gray-800 dark:text-gray-200
                 backdrop-blur-sm shadow-sm
                 hover:opacity-90 transition"
      >
        {dark ? (
            // Sun icon
            <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            >
              <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v2m0 14v2m7-9h2M3 12H1m15.364 6.364l1.414 1.414M6.222 6.222 4.808 4.808m12.728 0 1.414 1.414M6.222 17.778l-1.414 1.414"
              />
              <circle cx="12" cy="12" r="4" />
            </svg>
        ) : (
            // Moon icon
            <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            >
              <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"
              />
            </svg>
        )}
      </button>
  );
}
