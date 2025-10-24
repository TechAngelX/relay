// src/app/components/Header.tsx
'use client';

import Image from "next/image";
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

            {/* === Logo inline === */}
            <div className="flex items-center gap-2 group select-none">
                <div
                    className="w-[34px] h-[34px] bg-gradient-to-br from-[#4F00E9] to-[#00BFFF] transition-all duration-300 group-hover:scale-105 group-hover:brightness-110"
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
                    width={90}
                    height={30}
                    className="transition-all duration-300 dark:invert-[0.9] brightness-0 saturate-100 hue-rotate-[210deg]"
                    priority
                />
            </div>

            {/* === Account info + dark mode toggle === */}
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
