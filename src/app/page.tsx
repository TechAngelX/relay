"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link"; // ✅ Added for internal navigation
import ContactList from "./components/ContactList";
import ChatWindow from "./components/ChatWindow";
import AddContactModal from "./components/AddContactModal";
import UsernameRegistration from "./components/UsernameRegistration";
import { getSocket } from "./services/socket";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { v4 as uuidv4 } from "uuid";
import DarkModeToggle from "./components/DarkModeToggle";
import VideoCall from "./components/VideoCall";

const WalletConnect = dynamic(() => import("./components/WalletConnect"), {
    ssr: false,
    loading: () => (
        <div className="min-h-screen flex items-center justify-center text-lg text-gray-700 dark:text-gray-200">
            Loading Wallet UI...
        </div>
    ),
});

// === Types ===
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

type CallMode = "video" | "audio" | null;

// === Component ===
export default function Home() {
    const [account, setAccount] = useState<Account | null>(null);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isCalling, setIsCalling] = useState(false);
    const [callMode, setCallMode] = useState<CallMode>(null);

    // === Socket setup ===
    useEffect(() => {
        if (!account) return () => {};
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

        socket.on("receive-message", handleReceiveMessage);
        return () => socket.off("receive-message", handleReceiveMessage);
    }, [account]);

    // === Contact handling ===
    const handleAddContact = (address: string, name: string) => {
        setContacts((prev) => [{ address, name, online: false }, ...prev]);
    };

    // === Message sending ===
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
    };

    // === Copy wallet address ===
    const copyAddress = async (): Promise<void> => {
        if (!account) return;
        try {
            await navigator.clipboard.writeText(account.address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Clipboard failed:", err);
        }
    };

    // === UI ===
    if (!account) return <WalletConnect onConnect={setAccount} />;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[var(--color-darkbg)] text-gray-900 dark:text-gray-200 transition-colors duration-300">
            {/* === Header === */}
            <header className="bg-white/80 dark:bg-[var(--color-darkcard)] border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm px-6 py-3 flex items-center justify-between transition-colors duration-300">

                {/* === Inline Logo + Text (Clickable) === */}
                <Link
                    href="/"
                    className="flex items-center gap-2 group transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <div
                        className="w-[28px] h-[28px] bg-gradient-to-br from-[#4F00E9] to-[#00BFFF] transition-all duration-300 group-hover:brightness-110"
                        style={{
                            WebkitMaskImage: 'url(/images/relay-logo.svg)',
                            WebkitMaskRepeat: 'no-repeat',
                            WebkitMaskPosition: 'center',
                            WebkitMaskSize: 'contain',
                            maskImage: 'url(/images/relay-logo.svg)',
                            maskRepeat: 'no-repeat',
                            maskPosition: 'center',
                            maskSize: 'contain',
                        }}
                    />
                    <img
                        src="/images/relay-text.svg"
                        alt="Relay text"
                        className="w-[85px] dark:invert-[0.9] brightness-0 saturate-100 hue-rotate-[210deg] transition-all duration-300"
                    />
                </Link>

                {/* === Right-side controls === */}
                <div className="flex items-center gap-3">
                    <DarkModeToggle />
                    <div className="text-right">
                        <p className="text-sm font-medium">
                            {account.meta.name || "Account"}
                        </p>
                        <p
                            onClick={copyAddress}
                            className="text-xs text-gray-500 dark:text-gray-400 font-mono cursor-pointer hover:text-blue-600 dark:hover:text-[var(--color-darkaccent)] transition"
                        >
                            {copied
                                ? "Copied!"
                                : `${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
                        </p>
                    </div>
                </div>
            </header>

            {/* === Main content === */}
            <div className="flex-1 flex overflow-hidden">
                {/* === Contact List === */}
                <div className="flex flex-col border-r border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[var(--color-darkcard)] transition-colors duration-300">
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

                {/* === Chat Window === */}
                <ChatWindow
                    contact={selectedContact}
                    messages={messages.filter(
                        (m) =>
                            m.sender === selectedContact?.address ||
                            (m.isMine && selectedContact)
                    )}
                    onSendMessage={handleSendMessage}
                    currentUserAddress={account.address}
                    onStartCall={(mode) => {
                        setCallMode(mode);
                        setIsCalling(true);
                    }}
                />
            </div>

            {/* === Add Contact Modal === */}
            <AddContactModal
                isOpen={isAddContactModalOpen}
                onClose={() => setIsAddContactModalOpen(false)}
                onAddContact={handleAddContact}
            />

            {/* === Video / Audio Call Modal === */}
            {isCalling && selectedContact && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <VideoCall
                        userId={account.address}
                        remoteId={selectedContact.address}
                        mode={callMode || "video"}
                    />
                    <button
                        onClick={() => {
                            setIsCalling(false);
                            setCallMode(null);
                        }}
                        className="absolute top-5 right-5 bg-red-600 text-white px-4 py-2 rounded-lg hover:opacity-90"
                    >
                        ✖ End
                    </button>
                </div>
            )}
        </div>
    );
}
