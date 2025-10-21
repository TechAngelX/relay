// src/app/components/AddContactModal.tsx
'use client';

import { useState } from "react";

export default function AddContactModal({
                                          isOpen,
                                          onClose,
                                          onAddContact,
                                        }: {
  isOpen: boolean;
  onClose: () => void;
  onAddContact: (address: string, name: string) => void;
}) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && address.trim()) {
      onAddContact(address, name);
      setName("");
      setAddress("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="p-4 rounded-xl bg-white dark:bg-[var(--color-darkcard)] shadow-elevated">
          <h2 className="text-xl font-semibold mb-4">Add Contact</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[var(--color-darkbg)] text-gray-900 dark:text-gray-200 focus:ring-[var(--color-darkaccent)] focus:outline-none"
                  placeholder="Enter name"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Wallet Address</label>
              <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[var(--color-darkbg)] text-gray-900 dark:text-gray-200 focus:ring-[var(--color-darkaccent)] focus:outline-none"
                  placeholder="Enter address"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:opacity-80 transition"
              >
                Cancel
              </button>
              <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[var(--color-darkaccent)] text-white hover:opacity-90 transition"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}
