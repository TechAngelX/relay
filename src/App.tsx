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
      const existingUsername = getUsername(account.address);

      if (existingUsername) {
        setUsernameState(existingUsername);
        initialiseSocket();
      } else {
        setShowUsernameModal(true);
      }
    }
  }, [account]);

  const initialiseSocket = () => {
    if (!account) return;

    connectSocket(account.address, username || undefined);

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

    onUserOnline((data) => {
      setContacts((prev) =>
          prev.map((c) => (c.address === data.address ? { ...c, online: true } : c))
      );
    });

    onUserOffline((data) => {
      setContacts((prev) =>
          prev.map((c) => (c.address === data.address ? { ...c, online: false } : c))
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
      initialiseSocket();
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
            <div className="bg-gradient-to-r from-polkadot-purple to-polkadot-pink shadow-lg">
              <div className="px-6 py-4">
                <div className="flex justify-between items-center">
                  <h1 className="text-3xl font-bold text-white tracking-tight">Relay</h1>
                  <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsCreateRoomModalOpen(true)}
                        className="bg-white text-polkadot-purple hover:bg-gray-50 px-5 py-2.5 rounded-lg transition text-sm font-semibold shadow-sm"
                    >
                      Create Room
                    </button>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{displayName}</p>
                      <p className="text-xs text-pink-100 font-mono">{account.address.slice(0, 6)}...{account.address.slice(-4)}</p>
                    </div>
                    <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center text-polkadot-pink font-bold text-lg shadow-md">
                      {displayName.slice(0, 1).toUpperCase()}
                    </div>
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
