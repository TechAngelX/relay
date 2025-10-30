// src/app/components/LoginPanel.tsx
'use client';

import { useState, useEffect } from "react";
import { loginGuest, loginWallet, loginPolkadot } from "../services/socket";
import detectEthereumProvider from "@metamask/detect-provider";

export default function LoginPanel() {
    const [hasPolkadot, setHasPolkadot] = useState(false);
    const [hasMetaMask, setHasMetaMask] = useState(false);
    const [isSafari, setIsSafari] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [guestName, setGuestName] = useState("");

    useEffect(() => {
        // Detect Polkadot.js and MetaMask
        if (typeof window !== "undefined") {
            setHasPolkadot(!!(window as any).injectedWeb3);

            detectEthereumProvider().then((provider: any) => {
                if (provider) setHasMetaMask(true);
            });

            const ua = navigator.userAgent.toLowerCase();
            setIsSafari(ua.includes("safari") && !ua.includes("chrome"));
        }
    }, []);

    const handlePolkadotLogin = async () => {
        try {
            const injected = (window as any).injectedWeb3;
            if (!injected) throw new Error("No Polkadot.js extension found");

            const provider = injected["polkadot-js"];
            const accounts = await provider.enable("relay");
            const address = accounts[0]?.address;
            const signature = "fake_signature_for_demo"; // Replace with actual signing

            loginPolkadot(address, signature);
            setError(null);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        }
    };

    const handleMetaMaskLogin = async () => {
        try {
            const provider = (window as any).ethereum;
            if (!provider) throw new Error("MetaMask not found");
            await provider.request({ method: "eth_requestAccounts" });
            const address = provider.selectedAddress;
            const message = "Login to Relay";
            const signature = await provider.request({
                method: "personal_sign",
                params: [message, address],
            });

            loginWallet(address, signature, "EVM");
            setError(null);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        }
    };

    const handleGuestLogin = (auto = false) => {
        const name =
            guestName.trim() ||
            `guest-${Math.random().toString(36).substring(2, 7)}`;
        loginGuest(name);
        if (!auto) setError(null);
    };

    // ---------- AUTO-GUEST LOGIN ----------
    useEffect(() => {
        const showFallback = !hasPolkadot || isSafari;
        if (showFallback) {
            const timer = setTimeout(() => {
                console.log("Auto guest login (no wallet detected)");
                handleGuestLogin(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [hasPolkadot, isSafari]);

    const showFallback = !hasPolkadot || isSafari;

    // ---------- UI ----------
    return (
        <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-gradient-to-b from-[#6C63FF] to-[#9E9AFF] shadow-xl max-w-sm mx-auto mt-10">
            <h1 className="text-3xl font-bold text-white mb-2">relay</h1>
            <p className="text-sm text-gray-100 mb-6">Web3 Communication</p>

            {/* --- Polkadot Flow --- */}
            {!showFallback && (
                <button
                    onClick={handlePolkadotLogin}
                    className="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-6 py-2 rounded-lg w-full transition-all"
                >
                    Connect Polkadot.js
                </button>
            )}

            {/* --- Fallback for Safari / No Extension --- */}
            {showFallback && (
                <div className="w-full flex flex-col gap-3">
                    {hasMetaMask && (
                        <button
                            onClick={handleMetaMaskLogin}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg transition-all"
                        >
                            Connect MetaMask
                        </button>
                    )}

                    <div className="flex gap-2">
                        <input
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            placeholder="Enter guest name"
                            className="flex-1 p-2 rounded-md border border-gray-300 focus:outline-none"
                        />
                        <button
                            onClick={() => handleGuestLogin(false)}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 rounded-lg transition-all"
                        >
                            Guest Login
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <p className="text-red-200 text-sm mt-4 bg-red-600/40 p-2 rounded-md w-full text-center">
                    {error}
                </p>
            )}

            <p className="text-xs text-gray-200 mt-4 text-center">
                {showFallback
                    ? "Fallback mode: Guest or MetaMask login available."
                    : "Using Polkadot.js wallet connection."}
            </p>
        </div>
    );
}

