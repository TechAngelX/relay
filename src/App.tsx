// src/App.tsx

import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { WalletConnect } from './components/WalletConnect';
import { ContactList } from './components/ContactList';
import { ChatWindow } from './components/ChatWindow';
import { AddContactModal } from './components/AddContactModal';
import { CreateRoomModal } from './components/CreateRoomModal';
import { UsernameModal } from './components/UsernameModal';
import { Room } from './components/Room';
import {
  connectSocket,
  sendMessage,
  onReceiveMessage,
  onUserOnline,
  onUserOffline,
  createRoom,
  onRoomCreated
} from './services/socket';
import { getUsername, setUsername, getDisplayName } from './services/username';

interface Account {
  address: string;
  meta: { name?: string; source: string; };
}

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

function App() {
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(null);
  const [username, setUsernameState] = useState<string | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);

  useEffect(() => {
    if (account) {
      // Check if username exists
      const existingUsername = getUsername(account.address);

      if (existingUsername) {
        setUsernameState(existingUsername);
        initializeSocket();
      } else {
        // Show username modal
        setShowUsernameModal(true);
      }
    }
  }, [account]);

  const initializeSocket = () => {
    if (!account) return;

    const socket = connectSocket(account.address);

    onReceiveMessage((message) => {
      const newMessage: Message = {
        id: message.id,
        text: message.text,
        sender: message.from,
        timestamp: message.timestamp,
        isMine: false,
      };
      setMessages((prev) => [...prev, newMessage]);
    });

    onUserOnline((address) => {
      setContacts((prev) =>
          prev.map((c) => (c.address === address ? { ...c, online: true } : c))
      );
    });

    onUserOffline((address) => {
      setContacts((prev) =>
          prev.map((c) => (c.address === address ? { ...c, online: false } : c))
      );
    });

    onRoomCreated((data) => {
      navigate(`/room/${data.roomId}`);
    });
  };

  const handleUsernameSet = (newUsername: string) => {
    if (account) {
      setUsername(account.address, newUsername);
      setUsernameState(newUsername);
      setShowUsernameModal(false);
      initializeSocket();
    }
  };

  const handleAddContact = (address: string, name: string) => {
    const newContact: Contact = { address, name, online: false };
    setContacts([...contacts, newContact]);
  };

  const handleDeleteContact = (address: string) => {
    setContacts(contacts.filter(c => c.address !== address));
    if (selectedContact?.address === address) {
      setSelectedContact(null);
      setMessages([]);
    }
  };

  const handleSendMessage = (text: string) => {
    if (!selectedContact || !account) return;

    sendMessage(selectedContact.address, account.address, text);

    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: account.address,
      timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
    };
    setMessages([...messages, newMessage]);
  };

  const handleCreateRoom = (name: string) => {
    if (!account) return;
    createRoom(name, account.address);
  };

  if (!account) {
    return <WalletConnect onConnect={setAccount} />;
  }

  if (showUsernameModal) {
    return <UsernameModal isOpen={showUsernameModal} onSetUsername={handleUsernameSet} />;
  }

  const displayName = username || account.meta.name || getDisplayName(account.address);

  return (
      <Routes>
        <Route path="/" element={
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="bg-white shadow-sm border-b">
              <div className="px-4 py-3">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-800">Relay</h1>
                  <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsCreateRoomModalOpen(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
                    >
                      Create Room
                    </button>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700">{displayName}</p>
                      <p className="text-xs text-gray-500 font-mono">{account.address.slice(0, 6)}...{account.address.slice(-4)}</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 flex overflow-hidden">
              <ContactList
                  contacts={contacts}
                  onSelectContact={setSelectedContact}
                  selectedContact={selectedContact}
                  onAddContact={() => setIsAddContactModalOpen(true)}
                  onDeleteContact={handleDeleteContact}
              />
              <ChatWindow contact={selectedContact} messages={messages} onSendMessage={handleSendMessage} currentUserAddress={account.address} />
            </div>
            <AddContactModal isOpen={isAddContactModalOpen} onClose={() => setIsAddContactModalOpen(false)} onAddContact={handleAddContact} />
            <CreateRoomModal isOpen={isCreateRoomModalOpen} onClose={() => setIsCreateRoomModalOpen(false)} onCreateRoom={handleCreateRoom} />
          </div>
        } />
        <Route path="/room/:roomId" element={<Room userAddress={account.address} username={username} />} />
      </Routes>
  );
}

export default App;
