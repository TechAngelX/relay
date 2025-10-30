// /src/app/components/LoginPanel.tsx:
import React, { useState } from "react";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { ethers } from "ethers";
import {
    web3Enable,
    web3Accounts,
    web3FromAddress,
} from "@polkadot/extension-dapp";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

interface LoginProps {
    onLogin: (user: {
        address: string;
        type: "GUEST" | "EVM" | "SUBSTRATE";
        connected: boolean;
    }) => void;
}

export default function LoginPanel({ onLogin }: LoginProps) {
    const [status, setStatus] = useState<string>("");
    const [socket, setSocket] = useState<Socket | null>(null);

    // ---------- GUEST LOGIN ----------
    const handleGuestLogin = async () => {
        setStatus("Connecting as guest...");
        const guestId = "guest-" + uuidv4().slice(0, 8);
        localStorage.setItem("guestId", guestId);
        const sock = io(SOCKET_URL);
        sock.emit("guestLogin", { id: guestId });
        setSocket(sock);
        onLogin({ address: guestId, type: "GUEST", connected: true });
        setStatus("Guest mode active");
    };

    // ---------- METAMASK LOGIN ----------
    const handleMetaMaskLogin = async () => {
        try {
            if (!window.ethereum) throw new Error("MetaMask not detected");
            setStatus("Requesting MetaMask connection...");
            await window.ethereum.request({ method: "eth_requestAccounts" });
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            const nonce = "Login to Relay " + Date.now();
            const signature = await signer.signMessage(nonce);

            const sock = io(SOCKET_URL);
            sock.emit("walletLogin", { address, signature, type: "EVM" });
            setSocket(sock);
            onLogin({ address, type: "EVM", connected: true });
            setStatus("Connected with MetaMask");
        } catch (err) {
            console.error(err);
            setStatus("MetaMask login failed");
        }
    };

    // ---------- POLKADOT.JS LOGIN ----------
    const handlePolkadotLogin = async () => {
        try {
            setStatus("Requesting Polkadot.js access...");
            const extensions = await web3Enable("Relay App");
            if (extensions.length === 0)
                throw new Error("No Polkadot.js extension found");

            const accounts = await web3Accounts();
            if (accounts.length === 0) throw new Error("No Polkadot accounts available");

            const account = accounts[0];
            const injector = await web3FromAddress(account.address);
            const signRaw = injector?.signer?.signRaw;
            if (!signRaw) throw new Error("Cannot sign with Polkadot.js");

            const nonce = `Login to Relay ${Date.now()}`;
            const { signature } = await signRaw({
                address: account.address,
                data: Buffer.from(nonce).toString("hex"),
                type: "bytes",
            });

            const sock = io(SOCKET_URL);
            sock.emit("walletLogin", { address: account.address, signature, type: "SUBSTRATE" });
            setSocket(sock);
            onLogin({ address: account.address, type: "SUBSTRATE", connected: true });
            setStatus("Connected with Polkadot.js");
        } catch (err) {
            console.error(err);
            setStatus("Polkadot.js login failed");
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 p-6 max-w-sm mx-auto mt-20 bg-gray-800 rounded-2xl shadow-lg text-white">
            <h2 className="text-xl font-bold mb-4">Connect to Relay</h2>

            <button
                onClick={handleGuestLogin}
                className="w-full py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition"
            >
                Continue as Guest
            </button>

            <button
                onClick={handleMetaMaskLogin}
                className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 transition"
            >
                Connect with MetaMask
            </button>

            <button
                onClick={handlePolkadotLogin}
                className="w-full py-2 rounded-lg bg-pink-600 hover:bg-pink-500 transition"
            >
                Connect with Polkadot.js
            </button>

            {status && <p className="text-sm mt-4 text-gray-300">{status}</p>}
        </div>
    );
}
