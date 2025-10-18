// src/app/components/WalletConnect.tsx
'use client'; 

import { useState } from 'react';
import { connectWallet, connectToPolkadot } from '../services/polkadot';
import { getSocket } from '../services/socket';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

interface Account extends InjectedAccountWithMeta {}

export const WalletConnect = ({ onConnect }: { onConnect: (account: Account) => void }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError('');
      
      await connectToPolkadot();
      const accounts = await connectWallet();
      
      if (accounts.length > 0) {
        const account = accounts[0] as Account;
        
        const socket = getSocket();
        socket.connect();
        socket.emit('register', account.address);
        
        onConnect(account);
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to connect wallet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2 text-gray-800">Relay</h1>
          <p className="text-gray-600">Web3 Communication</p>
        </div>
        <button
          onClick={handleConnect}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Connecting...' : '🔗 Connect Wallet'}
        </button>
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Don't have a wallet?{' '}
            <a href="https://polkadot.js.org/extension/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
              Install Polkadot.js Extension
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
