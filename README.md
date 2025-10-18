cat > README.md << 'EOF'
# Relay - Polkadot Web3 Communication Platform

![Relay App Screenshot](./public/images/screenshot1.png)

## Overview

**Relay** is a decentralized Web3 communication platform built on the Polkadot ecosystem. It enables secure, wallet-based messaging, video calls, and group rooms without requiring traditional authentication systems. Your wallet is your identity.

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
- Polkadot.js API
- Ethers.js
- Solidity Smart Contracts
- Hardhat

**Communication:**
- Socket.io (WebSocket)
- PeerJS (WebRTC)
- IPFS (future file sharing)

**Deployment:**
- Vercel (Frontend)
- Custom domain: [relay.techangelx.com](https://relay.techangelx.com)

## Installation

### Prerequisites
- Node.js 20+
- npm or yarn
- Polkadot.js browser extension
- MetaMask (for username registration)

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

### Connect Wallet
- Install Polkadot.js extension
- Click "Connect Wallet"
- Approve the connection

### Set Username
- Choose a unique username (3-20 characters)
- Pay 0.001 PAS to register on-chain
- Or skip and use wallet address

### Add Contacts
- Click "+ Add Contact"
- Enter contact's wallet address and name
- Start chatting

### Create Rooms
- Click "Create Room"
- Name your room
- Share the room link with others

## Smart Contracts

### Username Registry
- **Contract Address:** `0x0E4716Dc8b9c6a6DC32867b50042d71C181B87C2`
- **Network:** Passet Hub Testnet (Paseo)
- **Chain ID:** 0x190f1b46 (420420422)

### Functions
- `registerUsername(string username)` - Register a new username
- `updateUsername(string newUsername)` - Update existing username
- `getUsername(address user)` - Get username for an address
- `getAddress(string username)` - Get address for a username

## Project Structure
```
relay/
├── src/
│   ├── components/          # React components
│   │   ├── WalletConnect.tsx
│   │   ├── ChatWindow.tsx
│   │   ├── ContactList.tsx
│   │   ├── Room.tsx
│   │   └── ...
│   ├── services/            # Business logic
│   │   ├── socket.ts        # Socket.io client
│   │   ├── username.ts      # Username management
│   │   └── usernameContract.ts
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── contracts/               # Smart contracts
│   └── UsernameRegistry.sol
├── scripts/                 # Deployment scripts
├── server/                  # Socket.io server
└── public/                  # Static assets
```

## Testing
```bash
# Run TypeScript compiler check
npm run build

# Run linter
npm run lint
```

## Roadmap

- [x] Wallet authentication
- [x] Real-time messaging
- [x] On-chain username registry
- [x] Video calling infrastructure
- [ ] End-to-end encryption
- [ ] IPFS file sharing
- [ ] Token-gated rooms
- [ ] NFT-based profiles
- [ ] Mobile app (React Native)
- [ ] Group video calls (multiple participants)

## Known Issues

**PolkaVM Storage Bug:** The Passet Hub testnet currently has a bug preventing storage reads from smart contracts. Username registration works, but retrieval is temporarily disabled. This is a known testnet issue being fixed by Parity.

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

- Polkadot ecosystem
- Parity Technologies
- Socket.io team
- PeerJS maintainers
- Vercel for hosting

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Contact via relay.techangelx.com

---

Built with care on Polkadot
EOF
