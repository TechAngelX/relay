// src/app/components/ChatWindow.tsx
'use client';

import { useState } from 'react';

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  isMine: boolean;
}

interface Contact {
  address: string;
  name: string;
  online?: boolean;
}

interface ChatWindowProps {
  contact: Contact | null;
  messages: Message[];
  onSendMessage: (text: string) => void;
  currentUserAddress: string;
}

export const ChatWindow = ({ contact, messages, onSendMessage }: ChatWindowProps) => {
  const [messageText, setMessageText] = useState('');

  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage(messageText);
      setMessageText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!contact) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
            <span className="text-6xl">💬</span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome to Relay</h2>
          <p className="text-gray-600">Select a contact to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <div className="bg-white border-b p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold">
              {contact.name.charAt(0).toUpperCase()}
            </div>
            {contact.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{contact.name}</h3>
            <p className="text-xs text-gray-500">{contact.address.slice(0, 8)}...{contact.address.slice(-6)}</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${message.isMine ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 border'}`}>
                <p className="break-words">{message.text}</p>
                <p className={`text-xs mt-1 ${message.isMine ? 'text-blue-100' : 'text-gray-500'}`}>{message.timestamp}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="bg-white border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={handleSend} disabled={!messageText.trim()} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full w-12 h-12 flex items-center justify-center transition">
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};
