// src/components/UsernameModal.tsx

import { useState } from 'react';

interface UsernameModalProps {
  isOpen: boolean;
  onSetUsername: (username: string) => void;
}

export const UsernameModal = ({ isOpen, onSetUsername }: UsernameModalProps) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (username.length > 20) {
      setError('Username must be less than 20 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }

    onSetUsername(username);
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-2">Choose Your Username</h2>
          <p className="text-gray-600 mb-6 text-sm">
            This will be displayed instead of your wallet address
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter username"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  maxLength={20}
              />
              {error && (
                  <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
              <p className="text-gray-500 text-xs mt-2">
                3-20 characters, letters, numbers, and underscores only
              </p>
            </div>

            <button
                type="submit"
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
  );
};
