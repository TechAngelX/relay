// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ContactList } from './components/ContactList';
import { ChatWindow } from './components/ChatWindow';
import { AddContactModal } from './components/AddContactModal';
import { UsernameRegistration } from './components/UsernameRegistration';
import { getSocket } from './services/socket';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { v4 as uuidv4 } from 'uuid';

const WalletConnect = dynamic(() => import('./components/WalletConnect').then(mod => mod.WalletConnect), {
  ssr: false,
  loading: () => <div className="min-h-screen flex items-center justify-center text-xl">Loading Wallet UI...</div>
});

type Account = InjectedAccountWithMeta;

interface Contact {
  address: string;
  name: string;
  lastMessage?: string;
  timestamp?: string;
  online?: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  isMine: boolean;
}

export default function Home() {
  const [account, setAccount] = useState<Account | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);

  useEffect(() => {
    if (!account) return;

    console.log('Setting up socket listeners for account:', account.address);
    const socket = getSocket();

    const handleReceiveMessage = (data: { from: string; text: string; timestamp: string; id: string }) => {
      console.log('MESSAGE RECEIVED:', data);

      const incomingMessage: Message = {
        id: data.id,
        text: data.text,
        sender: data.from,
        timestamp: data.timestamp,
        isMine: false,
      };

      setMessages(prevMessages => [...prevMessages, incomingMessage]);

      setContacts(prevContacts => prevContacts.map(c => {
        if (c.address === data.from) {
          return { ...c, lastMessage: data.text, timestamp: data.timestamp };
        }
        return c;
      }));
    };

    const handleUserStatus = (address: string, isOnline: boolean) => {
      console.log('User status:', address, isOnline);
      setContacts(prevContacts => prevContacts.map(c => {
        if (c.address === address) {
          return { ...c, online: isOnline };
        }
        return c;
      }));
    };

    socket.on('receive-message', handleReceiveMessage);
    socket.on('user-online', (address: string) => handleUserStatus(address, true));
    socket.on('user-offline', (address: string) => handleUserStatus(address, false));

    return () => {
      socket.off('receive-message', handleReceiveMessage);
      socket.off('user-online');
      socket.off('user-offline');
    };
  }, [account]);

  const handleAddContact = (address: string, name: string) => {
    const newContact: Contact = { address, name, online: false };
    if (!contacts.some(c => c.address === address)) {
      setContacts([...contacts, newContact]);
    }
  };

  const handleSendMessage = (text: string) => {
    if (!selectedContact || !account) return;

    const timestamp = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    console.log('SENDING MESSAGE:', {
      to: selectedContact.address,
      from: account.address,
      text: text
    });

    const newMessage: Message = {
      id: uuidv4(),
      text,
      sender: account.address,
      timestamp,
      isMine: true,
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);

    const socket = getSocket();
    socket.emit('send-message', {
      to: selectedContact.address,
      from: account.address,
      text: text,
      timestamp: timestamp,
    });

    setContacts(prevContacts => prevContacts.map(c => {
      if (c.address === selectedContact.address) {
        return { ...c, lastMessage: text, timestamp: timestamp };
      }
      return c;
    }));
  };

  if (!account) {
    return <WalletConnect onConnect={setAccount} />;
  }

  return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
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

        <div className="flex-1 flex overflow-hidden">
          <div className="flex flex-col border-r bg-gray-100">
            <ContactList
                contacts={contacts}
                onSelectContact={setSelectedContact}
                selectedContact={selectedContact}
                onAddContact={() => setIsAddContactModalOpen(true)}
            />
            <div className="p-4 border-t">
              <UsernameRegistration currentUserAddress={account.address} />
            </div>
          </div>

          <ChatWindow
              contact={selectedContact}
              messages={messages.filter(m => (m.sender === selectedContact?.address) || (m.isMine && selectedContact))}
              onSendMessage={handleSendMessage}
              currentUserAddress={account.address}
          />
        </div>

        <AddContactModal
            isOpen={isAddContactModalOpen}
            onClose={() => setIsAddContactModalOpen(false)}
            onAddContact={handleAddContact}
        />
      </div>
  );
}
