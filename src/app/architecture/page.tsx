// src/app/architecture/page.ts

"use client";
import { FC } from "react";

const Architecture: FC = () => {
    const currentYear = new Date().getFullYear();
    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col items-center p-10 transition-colors duration-300">
            <h1 className="text-4xl font-extrabold mb-12 text-center text-purple-600 dark:text-purple-400">
                🔗 RELAY SYSTEM ARCHITECTURE
            </h1>

            {/* 🖥️ RELAY APP (Frontend) */}
            <div className="text-center mb-6">
                <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-purple-900/50 shadow-xl rounded-xl p-6 w-96 mx-auto transition-all duration-300">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        🖥️ RELAY APP (Frontend)
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Next.js Client</p>
                </div>
            </div>

            <div className="text-4xl mb-4 text-purple-500 dark:text-purple-400">↓</div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-6 tracking-wider">
                Connect Both Wallets
            </p>
            <div className="text-4xl mb-6 text-purple-500 dark:text-purple-400">↓</div>

            {/* Wallets */}
            <div className="flex flex-col sm:flex-row justify-center items-stretch gap-8 mb-12 max-w-4xl w-full">
                <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-purple-900/50 shadow-xl rounded-xl p-6 transition-all duration-300 hover:shadow-2xl hover:border-purple-500/70">
                    <h3 className="font-bold text-lg mb-3 text-purple-600 dark:text-purple-400">
                        🦊 MetaMask (EVM)
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-mono mb-1">
                        → 0xAbC...123
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        → Signs with EVM key
                    </p>
                </div>

                <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-purple-900/50 shadow-xl rounded-xl p-6 transition-all duration-300 hover:shadow-2xl hover:border-purple-500/70">
                    <h3 className="font-bold text-lg mb-3 text-purple-600 dark:text-purple-400">
                        🪶 Polkadot.js (Substrate)
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-mono mb-1">
                        → 5GHne...kUeG
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        → Signs with Substrate key
                    </p>
                </div>
            </div>

            <div className="text-4xl mb-4 text-purple-500 dark:text-purple-400">↓</div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-6 tracking-wider">
                Both signatures + message sent to backend
            </p>
            <div className="text-4xl mb-6 text-purple-500 dark:text-purple-400">↓</div>

            {/* 🖧 RELAY BACKEND */}
            <div className="text-center">
                <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-purple-900/50 shadow-2xl rounded-xl p-8 w-[450px] mx-auto transition-all duration-300">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        🖧 RELAY BACKEND (Server)
                    </h2>
                    <p className="text-base text-purple-500 dark:text-purple-400 font-semibold mt-4">
                        VERIFICATION LOGIC
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Verifies both signatures (EVM & Substrate)
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Stores linked identity: {`{substrate, evm, user}`}
                    </p>
                </div>
            </div>

            <footer className="mt-16 text-gray-500 dark:text-gray-600 text-xs tracking-wide">
                © {currentYear} TechAngelX
            </footer>
        </main>
    );
};

export default Architecture;
