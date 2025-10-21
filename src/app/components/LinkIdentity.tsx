// src/app/components/LinkIdentity.tsx
'use client';

import { useState } from "react";
import { connectMetaMask, signEvm } from "../services/evm";
import { connectPolkadot, signSubstrate } from "../services/substrate";
import { fetchNonce, linkIdentity } from "../services/bridge";

export default function LinkIdentity() {
    const [substrate, setSubstrate] = useState<string>('');
    const [evm, setEvm] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [status, setStatus] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const connectBoth = async () => {
        try {
            setStatus('🔌 Connecting wallets...');
            const sub = await connectPolkadot();
            const ev = await connectMetaMask();
            setSubstrate(sub);
            setEvm(ev);
            setStatus('✅ Wallets connected.');
        } catch (err: any) {
            setStatus(`❌ ${err.message}`);
        }
    };

    const handleLink = async () => {
        if (!substrate || !evm) return setStatus('⚠️ Connect both wallets first');
        setLoading(true);
        setStatus('⏳ Preparing identity link...');

        try {
            const { nonce } = await fetchNonce({ substrate, evm });
            const message = [
                'Relay Identity Link',
                `substrate: ${substrate}`,
                `evm: ${evm}`,
                `nonce: ${nonce}`,
                username ? `username: ${username}` : null,
            ].filter(Boolean).join('\n');

            setStatus('🦊 Signing with MetaMask...');
            const sigEvm = await signEvm(evm, message);

            setStatus('🔗 Signing with Polkadot.js...');
            const sigSub = await signSubstrate(substrate, message);

            setStatus('📤 Sending verification to server...');
            const res = await linkIdentity({ substrate, evm, username, sigEvm, sigSub, nonce });

            setStatus(`✅ Linked successfully for ${res.record.username || 'user'}`);
        } catch (err: any) {
            setStatus(`❌ ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-[var(--color-darkcard)] text-gray-900 dark:text-gray-200 p-6 rounded-2xl shadow-lg w-full max-w-md transition-all">
            <h3 className="font-semibold text-lg mb-4 text-center">🔗 Link Polkadot ↔ MetaMask</h3>

            <div className="grid gap-4">
                <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Optional username"
                    className="p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-[var(--color-darkbg)] text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-[var(--color-darkaccent)] transition"
                />

                <div className="text-sm text-gray-600 dark:text-gray-400">
                    Substrate: {substrate ? `${substrate.slice(0, 6)}...${substrate.slice(-4)}` : '—'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    EVM: {evm ? `${evm.slice(0, 6)}...${evm.slice(-4)}` : '—'}
                </div>

                <div className="flex gap-2 justify-between pt-2">
                    <button
                        onClick={connectBoth}
                        disabled={loading}
                        className="w-1/2 py-2 bg-[var(--color-darkaccent)] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition"
                    >
                        Connect
                    </button>

                    <button
                        onClick={handleLink}
                        disabled={loading || !substrate || !evm}
                        className="w-1/2 py-2 bg-[var(--color-darkaccent)] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition"
                    >
                        {loading ? "Linking..." : "Link"}
                    </button>
                </div>

                <div
                    className={`text-sm mt-3 text-center transition-all ${
                        status.includes('❌') ? 'text-red-600 dark:text-red-400' :
                            status.includes('✅') ? 'text-green-600 dark:text-green-400' :
                                'text-gray-700 dark:text-gray-300'
                    }`}
                >
                    {status}
                </div>
            </div>
        </div>
    );
}
