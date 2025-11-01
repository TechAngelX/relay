// src/app/components/ChatWindow.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { getSocket } from "../services/socket";

interface ChatWindowProps {
    contact: {
        name: string;
        address: string;
    } | null;
    currentUserAddress: string;
    onStartCall: (mode: "video" | "audio") => void;
}

export default function ChatWindow({
                                       contact,
                                       currentUserAddress,
                                       onStartCall,
                                   }: ChatWindowProps) {
    const [text, setText] = useState("");
    const [messages, setMessages] = useState<
        { id: string; text: string; isMine: boolean }[]
    >([]);

    const socket = getSocket();

    // ✅ Attach message listener
    useEffect(() => {
        if (!socket) return;

        socket.on("receive-message", (data) => {
            console.log("Message received:", data);

            // ✅ Add message if either side matches
            if (!contact || !data) return;
            if (data.from === contact.address || data.to === contact.address) {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: data.id || Date.now().toString(),
                        text: data.text,
                        isMine: data.from === currentUserAddress,
                    },
                ]);
            }
        });

        return () => {
            socket.off("receive-message");
        };
    }, [socket, contact, currentUserAddress]);

    // ✅ Handle sending messages
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!text.trim() || !contact) return;

        const message = {
            from: currentUserAddress,
            to: contact.address,
            text,
            timestamp: new Date().toISOString(),
        };

        console.log("Sending message:", message);
        socket.emit("send-message", message);

        setMessages((prev) => [
            ...prev,
            { id: Date.now().toString(), text, isMine: true },
        ]);
        setText("");
    };

    if (!contact) {
        return (
            <div className="flex flex-1 items-center justify-center text-gray-500">
                Select a contact to start chatting
            </div>
        );
    }

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
            <form
                onSubmit={handleSubmit}
                className="p-3 border-t border-gray-200 dark:border-gray-700"
            >
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
