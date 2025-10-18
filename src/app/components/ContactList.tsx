// src/app/components/ContactList.tsx
'use client';

interface Contact {
  address: string;
  name: string;
  lastMessage?: string;
  timestamp?: string;
  online?: boolean;
}

interface ContactListProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  selectedContact: Contact | null;
  onAddContact: () => void;
}

export const ContactList = ({ contacts, onSelectContact, selectedContact, onAddContact }: ContactListProps) => {
  return (
    <div className="w-80 bg-white border-r flex flex-col">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Chats</h2>
          <button onClick={onAddContact} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-10 h-10 flex items-center justify-center transition">
            +
          </button>
        </div>
        <input type="text" placeholder="Search contacts..." className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="flex-1 overflow-y-auto">
        {contacts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="mb-2">No contacts yet</p>
            <p className="text-sm">Click + to add your first contact</p>
          </div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.address}
              onClick={() => onSelectContact(contact)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${selectedContact?.address === contact.address ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  {contact.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-gray-900 truncate">{contact.name}</h3>
                    {contact.timestamp && <span className="text-xs text-gray-500">{contact.timestamp}</span>}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{contact.address.slice(0, 8)}...{contact.address.slice(-6)}</p>
                  {contact.lastMessage && <p className="text-sm text-gray-500 truncate">{contact.lastMessage}</p>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
