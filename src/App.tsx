
import { useState } from 'react';
import { WalletConnect } from './components/WalletConnect';

interface Account {
  address: string;
  meta: {
    name?: string;
    source: string;
  };
}

function App() {
  const [account, setAccount] = useState<Account | null>(null);

  if (!account) {
    return <WalletConnect onConnect={setAccount} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Relay</h1>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">
                  {account.meta.name || 'Account'}
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  {account.address.slice(0, 6)}...{account.address.slice(-4)}
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            ✅ Wallet Connected!
          </h2>
          <p className="text-gray-600 mb-6">
            You're connected to Relay. Next up: building the chat interface.
          </p>
          <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
            Connected to Westend Testnet
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
