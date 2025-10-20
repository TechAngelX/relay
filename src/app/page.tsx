// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ContactList } from "./components/ContactList";
import { ChatWindow } from "./components/ChatWindow";
import { AddContactModal } from "./components/AddContactModal";
import { UsernameRegistration } from "./components/UsernameRegistration";
import { getSocket } from "./services/socket";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { v4 as uuidv4 } from "uuid";
import DarkModeToggle from "./context/DarkModeToggle";  

const WalletConnect = dynamic(
    () => import("./components/WalletConnect").then((mod) => mod.WalletConnect),
    {
      ssr: false,
      loading: () => (
          <div className="min-h-screen flex items-center justify-center text-lg text-gray-700 dark:text-gray-200">
            Loading Wallet UI...
          </div>
      ),
    }
);

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
  const [copied, setCopied] = useState(false);

  // --- Socket setup
  useEffect(() => {
    if (!account) return;

    const socket = getSocket();

    const handleReceiveMessage = (data: {
      from: string;
      text: string;
      timestamp: string;
      id: string;
    }) => {
      const incoming: Message = {
        id: data.id,
        text: data.text,
        sender: data.from,
        timestamp: data.timestamp,
        isMine: false,
      };
      setMessages((prev) => [...prev, incoming]);
      setContacts((prev) =>
          prev.map((c) =>
              c.address === data.from
                  ? { ...c, lastMessage: data.text, timestamp: data.timestamp }
                  : c
          )
      );
    };

    const handleMessageSent = (res: { success: boolean; error?: string }) => {
      if (!res.success) console.warn("Message delivery failed:", res.error);
    };

    socket.on("receive-message", handleReceiveMessage);
    socket.on("message-sent", handleMessageSent);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
      socket.off("message-sent", handleMessageSent);
    };
  }, [account]);

  // --- Add new contact
  const handleAddContact = (address: string, name: string) => {
    setContacts((prev) => [{ address, name, online: false }, ...prev]);
  };

  // --- Send message
  const handleSendMessage = (text: string) => {
    if (!account || !selectedContact) return;

    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const myMessage: Message = {
      id: uuidv4(),
      text,
      sender: account.address,
      timestamp,
      isMine: true,
    };

    setMessages((prev) => [...prev, myMessage]);

    const socket = getSocket();
    socket.emit("send-message", {
      to: selectedContact.address,
      from: account.address,
      text,
      timestamp,
    });

    setContacts((prev) =>
        prev.map((c) =>
            c.address === selectedContact.address
                ? { ...c, lastMessage: text, timestamp }
                : c
        )
    );
  };

  // --- Copy wallet address
  const copyAddress = async () => {
    if (!account) return;
    try {
      await navigator.clipboard.writeText(account.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard failed:", err);
    }
  };

  // --- Initial “Connect Wallet” screen (no header, no toggle)
  if (!account) {
    return <WalletConnect onConnect={setAccount} />;
  }

  // --- Main UI after connect (header + dark-mode toggle)
  return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <header className="bg-white/90 dark:bg-gray-800/90 border-b border-gray-200 dark:border-gray-700 backdrop-blur">
          <div className="px-6 py-3 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Relay</h1>
            <div className="flex items-center gap-3">
              <DarkModeToggle />
              <div className="text-right">
                <p className="text-sm font-medium">
                  {account.meta.name || "Account"}
                </p>
                <p
                    onClick={copyAddress}
                    className="text-xs text-gray-500 dark:text-gray-400 font-mono cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition"
                    title="Click to copy"
                >
                  {copied
                      ? "Copied!"
                      : `${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Contact List */}
          <div className="flex flex-col border-r border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
            <ContactList
                contacts={contacts}
                onSelectContact={setSelectedContact}
                selectedContact={selectedContact}
                onAddContact={() => setIsAddContactModalOpen(true)}
            />
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <UsernameRegistration currentUserAddress={account.address} />
            </div>
          </div>

          {/* Chat Window */}
          <ChatWindow
              contact={selectedContact}
              messages={messages.filter(
                  (m) =>
                      m.sender === selectedContact?.address ||
                      (m.isMine && selectedContact)
              )}
              onSendMessage={handleSendMessage}
              currentUserAddress={account.address}
          />
        </div>

        {/* Add Contact Modal */}
        <AddContactModal
            isOpen={isAddContactModalOpen}
            onClose={() => setIsAddContactModalOpen(false)}
            onAddContact={handleAddContact}
        />
      </div>
  );
}
