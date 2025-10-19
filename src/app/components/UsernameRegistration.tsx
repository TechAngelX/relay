// src/app/components/UsernameRegistration.tsx
'use client';

import { useState } from 'react';
import { registerUsernameOnChain } from '../services/usernameContract';

export const UsernameRegistration = ({ currentUserAddress }: { currentUserAddress: string }) => {
    const [username, setUsername] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async () => {
        if (username.length < 3) {
            setError('Username must be at least 3 characters.');
            return;
        }

        setLoading(true);
        setStatus('Awaiting MetaMask confirmation...');
        setError('');

        try {
            const txHash = await registerUsernameOnChain(username);
            setStatus(`Registration successful! TX: ${txHash.slice(0, 10)}...`);
            setUsername('');
        } catch (e) {
            console.error(e);
            setStatus('');
            setError('Registration failed. Check MetaMask or ensure Passet Hub is selected.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-lg text-gray-900">
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Register On-Chain Username</h3>
            <p className="text-sm text-gray-700 mb-4">
                This step uses <strong>MetaMask</strong> to register your identity on the Passet Hub testnet.
                (Cost: ~0.001 PAS for gas fees)
            </p>

            <div className="flex flex-col gap-3">
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username (e.g., techangelx)"
                    className="p-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                />
                <button
                    onClick={handleRegister}
                    disabled={loading || username.length < 3}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50"
                >
                    {loading ? 'Processing Transaction...' : 'Register Username (Pay PAS)'}
                </button>
            </div>

            {status && <p className="mt-3 text-sm text-green-600 font-medium">{status}</p>}
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>
    );
};
