// src/app/components/ContactList.tsx
'use client';

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
                                    }: {
    contacts: Contact[];
    onSelectContact: (contact: Contact) => void;
    selectedContact: Contact | null;
    onAddContact: () => void;
}) {
    return (
        <div className="flex flex-col border-r border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[var(--color-darkcard)] shadow-elevated transition-all">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold">Chats</h2>
                <button
                    onClick={onAddContact}
                    className="text-lg font-bold rounded-full bg-[var(--color-darkaccent)] text-white w-7 h-7 flex items-center justify-center hover:opacity-90 transition"
                    title="Add new contact"
                >
                    +
                </button>
            </div>

            {/* Contacts list */}
            <div className="flex-1 overflow-y-auto">
                {contacts.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                        No contacts yet
                        <br />
                        <span className="text-sm">Click + to add your first contact</span>
                    </div>
                ) : (
                    contacts.map((contact) => (
                        <div
                            key={contact.address}
                            onClick={() => onSelectContact(contact)}
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
                            {contact.timestamp && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 text-right">
                                    {contact.timestamp}
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
