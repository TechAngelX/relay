// src/app/components/WalletConnect.tsx
'use client';

import { useState } from 'react';
import { connectWallet } from '../services/polkadot';
import { getSocket } from '../services/socket';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { addressToEvm } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';

interface Account extends InjectedAccountWithMeta {}

const ss58ToEvmAddress = (ss58Address: string): string => {
  try {
    const evmBytes = addressToEvm(ss58Address);
    return u8aToHex(evmBytes);
  } catch (e) {
    console.error("Failed to convert SS58 to EVM:", e);
    return '0x0000000000000000000000000000000000000000';
  }
};

export const WalletConnect = ({ onConnect }: { onConnect: (account: Account) => void }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    setLoading(true);
    setError('');

    try {
      const accounts = await connectWallet();
      if (accounts.length > 0) {
        const account = accounts[0] as Account;
        const evmAddress = ss58ToEvmAddress(account.address);
        const socket = getSocket();
        socket.connect();
        socket.on('connect', () => socket.emit('register', evmAddress));
        const evmAccount = { ...account, address: evmAddress };
        onConnect(evmAccount);
      } else {
        setError('No accounts found in extension.');
      }
    } catch (err) {
      const message = (err as Error).message;
      if (message.includes('No Polkadot extension found')) {
        setError('No Polkadot extension found. Please install Polkadot.js extension.');
      } else if (message.includes('denied')) {
        setError('Connection denied. Please approve in Polkadot.js extension.');
      } else {
        setError(message || 'Failed to connect wallet.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4 text-gray-900">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-2 text-gray-900">Relay</h1>
            <p className="text-gray-700">Web3 Communication</p>
          </div>

          <button
              onClick={handleConnect}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>

          {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <p className="font-semibold text-sm">Connection Error</p>
                <p className="text-sm">{error}</p>
              </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-700 text-center">
              Don't have a wallet?{' '}
              <a
                  href="https://polkadot.js.org/extension/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
              >
                Install Polkadot.js Extension
              </a>
            </p>
          </div>
        </div>
      </div>
  );
};
