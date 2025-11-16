// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import ContactList from "./components/ContactList";
import ChatWindow from "./components/ChatWindow";
import AddContactModal from "./components/AddContactModal";
import UsernameRegistration from "./components/UsernameRegistration";
import { getSocket } from "./services/socket";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { v4 as uuidv4 } from "uuid";
import DarkModeToggle from "./components/DarkModeToggle";
import VideoCall from "./components/VideoCall";

// === Dynamic Import ===
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

interface IncomingCall {
    from: string;
    offer: RTCSessionDescriptionInit;
}

type CallMode = "video" | "audio" | null;

// === Main Component ===
export default function Home() {
    const [account, setAccount] = useState<Account | null>(null);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    // Tracks if a call is active (user accepted)
    const [isCalling, setIsCalling] = useState(false);
    const [callMode, setCallMode] = useState<CallMode>(null);

    // 🛑 NEW: Tracks if a call is incoming (before acceptance)
    const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);

    // === Socket setup for MESSAGES ===
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

        socket.on("receive-message", handleReceiveMessage);
        return () => {
            socket.off("receive-message", handleReceiveMessage);
        };
    }, [account]);

    // 🛑 UPDATED: Socket setup for INCOMING CALLS
    useEffect(() => {
        if (!account) return;
        const socket = getSocket();

        const handleIncomingOffer = (data: { from: string; offer: RTCSessionDescriptionInit }) => {
            const callerContact = contacts.find(c => c.address === data.from);

            if (callerContact) {
                // 1. Select the calling contact
                setSelectedContact(callerContact);

                // 2. Set the incoming call state (triggers prompt)
                setIncomingCall({ from: data.from, offer: data.offer });

                // We default to video, as the offer payload doesn't specify mode
                setCallMode("video");

                console.log(`Incoming call from ${callerContact.name}`);
            }
        };

        socket.on("webrtc-offer", handleIncomingOffer);

        return () => {
            socket.off("webrtc-offer", handleIncomingOffer);
        };
    }, [account, contacts]);

    // === Add contact ===
    const handleAddContact = (address: string, name: string) => {
        setContacts((prev) => [{ address, name, online: false }, ...prev]);
    };

    // === Send message ===
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

    // 🛑 NEW: Call action handlers
    const acceptCall = () => {
        // Set isCalling to true, which mounts the VideoCall component
        setIsCalling(true);
        // Clear the incoming call prompt
        setIncomingCall(null);
    };

    const rejectCall = () => {
        // Here you would typically send a signal to the caller to say the call was rejected.
        // For now, we just clear the prompt.
        setIncomingCall(null);
    };

    // === Render wallet connect ===
    if (!account) return <WalletConnect onConnect={setAccount} />;

    const callerName = selectedContact?.name || selectedContact?.address.slice(0, 6) + '...';

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[var(--color-darkbg)] text-gray-900 dark:text-gray-200 transition-colors duration-300">
            {/* === Header === */}
            <header className="bg-white/80 dark:bg-[var(--color-darkcard)] border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm px-6 py-3 flex items-center justify-between transition-colors duration-300">
                {/* === Logo + Title === */}
                <Link
                    href="/"
                    className="flex items-center gap-2 group transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <div
                        className="w-[28px] h-[28px] bg-gradient-to-br from-[#4F00E9] to-[#00BFFF] transition-all duration-300 group-hover:brightness-110"
                        style={{
                            WebkitMaskImage: "url(/images/relay-logo.svg)",
                            WebkitMaskRepeat: "no-repeat",
                            WebkitMaskPosition: "center",
                            WebkitMaskSize: "contain",
                            maskImage: "url(/images/relay-logo.svg)",
                            maskRepeat: "no-repeat",
                            maskPosition: "center",
                            maskSize: "contain",
                        }}
                    />
                    <img
                        src="/images/relay-text.svg"
                        alt="Relay text"
                        className="w-[85px] dark:invert-[0.9] brightness-0 saturate-100 hue-rotate-[210deg] transition-all duration-300"
                    />
                </Link>

                {/* === Right Controls === */}
                <div className="flex items-center gap-3">
                    <DarkModeToggle />
                    <div className="text-right">
                        <p className="text-sm font-medium">{account.meta.name ||
                            "Account"}</p>
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

            {/* === Main Layout === */}
            <div className="flex-1 flex overflow-hidden">
                {/* === Contact List === */}
                <div className="flex flex-col border-r border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[var(--color-darkcard)] transition-colors duration-300">
                    <ContactList
                        contacts={contacts}
                        onSelectContact={setSelectedContact}
                        selectedContact={selectedContact}
                        onAddContact={() => setIsAddContactModalOpen(true)}
                        currentAccount={account?.address || null}
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

            {/* === Video / Audio Call Modal (Z-Index: z-40) === */}
            {isCalling && selectedContact && (
                // Z-40 ensures the call modal is below the prompt modal
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40">
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

            {/* 🛑 Incoming Call Prompt (Z-Index: z-50) */}
            {incomingCall && selectedContact && (
                // Z-50 ensures the prompt is above all other modals (e.g., z-40 call modal)
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-[var(--color-darkcard)] p-8 rounded-2xl shadow-xl text-center w-full max-w-sm">
                        <p className="text-lg font-semibold mb-4">
                            Incoming Call from <span className="text-[var(--color-darkaccent)]">{callerName}</span>
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={acceptCall}
                                className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                            >
                                Accept
                            </button>
                            <button
                                onClick={rejectCall}
                                className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
