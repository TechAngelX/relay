// src/components/Room.tsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  joinRoom,
  leaveRoom,
  sendRoomMessage,
  onReceiveRoomMessage,
  onUserJoinedRoom,
  onUserLeftRoom,
  getRoomInfo,
  onRoomInfo,
  onRoomError
} from '../services/socket';
import { getDisplayName } from '../services/username';

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  isMine: boolean;
}

interface RoomProps {
  userAddress: string;
  username: string | null;
}

export const Room = ({ userAddress, username }: RoomProps) => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [systemMessages, setSystemMessages] = useState<Array<{ id: string; text: string }>>([]);

  useEffect(() => {
    if (!roomId) return;

    getRoomInfo(roomId);
    joinRoom(roomId, userAddress);

    onRoomInfo((data) => {
      setRoomInfo(data.room);
      setParticipants(data.room.participants);
    });

    onReceiveRoomMessage((message) => {
      const newMessage: Message = {
        id: message.id,
        text: message.text,
        sender: message.from,
        timestamp: message.timestamp,
        isMine: message.from === userAddress,
      };
      setMessages((prev) => [...prev, newMessage]);
    });

    onUserJoinedRoom((data) => {
      setParticipants(data.participants);
      if (data.user !== userAddress) {
        setSystemMessages((prev) => [
          ...prev,
          { id: `join-${Date.now()}`, text: `${getDisplayName(data.user)} joined the room` }
        ]);
      }
    });

    onUserLeftRoom((data) => {
      setParticipants(data.participants);
      if (data.user !== userAddress) {
        setSystemMessages((prev) => [
          ...prev,
          { id: `leave-${Date.now()}`, text: `${getDisplayName(data.user)} left the room` }
        ]);
      }
    });

    onRoomError((err) => {
      setError(err);
    });

    return () => {
      if (roomId) {
        leaveRoom(roomId, userAddress);
      }
    };
  }, [roomId, userAddress]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !roomId) return;

    sendRoomMessage(roomId, userAddress, messageText);

    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: userAddress,
      timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
    };
    setMessages([...messages, newMessage]);
    setMessageText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyLink = () => {
    const roomUrl = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Room Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
                onClick={() => navigate('/')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
            >
              Back to Chat
            </button>
          </div>
        </div>
    );
  }

  if (!roomInfo) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading room...</p>
          </div>
        </div>
    );
  }

  // Combine system messages and chat messages in chronological order
  const allMessages = [
    ...systemMessages.map(sm => ({ ...sm, type: 'system' as const })),
    ...messages.map(m => ({ ...m, type: 'chat' as const }))
  ].sort((a, b) => {
    const aId = a.id.includes('join') || a.id.includes('leave')
        ? parseInt(a.id.split('-')[1])
        : parseInt(a.id);
    const bId = b.id.includes('join') || b.id.includes('leave')
        ? parseInt(b.id.split('-')[1])
        : parseInt(b.id);
    return aId - bId;
  });

  return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="px-4 py-3">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{roomInfo.name}</h1>
                <p className="text-sm text-gray-500">{participants.length} participants</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                    onClick={handleCopyLink}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
                >
                  {copied ? '✓ Copied!' : 'Copy Room Link'}
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  Leave Room
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Participants Sidebar */}
          <div className="w-64 bg-white border-r p-4">
            <h3 className="font-semibold mb-3">Participants</h3>
            <div className="space-y-2">
              {participants.map((participant) => {
                const displayName = participant === userAddress
                    ? `You${username ? ` (${username})` : ''}`
                    : getDisplayName(participant);

                return (
                    <div key={participant} className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {displayName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {displayName}
                        </p>
                      </div>
                    </div>
                );
              })}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {allMessages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
              ) : (
                  allMessages.map((item) => {
                    if (item.type === 'system') {
                      return (
                          <div key={item.id} className="flex justify-center">
                            <div className="bg-gray-200 text-gray-600 px-4 py-1 rounded-full text-sm">
                              {item.text}
                            </div>
                          </div>
                      );
                    } else {
                      const message = item as Message & { type: 'chat' };
                      return (
                          <div
                              key={message.id}
                              className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                                    message.isMine
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-900 border'
                                }`}
                            >
                              {!message.isMine && (
                                  <p className="text-xs opacity-70 mb-1">
                                    {getDisplayName(message.sender)}
                                  </p>
                              )}
                              <p className="break-words">{message.text}</p>
                              <p
                                  className={`text-xs mt-1 ${
                                      message.isMine ? 'text-blue-100' : 'text-gray-500'
                                  }`}
                              >
                                {message.timestamp}
                              </p>
                            </div>
                          </div>
                      );
                    }
                  })
              )}
            </div>

            {/* Message Input */}
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
                <button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full w-12 h-12 flex items-center justify-center transition"
                >
                  ➤
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};
