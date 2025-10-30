// src/app/components/ContactList.tsx
'use client';

import { useEffect, useState } from "react";

interface Contact {
    address: string;
    name: string;
    lastMessage?: string;
    timestamp?: string;
    online?: boolean;
}

export default function ContactList({
                                        contacts,
                                        onSelectContact,
                                        selectedContact,
                                        onAddContact,
                                        currentAccount,
                                    }: {
    contacts: Contact[];
    onSelectContact: (contact: Contact) => void;
    selectedContact: Contact | null;
    onAddContact: () => void;
    currentAccount: string | null;
}) {
    const [friends, setFriends] = useState<Contact[]>([]);
    const [showFriends, setShowFriends] = useState(false);

    // ✅ Check localStorage availability (Firefox-safe)
    const storageAvailable = (() => {
        try {
            const testKey = "__relay_test__";
            localStorage.setItem(testKey, "1");
            localStorage.removeItem(testKey);
            return true;
        } catch {
            return false;
        }
    })();

    // ✅ Load saved friends
    useEffect(() => {
        if (currentAccount && storageAvailable) {
            try {
                const saved = localStorage.getItem(`friends_${currentAccount}`);
                setFriends(saved ? JSON.parse(saved) : []);
            } catch {
                console.warn("⚠️ Could not read from localStorage — skipping load");
                setFriends([]);
            }
        } else {
            setFriends([]);
        }
    }, [currentAccount, storageAvailable]);

    // ✅ Save friends list when updated
    useEffect(() => {
        if (currentAccount && storageAvailable) {
            try {
                localStorage.setItem(`friends_${currentAccount}`, JSON.stringify(friends));
            } catch {
                console.warn("⚠️ localStorage blocked — skipping save");
            }
        }
    }, [friends, currentAccount, storageAvailable]);

    // ✅ Add new contact
    const addFriend = (contact: Contact) => {
        setFriends((prev) => {
            if (prev.find((f) => f.address === contact.address)) return prev;
            return [...prev, contact];
        });
    };

    // ✅ Remove friend with confirmation
    const removeFriend = (address: string) => {
        const friend = friends.find((f) => f.address === address);
        if (!friend) return;

        if (confirm(`Are you sure you want to remove ${friend.name}?`)) {
            setFriends((prev) => prev.filter((f) => f.address !== address));
        }
    };

    // === UI ===
    return (
        <div className="flex flex-col border-r border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[var(--color-darkcard)] shadow-elevated transition-all">
            {/* === Header === */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold">Chats</h2>
                <div className="flex gap-2">
                    <button
                        onClick={onAddContact}
                        className="text-lg font-bold rounded-full bg-[var(--color-darkaccent)] text-white w-7 h-7 flex items-center justify-center hover:opacity-90 transition"
                        title="Add new contact"
                    >
                        +
                    </button>
                    <button
                        onClick={() => setShowFriends(!showFriends)}
                        className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        {showFriends ? "Hide Friends" : "Show Friends"}
                    </button>
                </div>
            </div>

            {/* === Content === */}
            <div className="flex-1 overflow-y-auto">
                {showFriends ? (
                    friends.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                            No friends saved yet
                            <br />
                            <span className="text-sm">Add and select a contact to save as friend</span>
                        </div>
                    ) : (
                        friends.map((friend, index) => (
                            <div
                                key={`${friend.address}-${index}`}
                                className={`p-3 border-b border-gray-200 dark:border-gray-700 transition-colors group ${
                                    selectedContact?.address === friend.address
                                        ? "bg-blue-100 dark:bg-[var(--color-darkaccent)]/30"
                                        : "hover:bg-gray-200 dark:hover:bg-[var(--color-darkaccent)]/20"
                                }`}
                            >
                                <div
                                    onClick={() => onSelectContact(friend)}
                                    className="flex justify-between items-center cursor-pointer"
                                >
                                    <span className="font-medium">{friend.name}</span>
                                    {friend.online && (
                                        <span className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                                    )}
                                </div>

                                {friend.lastMessage && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                        {friend.lastMessage}
                                    </p>
                                )}

                                {/* 🗑️ Remove Friend Button (appears on hover) */}
                                <button
                                    onClick={() => removeFriend(friend.address)}
                                    className="opacity-0 group-hover:opacity-100 text-xs text-red-600 dark:text-red-400 mt-2 transition-opacity hover:underline"
                                >
                                    Remove friend
                                </button>
                            </div>
                        ))
                    )
                ) : (
                    contacts.map((contact, index) => (
                        <div
                            key={`${contact.address}-${index}`}
                            onClick={() => {
                                onSelectContact(contact);
                                addFriend(contact);
                            }}
                            className={`p-3 cursor-pointer border-b border-gray-200 dark:border-gray-700 transition-colors ${
                                selectedContact?.address === contact.address
                                    ? "bg-blue-100 dark:bg-[var(--color-darkaccent)]/30"
                                    : "hover:bg-gray-200 dark:hover:bg-[var(--color-darkaccent)]/20"
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-medium">{contact.name}</span>
                                {contact.online && (
                                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                                )}
                            </div>
                            {contact.lastMessage && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {contact.lastMessage}
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
