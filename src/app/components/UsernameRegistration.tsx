// src/app/components/UsernameRegistration.tsx
'use client';

import { useState } from "react";

export default function UsernameRegistration({
                                                 currentUserAddress,
                                             }: {
    currentUserAddress: string;
}) {
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async () => {
        if (!username.trim()) return setError("Please enter a username.");
        setLoading(true);
        try {
            // registration logic
            console.log("Register username:", username, "for", currentUserAddress);
            setError("");
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-[var(--color-darkcard)] text-gray-900 dark:text-gray-200 p-4 rounded-lg shadow transition-colors duration-300">
            <h2 className="font-semibold mb-2">Register On-Chain Username</h2>
            <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 mb-3 rounded-lg bg-gray-50 dark:bg-[var(--color-darkbg)] text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-700 focus:ring-[var(--color-darkaccent)]"
                placeholder="Enter username"
            />
            <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full p-2 bg-[var(--color-darkaccent)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition"
            >
                {loading ? "Registering..." : "Register"}
            </button>
            {error && <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>}
        </div>
    );
}
