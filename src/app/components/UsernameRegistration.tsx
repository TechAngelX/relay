// src/app/components/UsernameRegistration.tsx
'use client';

import { useState } from "react";
import { ethers } from "ethers";
import usernameRegistryABI from "../../abis/UsernameRegistry.json";

const CONTRACT_ADDRESS = "0x0E4716Dc8b9c6a6DC32867b50042d71C181B87C2";
const DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === "true";

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
            if (!window.ethereum) {
                setError("MetaMask not detected. Please install it first.");
                return;
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);

            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, usernameRegistryABI, signer);

            const finalUsername = username.endsWith(".relay") ? username : `${username}.relay`;

            console.log("Register username:", finalUsername, "for", currentUserAddress);

            const tx = await contract.registerUsername(finalUsername, {
                value: ethers.parseEther("0.001"),
            });

            await tx.wait();

            alert(`Username "${finalUsername}" registered successfully.`);
            setError("");
            setUsername("");
        } catch (err) {
            console.error(err);
            if ((err as any)?.reason) setError((err as any).reason);
            else setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

// Developer-only: View all registered usernames
    const handleViewUsernames = async (): Promise<void> => {
        try {
            if (!window.ethereum) {
                console.warn("MetaMask not detected.");
                return;
            }

            // Create a read-only provider from the injected MetaMask object
            const provider = new ethers.BrowserProvider(window.ethereum!);
            const contract = new ethers.Contract(CONTRACT_ADDRESS, usernameRegistryABI, provider);

            // Fetch all past UsernameRegistered events
            const logs = (await contract.queryFilter("UsernameRegistered")) as ethers.EventLog[];

            if (!logs.length) {
                console.log("No usernames registered yet.");
                return;
            }

            console.group("=== Registered usernames ===");
            logs.forEach((log) => {
                const user = log.args[0];
                const name = log.args[1];
                console.log(`${user} → ${name}`);
            });
            console.groupEnd();
        } catch (err) {
            console.error(err);
        }
    };


    // Only expose in debug mode (invisible to production)
    if (DEBUG_MODE) {
        (window as any).viewUsernames = handleViewUsernames;
        console.log("🛠️ Debug mode active — type viewUsernames() in the browser console");
    }

    return (
        <div className="bg-white dark:bg-[var(--color-darkcard)] text-gray-900 dark:text-gray-200 p-4 rounded-xl shadow-elevated transition-all duration-300">
            <h2 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">
                Register On-Chain Username
            </h2>

            <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full p-2.5 mb-4 rounded-lg bg-gray-50 dark:bg-[var(--color-darkbg)] text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-[var(--color-darkaccent)] focus:outline-none transition-all"
            />

            <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full p-2.5 rounded-lg font-medium bg-[var(--color-darkaccent)] text-white hover:opacity-90 disabled:opacity-50 transition-all duration-300"
            >
                {loading ? "Registering..." : "Register"}
            </button>

            {error && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-3 transition-colors duration-300">
                    {error}
                </p>
            )}
        </div>
    );
}
