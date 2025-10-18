// src/app/components/AddContactModal.tsx
'use client';

import { useState } from 'react';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddContact: (address: string, name: string) => void;
}

export const AddContactModal = ({ isOpen, onClose, onAddContact }: AddContactModalProps) => {
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim() && name.trim()) {
      onAddContact(address, name);
      setAddress('');
      setName('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Add New Contact</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alice" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Polkadot Address</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" required />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Add Contact</button>
          </div>
        </form>
      </div>
    </div>
  );
};
