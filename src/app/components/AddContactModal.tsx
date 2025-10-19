// src/app/components/AddContactModal.tsx
'use client';

import { useState } from 'react';
import { addressToEvm } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddContact: (address: string, name: string) => void;
}

const ss58ToEvmAddress = (ss58Address: string): string => {
  try {
    const evmBytes = addressToEvm(ss58Address);
    return u8aToHex(evmBytes);
  } catch (e) {
    console.error("Failed to convert SS58 to EVM:", e);
    return ss58Address;
  }
};

export const AddContactModal = ({ isOpen, onClose, onAddContact }: AddContactModalProps) => {
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim() && name.trim()) {
      const evmAddress = ss58ToEvmAddress(address.trim());
      onAddContact(evmAddress, name);
      setAddress('');
      setName('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-gray-900">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Add New Contact</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
              <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alice"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Polkadot Address</label>
              <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="13FiFs... or 0x..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-600 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
              />
            </div>
            <div className="flex gap-3">
              <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Add Contact
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};
