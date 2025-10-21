// src/app/components/Header.tsx
'use client';

import DarkModeToggle from "./DarkModeToggle";

export default function Header({
                                   accountName,
                                   accountAddress,
                                   onCopyAddress,
                                   copied,
                               }: {
    accountName: string;
    accountAddress: string;
    onCopyAddress: () => void;
    copied: boolean;
}) {
    return (
        <header className="bg-white/80 dark:bg-[var(--color-darkcard)] border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm px-6 py-3 flex items-center justify-between transition-colors duration-300">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Relay</h1>

            <div className="flex items-center gap-3">
                <DarkModeToggle />
                <div className="text-right">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {accountName || "Account"}
                    </p>
                    <p
                        onClick={onCopyAddress}
                        className="text-xs text-gray-500 dark:text-gray-400 font-mono cursor-pointer hover:text-blue-600 dark:hover:text-[var(--color-darkaccent)] transition"
                    >
                        {copied
                            ? "Copied!"
                            : `${accountAddress.slice(0, 6)}...${accountAddress.slice(-4)}`}
                    </p>
                </div>
            </div>
        </header>
    );
}
