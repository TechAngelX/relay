cat > README.md << 'EOF'
# Relay - Polkadot Web3 Communication Platform

![Relay App Screenshot](./public/images/screenshot1.png)

## Overview

**Relay** is a decentralized Web3 communication platform built on the Polkadot ecosystem. It enables secure, wallet-based messaging, video calls, and group rooms without requiring traditional authentication systems. Your wallet is your identity.

## How It Works

Relay uses a **dual-wallet architecture** for different purposes:

### Polkadot.js Extension (Primary Authentication)
- **Purpose:** Login and chat identity
- **What it does:** Connects your Substrate-based wallet to authenticate and identify you in the app
- **Address format:** Substrate address (e.g., `5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY`)
- **Used for:**
    - Logging into Relay
    - Your chat identity
    - Contact management
    - Receiving messages

### MetaMask (Optional - Username Registration)
- **Purpose:** On-chain username registration on Passet Hub
- **What it does:** Connects to the EVM-compatible Passet Hub testnet to register usernames
- **Address format:** Ethereum-style address (e.g., `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`)
- **Used for:**
    - Registering on-chain usernames (optional)
    - Paying 0.001 PAS registration fee
    - Interacting with UsernameRegistry smart contract

### Authentication Flow
```
1. User Opens App
   ↓
2. Connect Polkadot.js → Get Substrate Address → Login to Chat
   ↓
3. User in Chat App (using Polkadot address)
   ↓
4. Optional: Register Username
   ↓
5. Connect MetaMask → Switch to Passet Hub → Pay 0.001 PAS → Username Saved
   ↓
6. Back to Chat (username now displays instead of address)
```

**Note:** You can use Relay without ever connecting MetaMask. Username registration is completely optional - the app works perfectly fine using just your wallet address.

## Features

### Wallet-Based Authentication
- Connect with Polkadot.js extension
- No passwords, no email signup
- Your keys, your identity

### Encrypted Messaging
- Real-time peer-to-peer messaging
- Socket.io for instant communication
- Contact management system

### Group Rooms
- Create and join video chat rooms
- Token-gated access (coming soon)
- Persistent room links

### Video & Voice Calls
- WebRTC-powered video calling
- PeerJS for P2P connections
- Low-latency communication

### On-Chain Usernames
- Register usernames on Passet Hub (Paseo testnet)
- Smart contract-based identity
- 0.001 PAS registration fee
- Optional feature - works without registration

### Modern UI
- Beautiful Tailwind CSS design
- Responsive and mobile-friendly
- Smooth animations and transitions

## Tech Stack

**Frontend:**
- React 19 + TypeScript
- Vite
- Tailwind CSS
- React Router

**Web3:**
- Polkadot.js API (Substrate wallet connection)
- Ethers.js (EVM interaction)
- Solidity Smart Contracts
- Hardhat (Smart contract development)

**Communication:**
- Socket.io (WebSocket for real-time messaging)
- PeerJS (WebRTC for video/voice)
- IPFS (planned for file sharing)

**Deployment:**
- Vercel (Frontend hosting)
- Custom domain: [relay.techangelx.com](https://relay.techangelx.com)

## Installation

### Prerequisites
- Node.js 20+
- npm or yarn
- **Polkadot.js browser extension** (required)
- **MetaMask** (optional - only needed for username registration)

### Setup
```bash
# Clone the repository
git clone https://github.com/TechAngelX/relay.git
cd relay

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Setup

Create a `.env` file in the root directory:
```env
VITE_SOCKET_SERVER_URL=http://localhost:3001
```

## Usage

### 1. Connect Wallet (Required)
- Install Polkadot.js extension
- Click "Connect Wallet"
- Approve the connection with Polkadot.js
- You're now logged in with your Substrate address

### 2. Set Username (Optional)
- Choose a unique username (3-20 characters)
- Install MetaMask if not already installed
- Connect MetaMask when prompted
- Approve network switch to Passet Hub
- Pay 0.001 PAS to register on-chain
- **Or skip** and use your wallet address as display name

### 3. Add Contacts
- Click "+ Add Contact"
- Enter contact's Substrate wallet address and name
- Start chatting

### 4. Create Rooms
- Click "Create Room"
- Name your room
- Share the room link with others for group video calls

## Smart Contracts

### Username Registry (EVM on Passet Hub)
- **Contract Address:** `0x0E4716Dc8b9c6a6DC32867b50042d71C181B87C2`
- **Network:** Passet Hub Testnet (Paseo)
- **Chain ID:** 0x190f1b46 (420420422 decimal)
- **RPC:** https://testnet-passet-hub-eth-rpc.polkadot.io
- **Explorer:** https://blockscout-passet-hub.parity-testnet.parity.io

### Contract Functions
- `registerUsername(string username)` - Register a new username (0.001 PAS)
- `updateUsername(string newUsername)` - Update existing username (0.005 PAS)
- `getUsername(address user)` - Get username for an address
- `getAddress(string username)` - Get address for a username

## Project Structure
```
relay/
├── src/
│   ├── components/          # React components
│   │   ├── WalletConnect.tsx      # Polkadot.js connection
│   │   ├── ChatWindow.tsx         # Chat interface
│   │   ├── ContactList.tsx        # Contact management
│   │   ├── Room.tsx               # Video call room
│   │   ├── UsernameModal.tsx      # Username registration
│   │   └── ...
│   ├── services/            # Business logic
│   │   ├── socket.ts              # Socket.io client
│   │   ├── username.ts            # Local username storage
│   │   └── usernameContract.ts    # MetaMask/contract interaction
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── contracts/               # Smart contracts
│   └── UsernameRegistry.sol       # Solidity username contract
├── scripts/                 # Deployment scripts
├── hardhat.config.ts        # Hardhat configuration
└── public/                  # Static assets
```

## Testing
```bash
# Run TypeScript compiler check
npm run build

# Run linter
npm run lint

# Test smart contracts (if running local node)
npx hardhat test
```

## Roadmap

- [x] Polkadot.js wallet authentication
- [x] Real-time messaging via Socket.io
- [x] On-chain username registry (EVM)
- [x] Video calling infrastructure (PeerJS)
- [x] Dual wallet support (Substrate + EVM)
- [ ] End-to-end encryption
- [ ] IPFS file sharing
- [ ] Token-gated rooms (hold X tokens to enter)
- [ ] NFT-based profiles
- [ ] Mobile app (React Native)
- [ ] Group video calls (multiple participants)
- [ ] Cross-chain messaging

## Known Issues

**PolkaVM Storage Bug:** The Passet Hub testnet currently has a bug preventing storage reads (`sload` operation) from smart contracts. Username registration (writes) works correctly, but retrieval (reads) is temporarily disabled. This is a known testnet issue being addressed by Parity Technologies.

**Workaround:** Usernames are stored locally in browser localStorage as a fallback until the bug is fixed.

## Contributing

Contributions are welcome. Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Author

**TechAngelX**
- GitHub: [@TechAngelX](https://github.com/TechAngelX)
- Website: [relay.techangelx.com](https://relay.techangelx.com)

## Acknowledgments

- Polkadot ecosystem and Parity Technologies
- Passet Hub testnet infrastructure
- Socket.io team for real-time communication
- PeerJS maintainers for WebRTC implementation
- Vercel for seamless deployment

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Visit [relay.techangelx.com](https://relay.techangelx.com)

---

Built on Polkadot | Powered by Web3
EOF
