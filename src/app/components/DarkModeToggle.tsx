// src/app/components/DarkModeToggle.tsx
'use client';

import { useEffect, useState } from "react";

export default function DarkModeToggle() {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        // Load saved theme from localStorage
        const saved = localStorage.getItem("theme");

        // Default to light if nothing saved
        const initial = saved === "dark";

        setDarkMode(initial);
        document.documentElement.classList.toggle("dark", initial);
    }, []);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        document.documentElement.classList.toggle("dark", newMode);
        localStorage.setItem("theme", newMode ? "dark" : "light");
    };

    return (
        <button
            onClick={toggleDarkMode}
            className="p-2 rounded-md bg-[var(--color-darkcard)] hover:bg-[var(--color-darkaccent)] text-gray-200 hover:text-white transition"
            title="Toggle dark mode"
        >
            {darkMode ? "☀️" : "🌙"}
        </button>
    );
}
