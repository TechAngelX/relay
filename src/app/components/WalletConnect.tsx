// Path: /src/app/components/WalletConnect.tsx
'use client';

import { useState } from "react";
import Image from "next/image";
import { connectWallet } from "../services/polkadot";
import { getSocket } from "../services/socket";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { addressToEvm } from "@polkadot/util-crypto";
import { u8aToHex } from "@polkadot/util";

interface Account extends InjectedAccountWithMeta {}

const ss58ToEvmAddress = (ss58Address: string): string => {
  try {
    const evmBytes = addressToEvm(ss58Address);
    return u8aToHex(evmBytes);
  } catch (e) {
    console.error("Failed to convert SS58 to EVM:", e);
    return "0x0000000000000000000000000000000000000000";
  }
};

export default function WalletConnect({ onConnect }: { onConnect: (account: Account) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConnect = async () => {
    setLoading(true);
    setError("");

    try {
      const accounts = await connectWallet();
      if (accounts.length > 0) {
        const account = accounts[0] as Account;
        const evmAddress = ss58ToEvmAddress(account.address);
        const socket = getSocket();
        socket.connect();
        socket.on("connect", () => socket.emit("register", evmAddress));
        const evmAccount = { ...account, address: evmAddress };
        onConnect(evmAccount);
      } else {
        setError("No accounts found in extension.");
      }
    } catch (err) {
      const message = (err as Error).message;
      if (message.includes("No Polkadot extension found")) {
        setError("No Polkadot extension found. Please install Polkadot.js extension.");
      } else if (message.includes("denied")) {
        setError("Connection denied. Please approve in Polkadot.js extension.");
      } else {
        setError(message || "Failed to connect wallet.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 dark:from-[var(--color-darkbg)] dark:to-[var(--color-darkcard)] p-6 text-gray-900 dark:text-gray-200 transition-colors duration-300">
        <div className="bg-white dark:bg-[var(--color-darkcard)] rounded-3xl shadow-2xl p-10 max-w-md w-full transition-colors duration-300 flex flex-col items-center text-center">

          {/* === Logo Block === */}
          <div className="flex flex-col items-center mb-8 space-y-1 group transition-all duration-500">
            {/* Gradient chain logo */}
            <div
                className="w-[68px] h-[68px] bg-gradient-to-br from-[#4F00E9] to-[#00BFFF] transition-all duration-500 group-hover:scale-105 group-hover:brightness-110"
                style={{
                  WebkitMaskImage: 'url(/images/relay-logo.svg)',
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  WebkitMaskSize: 'contain',
                  maskImage: 'url(/images/relay-logo.svg)',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  maskSize: 'contain',
                }}
            />

            <Image
                src="/images/relay-text.svg"
                alt="Relay text"
                width={150}
                height={40}
                className="animate-fade-in delay-200 transition-all duration-700 dark:invert-[0.9] brightness-0 saturate-100 hue-rotate-[210deg]"
                priority
            />

            <p className="text-gray-700 dark:text-gray-300 text-base mt-2">Web3 Communication</p>
          </div>



          {/* === Connect Button === */}
          <button
              onClick={handleConnect}
              disabled={loading}
              className="w-full bg-blue-600 dark:bg-[var(--color-darkaccent)] hover:bg-blue-700 dark:hover:opacity-90 text-white font-semibold py-4 px-6 rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
          {loading ? "Connecting..." : "Connect Wallet"}
          </button>

          {/* === Error Message === */}
          {error && (
              <div className="mt-5 p-4 bg-red-100 dark:bg-red-900/40 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg transition-colors duration-300 w-full text-sm">
                <p className="font-semibold mb-1">Connection Error</p>
                <p>{error}</p>
              </div>
          )}

          {/* === Footer === */}
          <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700 w-full">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Don't have a wallet?{" "}
              <a
                  href="https://polkadot.js.org/extension/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-[var(--color-darkaccent)] hover:underline font-medium"
              >
                Install Polkadot.js Extension
              </a>
            </p>
          </div>
        </div>
      </div>
  );
}
