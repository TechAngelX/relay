// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic'; // 👈 Import dynamic
import { ContactList } from './components/ContactList';
import { ChatWindow } from './components/ChatWindow';
import { AddContactModal } from './components/AddContactModal';
import { getSocket } from './services/socket';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { v4 as uuidv4 } from 'uuid';

// 👈 Dynamic import: Renders WalletConnect ONLY on the browser/client side.
const WalletConnect = dynamic(() => import('./components/WalletConnect').then(mod => mod.WalletConnect), {
  ssr: false,
  loading: () => <div className="min-h-screen flex items-center justify-center text-xl">Loading Wallet UI...</div>
});

interface Account extends InjectedAccountWithMeta {}

// ... (Rest of the interfaces remain the same)

export default function Home() {
  const [account, setAccount] = useState<Account | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);

  useEffect(() => {
    // ... (useEffect hook content remains the same)
  }, [account]);


  const handleAddContact = (address: string, name: string) => {
    // ... (handleAddContact content remains the same)
  };

  const handleSendMessage = (text: string) => {
    // ... (handleSendMessage content remains the same)
  };

  if (!account) {
    // 👈 Now using the dynamically imported WalletConnect component
    return <WalletConnect onConnect={setAccount} />;
  }

  return (
      // ... (Rest of the App component JSX remains the same)
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header Bar */}
        <div className="bg-white shadow-sm border-b">
          <div className="px-4 py-3">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">Relay</h1>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">{account.meta.name || 'Account'}</p>
                  <p className="text-xs text-gray-500 font-mono">{account.address.slice(0, 6)}...{account.address.slice(-4)}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Layout */}
        <div className="flex-1 flex overflow-hidden">
          <ContactList
              contacts={contacts}
              onSelectContact={setSelectedContact}
              selectedContact={selectedContact}
              onAddContact={() => setIsAddContactModalOpen(true)}
          />
          <ChatWindow
              contact={selectedContact}
              messages={messages.filter(m => (m.sender === selectedContact?.address) || (m.isMine && selectedContact))}
              onSendMessage={handleSendMessage}
              currentUserAddress={account.address}
          />
        </div>

        {/* Modals */}
        <AddContactModal
            isOpen={isAddContactModalOpen}
            onClose={() => setIsAddContactModalOpen(false)}
            onAddContact={handleAddContact}
        />
      </div>
  );
}
