// src/app/components/DarkModeToggle.tsx
'use client';

export default function DarkModeToggle() {
    const toggleDarkMode = () => {
        document.documentElement.classList.toggle('dark');
    };

    return (
        <button
            onClick={toggleDarkMode}
            className="p-2 rounded-md bg-[var(--color-darkcard)] hover:bg-[var(--color-darkaccent)] text-gray-200 hover:text-white transition"
            title="Toggle dark mode"
        >
            🌙
        </button>
    );
}
