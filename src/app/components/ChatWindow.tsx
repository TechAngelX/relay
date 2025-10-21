// src/app/components/ChatWindow.tsx
'use client';

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
}

export default function ChatWindow({
                                     contact,
                                     messages,
                                     onSendMessage,
                                     currentUserAddress,
                                   }: {
  contact: Contact | null;
  messages: Message[];
  onSendMessage: (text: string) => void;
  currentUserAddress: string;
}) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem("message") as HTMLInputElement;
    const text = input.value.trim();
    if (text) {
      onSendMessage(text);
      input.value = "";
    }
  };

  if (!contact) {
    return (
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-[var(--color-darkbg)] text-gray-500 dark:text-gray-400">
          Select a contact to start chatting
        </div>
    );
  }

  return (
      <div className="flex flex-col flex-1 bg-gray-50 dark:bg-[var(--color-darkbg)] text-gray-900 dark:text-gray-200">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
              <div
                  key={msg.id}
                  className={`p-3 rounded-lg max-w-md ${
                      msg.isMine
                          ? "bg-blue-600 dark:bg-[var(--color-darkaccent)] text-white self-end ml-auto"
                          : "bg-gray-200 dark:bg-[var(--color-darkcard)] text-gray-900 dark:text-gray-100"
                  }`}
              >
                <p>{msg.text}</p>
                <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">{msg.timestamp}</p>
              </div>
          ))}
        </div>

        <form
            onSubmit={handleSubmit}
            className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2 bg-white dark:bg-[var(--color-darkcard)]"
        >
          <input
              name="message"
              placeholder="Type a message..."
              className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[var(--color-darkbg)] text-gray-900 dark:text-gray-200 focus:ring-[var(--color-darkaccent)] focus:outline-none"
          />
          <button
              type="submit"
              className="px-4 py-2 bg-[var(--color-darkaccent)] text-white rounded-lg hover:opacity-90 transition"
          >
            Send
          </button>
        </form>
      </div>
  );
}
