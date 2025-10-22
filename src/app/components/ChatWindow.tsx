// src/app/components/ChatWindow.tsx
"use client";

import { useState, FormEvent } from "react";

interface ChatWindowProps {
    contact: {
        name: string;
        address: string;
    } | null;
    messages: {
        id: string;
        text: string;
        isMine: boolean;
    }[];
    onSendMessage: (text: string) => void;
    currentUserAddress: string;
    onStartCall: (mode: "video" | "audio") => void;
}

export default function ChatWindow({
                                       contact,
                                       messages,
                                       onSendMessage,
                                       currentUserAddress,
                                       onStartCall,
                                   }: ChatWindowProps) {
    const [text, setText] = useState("");

    if (!contact) {
        return (
            <div className="flex flex-1 items-center justify-center text-gray-500">
                Select a contact to start chatting
            </div>
        );
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onSendMessage(text);
            setText("");
        }
    };

    return (
        <div className="flex flex-col flex-1 bg-white dark:bg-[var(--color-darkbg)] transition-colors duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-lg">{contact.name}</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => onStartCall("video")}
                        className="bg-[var(--color-darkaccent)] text-white px-3 py-1 rounded hover:opacity-90"
                    >
                        🎥
                    </button>
                    <button
                        onClick={() => onStartCall("audio")}
                        className="bg-[var(--color-darkaccent)] text-white px-3 py-1 rounded hover:opacity-90"
                    >
                        🎤
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`max-w-xs p-2 rounded-lg ${
                            msg.isMine
                                ? "ml-auto bg-[var(--color-darkaccent)] text-white"
                                : "bg-gray-200 dark:bg-[var(--color-darkcard)] text-gray-900 dark:text-gray-200"
                        }`}
                    >
                        {msg.text}
                    </div>
                ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 dark:border-gray-700">
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full p-2 rounded-lg bg-gray-100 dark:bg-[var(--color-darkcard)] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200"
                />
            </form>
        </div>
    );
}
