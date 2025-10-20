// src/app/components/Header.tsx
"use client";

import { useEffect, useState } from "react";
import DarkModeToggle from "./DarkModeToggle";

export default function Header() {
  const [account, setAccount] = useState<string | null>(null);

  // Example: detect connected wallet (adjust if your actual code differs)
  useEffect(() => {
    const saved = localStorage.getItem("walletAddress");
    if (saved) setAccount(saved);
  }, []);

  return (
    <header className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <h1 className="text-xl font-semibold tracking-tight">Relay</h1>

      <div className="flex items-center space-x-4">
        {account && (
          <>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                polkaBRAVE
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                0xca27...75ad
              </span>
            </div>
            <DarkModeToggle />
          </>
        )}
      </div>
    </header>
  );
}
